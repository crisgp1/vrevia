import mongoose, { Schema, Document, Model } from "mongoose"

export interface IEnglishStudent extends Document {
  _id: mongoose.Types.ObjectId
  clerkId: string
  email: string
  name: string
  phone?: string
  currentLevel: "a1" | "a2" | "b1" | "b2" | "b2plus"
  currentLesson: number
  subscription?: mongoose.Types.ObjectId
  completedLessons: number[]
  startDate: Date
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const englishStudentSchema = new Schema<IEnglishStudent>(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
    },
    currentLevel: {
      type: String,
      enum: ["a1", "a2", "b1", "b2", "b2plus"],
      default: "a1",
    },
    currentLesson: {
      type: Number,
      default: 1,
      min: 1,
      max: 150,
    },
    subscription: {
      type: Schema.Types.ObjectId,
      ref: "EnglishSubscription",
    },
    completedLessons: {
      type: [Number],
      default: [],
    },
    startDate: {
      type: Date,
      default: Date.now,
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

const EnglishStudent: Model<IEnglishStudent> =
  mongoose.models.EnglishStudent ||
  mongoose.model<IEnglishStudent>("EnglishStudent", englishStudentSchema)

export default EnglishStudent
