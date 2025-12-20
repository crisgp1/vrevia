"use server"

import { revalidatePath } from "next/cache"
import connectDB from "@/lib/db/connection"
import { EnglishLesson, EnglishProgress, EnglishStudent } from "@/lib/db/models"
import { requireAdmin } from "@/lib/auth"
import { requireActiveSubscription } from "@/lib/auth/english"
import {
  createEnglishLessonSchema,
  updateEnglishLessonSchema,
  markLessonCompleteSchema,
  type CreateEnglishLessonInput,
  type UpdateEnglishLessonInput,
  type MarkLessonCompleteInput,
} from "@/lib/validations/english"

/**
 * Obtiene lecciones por nivel (Requiere suscripción)
 */
export async function getLessonsByLevel(level: string) {
  try {
    const student = await requireActiveSubscription()
    await connectDB()

    const lessons = await EnglishLesson.find({
      level,
      isPublished: true,
    })
      .sort({ lessonNumber: 1 })
      .lean()

    // Obtener progreso del estudiante para cada lección
    const lessonsWithProgress = await Promise.all(
      lessons.map(async (lesson) => {
        const progress = await EnglishProgress.findOne({
          student: student.id,
          lesson: lesson._id,
        }).lean()

        return {
          ...lesson,
          progress: progress
            ? {
                status: progress.status,
                progress: progress.progress,
                timeSpent: progress.timeSpent,
              }
            : null,
        }
      })
    )

    return {
      success: true,
      data: JSON.parse(JSON.stringify(lessonsWithProgress)),
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al obtener lecciones",
    }
  }
}

/**
 * Obtiene una lección con el progreso del estudiante (Requiere suscripción)
 */
export async function getLessonWithProgress(lessonNumber: number) {
  try {
    const student = await requireActiveSubscription()
    await connectDB()

    const lesson = await EnglishLesson.findOne({
      lessonNumber,
      isPublished: true,
    }).lean()

    if (!lesson) {
      return {
        success: false,
        error: "Lección no encontrada",
      }
    }

    // Obtener o crear progreso
    let progress = await EnglishProgress.findOne({
      student: student.id,
      lesson: lesson._id,
    }).lean()

    // Si no existe progreso, crearlo
    if (!progress) {
      progress = await EnglishProgress.create({
        student: student.id,
        lesson: lesson._id,
        lessonNumber,
        status: "not-started",
        progress: 0,
        lastAccessedAt: new Date(),
        timeSpent: 0,
      })
    } else {
      // Actualizar última visita
      await EnglishProgress.findByIdAndUpdate(progress._id, {
        lastAccessedAt: new Date(),
      })
    }

    return {
      success: true,
      data: {
        lesson: JSON.parse(JSON.stringify(lesson)),
        progress: JSON.parse(JSON.stringify(progress)),
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al obtener lección",
    }
  }
}

/**
 * Marca una lección como completada (Requiere suscripción)
 */
export async function markLessonComplete(data: MarkLessonCompleteInput) {
  try {
    const student = await requireActiveSubscription()
    await connectDB()

    // Validar datos
    const validatedData = markLessonCompleteSchema.parse(data)

    const lesson = await EnglishLesson.findOne({ lessonNumber: validatedData.lessonNumber })
    if (!lesson) {
      return {
        success: false,
        error: "Lección no encontrada",
      }
    }

    // Actualizar progreso
    const progress = await EnglishProgress.findOneAndUpdate(
      {
        student: student.id,
        lesson: lesson._id,
      },
      {
        status: "completed",
        progress: 100,
        completedAt: new Date(),
        lastAccessedAt: new Date(),
      },
      { upsert: true, new: true }
    )

    // Agregar a lecciones completadas y avanzar currentLesson
    await EnglishStudent.findByIdAndUpdate(student.id, {
      $addToSet: { completedLessons: validatedData.lessonNumber },
      $max: { currentLesson: validatedData.lessonNumber + 1 },
    })

    revalidatePath("/ingles")
    revalidatePath(`/ingles/leccion/${validatedData.lessonNumber}`)

    return {
      success: true,
      data: JSON.parse(JSON.stringify(progress)),
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al completar lección",
    }
  }
}

/**
 * Actualiza el tiempo dedicado a una lección
 */
export async function trackLessonTime(lessonNumber: number, minutes: number) {
  try {
    const student = await requireActiveSubscription()
    await connectDB()

    const lesson = await EnglishLesson.findOne({ lessonNumber })
    if (!lesson) {
      return {
        success: false,
        error: "Lección no encontrada",
      }
    }

    await EnglishProgress.findOneAndUpdate(
      {
        student: student.id,
        lesson: lesson._id,
      },
      {
        $inc: { timeSpent: minutes },
        lastAccessedAt: new Date(),
      },
      { upsert: true }
    )

    return {
      success: true,
      message: "Tiempo registrado",
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al registrar tiempo",
    }
  }
}

/**
 * Obtiene todas las lecciones (Admin)
 */
export async function getAllLessons() {
  try {
    await requireAdmin()
    await connectDB()

    const lessons = await EnglishLesson.find().sort({ lessonNumber: 1 }).lean()

    return {
      success: true,
      data: JSON.parse(JSON.stringify(lessons)),
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al obtener lecciones",
    }
  }
}

/**
 * Crea una nueva lección (Admin)
 */
export async function createLesson(data: CreateEnglishLessonInput) {
  try {
    await requireAdmin()
    await connectDB()

    // Validar datos
    const validatedData = createEnglishLessonSchema.parse(data)

    // Verificar que no exista una lección con ese número
    const existing = await EnglishLesson.findOne({ lessonNumber: validatedData.lessonNumber })
    if (existing) {
      return {
        success: false,
        error: `Ya existe una lección con el número ${validatedData.lessonNumber}`,
      }
    }

    const lesson = await EnglishLesson.create({
      ...validatedData,
      content: { sections: [] },
      resources: [],
    })

    revalidatePath("/dashboard/ingles/lecciones")

    return {
      success: true,
      data: JSON.parse(JSON.stringify(lesson)),
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al crear lección",
    }
  }
}

/**
 * Actualiza una lección (Admin)
 */
export async function updateLesson(id: string, data: UpdateEnglishLessonInput) {
  try {
    await requireAdmin()
    await connectDB()

    // Validar datos
    const validatedData = updateEnglishLessonSchema.parse(data)

    const lesson = await EnglishLesson.findByIdAndUpdate(
      id,
      { $set: validatedData },
      { new: true, runValidators: true }
    )

    if (!lesson) {
      return {
        success: false,
        error: "Lección no encontrada",
      }
    }

    revalidatePath("/dashboard/ingles/lecciones")
    revalidatePath(`/dashboard/ingles/lecciones/${id}`)

    return {
      success: true,
      data: JSON.parse(JSON.stringify(lesson)),
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al actualizar lección",
    }
  }
}

/**
 * Elimina una lección (Admin)
 */
export async function deleteLesson(id: string) {
  try {
    await requireAdmin()
    await connectDB()

    const lesson = await EnglishLesson.findByIdAndDelete(id)

    if (!lesson) {
      return {
        success: false,
        error: "Lección no encontrada",
      }
    }

    revalidatePath("/dashboard/ingles/lecciones")

    return {
      success: true,
      message: "Lección eliminada exitosamente",
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al eliminar lección",
    }
  }
}
