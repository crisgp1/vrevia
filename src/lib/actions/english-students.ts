"use server"

import { revalidatePath } from "next/cache"
import connectDB from "@/lib/db/connection"
import { EnglishStudent, EnglishSubscription, User } from "@/lib/db/models"
import { requireAdmin } from "@/lib/auth"
import { getEnglishStudent } from "@/lib/auth/english"
import {
  createEnglishStudentSchema,
  updateEnglishStudentSchema,
  type CreateEnglishStudentInput,
  type UpdateEnglishStudentInput,
} from "@/lib/validations/english"

/**
 * Obtiene todos los estudiantes del módulo de inglés (Admin)
 */
export async function getEnglishStudents() {
  try {
    await requireAdmin()
    await connectDB()

    const students = await EnglishStudent.find()
      .populate("subscription")
      .sort({ createdAt: -1 })
      .lean()

    return {
      success: true,
      data: JSON.parse(JSON.stringify(students)),
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al obtener estudiantes",
    }
  }
}

/**
 * Crea un nuevo estudiante del módulo de inglés (Admin)
 */
export async function createEnglishStudent(data: CreateEnglishStudentInput) {
  try {
    await requireAdmin()
    await connectDB()

    // Validar datos
    const validatedData = createEnglishStudentSchema.parse(data)

    // Verificar que el clerkId exista en la tabla User
    const user = await User.findOne({ clerkId: validatedData.clerkId })
    if (!user) {
      return {
        success: false,
        error: "El usuario no existe en el sistema. Debe registrarse primero.",
      }
    }

    // Verificar que no exista ya un estudiante de inglés con ese clerkId
    const existing = await EnglishStudent.findOne({ clerkId: validatedData.clerkId })
    if (existing) {
      return {
        success: false,
        error: "Este usuario ya está registrado en el módulo de inglés",
      }
    }

    // Crear estudiante
    const student = await EnglishStudent.create({
      ...validatedData,
      completedLessons: [],
      startDate: new Date(),
      isActive: true,
    })

    revalidatePath("/dashboard/ingles/estudiantes")

    return {
      success: true,
      data: JSON.parse(JSON.stringify(student)),
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al crear estudiante",
    }
  }
}

/**
 * Actualiza un estudiante del módulo de inglés (Admin)
 */
export async function updateEnglishStudent(id: string, data: UpdateEnglishStudentInput) {
  try {
    await requireAdmin()
    await connectDB()

    // Validar datos
    const validatedData = updateEnglishStudentSchema.parse(data)

    const student = await EnglishStudent.findByIdAndUpdate(
      id,
      { $set: validatedData },
      { new: true, runValidators: true }
    )

    if (!student) {
      return {
        success: false,
        error: "Estudiante no encontrado",
      }
    }

    revalidatePath("/dashboard/ingles/estudiantes")
    revalidatePath(`/dashboard/ingles/estudiantes/${id}`)

    return {
      success: true,
      data: JSON.parse(JSON.stringify(student)),
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al actualizar estudiante",
    }
  }
}

/**
 * Elimina un estudiante del módulo de inglés (Admin)
 */
export async function deleteEnglishStudent(id: string) {
  try {
    await requireAdmin()
    await connectDB()

    const student = await EnglishStudent.findByIdAndDelete(id)

    if (!student) {
      return {
        success: false,
        error: "Estudiante no encontrado",
      }
    }

    revalidatePath("/dashboard/ingles/estudiantes")

    return {
      success: true,
      message: "Estudiante eliminado exitosamente",
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al eliminar estudiante",
    }
  }
}

/**
 * Obtiene el perfil del estudiante actual
 */
export async function getMyProfile() {
  try {
    const student = await getEnglishStudent()

    if (!student) {
      return {
        success: false,
        error: "No estás registrado en el módulo de inglés",
      }
    }

    return {
      success: true,
      data: student,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al obtener perfil",
    }
  }
}

/**
 * Obtiene estadísticas generales del módulo (Admin)
 */
export async function getEnglishModuleStats() {
  try {
    await requireAdmin()
    await connectDB()

    const [totalStudents, activeStudents, activeSubscriptions] = await Promise.all([
      EnglishStudent.countDocuments(),
      EnglishStudent.countDocuments({ isActive: true }),
      EnglishSubscription.countDocuments({
        status: "active",
        endDate: { $gt: new Date() },
      }),
    ])

    return {
      success: true,
      data: {
        totalStudents,
        activeStudents,
        activeSubscriptions,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al obtener estadísticas",
    }
  }
}
