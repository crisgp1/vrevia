import mongoose, { Schema, Document, Model } from "mongoose"

export interface IPayment extends Document {
  _id: mongoose.Types.ObjectId
  student: mongoose.Types.ObjectId
  amount: number
  concept: string
  date: Date
  status: "paid" | "pending"
  createdAt: Date
  updatedAt: Date
}

const PaymentSchema = new Schema<IPayment>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    concept: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["paid", "pending"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
)

const Payment: Model<IPayment> =
  mongoose.models.Payment || mongoose.model<IPayment>("Payment", PaymentSchema)

export default Payment
