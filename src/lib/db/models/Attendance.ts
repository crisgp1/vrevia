import mongoose, { Schema, Document, Model } from "mongoose"

export type AttendanceStatus = "attended" | "absent_justified" | "absent_unjustified"

export interface IAttendance extends Document {
  _id: mongoose.Types.ObjectId
  student: mongoose.Types.ObjectId
  lesson: number
  attended: boolean
  status: AttendanceStatus // attended = consumido, absent_justified = falta sin contar, absent_unjustified = irrecuperable
  date: Date
  notes?: string
  markedBy: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lesson: {
      type: Number,
      required: true,
      min: 1,
      max: 150,
    },
    attended: {
      type: Boolean,
      required: true,
      default: true,
    },
    status: {
      type: String,
      enum: ["attended", "absent_justified", "absent_unjustified"],
      default: "attended",
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
    },
    markedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

// Compound index for student + lesson uniqueness
AttendanceSchema.index({ student: 1, lesson: 1 }, { unique: true })

const Attendance: Model<IAttendance> =
  mongoose.models.Attendance || mongoose.model<IAttendance>("Attendance", AttendanceSchema)

export default Attendance
