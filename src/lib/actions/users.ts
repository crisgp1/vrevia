"use server"

import { revalidatePath } from "next/cache"
import connectDB from "@/lib/db/connection"
import { User, Group } from "@/lib/db/models"
import { createUserSchema, updateUserSchema } from "@/lib/validations/user"
import type { CreateUserInput, UpdateUserInput } from "@/lib/validations/user"

export async function getStudents() {
  await connectDB()

  const students = await User.find({ role: "student" })
    .populate("group", "name")
    .sort({ createdAt: -1 })
    .lean()

  return students.map((student) => {
    const group = student.group as unknown as { _id: { toString: () => string }; name: string } | null
    return {
      id: student._id.toString(),
      clerkId: student.clerkId,
      email: student.email,
      name: student.name,
      phone: student.phone || "",
      level: student.level,
      currentLesson: student.currentLesson || 1,
      classType: student.classType,
      group: group
        ? {
            id: group._id.toString(),
            name: group.name,
          }
        : null,
      isActive: student.isActive,
      startDate: student.startDate,
      createdAt: student.createdAt,
    }
  })
}

export async function getStudentById(id: string) {
  await connectDB()

  const student = await User.findById(id).populate("group", "name level").lean()

  if (!student || student.role !== "student") {
    return null
  }

  const group = student.group as unknown as { _id: { toString: () => string }; name: string; level: string } | null

  return {
    id: student._id.toString(),
    clerkId: student.clerkId,
    email: student.email,
    name: student.name,
    phone: student.phone || "",
    level: student.level,
    currentLesson: student.currentLesson || 1,
    classType: student.classType,
    group: group
      ? {
          id: group._id.toString(),
          name: group.name,
          level: group.level,
        }
      : null,
    isActive: student.isActive,
    startDate: student.startDate,
    createdAt: student.createdAt,
  }
}

export async function createStudent(data: CreateUserInput): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const validated = createUserSchema.parse(data)

    await connectDB()

    // Check if clerkId or email already exists
    const existingUser = await User.findOne({
      $or: [{ clerkId: validated.clerkId }, { email: validated.email }]
    })
    if (existingUser) {
      return { success: false, error: "El usuario ya está registrado" }
    }

    // Create student
    const student = await User.create({
      clerkId: validated.clerkId,
      email: validated.email,
      name: validated.name,
      role: "student",
      phone: validated.phone,
      level: validated.level,
      classType: validated.classType,
      group: validated.classType === "grupal" && validated.group ? validated.group : undefined,
      isActive: true,
    })

    revalidatePath("/dashboard/alumnos")

    return { success: true, id: student._id.toString() }
  } catch {
    return { success: false, error: "Error al crear el alumno" }
  }
}

export async function updateStudent(id: string, data: UpdateUserInput) {
  const validated = updateUserSchema.parse(data)

  await connectDB()

  const student = await User.findById(id)

  if (!student || student.role !== "student") {
    return { error: "Alumno no encontrado" }
  }

  // Update fields
  if (validated.name !== undefined) student.name = validated.name
  if (validated.phone !== undefined) student.phone = validated.phone
  if (validated.level !== undefined) student.level = validated.level
  if (validated.classType !== undefined) student.classType = validated.classType
  if (validated.isActive !== undefined) student.isActive = validated.isActive

  // Handle group assignment
  if (validated.group === null) {
    student.group = undefined
  } else if (validated.group) {
    student.group = validated.group as unknown as typeof student.group
  }

  await student.save()

  revalidatePath("/dashboard/alumnos")

  return { success: true }
}

export async function toggleStudentStatus(id: string) {
  await connectDB()

  const student = await User.findById(id)

  if (!student || student.role !== "student") {
    return { error: "Alumno no encontrado" }
  }

  student.isActive = !student.isActive
  await student.save()

  revalidatePath("/dashboard/alumnos")

  return { success: true, isActive: student.isActive }
}

export async function deleteStudent(id: string) {
  await connectDB()

  const student = await User.findById(id)

  if (!student || student.role !== "student") {
    return { error: "Alumno no encontrado" }
  }

  await User.findByIdAndDelete(id)

  revalidatePath("/dashboard/alumnos")

  return { success: true }
}

