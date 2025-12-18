import { z } from "zod"

export const createAssignmentSchema = z.object({
  title: z.string().min(2, "El título debe tener al menos 2 caracteres"),
  description: z.string().optional(),
  attachmentUrl: z.string().url().optional().or(z.literal("")),
  attachmentName: z.string().optional(),
  dueDate: z.string().min(1, "La fecha de entrega es requerida"),
  lesson: z.number().min(1).max(150).nullable().optional(), // null = extracurricular
  assignedTo: z.object({
    type: z.enum(["level", "group", "student"]),
    id: z.string().min(1, "El ID de asignación es requerido"),
  }),
})

export const updateAssignmentSchema = z.object({
  title: z.string().min(2, "El título debe tener al menos 2 caracteres").optional(),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  lesson: z.number().min(1).max(150).nullable().optional(),
  assignedTo: z.object({
    type: z.enum(["level", "group", "student"]),
    id: z.string().min(1, "El ID de asignación es requerido"),
  }).optional(),
})

export const gradeSubmissionSchema = z.object({
  grade: z.number().min(0).max(100),
  feedback: z.string().optional(),
  isExtraordinary: z.boolean().optional(),
})

export type CreateAssignmentInput = z.infer<typeof createAssignmentSchema>
export type UpdateAssignmentInput = z.infer<typeof updateAssignmentSchema>
export type GradeSubmissionInput = z.infer<typeof gradeSubmissionSchema>
