import mongoose, { Document, Schema } from "mongoose"

export interface IEnglishClassRequest extends Document {
  student: mongoose.Types.ObjectId
  lesson: mongoose.Types.ObjectId
  lessonNumber: number
  requestedDate: Date
  requestedTime: string // "09:00", "14:30", etc.
  status: "pending" | "confirmed" | "completed" | "cancelled"
  price: number
  paymentStatus: "pending" | "paid"
  notes?: string
  tutorNotes?: string
  confirmedDate?: Date
  createdAt: Date
  updatedAt: Date
}

const englishClassRequestSchema = new Schema<IEnglishClassRequest>(
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
    },
    requestedDate: {
      type: Date,
      required: true,
    },
    requestedTime: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
    price: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },
    notes: String,
    tutorNotes: String,
    confirmedDate: Date,
  },
  {
    timestamps: true,
  }
)

// Indexes
englishClassRequestSchema.index({ student: 1, status: 1 })
englishClassRequestSchema.index({ requestedDate: 1 })

export const EnglishClassRequest =
  mongoose.models.EnglishClassRequest ||
  mongoose.model<IEnglishClassRequest>("EnglishClassRequest", englishClassRequestSchema)