export async function getGroupsForSelect() {
  await connectDB()

  const groups = await Group.find({ isActive: true }).sort({ name: 1 }).lean()

  return groups.map((group) => ({
    id: group._id.toString(),
    name: group.name,
    level: group.level,
  }))
}

// Search for registered users by name or email
export async function searchUsers(query: string) {
  await connectDB()

  if (!query || query.length < 2) {
    return []
  }

  const users = await User.find({
    role: "student",
    $or: [
      { name: { $regex: query, $options: "i" } },
      { email: { $regex: query, $options: "i" } },
    ],
  })
    .limit(10)
    .lean()

  return users.map((user) => ({
    id: user._id.toString(),
    clerkId: user.clerkId,
    email: user.email,
    name: user.name,
    level: user.level,
    hasLevel: !!user.level,
  }))
}

// Get students without level assigned (new registrations)
export async function getUnassignedStudents() {
  await connectDB()

  const users = await User.find({
    role: "student",
    level: { $exists: false }
  }).sort({ createdAt: -1 }).lean()

  return users.map((user) => ({
    id: user._id.toString(),
    clerkId: user.clerkId,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
  }))
}

// Get starting lesson for a level
function getStartingLesson(level: string): number {
  switch (level) {
    case "a1": return 1
    case "a2": return 31
    case "b1": return 61
    case "b2": return 91
    case "b2plus": return 121
    default: return 1
  }
}

// Assign student role to an existing user
export async function assignStudentRole(
  userId: string,
  data: { level: string; classType: string; group?: string; phone?: string; currentLesson?: number }
): Promise<{ success: boolean; error?: string }> {
  try {
    await connectDB()

    const user = await User.findById(userId)

    if (!user) {
      return { success: false, error: "Usuario no encontrado" }
    }

    user.role = "student"
    user.level = data.level as "a1" | "a2" | "b1" | "b2" | "b2plus"
    user.classType = data.classType as "individual" | "grupal"
    user.currentLesson = data.currentLesson || getStartingLesson(data.level)
    user.startDate = new Date()
    if (data.phone) user.phone = data.phone
    if (data.classType === "grupal" && data.group) {
      user.group = data.group as unknown as typeof user.group
    }

    await user.save()

    revalidatePath("/dashboard/alumnos")

    return { success: true }
  } catch {
    return { success: false, error: "Error al asignar rol de estudiante" }
  }
}

// Advance student to next lesson
export async function advanceStudentLesson(studentId: string): Promise<{ success: boolean; newLesson?: number; error?: string }> {
  try {
    await connectDB()

    const student = await User.findById(studentId)

    if (!student || student.role !== "student") {
      return { success: false, error: "Estudiante no encontrado" }
    }

    if (student.currentLesson >= 150) {
      return { success: false, error: "El estudiante ya completó el programa" }
    }

    student.currentLesson = (student.currentLesson || 1) + 1

    // Auto-update level if crossing thresholds
    if (student.currentLesson === 31) student.level = "a2"
    else if (student.currentLesson === 61) student.level = "b1"
    else if (student.currentLesson === 91) student.level = "b2"
    else if (student.currentLesson === 121) student.level = "b2plus"

    await student.save()

    revalidatePath("/dashboard/alumnos")
    revalidatePath("/estudiante")

    return { success: true, newLesson: student.currentLesson }
  } catch {
    return { success: false, error: "Error al avanzar lección" }
  }
}

// Set student to specific lesson
export async function setStudentLesson(studentId: string, lessonNumber: number): Promise<{ success: boolean; error?: string }> {
  try {
    if (lessonNumber < 1 || lessonNumber > 150) {
      return { success: false, error: "Número de lección inválido" }
    }

    await connectDB()

    const student = await User.findById(studentId)

    if (!student || student.role !== "student") {
      return { success: false, error: "Estudiante no encontrado" }
    }

    student.currentLesson = lessonNumber

    // Update level based on lesson
    if (lessonNumber <= 30) student.level = "a1"
    else if (lessonNumber <= 60) student.level = "a2"
    else if (lessonNumber <= 90) student.level = "b1"
    else if (lessonNumber <= 120) student.level = "b2"
    else student.level = "b2plus"

    await student.save()

    revalidatePath("/dashboard/alumnos")
    revalidatePath("/estudiante")

    return { success: true }
  } catch {
    return { success: false, error: "Error al establecer lección" }
  }
}
