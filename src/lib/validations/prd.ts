import { z } from "zod"
import { prdStatusEnum } from "./enums"

// ─── JSON sub-schemas (matching Prisma comments) ─────────────────────────────

export const userStorySchema = z.object({
  as: z.string().min(1, "\"As a\" is required"),
  iWant: z.string().min(1, "\"I want\" is required"),
  soThat: z.string().min(1, "\"So that\" is required"),
})
export type UserStory = z.infer<typeof userStorySchema>

export const acceptanceCriterionSchema = z.object({
  scenario: z.string().min(1, "Scenario is required"),
  given: z.string().min(1, "Given is required"),
  when: z.string().min(1, "When is required"),
  then: z.string().min(1, "Then is required"),
})
export type AcceptanceCriterion = z.infer<typeof acceptanceCriterionSchema>

// ─── AI PRD Response Schema ──────────────────────────────────────────────────
export const aiPRDResponseSchema = z.object({
  problemStatement: z
    .string()
    .min(10, "Problem statement must be at least 10 characters"),
  edgeCases: z
    .string()
    .min(1, "Edge cases explanation is required"),
  goals: z
    .array(z.string().min(1, "Goal cannot be empty"))
    .min(1, "At least one goal is required"),
  nonGoals: z
    .array(z.string().min(1, "Non-goal cannot be empty"))
    .default([]),
  userStories: z
    .array(z.string().min(1, "User story cannot be empty"))
    .default([]),
  successMetrics: z
    .array(z.string().min(1, "Success metric cannot be empty"))
    .default([]),
  acceptanceCriteria: z
    .array(z.string().min(1, "Acceptance criterion cannot be empty"))
    .default([]),
  implementationApproach: z
    .array(z.string().min(1, "Implementation approach item cannot be empty"))
    .default([]),
  content: z
    .string()
    .min(1, "Detailed markdown content is required"),
})
export type AIPRDResponse = z.infer<typeof aiPRDResponseSchema>

// ─── Create ──────────────────────────────────────────────────────────────────
export const createPRDSchema = z.object({
  problemStatement: z
    .string()
    .min(10, "Problem statement must be at least 10 characters"),
  edgeCases: z
    .string()
    .min(1, "Edge cases explanation is required"),
  goals: z
    .array(z.string().min(1, "Goal cannot be empty"))
    .min(1, "At least one goal is required"),
  nonGoals: z
    .array(z.string().min(1, "Non-goal cannot be empty"))
    .default([]),
  userStories: z
    .array(z.string().min(1, "User story cannot be empty"))
    .default([]),
  successMetrics: z
    .array(z.string().min(1, "Success metric cannot be empty"))
    .default([]),
  acceptanceCriteria: z
    .array(z.string().min(1, "Acceptance criterion cannot be empty"))
    .default([]),
  implementationApproach: z
    .array(z.string().min(1, "Implementation approach item cannot be empty"))
    .default([]),
  content: z
    .string()
    .min(1, "Content is required"),
  status: prdStatusEnum.optional(),
  featureRequestId: z.string().min(1, "Feature request ID is required"),
})
export type CreatePRDInput = z.infer<typeof createPRDSchema>

// ─── Update ──────────────────────────────────────────────────────────────────
export const updatePRDSchema = z.object({
  problemStatement: z.string().min(10).optional(),
  edgeCases: z.string().min(1).optional(),
  goals: z.array(z.string().min(1)).optional(),
  nonGoals: z.array(z.string().min(1)).optional(),
  userStories: z.array(z.string().min(1)).optional(),
  successMetrics: z.array(z.string().min(1)).optional(),
  acceptanceCriteria: z.array(z.string().min(1)).optional(),
  implementationApproach: z.array(z.string().min(1)).optional(),
  content: z.string().min(1).optional(),
  status: prdStatusEnum.optional(),
})

export type UpdatePRDInput = z.infer<typeof updatePRDSchema>
