import mongoose, { Schema, Document, Model } from "mongoose"

export interface IEnglishProgress extends Document {
  _id: mongoose.Types.ObjectId
  student: mongoose.Types.ObjectId
  lesson: mongoose.Types.ObjectId
  lessonNumber: number
  status: "not-started" | "in-progress" | "completed"
  progress: number
  startedAt?: Date
  completedAt?: Date
  lastAccessedAt: Date
  timeSpent: number
  createdAt: Date
  updatedAt: Date
}

const englishProgressSchema = new Schema<IEnglishProgress>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "EnglishStudent",
      required: true,
    },
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
    status: {
      type: String,
      enum: ["not-started", "in-progress", "completed"],
      default: "not-started",
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    startedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    lastAccessedAt: {
      type: Date,
      default: Date.now,
    },
    timeSpent: {
      type: Number,
      default: 0, // minutos
    },
  },
  {
    timestamps: true,
  }
)

// Índice único para evitar duplicados
englishProgressSchema.index({ student: 1, lesson: 1 }, { unique: true })

const EnglishProgress: Model<IEnglishProgress> =
  mongoose.models.EnglishProgress ||
  mongoose.model<IEnglishProgress>("EnglishProgress", englishProgressSchema)

export default EnglishProgress
