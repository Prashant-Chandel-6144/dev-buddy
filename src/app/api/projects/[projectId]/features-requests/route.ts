import { getServerSession } from "@/features/auth/actions";
import { prisma } from "@/lib/db";
import { createFeatureRequestSchema } from "@/lib/validations";
import { getPineconeIndex } from "@/features/pinecone/client";

export async function POST(request: Request,{params}:{params:{projectId:string}}) {
  try {
    const session = await getServerSession()
    if(!session){
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const {projectId} = await params
    if(!projectId){
      return Response.json({ error: "Project ID is required" }, { status: 400 });
    }
    const userIdWithSession = session.user.id
    const body = await request.json();
    const parsed = createFeatureRequestSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: parsed.error }, { status: 400 });
    }
    const { title, description,  source } = parsed.data;

    const project = await prisma.project.findFirst({
      where:{
        id:projectId,
        workspace:{
          userId:userIdWithSession
        }
      }
    })

    if(!project){
      return Response.json({ error: "Project not found" }, { status: 404 });
    }

    // 1. Perform semantic search for duplicate feature requests
    const index = getPineconeIndex();
    const namespace = `features--project-${projectId}`;
    let duplicateWarnings: any[] = [];

    try {
      const searchRes = await index.namespace(namespace).searchRecords({
        query: {
          topK: 3,
          inputs: { text: `${title}\n${description}` }
        }
      });

      if (searchRes?.result?.hits) {
        for (const rawHit of searchRes.result.hits) {
          const hit = rawHit as any;
          if (hit.score && hit.score >= 0.85) {
            const dbFeature = await prisma.featureRequest.findUnique({
              where: { id: hit.id }
            });
            if (dbFeature) {
              duplicateWarnings.push({
                id: dbFeature.id,
                title: dbFeature.title,
                status: dbFeature.status,
                score: hit.score
              });
            }
          }
        }
      }
    } catch (err) {
      console.warn("Failed to check duplicate features via Pinecone:", err);
    }

    // 2. Create the feature request
    const feature = await prisma.featureRequest.create({
        data:{
            title,
            description,
            projectId,
            status: parsed.data.status,
            ...(source ? { source } : {}),
        }
    });

    // 3. Index new feature to Pinecone namespace for future matching
    try {
      await index.namespace(namespace).upsertRecords({
        records: [{
          id: feature.id,
          text: `${title}\n${description}`,
        }]
      });
    } catch (err) {
      console.warn("Failed to index new feature request to Pinecone:", err);
    }

    return Response.json({
        message: "Feature updated successfully",
        data: feature,
        warnings: duplicateWarnings.length > 0 ? duplicateWarnings : undefined
    }, { status: 200 });
  }
    catch (error) {
    console.error(error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to create feature" },
      { status: 500 },
    );
  }
}

export async function GET(request: Request,{params}:{params:{projectId:string}}) {
  try {
    const session = await getServerSession()
    if(!session){
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const {projectId} = await params
    if(!projectId){
      return Response.json({ error: "Project ID is required" }, { status: 400 });
    }
    const userIdWithSession = session.user.id
    const features = await prisma.featureRequest.findMany({
      where: {
        projectId:projectId,
        project: {
        
          workspace: {
            userId: userIdWithSession
          }
        }
      },
      include: {
        prd: {
          select: { id: true }
        },
        tasks: {
          orderBy: { order: "asc" }
        }
      }
    });
    return Response.json({
        message: "Features fetched successfully",
        data: features
    },{status: 200});
  }
    catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to fetch features" },
      { status: 500 },
    );
    }
}