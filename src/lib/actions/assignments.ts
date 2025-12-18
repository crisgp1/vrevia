"use server"

import { revalidatePath } from "next/cache"
import connectDB from "@/lib/db/connection"
import { Assignment, Submission, Group, User } from "@/lib/db/models"
import {
  createAssignmentSchema,
  updateAssignmentSchema,
  gradeSubmissionSchema,
} from "@/lib/validations/assignment"
import type {
  CreateAssignmentInput,
  UpdateAssignmentInput,
  GradeSubmissionInput,
} from "@/lib/validations/assignment"

export async function getAssignments() {
  await connectDB()

  const assignments = await Assignment.find().sort({ createdAt: -1 }).lean()

  const assignmentsWithDetails = await Promise.all(
    assignments.map(async (assignment) => {
      let assignedToName = ""

      if (assignment.assignedTo.type === "level") {
        const levels: Record<string, string> = {
          basico: "Nivel Básico",
          intermedio: "Nivel Intermedio",
          avanzado: "Nivel Avanzado",
        }
        assignedToName = levels[assignment.assignedTo.id] || assignment.assignedTo.id
      } else if (assignment.assignedTo.type === "group") {
        const group = await Group.findById(assignment.assignedTo.id).lean()
        assignedToName = group ? `Grupo: ${group.name}` : "Grupo no encontrado"
      } else if (assignment.assignedTo.type === "student") {
        const student = await User.findById(assignment.assignedTo.id).lean()
        assignedToName = student ? `Alumno: ${student.name}` : "Alumno no encontrado"
      }

      // Count submissions
      const submissionCount = await Submission.countDocuments({
        assignment: assignment._id,
      })
      const gradedCount = await Submission.countDocuments({
        assignment: assignment._id,
        grade: { $ne: null },
      })

      return {
        id: assignment._id.toString(),
        title: assignment.title,
        description: assignment.description || "",
        attachmentUrl: assignment.attachmentUrl,
        attachmentName: assignment.attachmentName,
        dueDate: assignment.dueDate,
        lesson: assignment.lesson || null,
        assignedTo: {
          type: assignment.assignedTo.type as "level" | "group" | "student",
          id: assignment.assignedTo.id,
        },
        assignedToName,
        submissionCount,
        gradedCount,
        createdAt: assignment.createdAt,
      }
    })
  )

  return assignmentsWithDetails
}

export async function getAssignmentById(id: string) {
  await connectDB()

  const assignment = await Assignment.findById(id).lean()

  if (!assignment) {
    return null
  }

  // Get all assigned students based on assignment type
  let assignedStudents: Array<{ _id: unknown; name: string; email: string }> = []

  if (assignment.assignedTo.type === "student") {
    const student = await User.findById(assignment.assignedTo.id).lean()
    if (student) {
      assignedStudents = [{ _id: student._id, name: student.name, email: student.email }]
    }
  } else if (assignment.assignedTo.type === "group") {
    const students = await User.find({
      role: "student",
      group: assignment.assignedTo.id,
      isActive: true,
    }).lean()
    assignedStudents = students.map(s => ({ _id: s._id, name: s.name, email: s.email }))
  } else if (assignment.assignedTo.type === "level") {
    const students = await User.find({
      role: "student",
      level: assignment.assignedTo.id,
      isActive: true,
    }).lean()
    assignedStudents = students.map(s => ({ _id: s._id, name: s.name, email: s.email }))
  }

  const submissions = await Submission.find({ assignment: id })
    .populate("student", "name email")
    .sort({ submittedAt: -1 })
    .lean()

  // Create a map of submissions by student ID
  const submissionMap = new Map(
    submissions.map((s) => {
      const student = s.student as unknown as { _id: { toString: () => string } }
      return [student._id.toString(), s]
    })
  )

  // Build the students array with submission info (or null if no submission)
  const studentsWithSubmissions = assignedStudents.map((student) => {
    const studentId = (student._id as { toString: () => string }).toString()
    const submission = submissionMap.get(studentId)

    return {
      studentId,
      studentName: student.name,
      studentEmail: student.email,
      submission: submission ? {
        id: (submission._id as { toString: () => string }).toString(),
        fileUrl: submission.fileUrl,
        fileName: submission.fileName,
        submittedAt: submission.submittedAt,
        grade: submission.grade,
        feedback: submission.feedback || "",
        gradedAt: submission.gradedAt,
      } : null,
    }
  })

  return {
    id: assignment._id.toString(),
    title: assignment.title,
    description: assignment.description || "",
    attachmentUrl: assignment.attachmentUrl,
    attachmentName: assignment.attachmentName,
    dueDate: assignment.dueDate,
    assignedTo: assignment.assignedTo,
    students: studentsWithSubmissions,
    createdAt: assignment.createdAt,
  }
}

export async function createAssignment(data: CreateAssignmentInput): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const validated = createAssignmentSchema.parse(data)

    await connectDB()

    const assignment = await Assignment.create({
      title: validated.title,
      description: validated.description,
      attachmentUrl: validated.attachmentUrl,
      attachmentName: validated.attachmentName,
      dueDate: new Date(validated.dueDate),
      lesson: validated.lesson || undefined,
      assignedTo: validated.assignedTo,
    })

    revalidatePath("/dashboard/tareas")

    return { success: true, id: assignment._id.toString() }
  } catch {
    return { success: false, error: "Error al crear la tarea" }
  }
}

