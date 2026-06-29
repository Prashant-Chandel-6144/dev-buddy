import { z } from "zod"

// ─── Create ──────────────────────────────────────────────────────────────────
export const createRepositorySchema = z.object({
  githubRepoId: z.string().min(1, "GitHub repo ID is required"),
  owner: z
    .string()
    .min(1, "Owner is required")
    .max(100, "Owner must be at most 100 characters"),
  name: z
    .string()
    .min(1, "Repository name is required")
    .max(100, "Repository name must be at most 100 characters"),
  installationId: z.string().optional(),
  projectId: z.string().min(1, "Project ID is required"),
})
export type CreateRepositoryInput = z.infer<typeof createRepositorySchema>

// ─── Update ──────────────────────────────────────────────────────────────────
export const updateRepositorySchema = z.object({
  installationId: z.string().optional().nullable(),
})
export type UpdateRepositoryInput = z.infer<typeof updateRepositorySchema>
