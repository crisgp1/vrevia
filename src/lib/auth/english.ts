import { auth } from "@clerk/nextjs/server"
import connectDB from "@/lib/db/connection"
import { EnglishStudent, EnglishSubscription } from "@/lib/db/models"

export interface EnglishStudentSession {
  id: string
  clerkId: string
  email: string
  name: string
  phone?: string
  currentLevel: string
  currentLesson: number
  completedLessons: number[]
  hasActiveSubscription: boolean
  subscriptionType?: string
  subscriptionEndDate?: Date
  isActive: boolean
}

/**
 * Obtiene el perfil del estudiante de inglés actual
 * @returns Sesión del estudiante o null si no existe
 */
export async function getEnglishStudent(): Promise<EnglishStudentSession | null> {
  const { userId } = await auth()

  if (!userId) return null

  await connectDB()

  const student = await EnglishStudent.findOne({ clerkId: userId }).lean()

  if (!student) return null

  // Buscar suscripción activa
  const subscription = await EnglishSubscription.findOne({
    student: student._id,
    status: "active",
    endDate: { $gt: new Date() },
  }).lean()

  return {
    id: student._id.toString(),
    clerkId: student.clerkId,
    email: student.email,
    name: student.name,
    phone: student.phone,
    currentLevel: student.currentLevel,
    currentLesson: student.currentLesson,
    completedLessons: student.completedLessons,
    hasActiveSubscription: !!subscription,
    subscriptionType: subscription?.type,
    subscriptionEndDate: subscription?.endDate,
    isActive: student.isActive,
  }
}

/**
 * Requiere que el usuario tenga un perfil de estudiante de inglés
 * @throws Error si el estudiante no existe
 */
export async function requireEnglishStudent(): Promise<EnglishStudentSession> {
  const student = await getEnglishStudent()

  if (!student) {
    throw new Error("No estás registrado en el módulo de inglés")
  }

  if (!student.isActive) {
    throw new Error("Tu cuenta del módulo de inglés está inactiva")
  }

  return student
}

/**
 * Requiere que el usuario tenga una suscripción activa
 * @throws Error si no hay suscripción activa
 */
export async function requireActiveSubscription(): Promise<EnglishStudentSession> {
  const student = await requireEnglishStudent()

  if (!student.hasActiveSubscription) {
    throw new Error("Necesitas una suscripción activa para acceder a este contenido")
  }

  return student
}

/**
 * Verifica si un usuario tiene acceso al módulo de inglés
 * @returns true si tiene acceso, false si no
 */
export async function hasEnglishAccess(): Promise<boolean> {
  try {
    const student = await requireActiveSubscription()
    return !!student
  } catch {
    return false
  }
}
