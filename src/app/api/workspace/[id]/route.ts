import { getServerSession } from "@/features/auth/actions";
import { prisma } from "@/lib/db";
import { updateWorkspaceSchema } from "@/lib/validations";

export async function GET(request: Request,{params}:{params:{id:string}}) {
  try {
    const session = await getServerSession()
    if(!session){
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }
    const {id} = await params;
    const workspaces = await prisma.workspace.findFirst({
        where:{
            id,
            userId: session.user.id
        }
    });
    if (!workspaces) {
      return Response.json({ error: "Workspace not found or unauthorized" }, { status: 404 });
    }
    return Response.json(workspaces,{status: 200});
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to fetch workspaces" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request,{params}:{params:{id:string}}) {
  try {
    const session = await getServerSession()
    if(!session){
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }
    const {id} = await params;

    // Check ownership first or use deleteMany to filter by userId
    const workspace = await prisma.workspace.deleteMany({
        where:{
            id,
            userId: session.user.id
        }
    });

    if (workspace.count === 0) {
      return Response.json({ error: "Workspace not found or unauthorized" }, { status: 404 });
    }

    return Response.json({
        message: "Workspace deleted successfully",
    }, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to delete workspace" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request,{params}:{params:{id:string}}) {
  try {
    const session = await getServerSession()
    if(!session){
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }
    const {id} = await params;
    const body = await request.json();
    const parsed = updateWorkspaceSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: parsed.error }, { status: 400 });
    }
    const { name } = parsed.data;
    
    const updateData: any = {};
    if (name) {
      updateData.name = name;
      updateData.slug = name.toLowerCase().replace(/\s+/g, "-");
    }

    // Verify ownership
    const existing = await prisma.workspace.findFirst({
        where: { id, userId: session.user.id }
    });
    if (!existing) {
      return Response.json({ error: "Workspace not found or unauthorized" }, { status: 404 });
    }

    const workspace = await prisma.workspace.update({
        where:{
            id
        },
        data: updateData
    });
    return Response.json({
        message: "Workspace updated successfully",
        data: workspace
    }, { status: 200 });
  }
    catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to update workspace" },
      { status: 500 },
    );
  }
}