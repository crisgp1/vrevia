import mongoose, { Schema, Document, Model } from "mongoose"

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId
  clerkId: string
  email: string
  name: string
  role: "admin" | "student"
  phone?: string
  level?: "a1" | "a2" | "b1" | "b2" | "b2plus"
  currentLesson: number
  group?: mongoose.Types.ObjectId
  classType?: "individual" | "grupal"
  startDate?: Date
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
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
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["admin", "student"],
      default: "student",
    },
    phone: {
      type: String,
      trim: true,
    },
    level: {
      type: String,
      enum: ["a1", "a2", "b1", "b2", "b2plus"],
    },
    currentLesson: {
      type: Number,
      default: 1,
      min: 1,
      max: 150,
    },
    group: {
      type: Schema.Types.ObjectId,
      ref: "Group",
    },
    classType: {
      type: String,
      enum: ["individual", "grupal"],
    },
    startDate: {
      type: Date,
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

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema)

export default User
