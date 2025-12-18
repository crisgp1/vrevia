import { z } from "zod"

const levelEnum = z.enum(["a1", "a2", "b1", "b2", "b2plus"])

export const assignStudentSchema = z.object({
  level: levelEnum,
  classType: z.enum(["individual", "grupal"]),
  group: z.string().optional(),
  phone: z.string().optional(),
  currentLesson: z.number().min(1).max(150).optional(),
  startDate: z.date().optional(),
})

export const createUserSchema = z.object({
  clerkId: z.string().min(1, "Clerk ID es requerido"),
  email: z.string().email("Email inválido"),
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  phone: z.string().optional(),
  level: levelEnum,
  classType: z.enum(["individual", "grupal"]),
  group: z.string().optional(),
  currentLesson: z.number().min(1).max(150).optional(),
})

export const updateUserSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").optional(),
  phone: z.string().optional(),
  level: levelEnum.optional(),
  classType: z.enum(["individual", "grupal"]).optional(),
  group: z.string().nullable().optional(),
  currentLesson: z.number().min(1).max(150).optional(),
  isActive: z.boolean().optional(),
})

export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type AssignStudentInput = z.infer<typeof assignStudentSchema>
