import { z } from "zod"

// ─── Create ──────────────────────────────────────────────────────────────────
export const createProjectSchema = z.object({
  name: z
    .string()
    .min(3, "Project name must be at least 3 characters")
    .max(100, "Project name must be at most 100 characters"),
  description: z
    .string()
    .max(500, "Description must be at most 500 characters")
    .optional(),
  githubRepoUrl: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  githubRepoName: z.string().optional(),
  workspaceId: z.string().optional(),
})
export type CreateProjectInput = z.infer<typeof createProjectSchema>

// ─── Update ──────────────────────────────────────────────────────────────────
export const updateProjectSchema = z.object({
  name: z
    .string()
    .min(3, "Project name must be at least 3 characters")
    .max(100, "Project name must be at most 100 characters")
    .optional(),
  description: z
    .string()
    .max(500, "Description must be at most 500 characters")
    .optional()
    .nullable(),
  githubRepoUrl: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .nullable()
    .or(z.literal("")),
  githubRepoName: z.string().optional().nullable(),
})
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>