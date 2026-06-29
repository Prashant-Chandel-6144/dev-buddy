import { z } from "zod"

// ─── JSON sub-schemas (matching Prisma comments) ─────────────────────────────

export const blockingIssueSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  file: z.string().optional(),
  line: z.number().int().positive().optional(),
})
export type BlockingIssue = z.infer<typeof blockingIssueSchema>

export const nonBlockingIssueSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
})
export type NonBlockingIssue = z.infer<typeof nonBlockingIssueSchema>

// ─── Create ──────────────────────────────────────────────────────────────────
export const createAIReviewSchema = z.object({
  summary: z
    .string()
    .min(1, "Summary is required")
    .max(5000, "Summary must be at most 5000 characters"),
  blockingIssues: z.array(blockingIssueSchema),
  nonBlockingIssues: z.array(nonBlockingIssueSchema),
  passed: z.boolean(),
  pullRequestId: z.string().min(1, "Pull request ID is required"),
})
export type CreateAIReviewInput = z.infer<typeof createAIReviewSchema>
