"use server"

import { revalidatePath } from "next/cache"
import connectDB from "@/lib/db/connection"
import { Attendance, User } from "@/lib/db/models"
import type { AttendanceStatus } from "@/lib/db/models"
import { requireAdmin } from "@/lib/auth"

export async function markAttendance(
  studentId: string,
  lesson: number,
  status: AttendanceStatus,
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await requireAdmin()
    await connectDB()

    const attended = status === "attended"

    // Check if attendance already exists
    const existing = await Attendance.findOne({
      student: studentId,
      lesson,
    })

    if (existing) {
      // Update existing
      existing.attended = attended
      existing.status = status
      existing.notes = notes
      existing.markedBy = admin.id as unknown as typeof existing.markedBy
      existing.date = new Date()
      await existing.save()
    } else {
      // Create new
      await Attendance.create({
        student: studentId,
        lesson,
        attended,
        status,
        notes,
        markedBy: admin.id,
        date: new Date(),
      })
    }

    revalidatePath("/dashboard/grupos")
    revalidatePath("/dashboard/alumnos")
    revalidatePath("/estudiante")

    return { success: true }
  } catch {
    return { success: false, error: "Error al marcar asistencia" }
  }
}

export async function markGroupAttendance(
  groupId: string,
  lesson: number,
  attendedStudentIds: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await requireAdmin()
    await connectDB()

    // Get all students in the group
    const students = await User.find({
      role: "student",
      group: groupId,
      isActive: true,
    }).lean()

    // Mark attendance for each student
    for (const student of students) {
      const attended = attendedStudentIds.includes(student._id.toString())

      const existing = await Attendance.findOne({
        student: student._id,
        lesson,
      })

      if (existing) {
        existing.attended = attended
        existing.markedBy = admin.id as unknown as typeof existing.markedBy
        existing.date = new Date()
        await existing.save()
      } else {
        await Attendance.create({
          student: student._id,
          lesson,
          attended,
          markedBy: admin.id,
          date: new Date(),
        })
      }
    }

    revalidatePath("/dashboard/grupos")
    revalidatePath("/estudiante")

    return { success: true }
  } catch {
    return { success: false, error: "Error al marcar asistencia del grupo" }
  }
}

export async function getStudentAttendance(studentId: string) {
  await connectDB()

  const attendance = await Attendance.find({ student: studentId })
    .sort({ lesson: -1 })
    .lean()

  return attendance.map((a) => ({
    id: a._id.toString(),
    lesson: a.lesson,
    attended: a.attended,
    status: (a.status || (a.attended ? "attended" : "absent_unjustified")) as AttendanceStatus,
    date: a.date,
    notes: a.notes,
  }))
}

export async function getAttendanceForLesson(lesson: number, groupId?: string) {
  await connectDB()

  let query: object = { lesson }

  if (groupId) {
    const students = await User.find({
      role: "student",
      group: groupId,
    }).lean()
    const studentIds = students.map((s) => s._id)
    query = { lesson, student: { $in: studentIds } }
  }

  const attendance = await Attendance.find(query)
    .populate("student", "name email")
    .lean()

  return attendance.map((a) => {
    const student = a.student as unknown as { _id: { toString: () => string }; name: string; email: string }
    return {
      id: a._id.toString(),
      studentId: student._id.toString(),
      studentName: student.name,
      studentEmail: student.email,
      attended: a.attended,
      date: a.date,
      notes: a.notes,
    }
  })
}

export async function getAttendanceSummary(studentId: string) {
  await connectDB()

  const attendance = await Attendance.find({ student: studentId }).lean()

  const total = attendance.length
  const attended = attendance.filter((a) => a.attended).length
  const missed = total - attended

  return {
    total,
    attended,
    missed,
    percentage: total > 0 ? Math.round((attended / total) * 100) : 0,
  }
}
