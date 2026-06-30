import { z } from "zod"

// ─── Plan ────────────────────────────────────────────────────────────────────
export const planEnum = z.enum(["FREE", "PRO", "ENTERPRISE"])
export type Plan = z.infer<typeof planEnum>

// ─── Role ────────────────────────────────────────────────────────────────────
export const roleEnum = z.enum(["OWNER", "ADMIN", "MEMBER"])
export type Role = z.infer<typeof roleEnum>

// ─── Source ──────────────────────────────────────────────────────────────────
export const sourceEnum = z.enum(["EMAIL", "TICKET", "CALL", "MANUAL", "AGENT"])
export type Source = z.infer<typeof sourceEnum>
export const messageEnum = z.enum(["USER", "ASSISTANT"])
export type Message = z.infer<typeof messageEnum>
// ─── FeatureStatus ───────────────────────────────────────────────────────────
export const featureStatusEnum = z.enum([
  "SUBMITTED",
  "ANALYZING",
  "PRD_GENERATED",
  "TASKS_CREATED",
  "IN_REVIEW",
  "FIX_NEEDED",
  "APPROVED",
  "SHIPPED",
  "REJECTED",
  "DRAFT",
  "PLANNING",
  "IN_DEVELOPMENT",
  "CHANGES_REQUIRED",
  "READY_FOR_MERGE"
])
export type FeatureStatus = z.infer<typeof featureStatusEnum>

// ─── PRDStatus ───────────────────────────────────────────────────────────────
export const prdStatusEnum = z.enum(["GENERATING", "READY", "FAILED", "draft", "approved"])
export type PRDStatus = z.infer<typeof prdStatusEnum>

// ─── TaskStatus ──────────────────────────────────────────────────────────────
export const taskStatusEnum = z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"])
export type TaskStatus = z.infer<typeof taskStatusEnum>

// ─── Priority ────────────────────────────────────────────────────────────────
export const priorityEnum = z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"])
export type Priority = z.infer<typeof priorityEnum>

// ─── ApprovalStatus ──────────────────────────────────────────────────────────
export const approvalStatusEnum = z.enum(["PENDING", "APPROVED", "REJECTED"])
export type ApprovalStatus = z.infer<typeof approvalStatusEnum>

// ─── PRStatus ────────────────────────────────────────────────────────────────
export const prStatusEnum = z.enum(["OPEN", "CLOSED", "MERGED"])
export type PRStatus = z.infer<typeof prStatusEnum>
