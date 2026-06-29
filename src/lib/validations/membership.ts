import { z } from "zod"
import { roleEnum } from "./enums"

// ─── Add member ──────────────────────────────────────────────────────────────
export const addMemberSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  workspaceId: z.string().min(1, "Workspace ID is required"),
  role: roleEnum.optional(), // defaults to MEMBER in Prisma
})
export type AddMemberInput = z.infer<typeof addMemberSchema>

// ─── Update member role ──────────────────────────────────────────────────────
export const updateMemberRoleSchema = z.object({
  role: roleEnum,
})
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>
