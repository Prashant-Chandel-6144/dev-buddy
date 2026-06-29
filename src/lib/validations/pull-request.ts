import { z } from "zod"
import { prStatusEnum } from "./enums"

// ─── Create ──────────────────────────────────────────────────────────────────
export const createPullRequestSchema = z.object({
  githubId: z.number().int().positive("GitHub ID must be a positive integer"),
  prNumber: z.number().int().positive("PR number must be a positive integer"),
  title: z
    .string()
    .min(1, "Title is required")
    .max(300, "Title must be at most 300 characters"),
  body: z
    .string()
    .max(10000, "Body must be at most 10000 characters")
    .optional(),
  url: z.string().url("Must be a valid URL"),
  status: prStatusEnum.optional(), // defaults to OPEN
  repositoryId: z.string().min(1, "Repository ID is required"),
  featureRequestId: z.string().optional(), // nullable FK
})
export type CreatePullRequestInput = z.infer<typeof createPullRequestSchema>

// ─── Update ──────────────────────────────────────────────────────────────────
export const updatePullRequestSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  body: z.string().max(10000).optional().nullable(),
  status: prStatusEnum.optional(),
  featureRequestId: z.string().optional().nullable(),
})
export type UpdatePullRequestInput = z.infer<typeof updatePullRequestSchema>
