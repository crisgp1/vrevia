import { z } from "zod"

const levelEnum = z.enum(["a1", "a2", "b1", "b2", "b2plus"])

export const createGroupSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  level: levelEnum,
  schedule: z.string().min(1, "El horario es requerido"),
  description: z.string().optional(),
})

export const updateGroupSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").optional(),
  level: levelEnum.optional(),
  schedule: z.string().min(1, "El horario es requerido").optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
})

export type CreateGroupInput = z.infer<typeof createGroupSchema>
export type UpdateGroupInput = z.infer<typeof updateGroupSchema>
