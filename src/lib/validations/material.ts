import { z } from "zod"

export const createMaterialSchema = z.object({
  title: z.string().min(2, "El título debe tener al menos 2 caracteres"),
  description: z.string().optional(),
  fileUrl: z.string().url("URL del archivo inválida"),
  fileName: z.string().min(1, "El nombre del archivo es requerido"),
  lesson: z.number().min(1).max(150),
  assignedTo: z.object({
    type: z.enum(["group", "student"]),
    id: z.string().min(1, "El ID de asignación es requerido"),
  }).optional(),
})

export const updateMaterialSchema = z.object({
  title: z.string().min(2, "El título debe tener al menos 2 caracteres").optional(),
  description: z.string().optional(),
  lesson: z.number().min(1).max(150).optional(),
  assignedTo: z.object({
    type: z.enum(["group", "student"]),
    id: z.string().min(1, "El ID de asignación es requerido"),
  }).optional().nullable(),
})

export type CreateMaterialInput = z.infer<typeof createMaterialSchema>
export type UpdateMaterialInput = z.infer<typeof updateMaterialSchema>
