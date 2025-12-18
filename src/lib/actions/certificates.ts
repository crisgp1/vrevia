"use server"

import { revalidatePath } from "next/cache"
import connectDB from "@/lib/db/connection"
import { Certificate, User } from "@/lib/db/models"
import { requireAdmin } from "@/lib/auth"

// Generate unique certificate number
function generateCertificateNumber(): string {
  const year = new Date().getFullYear()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `VREVIA-${year}-${random}`
}

// Get all certificates
export async function getCertificates() {
  await connectDB()

  const certificates = await Certificate.find()
    .populate("student", "name email")
    .populate("issuedBy", "name")
    .sort({ issueDate: -1 })
    .lean()

  return certificates.map((cert) => {
    const student = cert.student as unknown as { _id: { toString: () => string }; name: string; email: string }
    const issuedBy = cert.issuedBy as unknown as { _id: { toString: () => string }; name: string }

    return {
      id: cert._id.toString(),
      student: {
        id: student._id.toString(),
        name: student.name,
        email: student.email,
      },
      level: cert.level,
      issueDate: cert.issueDate,
      certificateNumber: cert.certificateNumber,
      issuedBy: issuedBy.name,
      notes: cert.notes,
    }
  })
}

// Get certificates for a specific student
export async function getStudentCertificates(studentId: string) {
  await connectDB()

  const certificates = await Certificate.find({ student: studentId })
    .populate("issuedBy", "name")
    .sort({ issueDate: -1 })
    .lean()

  return certificates.map((cert) => {
    const issuedBy = cert.issuedBy as unknown as { _id: { toString: () => string }; name: string }

    return {
      id: cert._id.toString(),
      level: cert.level,
      issueDate: cert.issueDate,
      certificateNumber: cert.certificateNumber,
      issuedBy: issuedBy.name,
      notes: cert.notes,
    }
  })
}

// Issue a new certificate
export async function issueCertificate(data: {
  studentId: string
  level: "a1" | "a2" | "b1" | "b2" | "b2plus"
  issueDate?: Date
  notes?: string
}): Promise<{ success: boolean; certificateId?: string; error?: string }> {
  try {
    const admin = await requireAdmin()
    await connectDB()

    // Check if student exists
    const student = await User.findById(data.studentId)
    if (!student || student.role !== "student") {
      return { success: false, error: "Estudiante no encontrado" }
    }

    // Check if certificate already exists for this student and level
    const existingCert = await Certificate.findOne({
      student: data.studentId,
      level: data.level,
    })

    if (existingCert) {
      return { success: false, error: "El estudiante ya tiene un certificado para este nivel" }
    }

    // Generate certificate number
    const certificateNumber = generateCertificateNumber()

    // Create certificate
    const certificate = await Certificate.create({
      student: data.studentId,
      level: data.level,
      issueDate: data.issueDate || new Date(),
      certificateNumber,
      issuedBy: admin.id,
      notes: data.notes,
    })

    revalidatePath("/dashboard/certificados")
    revalidatePath("/estudiante")

    return { success: true, certificateId: certificate._id.toString() }
  } catch (error) {
    console.error("Error issuing certificate:", error)
    return { success: false, error: "Error al emitir el certificado" }
  }
}

// Delete a certificate
export async function deleteCertificate(certificateId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin()
    await connectDB()

    const certificate = await Certificate.findById(certificateId)
    if (!certificate) {
      return { success: false, error: "Certificado no encontrado" }
    }

    await Certificate.findByIdAndDelete(certificateId)

    revalidatePath("/dashboard/certificados")
    revalidatePath("/estudiante")

    return { success: true }
  } catch (error) {
    console.error("Error deleting certificate:", error)
    return { success: false, error: "Error al eliminar el certificado" }
  }
}

// Get certificate by number (for verification)
export async function verifyCertificate(certificateNumber: string) {
  await connectDB()

  const certificate = await Certificate.findOne({ certificateNumber })
    .populate("student", "name email")
    .lean()

  if (!certificate) {
    return null
  }

  const student = certificate.student as unknown as { _id: { toString: () => string }; name: string; email: string }

  return {
    id: certificate._id.toString(),
    student: {
      id: student._id.toString(),
      name: student.name,
      email: student.email,
    },
    level: certificate.level,
    issueDate: certificate.issueDate,
    certificateNumber: certificate.certificateNumber,
  }
}
