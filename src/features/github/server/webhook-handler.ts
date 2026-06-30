import { inngest } from "@/features/inngest/client";
import { savePullRequest } from "@/features/reviews/server/save-pull-request";
import { getGithubApp } from "../utils/github-app";
import { getUserIdByInstallationId } from "./installation";
import { canUserReview } from "@/features/billing/server/usage";
import { prisma } from "@/lib/db";


const REVIEWABLE_ACTIONS = ["opened", "synchronize", "reopened"];

export type PullRequestWebhookPayload = {
  /** Webhook action, e.g. `opened`, `synchronize`, `reopened` */
  action: string;
  /** GitHub App installation that received the event */
  installation: { id: number };
  repository: { full_name: string };
  pull_request: {
    number: number;
    title: string;
    user: { login: string } | null;
    head: { sha: string };
    base: { ref: string };
  };
};

async function isSignatureValid(payload: string, signature: string | null) {
  if (!signature) {
    return false;
  }

  const app = getGithubApp();
  // Octokit wraps GitHub's webhook crypto — rejects forged payloads.
  return app.webhooks.verify(payload, signature);
}



export async function handleGithubWebhook(request: Request) {
  const payload = await request.text();
  const signature = request.headers.get("x-hub-signature-256");
  const eventName = request.headers.get("x-github-event");

  const isValid = await isSignatureValid(payload, signature);

  if (!isValid) {
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }

  if (eventName !== "pull_request" && eventName !== "issue_comment" && eventName !== "pull_request_review") {
    return Response.json({ received: true });
  }

  const event = JSON.parse(payload);

  if (eventName === "pull_request_review") {
    if (event.action !== "submitted") {
      return Response.json({ received: true });
    }

    const repoFullName = event.repository.full_name;
    const prNumber = event.pull_request.number;

    const pullRequest = await prisma.pullRequest.findUnique({
      where: {
        repoFullName_prNumber: {
          repoFullName,
          prNumber,
        },
      },
    });

    if (pullRequest) {
      await inngest.send({
        name: "github/review.submitted",
        data: { pullRequestId: pullRequest.id },
      });
    }

    return Response.json({ received: true });
  }

  if (eventName === "issue_comment") {
    // issue_comment is used for standard PR comments on the main conversation tab
    // We must verify the comment was just created and that it is on a Pull Request (has pull_request object)
    if (event.action !== "created" || !event.issue || !event.issue.pull_request) {
      return Response.json({ received: true });
    }

    const commentBody = (event.comment.body || "").trim();
    const isVerify = commentBody.startsWith("/verify");
    const isShip = commentBody.startsWith("/ship");

    if (!isVerify && !isShip) {
      return Response.json({ received: true });
    }

    await inngest.send({
      name: "github/comment.received",
      data: {
        installationId: event.installation.id,
        repoFullName: event.repository.full_name,
        prNumber: event.issue.number,
        commentBody,
        commenter: event.comment.user?.login || "unknown",
        command: isVerify ? "verify" : "ship",
      },
    });

    return Response.json({ received: true });
  }

  console.log("pull_request event", event);

  if (event.action === "closed" && event.pull_request.merged === true) {
    const repoFullName = event.repository.full_name;
    const prNumber = event.pull_request.number;

    const pullRequest = await prisma.pullRequest.findUnique({
      where: { repoFullName_prNumber: { repoFullName, prNumber } },
    });

    if (pullRequest && (pullRequest as any).featureRequestId) {
      const prFeatureRequestId = (pullRequest as any).featureRequestId;
      await prisma.pullRequest.update({
        where: { id: pullRequest.id },
        data: { status: "merged" },
      });

      await prisma.featureRequest.update({
        where: { id: prFeatureRequestId },
        data: { status: "SHIPPED" },
      });

      await prisma.task.updateMany({
        where: { featureRequestId: prFeatureRequestId },
        data: { status: "DONE" },
      });

      await (prisma as any).releaseHistory.create({
        data: {
          featureRequestId: prFeatureRequestId,
          prNumber: prNumber,
          commitSha: event.pull_request.merge_commit_sha || "",
          mergedBy: event.sender?.login || "unknown",
          completionPercentage: 100,
          verificationResult: pullRequest.status,
          releaseNotes: event.pull_request.title,
        },
      });
    }
    return Response.json({ received: true });
  }

  // Handle PR closed without merge (rejected)
  if (event.action === "closed" && event.pull_request.merged === false) {
    const repoFullName = event.repository.full_name;
    const prNumber = event.pull_request.number;

    const pullRequest = await prisma.pullRequest.findUnique({
      where: { repoFullName_prNumber: { repoFullName, prNumber } },
    });

    if (pullRequest && (pullRequest as any).featureRequestId) {
      const prFeatureRequestId = (pullRequest as any).featureRequestId;
      await prisma.pullRequest.update({
        where: { id: pullRequest.id },
        data: { status: "closed" },
      });

      await prisma.featureRequest.update({
        where: { id: prFeatureRequestId },
        data: { status: "REJECTED" },
      });
    } else if (pullRequest) {
      // Just close the PR if it's not linked to a feature
      await prisma.pullRequest.update({
        where: { id: pullRequest.id },
        data: { status: "closed" },
      });
    }

    return Response.json({ received: true });
  }

  if (!REVIEWABLE_ACTIONS.includes(event.action)) {
    return Response.json({ received: true });
  }

  const pullRequest = await savePullRequest(event);

  const userId = await getUserIdByInstallationId(event.installation.id);

  if(userId){
    const allowed = await canUserReview(userId);
    if(!allowed){
      await prisma.pullRequest.update({
        where:{
          id:pullRequest.id
        },
        data:{
          status:"rate_limited"
        }
      });
      return Response.json({ received: true  , rateLimited:true});
    }
  }

  await inngest.send({
    name: "github/pr.received",
    data: { pullRequestId: pullRequest.id },
  });

  return Response.json({ received: true });
}