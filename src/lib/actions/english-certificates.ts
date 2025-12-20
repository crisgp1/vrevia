"use server"

import { revalidatePath } from "next/cache"
import connectDB from "@/lib/db/connection"
import { EnglishCertificate, EnglishProgress, EnglishStudent } from "@/lib/db/models"
import { requireAdmin } from "@/lib/auth"
import { requireActiveSubscription } from "@/lib/auth/english"
import { getLessonsByLevel } from "@/lib/constants"
import {
  generateCertificateSchema,
  type GenerateCertificateInput,
} from "@/lib/validations/english"

/**
 * Genera un certificado de nivel (requiere haber completado todas las lecciones)
 */
export async function generateCertificate(data: GenerateCertificateInput) {
  try {
    const student = await requireActiveSubscription()
    await connectDB()

    // Validar datos
    const validatedData = generateCertificateSchema.parse(data)

    // Verificar que no tenga ya un certificado de este nivel
    const existing = await EnglishCertificate.findOne({
      student: student.id,
      level: validatedData.level,
    })

    if (existing) {
      return {
        success: false,
        error: "Ya tienes un certificado de este nivel",
      }
    }

    // Obtener lecciones del nivel
    const levelLessons = getLessonsByLevel(validatedData.level)
    const totalLessons = levelLessons.length

    // Verificar que haya completado todas las lecciones del nivel
    const completedCount = await EnglishProgress.countDocuments({
      student: student.id,
      lessonNumber: { $in: levelLessons.map((l) => l.lessonNumber) },
      status: "completed",
    })

    if (completedCount < totalLessons) {
      return {
        success: false,
        error: `Debes completar todas las lecciones del nivel (${completedCount}/${totalLessons})`,
      }
    }

    // Calcular tiempo total
    const progressData = await EnglishProgress.find({
      student: student.id,
      lessonNumber: { $in: levelLessons.map((l) => l.lessonNumber) },
    }).lean()

    const totalHours = Math.round(
      progressData.reduce((sum, p) => sum + (p.timeSpent || 0), 0) / 60
    )

    // Generar número de certificado único
    const certificateNumber = `ENG-${validatedData.level.toUpperCase()}-${Date.now()}-${student.id.slice(-6)}`

    // Crear certificado
    const certificate = await EnglishCertificate.create({
      student: student.id,
      level: validatedData.level,
      certificateNumber,
      issueDate: new Date(),
      totalHours,
      completionDate: new Date(),
      // pdfUrl se generará después con un servicio de PDFs
    })

    revalidatePath("/ingles/certificados")

    return {
      success: true,
      data: JSON.parse(JSON.stringify(certificate)),
      message: "¡Felicidades! Tu certificado ha sido generado",
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al generar certificado",
    }
  }
}

/**
 * Obtiene mis certificados
 */
export async function getMyCertificates() {
  try {
    const student = await requireActiveSubscription()
    await connectDB()

    const certificates = await EnglishCertificate.find({
      student: student.id,
    })
      .sort({ issueDate: -1 })
      .lean()

    return {
      success: true,
      data: JSON.parse(JSON.stringify(certificates)),
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al obtener certificados",
    }
  }
}

/**
 * Obtiene todos los certificados (Admin)
 */
export async function getAllCertificates() {
  try {
    await requireAdmin()
    await connectDB()

    const certificates = await EnglishCertificate.find()
      .populate("student")
      .sort({ issueDate: -1 })
      .lean()

    return {
      success: true,
      data: JSON.parse(JSON.stringify(certificates)),
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al obtener certificados",
    }
  }
}

/**
 * Genera un certificado manualmente (Admin)
 */
export async function generateCertificateAdmin(studentId: string, level: string) {
  try {
    await requireAdmin()
    await connectDB()

    // Verificar que el estudiante exista
    const student = await EnglishStudent.findById(studentId)
    if (!student) {
      return {
        success: false,
        error: "Estudiante no encontrado",
      }
    }

    // Verificar que no tenga ya un certificado de este nivel
    const existing = await EnglishCertificate.findOne({
      student: studentId,
      level,
    })

    if (existing) {
      return {
        success: false,
        error: "El estudiante ya tiene un certificado de este nivel",
      }
    }

    // Calcular tiempo total (si existe progreso)
    const levelLessons = getLessonsByLevel(level as any)
    const progressData = await EnglishProgress.find({
      student: studentId,
      lessonNumber: { $in: levelLessons.map((l) => l.lessonNumber) },
    }).lean()

    const totalHours = Math.round(
      progressData.reduce((sum, p) => sum + (p.timeSpent || 0), 0) / 60
    )

    // Generar número de certificado único
    const certificateNumber = `ENG-${level.toUpperCase()}-${Date.now()}-${studentId.slice(-6)}`

    // Crear certificado
    const certificate = await EnglishCertificate.create({
      student: studentId,
      level,
      certificateNumber,
      issueDate: new Date(),
      totalHours,
      completionDate: new Date(),
    })

    revalidatePath("/dashboard/ingles/certificados")

    return {
      success: true,
      data: JSON.parse(JSON.stringify(certificate)),
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al generar certificado",
    }
  }
}

/**
 * Elimina un certificado (Admin)
 */
export async function deleteCertificate(id: string) {
  try {
    await requireAdmin()
    await connectDB()

    const certificate = await EnglishCertificate.findByIdAndDelete(id)

    if (!certificate) {
      return {
        success: false,
        error: "Certificado no encontrado",
      }
    }

    revalidatePath("/dashboard/ingles/certificados")

    return {
      success: true,
      message: "Certificado eliminado exitosamente",
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al eliminar certificado",
    }
  }
}