export async function updateAssignment(id: string, data: UpdateAssignmentInput) {
  const validated = updateAssignmentSchema.parse(data)

  await connectDB()

  const assignment = await Assignment.findById(id)

  if (!assignment) {
    return { error: "Tarea no encontrada" }
  }

  if (validated.title !== undefined) assignment.title = validated.title
  if (validated.description !== undefined) assignment.description = validated.description
  if (validated.dueDate !== undefined) assignment.dueDate = new Date(validated.dueDate)
  if (validated.lesson !== undefined) assignment.lesson = validated.lesson ?? undefined
  if (validated.assignedTo !== undefined) assignment.assignedTo = validated.assignedTo

  await assignment.save()

  revalidatePath("/dashboard/tareas")

  return { success: true }
}

export async function deleteAssignment(id: string) {
  await connectDB()

  const assignment = await Assignment.findById(id)

  if (!assignment) {
    return { error: "Tarea no encontrada" }
  }

  // Delete all submissions for this assignment
  await Submission.deleteMany({ assignment: id })
  await Assignment.findByIdAndDelete(id)

  revalidatePath("/dashboard/tareas")

  return { success: true }
}

export async function gradeSubmission(
  submissionId: string,
  data: GradeSubmissionInput
) {
  const validated = gradeSubmissionSchema.parse(data)

  await connectDB()

  const submission = await Submission.findById(submissionId)

  if (!submission) {
    return { error: "Entrega no encontrada" }
  }

  // If marking as extraordinary and there's an existing grade, preserve original
  if (validated.isExtraordinary && submission.grade !== undefined && submission.grade !== null && !submission.isExtraordinary) {
    submission.originalGrade = submission.grade
    submission.originalFeedback = submission.feedback || ""
  }

  // If NOT extraordinary and was previously extraordinary, restore would be handled separately
  // For now, just update normally
  if (!validated.isExtraordinary && submission.isExtraordinary) {
    // Removing extraordinary status - keep as normal update
    submission.originalGrade = undefined
    submission.originalFeedback = undefined
  }

  submission.grade = validated.grade
  submission.feedback = validated.feedback || ""
  submission.isExtraordinary = validated.isExtraordinary || false
  submission.gradedAt = new Date()

  await submission.save()

  revalidatePath("/dashboard/tareas")

  return { success: true }
}

export async function gradeStudentWithoutSubmission(
  assignmentId: string,
  studentId: string,
  data: GradeSubmissionInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const validated = gradeSubmissionSchema.parse(data)

    await connectDB()

    // Check if submission already exists
    const existing = await Submission.findOne({
      assignment: assignmentId,
      student: studentId,
    })

    if (existing) {
      // Update existing
      existing.grade = validated.grade
      existing.feedback = validated.feedback || ""
      existing.isExtraordinary = validated.isExtraordinary || false
      existing.gradedAt = new Date()
      await existing.save()
    } else {
      // Create a submission without file (graded directly)
      await Submission.create({
        assignment: assignmentId,
        student: studentId,
        fileUrl: "",
        fileName: "Sin entrega",
        submittedAt: new Date(),
        grade: validated.grade,
        feedback: validated.feedback || "",
        isExtraordinary: validated.isExtraordinary || false,
        gradedAt: new Date(),
      })
    }

    revalidatePath("/dashboard/tareas")

    return { success: true }
  } catch {
    return { success: false, error: "Error al calificar" }
  }
}

export async function getAssignmentsForLesson(
  lesson: number,
  studentId: string,
  groupId?: string
) {
  await connectDB()

  const conditions: object[] = [
    { lesson, "assignedTo.type": "student", "assignedTo.id": studentId },
  ]

  if (groupId) {
    conditions.push({ lesson, "assignedTo.type": "group", "assignedTo.id": groupId })
  }

  // Also get assignments for the student's level based on lesson
  const user = await User.findById(studentId).lean()
  if (user?.level) {
    conditions.push({ lesson, "assignedTo.type": "level", "assignedTo.id": user.level })
  }

  const assignments = await Assignment.find({ $or: conditions })
    .sort({ dueDate: 1 })
    .lean()

  const assignmentsWithSubmission = await Promise.all(
    assignments.map(async (assignment) => {
      const submission = await Submission.findOne({
        assignment: assignment._id,
        student: studentId,
      }).lean()

      return {
        id: assignment._id.toString(),
        title: assignment.title,
        description: assignment.description || "",
        attachmentUrl: assignment.attachmentUrl,
        attachmentName: assignment.attachmentName,
        dueDate: assignment.dueDate,
        lesson: assignment.lesson,
        submission: submission
          ? {
              id: submission._id.toString(),
              fileUrl: submission.fileUrl,
              fileName: submission.fileName,
              submittedAt: submission.submittedAt,
              grade: submission.grade,
              feedback: submission.feedback || "",
            }
          : null,
      }
    })
  )

  return assignmentsWithSubmission
}

