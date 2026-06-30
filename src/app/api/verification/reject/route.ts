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
      return NextResponse.json({ error: "No pull request associated with this feature request." }, { status: 400 });
    }

    // 2. Close PR on GitHub
    const app = getGithubApp();
    const octokit = await app.getInstallationOctokit(pr.installationId);
    const [owner, repo] = pr.repoFullName.split("/");

    await octokit.rest.pulls.update({
      owner,
      repo,
      pull_number: pr.prNumber,
      state: "closed"
    });

    // 3. Update database statuses
    await prisma.pullRequest.update({
      where: { id: pr.id },
      data: { status: "closed" },
    });

    await prisma.featureRequest.update({
      where: { id: featureId },
      data: { status: "REJECTED" },
    });

    // 4. Post system comment on PR
    await postPrComment(
      pr.installationId,
      pr.repoFullName,
      pr.prNumber,
      `🛑 **System Action: Feature Rejected!**\nThis Pull Request was explicitly rejected and closed via the Developer Dashboard.`
    );

    return NextResponse.json({ message: "Feature successfully rejected and PR closed!" }, { status: 200 });
  } catch (error: any) {
    console.error("Error rejecting feature:", error);
    return NextResponse.json({ error: error.message || "Failed to reject feature" }, { status: 500 });
  }
}
