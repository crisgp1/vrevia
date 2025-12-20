import mongoose, { Schema, Document, Model } from "mongoose"

export interface IEnglishCertificate extends Document {
  _id: mongoose.Types.ObjectId
  student: mongoose.Types.ObjectId
  level: "a1" | "a2" | "b1" | "b2" | "b2plus"
  certificateNumber: string
  issueDate: Date
  finalScore?: number
  totalHours: number
  completionDate: Date
  pdfUrl?: string
  createdAt: Date
  updatedAt: Date
}

const englishCertificateSchema = new Schema<IEnglishCertificate>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "EnglishStudent",
      required: true,
    },
    level: {
      type: String,
      enum: ["a1", "a2", "b1", "b2", "b2plus"],
      required: true,
    },
    certificateNumber: {
      type: String,
      required: true,
      unique: true,
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    finalScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    totalHours: {
      type: Number,
      default: 0,
    },
    completionDate: {
      type: Date,
      required: true,
    },
    pdfUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
)

// Índice compuesto para búsquedas eficientes
englishCertificateSchema.index({ student: 1, level: 1 })

const EnglishCertificate: Model<IEnglishCertificate> =
  mongoose.models.EnglishCertificate ||
  mongoose.model<IEnglishCertificate>("EnglishCertificate", englishCertificateSchema)

export default EnglishCertificate
