import { z } from "zod"
import { planEnum } from "./enums"

// ─── Create ──────────────────────────────────────────────────────────────────
export const createSubscriptionSchema = z.object({
  razorpaySubId: z.string().optional(),
  plan: planEnum.optional(),         // defaults to FREE
  workspaceId: z.string().min(1, "Workspace ID is required"),
})
export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>

// ─── Update ──────────────────────────────────────────────────────────────────
export const updateSubscriptionSchema = z.object({
  razorpaySubId: z.string().optional().nullable(),
  plan: planEnum.optional(),
  status: z.string().optional(),
  aiReviewsUsed: z.number().int().min(0).optional(),
  currentPeriodEnd: z.coerce.date().optional().nullable(),
})
export type UpdateSubscriptionInput = z.infer<typeof updateSubscriptionSchema>
