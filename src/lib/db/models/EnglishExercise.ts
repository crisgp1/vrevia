import mongoose, { Schema, Document, Model } from "mongoose"

// Para fill-blank: cada blank tiene su respuesta
interface FillBlank {
  id: string
  correctAnswer: string | string[] // Puede aceptar múltiples respuestas correctas
  caseSensitive?: boolean
}

// Para matching: pares de elementos
interface MatchingPair {
  left: string
  right: string
}

// Para ordering: elementos a ordenar
interface OrderingItem {
  text: string
  correctPosition: number
}

interface Question {
  id: string
  question: string // Puede contener {{blank:1}}, {{blank:2}}, etc. para fill-blank
  type: "multiple-choice" | "fill-blank" | "matching" | "ordering" | "short-answer" | "translation"

  // Para multiple-choice
  options?: string[]
  correctAnswer?: string | string[]

  // Para fill-blank (formato dinámico)
  blanks?: FillBlank[]

  // Para matching
  pairs?: MatchingPair[]

  // Para ordering
  items?: OrderingItem[]

  points: number
  explanation?: string
  hint?: string
}

export interface IEnglishExercise extends Document {
  _id: mongoose.Types.ObjectId
  lesson: mongoose.Types.ObjectId
  lessonNumber: number
  title: string
  type: "multiple-choice" | "fill-blank" | "matching" | "ordering" | "short-answer" | "translation" | "essay" | "speaking"
  questions: Question[]
  passingScore: number
  allowRetry: boolean
  maxAttempts?: number
  order: number
  isRequired: boolean
  createdAt: Date
  updatedAt: Date
}

const englishExerciseSchema = new Schema<IEnglishExercise>(
  {
    lesson: {
      type: Schema.Types.ObjectId,
      ref: "EnglishLesson",
      required: true,
    },
    lessonNumber: {
      type: Number,
      required: true,
      min: 1,
      max: 150,
    },
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["multiple-choice", "fill-blank", "matching", "ordering", "short-answer", "translation", "essay", "speaking"],
      required: true,
    },
    questions: [
      {
        id: {
          type: String,
          required: true,
        },
        question: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          enum: ["multiple-choice", "fill-blank", "matching", "ordering", "short-answer", "translation"],
          required: true,
        },
        // Multiple choice
        options: [String],
        correctAnswer: Schema.Types.Mixed,
        // Fill-blank
        blanks: [
          {
            id: String,
            correctAnswer: Schema.Types.Mixed,
            caseSensitive: { type: Boolean, default: false },
          },
        ],
        // Matching
        pairs: [
          {
            left: String,
            right: String,
          },
        ],
        // Ordering
        items: [
          {
            text: String,
            correctPosition: Number,
          },
        ],
        points: {
          type: Number,
          required: true,
          default: 1,
        },
        explanation: String,
        hint: String,
      },
    ],
    passingScore: {
      type: Number,
      default: 70,
      min: 0,
      max: 100,
    },
    allowRetry: {
      type: Boolean,
      default: true,
    },
    maxAttempts: {
      type: Number,
      min: 1,
    },
    order: {
      type: Number,
      default: 1,
    },
    isRequired: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
)

const EnglishExercise: Model<IEnglishExercise> =
  mongoose.models.EnglishExercise ||
  mongoose.model<IEnglishExercise>("EnglishExercise", englishExerciseSchema)

export default EnglishExercise
