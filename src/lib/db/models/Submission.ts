import mongoose, { Schema, Document, Model } from "mongoose"

export interface ISubmission extends Document {
  _id: mongoose.Types.ObjectId
  assignment: mongoose.Types.ObjectId
  student: mongoose.Types.ObjectId
  fileUrl: string
  fileName: string
  submittedAt: Date
  grade?: number
  originalGrade?: number // Original grade before extraordinary override
  feedback?: string
  originalFeedback?: string // Original feedback before extraordinary override
  isExtraordinary?: boolean // If true, grade is extraordinary and originalGrade was cancelled
  gradedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const SubmissionSchema = new Schema<ISubmission>(
  {
    assignment: {
      type: Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fileUrl: {
      type: String,
      default: "",
    },
    fileName: {
      type: String,
      default: "Sin entrega",
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    grade: {
      type: Number,
      min: 0,
      max: 100,
    },
    originalGrade: {
      type: Number,
      min: 0,
      max: 100,
    },
    feedback: {
      type: String,
      trim: true,
    },
    originalFeedback: {
      type: String,
      trim: true,
    },
    isExtraordinary: {
      type: Boolean,
      default: false,
    },
    gradedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
)

// Index for efficient queries
SubmissionSchema.index({ assignment: 1, student: 1 }, { unique: true })

const Submission: Model<ISubmission> =
  mongoose.models.Submission ||
  mongoose.model<ISubmission>("Submission", SubmissionSchema)

export default Submission
