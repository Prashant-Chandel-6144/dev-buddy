import { z } from "zod"
import { approvalStatusEnum } from "./enums"

// ─── Create ──────────────────────────────────────────────────────────────────
export const createApprovalSchema = z.object({
  featureRequestId: z.string().min(1, "Feature request ID is required"),
  comments: z
    .string()
    .max(2000, "Comments must be at most 2000 characters")
    .optional(),
})
export type CreateApprovalInput = z.infer<typeof createApprovalSchema>

// ─── Update (approve / reject) ───────────────────────────────────────────────
export const updateApprovalSchema = z.object({
  status: approvalStatusEnum,
  comments: z
    .string()
    .max(2000, "Comments must be at most 2000 characters")
    .optional(),
})
export type UpdateApprovalInput = z.infer<typeof updateApprovalSchema>
