import { z } from "zod"

// ─── Create ──────────────────────────────────────────────────────────────────
export const createWorkspaceSchema = z.object({
  name: z
    .string()
    .min(3, "Workspace name must be at least 3 characters")
    .max(50, "Workspace name must be at most 50 characters"),
})
export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>

// ─── Update ──────────────────────────────────────────────────────────────────
export const updateWorkspaceSchema = z.object({
  name: z
    .string()
    .min(3, "Workspace name must be at least 3 characters")
    .max(50, "Workspace name must be at most 50 characters")
    .optional(),
})
export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>