import { z } from "zod"
import { featureStatusEnum } from "./enums"

// ─── Create (log a status transition) ────────────────────────────────────────
export const createFeatureHistorySchema = z.object({
  fromStatus: featureStatusEnum,
  toStatus: featureStatusEnum,
  note: z
    .string()
    .max(1000, "Note must be at most 1000 characters")
    .optional(),
  featureRequestId: z.string().min(1, "Feature request ID is required"),
  changedById: z.string().min(1, "Changed-by user ID is required"),
})
export type CreateFeatureHistoryInput = z.infer<typeof createFeatureHistorySchema>
