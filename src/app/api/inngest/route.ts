import { serve } from "inngest/next";
import { inngest } from "@/features/inngest/client";
import { processTask } from "./function";
import { reviewPullRequest } from "@/features/reviews/server/review-pr-function";
import { syncRepoCodebaseFunction } from "@/features/repo-sync/server/repo-sync-function";
import { verifyPrdFunction, shipPrdFunction } from "@/features/reviews/server/verify-prd-function";
import { verifyPrdImplementationFunction } from "@/features/verification/server/verification-function";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    processTask,
    reviewPullRequest,
    syncRepoCodebaseFunction,
    verifyPrdFunction,
    shipPrdFunction,
    verifyPrdImplementationFunction,
  ],
});
