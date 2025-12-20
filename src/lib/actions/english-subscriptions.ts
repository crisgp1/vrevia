"use server"

import { revalidatePath } from "next/cache"
import connectDB from "@/lib/db/connection"
import { EnglishStudent, EnglishSubscription } from "@/lib/db/models"
import { requireAdmin } from "@/lib/auth"
import { getEnglishStudent } from "@/lib/auth/english"
import { calculateEndDate } from "@/lib/constants/english"
import {
  createEnglishSubscriptionSchema,
  updateEnglishSubscriptionSchema,
  type CreateEnglishSubscriptionInput,
  type UpdateEnglishSubscriptionInput,
} from "@/lib/validations/english"

/**
 * Obtiene todas las suscripciones (Admin)
 */
export async function getEnglishSubscriptions() {
  try {
    await requireAdmin()
    await connectDB()

    const subscriptions = await EnglishSubscription.find()
      .populate("student")
      .sort({ createdAt: -1 })
      .lean()

    return {
      success: true,
      data: JSON.parse(JSON.stringify(subscriptions)),
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al obtener suscripciones",
    }
  }
}

/**
 * Crea una nueva suscripción (Admin)
 */
export async function createSubscription(data: CreateEnglishSubscriptionInput) {
  try {
    await requireAdmin()
    await connectDB()

    // Validar datos
    const validatedData = createEnglishSubscriptionSchema.parse(data)

    // Verificar que el estudiante exista
    const student = await EnglishStudent.findById(validatedData.studentId)
    if (!student) {
      return {
        success: false,
        error: "Estudiante no encontrado",
      }
    }

    // Calcular fechas
    const startDate = validatedData.startDate ? new Date(validatedData.startDate) : new Date()
    const endDate = calculateEndDate(startDate, validatedData.type)

    // Crear suscripción
    const subscription = await EnglishSubscription.create({
      student: validatedData.studentId,
      type: validatedData.type,
      status: "active",
      startDate,
      endDate,
      price: validatedData.price,
      currency: "MXN",
      paymentMethod: validatedData.paymentMethod || "manual",
      transactionId: validatedData.transactionId,
      autoRenew: false,
    })

    // Actualizar referencia en el estudiante
    await EnglishStudent.findByIdAndUpdate(validatedData.studentId, {
      subscription: subscription._id,
    })

    revalidatePath("/dashboard/ingles/suscripciones")
    revalidatePath("/dashboard/ingles/estudiantes")

    return {
      success: true,
      data: JSON.parse(JSON.stringify(subscription)),
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al crear suscripción",
    }
  }
}

/**
 * Actualiza una suscripción (Admin)
 */
export async function updateSubscription(id: string, data: UpdateEnglishSubscriptionInput) {
  try {
    await requireAdmin()
    await connectDB()

    // Validar datos
    const validatedData = updateEnglishSubscriptionSchema.parse(data)

    const updateData: any = { ...validatedData }

    // Si se está cancelando, agregar fecha de cancelación
    if (validatedData.status === "cancelled" && !updateData.cancelledAt) {
      updateData.cancelledAt = new Date()
    }

    // Convertir endDate string a Date si existe
    if (validatedData.endDate) {
      updateData.endDate = new Date(validatedData.endDate)
    }

    const subscription = await EnglishSubscription.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    )

    if (!subscription) {
      return {
        success: false,
        error: "Suscripción no encontrada",
      }
    }

    revalidatePath("/dashboard/ingles/suscripciones")
    revalidatePath("/ingles")

    return {
      success: true,
      data: JSON.parse(JSON.stringify(subscription)),
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al actualizar suscripción",
    }
  }
}

/**
 * Marca suscripciones vencidas (Cron job o manual)
 */
export async function checkExpiredSubscriptions() {
  try {
    await connectDB()

    const result = await EnglishSubscription.updateMany(
      {
        status: "active",
        endDate: { $lt: new Date() },
      },
      {
        $set: { status: "expired" },
      }
    )

    return {
      success: true,
      message: `${result.modifiedCount} suscripciones marcadas como vencidas`,
      count: result.modifiedCount,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al verificar suscripciones",
    }
  }
}

/**
 * Obtiene la suscripción del estudiante actual
 */
export async function getMySubscription() {
  try {
    const student = await getEnglishStudent()

    if (!student) {
      return {
        success: false,
        error: "No estás registrado en el módulo de inglés",
      }
    }

    await connectDB()

    const subscription = await EnglishSubscription.findOne({
      student: student.id,
    })
      .sort({ createdAt: -1 })
      .lean()

    return {
      success: true,
      data: subscription ? JSON.parse(JSON.stringify(subscription)) : null,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al obtener suscripción",
    }
  }
}

/**
 * Renueva una suscripción existente (Admin o Auto-renovación)
 */
export async function renewSubscription(studentId: string, type: "monthly" | "annual") {
  try {
    await requireAdmin()
    await connectDB()

    // Obtener suscripción actual
    const currentSubscription = await EnglishSubscription.findOne({
      student: studentId,
    }).sort({ createdAt: -1 })

    if (!currentSubscription) {
      return {
        success: false,
        error: "No se encontró suscripción anterior",
      }
    }

    // Calcular fechas desde hoy
    const startDate = new Date()
    const endDate = calculateEndDate(startDate, type)

    // Marcar la anterior como cancelada si estaba activa
    if (currentSubscription.status === "active") {
      await EnglishSubscription.findByIdAndUpdate(currentSubscription._id, {
        status: "expired",
      })
    }

    // Crear nueva suscripción
    const newSubscription = await EnglishSubscription.create({
      student: studentId,
      type,
      status: "active",
      startDate,
      endDate,
      price: currentSubscription.price,
      currency: currentSubscription.currency,
      paymentMethod: currentSubscription.paymentMethod,
      autoRenew: false,
    })

    // Actualizar referencia en el estudiante
    await EnglishStudent.findByIdAndUpdate(studentId, {
      subscription: newSubscription._id,
    })

    revalidatePath("/dashboard/ingles/suscripciones")
    revalidatePath("/ingles")

    return {
      success: true,
      data: JSON.parse(JSON.stringify(newSubscription)),
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al renovar suscripción",
    }
  }
}
