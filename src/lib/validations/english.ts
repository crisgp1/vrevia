import { z } from "zod"

// EnglishStudent validations
export const createEnglishStudentSchema = z.object({
  clerkId: z.string().min(1, "Clerk ID es requerido"),
  email: z.string().email("Email inválido"),
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  phone: z.string().optional(),
  currentLevel: z.enum(["a1", "a2", "b1", "b2", "b2plus"]).default("a1"),
  currentLesson: z.number().min(1).max(150).default(1),
})

export const updateEnglishStudentSchema = z.object({
  email: z.string().email("Email inválido").optional(),
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").optional(),
  phone: z.string().optional(),
  currentLevel: z.enum(["a1", "a2", "b1", "b2", "b2plus"]).optional(),
  currentLesson: z.number().min(1).max(150).optional(),
  isActive: z.boolean().optional(),
})

// EnglishSubscription validations
export const createEnglishSubscriptionSchema = z.object({
  studentId: z.string().min(1, "ID del estudiante es requerido"),
  type: z.enum(["monthly", "annual"]),
  price: z.number().min(0, "El precio debe ser positivo"),
  startDate: z.string().optional(), // ISO string, default: now
  paymentMethod: z.enum(["stripe", "paypal", "manual"]).optional(),
  transactionId: z.string().optional(),
})

export const updateEnglishSubscriptionSchema = z.object({
  status: z.enum(["active", "expired", "cancelled", "pending"]).optional(),
  endDate: z.string().optional(), // ISO string
  autoRenew: z.boolean().optional(),
  cancelReason: z.string().optional(),
})

// EnglishLesson validations
export const createEnglishLessonSchema = z.object({
  lessonNumber: z.number().min(1).max(150),
  level: z.enum(["a1", "a2", "b1", "b2", "b2plus"]),
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
  grammar: z.string().min(3, "La gramática es requerida"),
  vocabulary: z.string().min(3, "El vocabulario es requerido"),
  estimatedDuration: z.number().min(1).default(60),
  isPublished: z.boolean().default(false),
})

export const updateEnglishLessonSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(10).optional(),
  grammar: z.string().min(3).optional(),
  vocabulary: z.string().min(3).optional(),
  estimatedDuration: z.number().min(1).optional(),
  isPublished: z.boolean().optional(),
})

export const addLessonContentSchema = z.object({
  type: z.enum(["text", "video", "audio", "image", "interactive"]),
  title: z.string().min(1),
  content: z.string().min(1),
  order: z.number().min(0),
})

export const addLessonResourceSchema = z.object({
  title: z.string().min(1),
  type: z.enum(["pdf", "audio", "video"]),
  url: z.string().url("URL inválida"),
})

// EnglishExercise validations
export const questionSchema = z.object({
  id: z.string(),
  question: z.string().min(1, "La pregunta es requerida"),
  type: z.string(),
  options: z.array(z.string()).optional(),
  correctAnswer: z.union([z.string(), z.array(z.string())]).optional(),
  points: z.number().min(0).default(1),
  explanation: z.string().optional(),
})

export const createEnglishExerciseSchema = z.object({
  lessonId: z.string().min(1, "ID de lección es requerido"),
  lessonNumber: z.number().min(1).max(150),
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  type: z.enum(["multiple-choice", "fill-blank", "matching", "ordering", "essay", "speaking"]),
  questions: z.array(questionSchema).min(1, "Debe haber al menos una pregunta"),
  passingScore: z.number().min(0).max(100).default(70),
  allowRetry: z.boolean().default(true),
  maxAttempts: z.number().min(1).optional(),
  order: z.number().min(0).default(1),
  isRequired: z.boolean().default(true),
})

export const updateEnglishExerciseSchema = z.object({
  title: z.string().min(3).optional(),
  questions: z.array(questionSchema).min(1).optional(),
  passingScore: z.number().min(0).max(100).optional(),
  allowRetry: z.boolean().optional(),
  maxAttempts: z.number().min(1).optional(),
  order: z.number().min(0).optional(),
  isRequired: z.boolean().optional(),
})

// Exercise submission validation
export const exerciseAnswerSchema = z.object({
  questionId: z.string(),
  answer: z.any(), // Acepta cualquier tipo: string, array, object para diferentes tipos de ejercicios
})

export const submitExerciseSchema = z.object({
  exerciseId: z.string().min(1),
  answers: z.array(exerciseAnswerSchema).min(1, "Debe responder al menos una pregunta"),
})

// Progress tracking
export const updateProgressSchema = z.object({
  lessonId: z.string().min(1),
  progress: z.number().min(0).max(100),
  timeSpent: z.number().min(0), // minutos
})

export const markLessonCompleteSchema = z.object({
  lessonNumber: z.number().min(1).max(150),
})

// Certificate generation
export const generateCertificateSchema = z.object({
  level: z.enum(["a1", "a2", "b1", "b2", "b2plus"]),
})

// Types
export type CreateEnglishStudentInput = z.infer<typeof createEnglishStudentSchema>
export type UpdateEnglishStudentInput = z.infer<typeof updateEnglishStudentSchema>
export type CreateEnglishSubscriptionInput = z.infer<typeof createEnglishSubscriptionSchema>
export type UpdateEnglishSubscriptionInput = z.infer<typeof updateEnglishSubscriptionSchema>
export type CreateEnglishLessonInput = z.infer<typeof createEnglishLessonSchema>
export type UpdateEnglishLessonInput = z.infer<typeof updateEnglishLessonSchema>
export type AddLessonContentInput = z.infer<typeof addLessonContentSchema>
export type AddLessonResourceInput = z.infer<typeof addLessonResourceSchema>
export type CreateEnglishExerciseInput = z.infer<typeof createEnglishExerciseSchema>
export type UpdateEnglishExerciseInput = z.infer<typeof updateEnglishExerciseSchema>
export type SubmitExerciseInput = z.infer<typeof submitExerciseSchema>
export type UpdateProgressInput = z.infer<typeof updateProgressSchema>
export type MarkLessonCompleteInput = z.infer<typeof markLessonCompleteSchema>
export type GenerateCertificateInput = z.infer<typeof generateCertificateSchema>
