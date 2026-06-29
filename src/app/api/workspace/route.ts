import { prisma } from "@/lib/db";
import { createWorkspaceSchema } from "@/lib/validations";
import { getServerSession } from "@/features/auth/actions";

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createWorkspaceSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: parsed.error }, { status: 400 });
    }
    const { name } = parsed.data; 
    const workspace = await prisma.workspace.create({
        data: {
            name,
            userId: session.user.id
        }
    });
    return Response.json(workspace);
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to create workspace" },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workspaces = await prisma.workspace.findMany({
      where: {
        userId: session.user.id
      }
    });
    return Response.json(workspaces, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to fetch workspaces" },
      { status: 500 },
    );
  }
}