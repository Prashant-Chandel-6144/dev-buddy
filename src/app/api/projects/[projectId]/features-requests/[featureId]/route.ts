import { getServerSession } from "@/features/auth/actions";
import { prisma } from "@/lib/db";
import { updateFeatureRequestSchema } from "@/lib/validations";

export async function GET(
  request: Request,
  { params }: { params: { featureId: string, projectId: string } },
) {
  try {
    const session = await getServerSession()

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { featureId, projectId } = await params
    if (!featureId) {
      return Response.json({ error: "Feature ID is required" }, { status: 400 });
    }
    if (!projectId) {
      return Response.json({ error: "Project ID is required" }, { status: 400 });
    }
    const userIdWithSession = session.user.id
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


    const features = await prisma.featureRequest.findFirst({
      where: {
        id: featureId,
        project: {
          workspace: {
            userId: userIdWithSession
          }
        }
      },
      include: {
        prd: true,
        tasks: { orderBy: { order: "asc" } },
        project: { select: { id: true, name: true } },
      },
    }) as any;

    if (features) {
      const pullRequests = await prisma.$queryRawUnsafe<any[]>(
        `SELECT * FROM "pull_request" WHERE "featureRequestId" = $1 ORDER BY "createdAt" DESC`,
        featureId
      );
      features.pullRequests = pullRequests;
    }

    return Response.json(features, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to fetch features" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { featureId: string, projectId: string } },
) {
  try {
    const session = await getServerSession()

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { featureId, projectId } = await params
    if (!featureId) {
      return Response.json({ error: "Feature ID is required" }, { status: 400 });
    }
    const userIdWithSession = session.user.id
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        workspace: {
          userId: userIdWithSession
        }
      }
    });
    if (!project) {
      return Response.json({ error: "Project not found" }, { status: 404 });
    }
    const existingFeature = await prisma.featureRequest.findFirst({
      where: {
        id: featureId,
        projectId: projectId,
        project: {
          workspace: {
            userId: userIdWithSession
          }
        }
      }
    });

    if (!existingFeature) {
      return Response.json({ error: "Feature not found" }, { status: 404 });
    }

    const feature = await prisma.featureRequest.delete({
      where: {
        id: featureId,

      },
    });
    return Response.json(
      {
        message: "Feature deleted successfully",
        data: feature,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to delete feature" },
      { status: 500 },
    );
  }
}


export async function PATCH(
  request: Request,
  { params }: { params: { featureId: string, projectId: string } },
) {
  try {
    const session = await getServerSession()

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { featureId, projectId } = await params
    if (!featureId) {
      return Response.json({ error: "Feature ID is required" }, { status: 400 });
    }
    const userIdWithSession = session.user.id
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
    const existingFeature = await prisma.featureRequest.findFirst({
      where: {
        id: featureId,
        projectId: projectId,
        project: {
          workspace: {
            userId: userIdWithSession
          }
        }
      }
    });

    if (!existingFeature) {
      return Response.json({ error: "Feature not found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = updateFeatureRequestSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: parsed.error }, { status: 400 });
    }

    const updateData: any = {};
    if (parsed.data.title !== undefined) updateData.title = parsed.data.title;
    if (parsed.data.description !== undefined) updateData.description = parsed.data.description;
    if (parsed.data.source !== undefined) updateData.source = parsed.data.source;
    if (parsed.data.status !== undefined) updateData.status = parsed.data.status;

    const feature = await prisma.featureRequest.update({
      where: {
        id: featureId,

      },
      data: updateData,
    });
    return Response.json(feature, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to update feature" },
      { status: 500 },
    );
  }
}
