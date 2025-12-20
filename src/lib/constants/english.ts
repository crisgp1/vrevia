// Reutilizamos los niveles del sistema principal
// NOTA: Usar LEVELS desde @/lib/constants en lugar de definirlo aquí
// export const ENGLISH_LEVELS se importa como: import { LEVELS as ENGLISH_LEVELS } from "@/lib/constants"

export const SUBSCRIPTION_TYPES = {
  monthly: {
    name: "Mensual",
    duration: 30, // días
    price: 499, // MXN
    features: [
      "Acceso a todas las lecciones",
      "Ejercicios interactivos ilimitados",
      "Seguimiento de progreso personalizado",
      "Certificado al completar nivel",
      "Soporte por email",
    ],
  },
  annual: {
    name: "Anual",
    duration: 365, // días
    price: 4990, // MXN (ahorro ~17%)
    features: [
      "Acceso a todas las lecciones",
      "Ejercicios interactivos ilimitados",
      "Seguimiento de progreso personalizado",
      "Certificado al completar nivel",
      "Soporte prioritario",
      "Ahorro del 17% vs mensual",
      "Acceso garantizado por 1 año",
    ],
  },
} as const

export const SUBSCRIPTION_STATUS_LABELS = {
  active: "Activa",
  expired: "Vencida",
  cancelled: "Cancelada",
  pending: "Pendiente",
} as const

export const SUBSCRIPTION_STATUS_COLORS = {
  active: "bg-green-100 text-green-800",
  expired: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-800",
  pending: "bg-yellow-100 text-yellow-800",
} as const

export const EXERCISE_TYPES = {
  "multiple-choice": "Opción Múltiple",
  "fill-blank": "Llenar Espacios",
  "matching": "Relacionar Columnas",
  "ordering": "Ordenar Elementos",
  "essay": "Ensayo Escrito",
  "speaking": "Expresión Oral",
} as const

export const PROGRESS_STATUS_LABELS = {
  "not-started": "No iniciada",
  "in-progress": "En progreso",
  "completed": "Completada",
} as const

export const PROGRESS_STATUS_COLORS = {
  "not-started": "bg-gray-100 text-gray-800",
  "in-progress": "bg-blue-100 text-blue-800",
  "completed": "bg-green-100 text-green-800",
} as const

// Helper para calcular precio con descuento
export function calculateSubscriptionPrice(type: "monthly" | "annual", months?: number) {
  const basePrice = SUBSCRIPTION_TYPES[type].price

  if (type === "monthly" && months) {
    return basePrice * months
  }

  return basePrice
}

// Helper para calcular fecha de vencimiento
export function calculateEndDate(startDate: Date, type: "monthly" | "annual"): Date {
  const endDate = new Date(startDate)
  const duration = SUBSCRIPTION_TYPES[type].duration
  endDate.setDate(endDate.getDate() + duration)
  return endDate
}

// Helper para verificar si una suscripción está por vencer (menos de 7 días)
export function isSubscriptionExpiringSoon(endDate: Date): boolean {
  const now = new Date()
  const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  return daysUntilExpiry <= 7 && daysUntilExpiry > 0
}

// Helper para obtener días restantes de suscripción
export function getDaysRemaining(endDate: Date): number {
  const now = new Date()
  const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  return Math.max(0, daysRemaining)
}

// Private class pricing
export const PRIVATE_CLASS_PRICE = 299 // MXN per class
export const PRIVATE_CLASS_MAX_PER_LEVEL = 3 // Maximum classes per level (any status)
export const PRIVATE_CLASS_DISCOUNT_THRESHOLD = 5 // Number of total classes to suggest full course
export const PRIVATE_CLASS_BULK_DISCOUNT = 0.15 // 15% discount for 5+ classes

export const CLASS_REQUEST_STATUS_LABELS = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  completed: "Completada",
  cancelled: "Cancelada",
} as const

export const CLASS_REQUEST_STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  completed: "bg-blue-100 text-blue-800",
  cancelled: "bg-gray-100 text-gray-800",
} as const

// EnglishLevel type - usar Level del sistema principal
export type EnglishLevel = "a1" | "a2" | "b1" | "b2" | "b2plus"
export type SubscriptionType = keyof typeof SUBSCRIPTION_TYPES
export type SubscriptionStatus = keyof typeof SUBSCRIPTION_STATUS_LABELS
export type ExerciseType = keyof typeof EXERCISE_TYPES
export type ProgressStatus = keyof typeof PROGRESS_STATUS_LABELS
export type ClassRequestStatus = keyof typeof CLASS_REQUEST_STATUS_LABELS
