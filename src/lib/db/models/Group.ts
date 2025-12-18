import mongoose, { Schema, Document, Model } from "mongoose"

export interface IGroup extends Document {
  _id: mongoose.Types.ObjectId
  name: string
  level: "a1" | "a2" | "b1" | "b2" | "b2plus"
  schedule: string
  description?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const GroupSchema = new Schema<IGroup>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    level: {
      type: String,
      enum: ["a1", "a2", "b1", "b2", "b2plus"],
      required: true,
    },
    schedule: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
)

const Group: Model<IGroup> =
  mongoose.models.Group || mongoose.model<IGroup>("Group", GroupSchema)

export default Group
