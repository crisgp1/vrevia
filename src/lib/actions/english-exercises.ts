"use server"

import { revalidatePath } from "next/cache"
import connectDB from "@/lib/db/connection"
import { EnglishExercise, EnglishExerciseAttempt } from "@/lib/db/models"
import { requireAdmin } from "@/lib/auth"
import { requireActiveSubscription } from "@/lib/auth/english"
import {
  createEnglishExerciseSchema,
  updateEnglishExerciseSchema,
  submitExerciseSchema,
  type CreateEnglishExerciseInput,
  type UpdateEnglishExerciseInput,
  type SubmitExerciseInput,
} from "@/lib/validations/english"

/**
 * Obtiene un ejercicio por ID (Requiere suscripción)
 */
export async function getExerciseById(exerciseId: string) {
  try {
    const student = await requireActiveSubscription()
    await connectDB()

    const exercise = await EnglishExercise.findById(exerciseId).populate("lesson").lean()

    if (!exercise) {
      return {
        success: false,
        error: "Ejercicio no encontrado",
      }
    }

    // Get student's attempts
    const attempts = await EnglishExerciseAttempt.find({
      student: student.id,
      exercise: exerciseId,
    })
      .sort({ attemptNumber: -1 })
      .lean()

    const bestAttempt = attempts.length > 0 ? attempts.reduce((best, current) =>
      current.score > best.score ? current : best
    ) : null

    return {
      success: true,
      data: {
        exercise: JSON.parse(JSON.stringify(exercise)),
        attempts: JSON.parse(JSON.stringify(attempts)),
        bestScore: bestAttempt?.score,
        passed: bestAttempt?.passed,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al obtener ejercicio",
    }
  }
}

/**
 * Obtiene ejercicios de una lección (Requiere suscripción)
 */
export async function getExercisesByLesson(lessonId: string) {
  try {
    const student = await requireActiveSubscription()
    await connectDB()

    const exercises = await EnglishExercise.find({ lesson: lessonId })
      .sort({ order: 1 })
      .lean()

    // Obtener intentos del estudiante para cada ejercicio
    const exercisesWithAttempts = await Promise.all(
      exercises.map(async (exercise) => {
        const attempts = await EnglishExerciseAttempt.countDocuments({
          student: student.id,
          exercise: exercise._id,
        })

        const bestAttempt = await EnglishExerciseAttempt.findOne({
          student: student.id,
          exercise: exercise._id,
        })
          .sort({ score: -1 })
          .lean()

        return {
          ...exercise,
          attempts,
          bestScore: bestAttempt?.score,
          passed: bestAttempt?.passed,
        }
      })
    )

    return {
      success: true,
      data: JSON.parse(JSON.stringify(exercisesWithAttempts)),
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al obtener ejercicios",
    }
  }
}

/**
 * Envía respuestas de un ejercicio (Requiere suscripción)
 */
export async function submitExercise(data: SubmitExerciseInput) {
  try {
    const student = await requireActiveSubscription()
    await connectDB()

    // Validar datos
    const validatedData = submitExerciseSchema.parse(data)

    const exercise = await EnglishExercise.findById(validatedData.exerciseId)
    if (!exercise) {
      return {
        success: false,
        error: "Ejercicio no encontrado",
      }
    }

    // Contar intentos previos
    const previousAttempts = await EnglishExerciseAttempt.countDocuments({
      student: student.id,
      exercise: validatedData.exerciseId,
    })

    // Validar maxAttempts
    if (exercise.maxAttempts && previousAttempts >= exercise.maxAttempts) {
      return {
        success: false,
        error: `Has alcanzado el máximo de intentos (${exercise.maxAttempts})`,
      }
    }

    // Calcular puntaje
    let correctCount = 0
    const totalQuestions = exercise.questions.length

    const gradedAnswers = validatedData.answers.map((answer) => {
      const question = exercise.questions.find((q) => q.id === answer.questionId)

      if (!question) {
        return {
          questionId: answer.questionId,
          answer: answer.answer,
          isCorrect: false,
        }
      }

      let isCorrect: boolean | undefined = false

      // Grading logic based on question type
      switch (question.type) {
        case "fill-blank":
          // Check each blank
          if (question.blanks && typeof answer.answer === "object") {
            const allBlanksCorrect = question.blanks.every((blank) => {
              const userAnswer = answer.answer[blank.id]
              const correctAnswers = Array.isArray(blank.correctAnswer)
                ? blank.correctAnswer
                : [blank.correctAnswer]

              return correctAnswers.some((correct) => {
                if (blank.caseSensitive) {
                  return userAnswer === correct
                }
                return userAnswer?.toLowerCase() === correct.toLowerCase()
              })
            })
            isCorrect = allBlanksCorrect
          }
          break

        case "multiple-choice":
          isCorrect = answer.answer === question.correctAnswer
          break

        case "short-answer":
        case "translation":
          if (question.correctAnswer) {
            const correctAnswers = Array.isArray(question.correctAnswer)
              ? question.correctAnswer
              : [question.correctAnswer]

            isCorrect = correctAnswers.some(
              (correct) => answer.answer?.toLowerCase() === correct.toLowerCase()
            )
          }
          break

        case "matching":
          // Check if all pairs are correctly matched
          if (question.pairs && typeof answer.answer === "object") {
            isCorrect = question.pairs.every((pair) => {
              return answer.answer[pair.left] === pair.right
            })
          }
          break

        case "ordering":
          // Check if items are in correct order
          if (question.items && Array.isArray(answer.answer)) {
            isCorrect = question.items.every((item, index) => {
              return answer.answer[index] === item.text
            })
          }
          break

        default:
          // Essay, speaking, etc. require manual evaluation
          isCorrect = undefined
      }

      if (isCorrect === true) correctCount++

      return {
        questionId: answer.questionId,
        answer: answer.answer,
        isCorrect,
      }
    })

    const score = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0
    const passed = score >= exercise.passingScore

    // Crear intento
    const attempt = await EnglishExerciseAttempt.create({
      student: student.id,
      exercise: validatedData.exerciseId,
      lessonNumber: exercise.lessonNumber,
      attemptNumber: previousAttempts + 1,
      answers: gradedAnswers,
      score,
      passed,
      completedAt: new Date(),
    })

    // Obtener explicaciones
    const feedback = exercise.questions.map((q) => ({
      questionId: q.id,
      explanation: q.explanation,
    }))

    revalidatePath(`/ingles/leccion/${exercise.lessonNumber}`)

    return {
      success: true,
      data: {
        attempt: JSON.parse(JSON.stringify(attempt)),
        score,
        passed,
        feedback,
        canRetry: exercise.allowRetry && (!exercise.maxAttempts || previousAttempts + 1 < exercise.maxAttempts),
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al enviar ejercicio",
    }
  }
}

/**
 * Obtiene los intentos de un ejercicio
 */
export async function getMyAttempts(exerciseId: string) {
  try {
    const student = await requireActiveSubscription()
    await connectDB()

    const attempts = await EnglishExerciseAttempt.find({
      student: student.id,
      exercise: exerciseId,
    })
      .sort({ attemptNumber: -1 })
      .lean()

    return {
      success: true,
      data: JSON.parse(JSON.stringify(attempts)),
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al obtener intentos",
    }
  }
}

/**
 * Obtiene todos los ejercicios (Admin)
 */
export async function getAllExercises() {
  try {
    await requireAdmin()
    await connectDB()

    const exercises = await EnglishExercise.find()
      .populate("lesson")
      .sort({ lessonNumber: 1, order: 1 })
      .lean()

    return {
      success: true,
      data: JSON.parse(JSON.stringify(exercises)),
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al obtener ejercicios",
    }
  }
}

/**
 * Crea un nuevo ejercicio (Admin)
 */
export async function createExercise(data: CreateEnglishExerciseInput) {
  try {
    await requireAdmin()
    await connectDB()

    // Validar datos
    const validatedData = createEnglishExerciseSchema.parse(data)

    const exercise = await EnglishExercise.create(validatedData as any)

    revalidatePath("/dashboard/ingles/ejercicios")

    return {
      success: true,
      data: JSON.parse(JSON.stringify(exercise)),
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al crear ejercicio",
    }
  }
}

/**
 * Actualiza un ejercicio (Admin)
 */
export async function updateExercise(id: string, data: UpdateEnglishExerciseInput) {
  try {
    await requireAdmin()
    await connectDB()

    // Validar datos
    const validatedData = updateEnglishExerciseSchema.parse(data)

    const exercise = await EnglishExercise.findByIdAndUpdate(
      id,
      { $set: validatedData },
      { new: true, runValidators: true }
    )

    if (!exercise) {
      return {
        success: false,
        error: "Ejercicio no encontrado",
      }
    }

    revalidatePath("/dashboard/ingles/ejercicios")

    return {
      success: true,
      data: JSON.parse(JSON.stringify(exercise)),
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al actualizar ejercicio",
    }
  }
}

/**
 * Elimina un ejercicio (Admin)
 */
export async function deleteExercise(id: string) {
  try {
    await requireAdmin()
    await connectDB()

    const exercise = await EnglishExercise.findByIdAndDelete(id)

    if (!exercise) {
      return {
        success: false,
        error: "Ejercicio no encontrado",
      }
    }

    revalidatePath("/dashboard/ingles/ejercicios")

    return {
      success: true,
      message: "Ejercicio eliminado exitosamente",
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al eliminar ejercicio",
    }
  }
}
