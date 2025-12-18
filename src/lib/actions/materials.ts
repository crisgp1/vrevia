"use server"

import { revalidatePath } from "next/cache"
import connectDB from "@/lib/db/connection"
import { Material, Group, User } from "@/lib/db/models"
import { createMaterialSchema, updateMaterialSchema } from "@/lib/validations/material"
import type { CreateMaterialInput, UpdateMaterialInput } from "@/lib/validations/material"
import { LEVELS, getLesson, getLevelFromLesson } from "@/lib/constants"

export async function getMaterials() {
  await connectDB()

  const materials = await Material.find().sort({ lesson: 1, uploadedAt: -1 }).lean()

  const materialsWithDetails = await Promise.all(
    materials.map(async (material) => {
      let assignedToName = "Todos los alumnos"
      const lessonData = getLesson(material.lesson)
      const level = getLevelFromLesson(material.lesson)

      if (material.assignedTo?.type === "group") {
        const group = await Group.findById(material.assignedTo.id).lean()
        assignedToName = group ? `Grupo: ${group.name}` : "Grupo no encontrado"
      } else if (material.assignedTo?.type === "student") {
        const student = await User.findById(material.assignedTo.id).lean()
        assignedToName = student ? `Alumno: ${student.name}` : "Alumno no encontrado"
      }

      return {
        id: material._id.toString(),
        title: material.title,
        description: material.description || "",
        fileUrl: material.fileUrl,
        fileName: material.fileName,
        lesson: material.lesson,
        level,
        levelName: LEVELS[level as keyof typeof LEVELS],
        grammar: lessonData?.grammar || "",
        assignedTo: material.assignedTo,
        assignedToName,
        uploadedAt: material.uploadedAt,
      }
    })
  )

  return materialsWithDetails
}

export async function getMaterialById(id: string) {
  await connectDB()

  const material = await Material.findById(id).lean()

  if (!material) {
    return null
  }

  const lessonData = getLesson(material.lesson)

  return {
    id: material._id.toString(),
    title: material.title,
    description: material.description || "",
    fileUrl: material.fileUrl,
    fileName: material.fileName,
    lesson: material.lesson,
    grammar: lessonData?.grammar || "",
    assignedTo: material.assignedTo,
    uploadedAt: material.uploadedAt,
  }
}

export async function createMaterial(data: CreateMaterialInput): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const validated = createMaterialSchema.parse(data)

    await connectDB()

    const material = await Material.create({
      title: validated.title,
      description: validated.description,
      fileUrl: validated.fileUrl,
      fileName: validated.fileName,
      lesson: validated.lesson,
      assignedTo: validated.assignedTo,
      uploadedAt: new Date(),
    })

    revalidatePath("/dashboard/materiales")
    revalidatePath("/estudiante/materiales")

    return { success: true, id: material._id.toString() }
  } catch {
    return { success: false, error: "Error al crear el material" }
  }
}

export async function updateMaterial(id: string, data: UpdateMaterialInput) {
  const validated = updateMaterialSchema.parse(data)

  await connectDB()

  const material = await Material.findById(id)

  if (!material) {
    return { error: "Material no encontrado" }
  }

  if (validated.title !== undefined) material.title = validated.title
  if (validated.description !== undefined) material.description = validated.description
  if (validated.lesson !== undefined) material.lesson = validated.lesson
  if (validated.assignedTo !== undefined) material.assignedTo = validated.assignedTo || undefined

  await material.save()

  revalidatePath("/dashboard/materiales")
  revalidatePath("/estudiante/materiales")

  return { success: true }
}

export async function deleteMaterial(id: string) {
  await connectDB()

  const material = await Material.findById(id)

  if (!material) {
    return { error: "Material no encontrado" }
  }

  await Material.findByIdAndDelete(id)

  revalidatePath("/dashboard/materiales")
  revalidatePath("/estudiante/materiales")

  return { success: true }
}

// Get materials for a specific lesson
export async function getMaterialsForLesson(lesson: number, studentId?: string, groupId?: string) {
  await connectDB()

  // Build query: materials for this lesson that are either:
  // 1. For everyone (no assignedTo)
  // 2. For this specific student
  // 3. For this student's group
  const conditions: object[] = [
    { lesson, assignedTo: { $exists: false } },
    { lesson, assignedTo: null },
  ]

  if (studentId) {
    conditions.push({ lesson, "assignedTo.type": "student", "assignedTo.id": studentId })
  }

  if (groupId) {
    conditions.push({ lesson, "assignedTo.type": "group", "assignedTo.id": groupId })
  }

  const materials = await Material.find({ $or: conditions })
    .sort({ uploadedAt: -1 })
    .lean()

  return materials.map((material) => ({
    id: material._id.toString(),
    title: material.title,
    description: material.description || "",
    fileUrl: material.fileUrl,
    fileName: material.fileName,
    lesson: material.lesson,
    uploadedAt: material.uploadedAt,
  }))
}

// Get all materials accessible by a student (for their current lesson and below)
export async function getMaterialsForStudent(
  studentId: string,
  currentLesson: number,
  groupId?: string
) {
  await connectDB()

  // Materials for lessons up to and including current lesson
  const conditions: object[] = [
    { lesson: { $lte: currentLesson }, assignedTo: { $exists: false } },
    { lesson: { $lte: currentLesson }, assignedTo: null },
    { lesson: { $lte: currentLesson }, "assignedTo.type": "student", "assignedTo.id": studentId },
  ]

  if (groupId) {
    conditions.push({ lesson: { $lte: currentLesson }, "assignedTo.type": "group", "assignedTo.id": groupId })
  }

  const materials = await Material.find({ $or: conditions })
    .sort({ lesson: 1, uploadedAt: -1 })
    .lean()

  return materials.map((material) => ({
    id: material._id.toString(),
    title: material.title,
    description: material.description || "",
    fileUrl: material.fileUrl,
    fileName: material.fileName,
    lesson: material.lesson,
    uploadedAt: material.uploadedAt,
  }))
}
