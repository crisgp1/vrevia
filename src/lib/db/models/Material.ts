import mongoose, { Schema, Document, Model } from "mongoose"

export interface IMaterial extends Document {
  _id: mongoose.Types.ObjectId
  title: string
  description?: string
  fileUrl: string
  fileName: string
  lesson: number
  assignedTo?: {
    type: "group" | "student"
    id: string
  }
  uploadedAt: Date
  createdAt: Date
  updatedAt: Date
}

const MaterialSchema = new Schema<IMaterial>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    lesson: {
      type: Number,
      required: true,
      min: 1,
      max: 150,
    },
    assignedTo: {
      type: {
        type: String,
        enum: ["group", "student"],
      },
      id: {
        type: String,
      },
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
)

const Material: Model<IMaterial> =
  mongoose.models.Material ||
  mongoose.model<IMaterial>("Material", MaterialSchema)

export default Material
