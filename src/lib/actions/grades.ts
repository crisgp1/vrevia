"use server"

import { revalidatePath } from "next/cache"
import connectDB from "@/lib/db/connection"
import { Grade, User } from "@/lib/db/models"
import { requireAdmin } from "@/lib/auth"

interface GradeInput {
  studentId: string
  lesson: number
  type: "class" | "assessment" | "final"
  score: number
  maxScore?: number
  notes?: string
  isExtraordinary?: boolean
}

export async function addGrade(data: GradeInput): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await requireAdmin()
    await connectDB()

    // Check if grade already exists
    const existing = await Grade.findOne({
      student: data.studentId,
      lesson: data.lesson,
      type: data.type,
    })

    if (existing) {
      // Update existing grade
      if (data.isExtraordinary) {
        // Save original grade info before updating
        existing.originalScore = existing.score
        existing.originalGradedBy = existing.gradedBy
        existing.originalGradedAt = existing.updatedAt
        existing.isExtraordinary = true
      }
      existing.score = data.score
      existing.maxScore = data.maxScore || 100
      existing.notes = data.notes
      existing.gradedBy = admin.id as unknown as typeof existing.gradedBy
      await existing.save()
    } else {
      // Create new grade
      await Grade.create({
        student: data.studentId,
        lesson: data.lesson,
        type: data.type,
        score: data.score,
        maxScore: data.maxScore || 100,
        notes: data.notes,
        gradedBy: admin.id,
      })
    }

    revalidatePath("/dashboard/grupos")
    revalidatePath("/dashboard/alumnos")

    return { success: true }
  } catch {
    return { success: false, error: "Error al guardar calificación" }
  }
}

export async function getStudentGrades(studentId: string) {
  await connectDB()

  const grades = await Grade.find({ student: studentId })
    .populate("originalGradedBy", "name")
    .sort({ lesson: 1 })
    .lean()

  return grades.map((g) => {
    const originalGradedBy = g.originalGradedBy as unknown as { name: string } | null

    return {
      id: g._id.toString(),
      lesson: g.lesson,
      type: g.type,
      score: g.score,
      maxScore: g.maxScore,
      notes: g.notes,
      isExtraordinary: g.isExtraordinary || false,
      originalScore: g.originalScore,
      originalGradedBy: originalGradedBy?.name,
      originalGradedAt: g.originalGradedAt,
      createdAt: g.createdAt,
    }
  })
}

export async function getGroupGrades(groupId: string) {
  await connectDB()

  // Get all students in the group
  const students = await User.find({
    role: "student",
    group: groupId,
  }).lean()

  const studentIds = students.map((s) => s._id)

  // Get all grades for these students
  const grades = await Grade.find({
    student: { $in: studentIds },
  })
    .sort({ lesson: 1 })
    .lean()

  // Group grades by student
  const gradesByStudent: Record<string, typeof grades> = {}
  for (const grade of grades) {
    const studentId = grade.student.toString()
    if (!gradesByStudent[studentId]) {
      gradesByStudent[studentId] = []
    }
    gradesByStudent[studentId].push(grade)
  }

  return gradesByStudent
}

export async function deleteGrade(gradeId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin()
    await connectDB()

    await Grade.findByIdAndDelete(gradeId)

    revalidatePath("/dashboard/grupos")
    revalidatePath("/dashboard/alumnos")

    return { success: true }
  } catch {
    return { success: false, error: "Error al eliminar calificación" }
  }
}
