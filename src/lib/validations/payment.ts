import { z } from "zod"

export const createPaymentSchema = z.object({
  student: z.string().min(1, "El estudiante es requerido"),
  amount: z.number().positive("El monto debe ser positivo"),
  concept: z.string().min(2, "El concepto debe tener al menos 2 caracteres"),
  date: z.string().min(1, "La fecha es requerida"),
  status: z.enum(["paid", "pending"]),
})

export const updatePaymentSchema = z.object({
  amount: z.number().positive("El monto debe ser positivo").optional(),
  concept: z.string().min(2, "El concepto debe tener al menos 2 caracteres").optional(),
  date: z.string().optional(),
  status: z.enum(["paid", "pending"]).optional(),
})

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>
export type UpdatePaymentInput = z.infer<typeof updatePaymentSchema>
