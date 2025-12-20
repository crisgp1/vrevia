"use server"

import { revalidatePath } from "next/cache"
import connectDB from "@/lib/db/connection"
import { EnglishClassRequest, EnglishLesson } from "@/lib/db/models"
import { requireEnglishStudent } from "@/lib/auth/english"
import { PRIVATE_CLASS_PRICE, PRIVATE_CLASS_MAX_PER_LEVEL } from "@/lib/constants/english"

export async function getMyClassRequests() {
  try {
    const student = await requireEnglishStudent()
    await connectDB()

    const requests = await EnglishClassRequest.find({ student: student.id })
      .populate("lesson")
      .sort({ createdAt: -1 })
      .lean()

    return {
      success: true,
      data: JSON.parse(JSON.stringify(requests)),
    }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function createClassRequest(data: {
  lessonNumber: number
  requestedDate: string
  requestedTime: string
  notes?: string
}) {
  try {
    const student = await requireEnglishStudent()
    await connectDB()

    // Find the lesson first to get the level
    const lesson = await EnglishLesson.findOne({ lessonNumber: data.lessonNumber })
    if (!lesson) {
      throw new Error("Lección no encontrada")
    }

    // Check if student has reached the limit for this level (excluding cancelled)
    const levelRequests = await EnglishClassRequest.countDocuments({
      student: student.id,
      lesson: { $in: await EnglishLesson.find({ level: lesson.level }).distinct("_id") },
      status: { $ne: "cancelled" },
    })

    if (levelRequests >= PRIVATE_CLASS_MAX_PER_LEVEL) {
      throw new Error(
        `Solo puedes agendar ${PRIVATE_CLASS_MAX_PER_LEVEL} tutorías por nivel. Has alcanzado el límite para este nivel. Si necesitas más clases, considera el curso completo con profesor.`
      )
    }

    // Validate date is in the future
    const requestedDateTime = new Date(`${data.requestedDate}T${data.requestedTime}`)
    if (requestedDateTime <= new Date()) {
      throw new Error("La fecha debe ser futura")
    }

    // Create class request
    const classRequest = await EnglishClassRequest.create({
      student: student.id,
      lesson: lesson._id,
      lessonNumber: data.lessonNumber,
      requestedDate: new Date(data.requestedDate),
      requestedTime: data.requestedTime,
      price: PRIVATE_CLASS_PRICE,
      notes: data.notes,
      status: "pending",
      paymentStatus: "pending",
    })

    revalidatePath("/ingles/soporte")
    revalidatePath("/ingles/soporte/solicitar-clase")

    return {
      success: true,
      data: JSON.parse(JSON.stringify(classRequest)),
    }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function cancelClassRequest(requestId: string) {
  try {
    const student = await requireEnglishStudent()
    await connectDB()

    const request = await EnglishClassRequest.findOne({
      _id: requestId,
      student: student.id,
    })

    if (!request) {
      throw new Error("Solicitud no encontrada")
    }

    if (request.status === "completed" || request.status === "cancelled") {
      throw new Error("Esta solicitud no se puede cancelar")
    }

    // Check if cancellation is at least 24 hours before the class
    const classDateTime = new Date(`${request.requestedDate}T${request.requestedTime}`)
    const hoursUntilClass = (classDateTime.getTime() - Date.now()) / (1000 * 60 * 60)

    if (hoursUntilClass < 24) {
      throw new Error("Debes cancelar con al menos 24 horas de anticipación")
    }

    request.status = "cancelled"
    await request.save()

    revalidatePath("/ingles/soporte")
    revalidatePath("/ingles/soporte/solicitar-clase")

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getAvailableLessonsForClass() {
  try {
    const student = await requireEnglishStudent()
    await connectDB()

    // Get all lessons up to current lesson
    const lessons = await EnglishLesson.find({
      lessonNumber: { $lte: student.currentLesson },
      isPublished: true,
    })
      .sort({ lessonNumber: 1 })
      .lean()

    return {
      success: true,
      data: JSON.parse(JSON.stringify(lessons)),
    }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
