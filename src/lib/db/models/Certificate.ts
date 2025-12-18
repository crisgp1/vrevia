import mongoose, { Schema, Document, Model } from "mongoose"

export interface ICertificate extends Document {
  _id: mongoose.Types.ObjectId
  student: mongoose.Types.ObjectId
  level: "a1" | "a2" | "b1" | "b2" | "b2plus"
  issueDate: Date
  certificateNumber: string
  issuedBy: mongoose.Types.ObjectId
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const CertificateSchema = new Schema<ICertificate>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    level: {
      type: String,
      enum: ["a1", "a2", "b1", "b2", "b2plus"],
      required: true,
    },
    issueDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    certificateNumber: {
      type: String,
      required: true,
      unique: true,
    },
    issuedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
)

// Index for faster queries
CertificateSchema.index({ student: 1, level: 1 })
// certificateNumber already has unique: true which creates an index automatically

const Certificate: Model<ICertificate> =
  mongoose.models.Certificate || mongoose.model<ICertificate>("Certificate", CertificateSchema)

export default Certificate
