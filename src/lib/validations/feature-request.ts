import { z } from "zod"
import { sourceEnum, featureStatusEnum } from "./enums"

// ─── Create ──────────────────────────────────────────────────────────────────
export const createFeatureRequestSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must be at most 200 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(5000, "Description must be at most 5000 characters"),
  source: sourceEnum.default("MANUAL"),
  status:featureStatusEnum.default("ANALYZING"),
  projectId: z.string().min(1, "Project ID is required"),
})
export type CreateFeatureRequestInput = z.infer<typeof createFeatureRequestSchema>

// ─── Update ──────────────────────────────────────────────────────────────────
export const updateFeatureRequestSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must be at most 200 characters")
    .optional(),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(5000, "Description must be at most 5000 characters")
    .optional(),
  source: sourceEnum.optional(),
  status:featureStatusEnum.optional().default("ANALYZING"),
})
export type UpdateFeatureRequestInput = z.infer<typeof updateFeatureRequestSchema>
