import mongoose, { Schema, Document, Model } from "mongoose"

export interface IEnglishSubscription extends Document {
  _id: mongoose.Types.ObjectId
  student: mongoose.Types.ObjectId
  type: "monthly" | "annual"
  status: "active" | "expired" | "cancelled" | "pending"
  startDate: Date
  endDate: Date
  price: number
  currency: string
  paymentMethod?: "stripe" | "paypal" | "manual"
  transactionId?: string
  autoRenew: boolean
  cancelledAt?: Date
  cancelReason?: string
  createdAt: Date
  updatedAt: Date
}

const englishSubscriptionSchema = new Schema<IEnglishSubscription>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "EnglishStudent",
      required: true,
    },
    type: {
      type: String,
      enum: ["monthly", "annual"],
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "expired", "cancelled", "pending"],
      default: "pending",
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "MXN",
    },
    paymentMethod: {
      type: String,
      enum: ["stripe", "paypal", "manual"],
    },
    transactionId: {
      type: String,
    },
    autoRenew: {
      type: Boolean,
      default: false,
    },
    cancelledAt: {
      type: Date,
    },
    cancelReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
)

// Índices para búsquedas eficientes
englishSubscriptionSchema.index({ student: 1, status: 1 })
englishSubscriptionSchema.index({ endDate: 1, status: 1 })

const EnglishSubscription: Model<IEnglishSubscription> =
  mongoose.models.EnglishSubscription ||
  mongoose.model<IEnglishSubscription>("EnglishSubscription", englishSubscriptionSchema)

export default EnglishSubscription
