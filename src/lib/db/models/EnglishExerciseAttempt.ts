import mongoose, { Schema, Document, Model } from "mongoose"

interface Answer {
  questionId: string
  answer: string | string[]
  isCorrect?: boolean
}

export interface IEnglishExerciseAttempt extends Document {
  _id: mongoose.Types.ObjectId
  student: mongoose.Types.ObjectId
  exercise: mongoose.Types.ObjectId
  lessonNumber: number
  attemptNumber: number
  answers: Answer[]
  score: number
  passed: boolean
  feedback?: string
  gradedBy?: mongoose.Types.ObjectId
  gradedAt?: Date
  completedAt: Date
  createdAt: Date
  updatedAt: Date
}

const englishExerciseAttemptSchema = new Schema<IEnglishExerciseAttempt>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "EnglishStudent",
      required: true,
    },
    exercise: {
      type: Schema.Types.ObjectId,
      ref: "EnglishExercise",
      required: true,
    },
    lessonNumber: {
      type: Number,
      required: true,
      min: 1,
      max: 150,
    },
    attemptNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    answers: [
      {
        questionId: {
          type: String,
          required: true,
        },
        answer: Schema.Types.Mixed,
        isCorrect: Boolean,
      },
    ],
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    passed: {
      type: Boolean,
      required: true,
    },
    feedback: {
      type: String,
    },
    gradedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    gradedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
)

const EnglishExerciseAttempt: Model<IEnglishExerciseAttempt> =
  mongoose.models.EnglishExerciseAttempt ||
  mongoose.model<IEnglishExerciseAttempt>("EnglishExerciseAttempt", englishExerciseAttemptSchema)

export default EnglishExerciseAttempt