export async function getExtracurricularAssignments(
  studentId: string,
  groupId?: string
) {
  await connectDB()

  const conditions: object[] = [
    { lesson: null, "assignedTo.type": "student", "assignedTo.id": studentId },
    { lesson: { $exists: false }, "assignedTo.type": "student", "assignedTo.id": studentId },
  ]

  if (groupId) {
    conditions.push({ lesson: null, "assignedTo.type": "group", "assignedTo.id": groupId })
    conditions.push({ lesson: { $exists: false }, "assignedTo.type": "group", "assignedTo.id": groupId })
  }

  const user = await User.findById(studentId).lean()
  if (user?.level) {
    conditions.push({ lesson: null, "assignedTo.type": "level", "assignedTo.id": user.level })
    conditions.push({ lesson: { $exists: false }, "assignedTo.type": "level", "assignedTo.id": user.level })
  }

  const assignments = await Assignment.find({ $or: conditions })
    .sort({ dueDate: 1 })
    .lean()

  const assignmentsWithSubmission = await Promise.all(
    assignments.map(async (assignment) => {
      const submission = await Submission.findOne({
        assignment: assignment._id,
        student: studentId,
      }).lean()

      return {
        id: assignment._id.toString(),
        title: assignment.title,
        description: assignment.description || "",
        attachmentUrl: assignment.attachmentUrl,
        attachmentName: assignment.attachmentName,
        dueDate: assignment.dueDate,
        submission: submission
          ? {
              id: submission._id.toString(),
              fileUrl: submission.fileUrl,
              fileName: submission.fileName,
              submittedAt: submission.submittedAt,
              grade: submission.grade,
              feedback: submission.feedback || "",
            }
          : null,
      }
    })
  )

  return assignmentsWithSubmission
}

export async function getAssignmentsForStudent(
  studentId: string,
  level?: string,
  groupId?: string
) {
  await connectDB()

  const conditions = [
    { "assignedTo.type": "student", "assignedTo.id": studentId },
  ]

  if (level) {
    conditions.push({ "assignedTo.type": "level", "assignedTo.id": level })
  }

  if (groupId) {
    conditions.push({ "assignedTo.type": "group", "assignedTo.id": groupId })
  }

  const assignments = await Assignment.find({ $or: conditions })
    .sort({ dueDate: -1 })
    .lean()

  const assignmentsWithSubmission = await Promise.all(
    assignments.map(async (assignment) => {
      const submission = await Submission.findOne({
        assignment: assignment._id,
        student: studentId,
      }).lean()

      return {
        id: assignment._id.toString(),
        title: assignment.title,
        description: assignment.description || "",
        attachmentUrl: assignment.attachmentUrl,
        attachmentName: assignment.attachmentName,
        dueDate: assignment.dueDate,
        submission: submission
          ? {
              id: submission._id.toString(),
              fileUrl: submission.fileUrl,
              fileName: submission.fileName,
              submittedAt: submission.submittedAt,
              grade: submission.grade,
              originalGrade: submission.originalGrade,
              feedback: submission.feedback || "",
              originalFeedback: submission.originalFeedback || "",
              isExtraordinary: submission.isExtraordinary || false,
              gradedAt: submission.gradedAt,
            }
          : null,
        createdAt: assignment.createdAt,
      }
    })
  )

  return assignmentsWithSubmission
}

export async function submitAssignment(
  assignmentId: string,
  studentId: string,
  fileUrl: string,
  fileName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await connectDB()

    // Check if already submitted
    const existingSubmission = await Submission.findOne({
      assignment: assignmentId,
      student: studentId,
    })

    if (existingSubmission) {
      // Update existing submission
      existingSubmission.fileUrl = fileUrl
      existingSubmission.fileName = fileName
      existingSubmission.submittedAt = new Date()
      existingSubmission.grade = undefined
      existingSubmission.feedback = undefined
      existingSubmission.gradedAt = undefined

      await existingSubmission.save()
    } else {
      // Create new submission
      await Submission.create({
        assignment: assignmentId,
        student: studentId,
        fileUrl,
        fileName,
        submittedAt: new Date(),
      })
    }

    revalidatePath("/estudiante/tareas")

    return { success: true }
  } catch {
    return { success: false, error: "Error al entregar la tarea" }
  }
}

export async function getPendingSubmissions() {
  await connectDB()

  const submissions = await Submission.find({ grade: null })
    .populate("student", "name email")
    .populate("assignment", "title dueDate")
    .sort({ submittedAt: -1 })
    .lean()

  return submissions.map((s) => {
    const student = s.student as unknown as { name: string; email: string }
    const assignment = s.assignment as unknown as { _id: { toString: () => string }; title: string }
    return {
      id: s._id.toString(),
      studentName: student.name,
      studentEmail: student.email,
      assignmentId: assignment._id.toString(),
      assignmentTitle: assignment.title,
      fileUrl: s.fileUrl,
      fileName: s.fileName,
      submittedAt: s.submittedAt,
    }
  })
}
