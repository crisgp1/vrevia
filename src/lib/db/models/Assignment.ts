import mongoose, { Schema, Document, Model } from "mongoose"

export interface IAssignment extends Document {
  _id: mongoose.Types.ObjectId
  title: string
  description?: string
  attachmentUrl?: string
  attachmentName?: string
  dueDate: Date
  lesson?: number // Optional: 1-150 for class-specific, null/undefined for extracurricular
  assignedTo: {
    type: "level" | "group" | "student"
    id: string
  }
  createdAt: Date
  updatedAt: Date
}

const AssignmentSchema = new Schema<IAssignment>(
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
    attachmentUrl: {
      type: String,
    },
    attachmentName: {
      type: String,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    lesson: {
      type: Number,
      min: 1,
      max: 150,
      default: null,
    },
    assignedTo: {
      type: {
        type: String,
        enum: ["level", "group", "student"],
        required: true,
      },
      id: {
        type: String,
        required: true,
      },
    },
  },
  {
    timestamps: true,
  }
)

const Assignment: Model<IAssignment> =
  mongoose.models.Assignment ||
  mongoose.model<IAssignment>("Assignment", AssignmentSchema)

export default Assignment
