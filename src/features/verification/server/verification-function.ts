import { inngest } from "@/features/inngest/client";
import { prisma } from "@/lib/db";
import { runImplementationVerification } from "./verification-agent";

export const verifyPrdImplementationFunction = inngest.createFunction(
  { id: "verify-prd-implementation-agent", triggers: [{ event: "github/pr.reviewed" }, { event: "github/review.submitted" }] },
  async ({ event, step }) => {
    const pullRequestId = event.data.pullRequestId;

    // Run verification agent
    await step.run("run-verification", async () => {
      return runImplementationVerification(pullRequestId);
    });
  }
);
