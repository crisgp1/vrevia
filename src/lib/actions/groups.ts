"use server"

import { revalidatePath } from "next/cache"
import connectDB from "@/lib/db/connection"
import { Group, User } from "@/lib/db/models"
import { createGroupSchema, updateGroupSchema } from "@/lib/validations/group"
import type { CreateGroupInput, UpdateGroupInput } from "@/lib/validations/group"

export async function getGroups() {
  await connectDB()

  const groups = await Group.find().sort({ createdAt: -1 }).lean()

  // Get student count for each group
  const groupsWithCount = await Promise.all(
    groups.map(async (group) => {
      const studentCount = await User.countDocuments({
        role: "student",
        group: group._id,
        isActive: true,
      })

      return {
        id: group._id.toString(),
        name: group.name,
        level: group.level,
        schedule: group.schedule,
        description: group.description || "",
        isActive: group.isActive,
        studentCount,
        createdAt: group.createdAt,
      }
    })
  )

  return groupsWithCount
}

export async function getGroupById(id: string) {
  await connectDB()

  const group = await Group.findById(id).lean()

  if (!group) {
    return null
  }

  const students = await User.find({
    role: "student",
    group: group._id,
  })
    .select("name email level currentLesson isActive")
    .sort({ name: 1 })
    .lean()

  return {
    id: group._id.toString(),
    name: group.name,
    level: group.level,
    schedule: group.schedule,
    description: group.description || "",
    isActive: group.isActive,
    students: students.map((s) => ({
      id: s._id.toString(),
      name: s.name,
      email: s.email,
      level: s.level,
      currentLesson: s.currentLesson || 1,
      isActive: s.isActive,
    })),
    createdAt: group.createdAt,
  }
}

// Advance all students in a group to the next lesson
export async function advanceGroupLesson(groupId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await connectDB()

    const students = await User.find({
      role: "student",
      group: groupId,
      isActive: true,
    })

    for (const student of students) {
      if (student.currentLesson < 150) {
        student.currentLesson = (student.currentLesson || 1) + 1

        // Auto-update level if crossing thresholds
        if (student.currentLesson === 31) student.level = "a2"
        else if (student.currentLesson === 61) student.level = "b1"
        else if (student.currentLesson === 91) student.level = "b2"
        else if (student.currentLesson === 121) student.level = "b2plus"

        await student.save()
      }
    }

    revalidatePath("/dashboard/grupos")
    revalidatePath(`/dashboard/grupos/${groupId}`)

    return { success: true }
  } catch {
    return { success: false, error: "Error al avanzar lecciones del grupo" }
  }
}

export async function createGroup(data: CreateGroupInput): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const validated = createGroupSchema.parse(data)

    await connectDB()

    const group = await Group.create({
      name: validated.name,
      level: validated.level,
      schedule: validated.schedule,
      description: validated.description,
      isActive: true,
    })

    revalidatePath("/dashboard/grupos")

    return { success: true, id: group._id.toString() }
  } catch {
    return { success: false, error: "Error al crear el grupo" }
  }
}

export async function updateGroup(id: string, data: UpdateGroupInput) {
  const validated = updateGroupSchema.parse(data)

  await connectDB()

  const group = await Group.findById(id)

  if (!group) {
    return { error: "Grupo no encontrado" }
  }

  if (validated.name !== undefined) group.name = validated.name
  if (validated.level !== undefined) group.level = validated.level
  if (validated.schedule !== undefined) group.schedule = validated.schedule
  if (validated.description !== undefined) group.description = validated.description
  if (validated.isActive !== undefined) group.isActive = validated.isActive

  await group.save()

  revalidatePath("/dashboard/grupos")

  return { success: true }
}

export async function toggleGroupStatus(id: string) {
  await connectDB()

  const group = await Group.findById(id)

  if (!group) {
    return { error: "Grupo no encontrado" }
  }

  group.isActive = !group.isActive
  await group.save()

  revalidatePath("/dashboard/grupos")

  return { success: true, isActive: group.isActive }
}

export async function deleteGroup(id: string) {
  await connectDB()

  const group = await Group.findById(id)

  if (!group) {
    return { error: "Grupo no encontrado" }
  }

  // Remove group reference from students
  await User.updateMany({ group: id }, { $unset: { group: 1 } })

  await Group.findByIdAndDelete(id)

  revalidatePath("/dashboard/grupos")

  return { success: true }
}
