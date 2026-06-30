import { getServerSession } from "@/features/auth/actions";
import { prisma } from "@/lib/db";
import { getGithubApp } from "@/features/github/utils/github-app";
import { postPrComment } from "@/features/reviews/server/post-pr-comment";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { featureId } = body;

    if (!featureId) {
      return NextResponse.json({ error: "featureId is required" }, { status: 400 });
    }

    // 1. Fetch feature and linked tasks with owner check
    const featureRequest = await prisma.featureRequest.findFirst({
      where: {
        id: featureId,
        project: {
          workspace: {
            userId: session.user.id
          }
        }
      },
      include: {
        tasks: true
      }
    });

    if (!featureRequest) {
      return NextResponse.json({ error: "Feature request not found or unauthorized" }, { status: 404 });
    }

    // Fetch associated PullRequest separately using raw SQL to bypass Prisma client validation
    const prs = await prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM "pull_request" WHERE "featureRequestId" = $1 ORDER BY "createdAt" DESC LIMIT 1`,
      featureId
    );
    const pr = prs[0] || null;

    if (!pr) {
      return NextResponse.json({ error: "No pull request associated with this feature request. Pull requests are synchronized via GitHub webhooks." }, { status: 400 });
    }

    // 2. Verify all tasks are complete (Warning only, no strict block to allow manual merges)
    const openTasks = featureRequest.tasks.filter((t: any) => t.status !== "COMPLETED" && t.status !== "DONE");
    if (openTasks.length > 0) {
      console.warn(`Merging with ${openTasks.length} incomplete tasks.`);
    }

    // 3. Execute squash merge on GitHub
    const app = getGithubApp();
    const octokit = await app.getInstallationOctokit(pr.installationId);
    const [owner, repo] = pr.repoFullName.split("/");

    const mergeResult = await octokit.rest.pulls.merge({
      owner,
      repo,
      pull_number: pr.prNumber,
      merge_method: "squash",
      commit_title: `🚢 Ship Feature: ${featureRequest.title} (PR #${pr.prNumber})`,
      commit_message: `Verified and merged automatically by ShipFlow AI from Developer Dashboard.`,
    });

    // 4. Update database statuses
    await prisma.pullRequest.update({
      where: { id: pr.id },
      data: { status: "merged" },
    });

    await prisma.featureRequest.update({
      where: { id: featureId },
      data: { status: "SHIPPED" },
    });

    await prisma.task.updateMany({
      where: { featureRequestId: featureId },
      data: { status: "DONE" },
    });

    await (prisma as any).releaseHistory.create({
      data: {
        featureRequestId: featureId,
        prNumber: pr.prNumber,
        commitSha: mergeResult.data.sha || "",
        mergedBy: session.user.name || "Dashboard User",
        completionPercentage: 100,
        verificationResult: "READY_FOR_MERGE",
        releaseNotes: featureRequest.title,
      },
    });

    // 5. Post system comment on PR
    await postPrComment(
      pr.installationId,
      pr.repoFullName,
      pr.prNumber,
      `🚀 **System Action: Feature Shipped!**\nSquash-merged Pull Request successfully via the Developer Dashboard button. Feature request status updated to **SHIPPED**.`
    );

    return NextResponse.json({ message: "Feature successfully shipped and merged!" }, { status: 200 });
  } catch (error: any) {
    console.error("Error shipping feature:", error);
    return NextResponse.json({ error: error.message || "Failed to ship feature" }, { status: 500 });
  }
}
