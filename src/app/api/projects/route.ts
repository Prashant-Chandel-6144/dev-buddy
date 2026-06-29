  import { getServerSession } from "@/features/auth/actions";
import { prisma } from "@/lib/db";
import { createProjectSchema } from "@/lib/validations";



export async function GET() {
  try {
    const session = await getServerSession()
    if(!session){
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userIdWithSession = session.user.id
    const projects = await prisma.project.findMany(
      {
        where:{
          workspace:{
            userId:userIdWithSession
          }
        }
      }
    );

    return Response.json(projects,{status: 200});
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to fetch projects" },
      { status: 500 },
    );
  }
}


export async function POST(request: Request) {
  try {
    const session = await getServerSession()
    if(!session){
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userIdWithSession = session.user.id
    const body = await request.json();
    const parsed = createProjectSchema.safeParse(body)
    if(!parsed.success){
        return Response.json({ error: parsed.error }, { status: 400 });
    }
    const { name, description, githubRepoUrl, githubRepoName, workspaceId } = parsed.data

    if(!workspaceId){
      return Response.json({ error: "Workspace ID is required" }, { status: 400 });
    }

    const workspace = await prisma.workspace.findFirst({
      where:{
        id:workspaceId,
        userId:userIdWithSession
      }
    })
    if(!workspace){
      return Response.json({ error: "Workspace not found" }, { status: 404 });
    }

    const project = await prisma.project.create({
      data: {
        name,
        workspaceId: workspaceId,
        description,
        githubRepoName,
        githubRepoUrl,
        
      },
    });

    return Response.json(project);
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to create project" },
      { status: 500 },
    );
  }
}