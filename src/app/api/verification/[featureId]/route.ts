import { getServerSession } from "@/features/auth/actions";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { featureId: string } }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { featureId } = await params;

    const feature = await prisma.featureRequest.findUnique({
      where: { id: featureId },
      include: {
        tasks: true,
        pullRequests: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!feature) {
      return NextResponse.json({ error: "Feature request not found" }, { status: 404 });
    }

    const pr = feature.pullRequests[0] || null;

    // Calculate task progress metrics dynamically
    const totalTasks = feature.tasks.length;
    const completedTasks = feature.tasks.filter((t) => t.status === "COMPLETED" || t.status === "DONE").length;
    const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    let featureStatus = "FEATURE_INCOMPLETE";
    if (pr) {
      if (["READY_FOR_MERGE", "CHANGES_REQUIRED", "FEATURE_INCOMPLETE"].includes(pr.status)) {
        featureStatus = pr.status;
      } else {
        featureStatus = totalTasks > 0 && completedTasks === totalTasks ? "READY_FOR_MERGE" : "FEATURE_INCOMPLETE";
      }
    }

    const tasks = feature.tasks.map((t) => ({
      taskId: t.id,
      title: t.title,
      status: t.status,
    }));

    return NextResponse.json({
      featureId: feature.id,
      featureTitle: feature.title,
      featureStatus,
      completionPercentage,
      completedTasks,
      totalTasks,
      tasks,
      verificationSummary: pr?.reviewComment || null,
      verifiedAt: pr?.reviewedAt || null,
    }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching verification status:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch verification status" },
      { status: 500 }
    );
  }
}
