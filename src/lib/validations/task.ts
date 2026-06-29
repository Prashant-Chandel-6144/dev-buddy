import { z } from "zod"
import { taskStatusEnum, priorityEnum } from "./enums"

// ─── Create ──────────────────────────────────────────────────────────────────
export const createTaskSchema = z.object({
  title: z
    .string()
    .min(3, "Task title must be at least 3 characters")
    .max(200, "Task title must be at most 200 characters"),
  description: z
    .string()
    .max(2000, "Description must be at most 2000 characters")
    .optional(),
  status: taskStatusEnum.optional(),    // defaults to TODO
  priority: priorityEnum.optional(),    // defaults to MEDIUM
  order: z.number().int().min(0).optional(), // defaults to 0
  featureRequestId: z.string().min(1, "Feature request ID is required"),
})
export type CreateTaskInput = z.infer<typeof createTaskSchema>


export const aiGeneratedTaskSchema = z.object({
  title: z
    .string()
    .min(3, "Task title must be at least 3 characters")
    .max(200, "Task title must be at most 200 characters"),

  description: z
    .string()
    .min(10, "Task description must be at least 10 characters")
    .max(2000, "Description must be at most 2000 characters"),

  priority: priorityEnum.default("MEDIUM"),
});

export type AIGeneratedTask = z.infer<typeof aiGeneratedTaskSchema>;

// ─── Update ──────────────────────────────────────────────────────────────────
export const updateTaskSchema = z.object({
  title: z
    .string()
    .min(3, "Task title must be at least 3 characters")
    .max(200, "Task title must be at most 200 characters")
    .optional(),
  description: z
    .string()
    .max(2000, "Description must be at most 2000 characters")
    .optional()
    .nullable(),
  status: taskStatusEnum.optional(),
  priority: priorityEnum.optional(),
  order: z.number().int().min(0).optional(),
})
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>

// ─── Bulk reorder (for kanban drag-and-drop) ─────────────────────────────────
export const reorderTasksSchema = z.object({
  tasks: z.array(
    z.object({
      id: z.string().min(1),
      order: z.number().int().min(0),
      status: taskStatusEnum.optional(), // column may change during drag
    })
  ),
})
export type ReorderTasksInput = z.infer<typeof reorderTasksSchema>
