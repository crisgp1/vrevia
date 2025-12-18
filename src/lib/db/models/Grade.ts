import mongoose, { Schema, Document, Model } from "mongoose"

export interface IGrade extends Document {
  _id: mongoose.Types.ObjectId
  student: mongoose.Types.ObjectId
  lesson: number
  type: "class" | "assessment" | "final"
  score: number
  maxScore: number
  notes?: string
  gradedBy: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const GradeSchema = new Schema<IGrade>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lesson: {
      type: Number,
      required: true,
      min: 1,
      max: 150,
    },
    type: {
      type: String,
      enum: ["class", "assessment", "final"],
      required: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
    },
    maxScore: {
      type: Number,
      required: true,
      default: 100,
    },
    notes: {
      type: String,
      trim: true,
    },
    gradedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

// Compound index for student + lesson uniqueness per type
GradeSchema.index({ student: 1, lesson: 1, type: 1 }, { unique: true })

const Grade: Model<IGrade> =
  mongoose.models.Grade || mongoose.model<IGrade>("Grade", GradeSchema)

export default Grade
