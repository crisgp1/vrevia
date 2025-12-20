import mongoose, { Schema, Document, Model } from "mongoose"

export interface IOfficialDocument extends Document {
  _id: mongoose.Types.ObjectId
  student: mongoose.Types.ObjectId
  documentType: "kardex" | "certificate" | "transcript"
  verificationHash: string
  issuedAt: Date
  issuedBy: mongoose.Types.ObjectId
  metadata: {
    studentName: string
    studentEmail: string
    currentLesson: number
    level?: string
    averageGrade?: number
    totalProgress?: number
    attendancePercentage?: number
  }
  isValid: boolean
  revokedAt?: Date
  revokedBy?: mongoose.Types.ObjectId
  revokedReason?: string
  createdAt: Date
  updatedAt: Date
}

const OfficialDocumentSchema = new Schema<IOfficialDocument>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    documentType: {
      type: String,
      enum: ["kardex", "certificate", "transcript"],
      required: true,
    },
    verificationHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    issuedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    issuedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    metadata: {
      studentName: { type: String, required: true },
      studentEmail: { type: String, required: true },
      currentLesson: { type: Number, required: true },
      level: String,
      averageGrade: Number,
      totalProgress: Number,
      attendancePercentage: Number,
    },
    isValid: {
      type: Boolean,
      default: true,
    },
    revokedAt: {
      type: Date,
    },
    revokedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    revokedReason: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
)

const OfficialDocument: Model<IOfficialDocument> =
  mongoose.models.OfficialDocument ||
  mongoose.model<IOfficialDocument>("OfficialDocument", OfficialDocumentSchema)

export default OfficialDocument
