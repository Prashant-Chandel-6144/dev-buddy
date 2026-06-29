import { getServerSession } from "@/features/auth/actions";
import { prisma } from "@/lib/db";
import { createFeatureRequestSchema } from "@/lib/validations";

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

    const feature = await prisma.featureRequest.create({
        data:{
            title,
            description,
            projectId,
            ...(source ? { source } : {}),
        }

    });
    return Response.json({
        message: "Feature updated successfully",
        data: feature
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