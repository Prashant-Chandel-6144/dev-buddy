import { z } from "zod"
import { messageEnum } from "./enums"

export const createMessageSchema = z.object({
    role:messageEnum,
    featureRequestId: z.string().optional(),
    content: z.string().min(1, "Message is required"),
})
export type CreateMessageInput = z.infer<typeof createMessageSchema>

export const updateMessageSchema = z.object({
    role: messageEnum,
    featureRequestId: z.string().optional(),

    content: z.string().min(1, "Message is required"),

})
export type UpdateMessageInput = z.infer<typeof updateMessageSchema>