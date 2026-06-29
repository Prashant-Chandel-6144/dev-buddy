import { getServerSession } from "@/features/auth/actions";
import { prisma } from "@/lib/db";
import { updateProjectSchema } from "@/lib/validations";

export async function GET(request: Request, { params }: { params: { projectId: string } }) {
  try {
    const session = await getServerSession()
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userIdWithSession = session.user.id
    const { projectId } = await params;
    console.log("id:", projectId);
    const projects = await prisma.project.findFirst({
      where: {
        id: projectId,
        workspace: {
          userId: userIdWithSession
        }
      }
    })
    return Response.json({
      message: "Project fetched successfully",
      data: projects
    }, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to fetch project" },
      { status: 500 },
    );
  }

}

export async function DELETE(request: Request, { params }: { params: { projectId: string } }) {
  try {
    const session = await getServerSession()
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userIdWithSession = session.user.id
    const { projectId } = await params;
    const existingProject = await prisma.project.findFirst({
      where: {
        id: projectId,
        workspace: {
          userId: userIdWithSession
        }
      }
    });
    if (!existingProject) {
      return Response.json({ error: "Project not found" }, { status: 404 });
    }


    const project = await prisma.project.delete({
      where: {
        id: projectId,

      }
    });
    return Response.json({
      message: "Project deleted successfully",
      data: project
    }, { status: 200 });
  }
  catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to delete project" },
      { status: 500 },
    );
  }
}


export async function PATCH(request: Request, { params }: { params: { projectId: string } }) {
  try {
    const session = await getServerSession()
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userIdWithSession = session.user.id
    const { projectId } = await params;
    const existingProject = await prisma.project.findFirst({
  where: {
    id: projectId,
    workspace: {
      userId: userIdWithSession
    }
  }
});
if (!existingProject) {
  return Response.json({ error: "Project not found" }, { status: 404 });
}

    const body = await request.json();
    const parsed = updateProjectSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: parsed.error }, { status: 400 });
    }
    const { name, description, githubRepoUrl, githubRepoName } = parsed.data;
    const project = await prisma.project.update({
      where: {
        id: projectId,

      },
      data: {
        name,
        description,
        githubRepoName,
        githubRepoUrl
      }
    });
    return Response.json({
      message: "Project updated successfully",
      data: project
    }, { status: 200 });
  }
  catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to update project" },
      { status: 500 },
    );
  }
} 