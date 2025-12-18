"use server"

import { revalidatePath } from "next/cache"
import connectDB from "@/lib/db/connection"
import { Payment, User } from "@/lib/db/models"
import { createPaymentSchema, updatePaymentSchema } from "@/lib/validations/payment"
import type { CreatePaymentInput, UpdatePaymentInput } from "@/lib/validations/payment"

export async function getPayments() {
  await connectDB()

  const payments = await Payment.find()
    .populate("student", "name email")
    .sort({ date: -1 })
    .lean()

  return payments.map((payment) => {
    const student = payment.student as unknown as { _id: { toString: () => string }; name: string; email: string }
    return {
      id: payment._id.toString(),
      studentId: student._id.toString(),
      studentName: student.name,
      studentEmail: student.email,
      amount: payment.amount,
      concept: payment.concept,
      date: payment.date,
      status: payment.status,
      createdAt: payment.createdAt,
    }
  })
}

export async function getPaymentsByStudent(studentId: string) {
  await connectDB()

  const payments = await Payment.find({ student: studentId })
    .sort({ date: -1 })
    .lean()

  return payments.map((payment) => ({
    id: payment._id.toString(),
    amount: payment.amount,
    concept: payment.concept,
    date: payment.date,
    status: payment.status,
    createdAt: payment.createdAt,
  }))
}

export async function createPayment(data: CreatePaymentInput): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const validated = createPaymentSchema.parse(data)

    await connectDB()

    // Verify student exists
    const student = await User.findById(validated.student)
    if (!student || student.role !== "student") {
      return { success: false, error: "Alumno no encontrado" }
    }

    const payment = await Payment.create({
      student: validated.student,
      amount: validated.amount,
      concept: validated.concept,
      date: new Date(validated.date),
      status: validated.status,
    })

    revalidatePath("/dashboard/pagos")

    return { success: true, id: payment._id.toString() }
  } catch {
    return { success: false, error: "Error al crear el pago" }
  }
}

export async function updatePayment(id: string, data: UpdatePaymentInput) {
  const validated = updatePaymentSchema.parse(data)

  await connectDB()

  const payment = await Payment.findById(id)

  if (!payment) {
    return { error: "Pago no encontrado" }
  }

  if (validated.amount !== undefined) payment.amount = validated.amount
  if (validated.concept !== undefined) payment.concept = validated.concept
  if (validated.date !== undefined) payment.date = new Date(validated.date)
  if (validated.status !== undefined) payment.status = validated.status

  await payment.save()

  revalidatePath("/dashboard/pagos")

  return { success: true }
}

export async function deletePayment(id: string) {
  await connectDB()

  const payment = await Payment.findById(id)

  if (!payment) {
    return { error: "Pago no encontrado" }
  }

  await Payment.findByIdAndDelete(id)

  revalidatePath("/dashboard/pagos")

  return { success: true }
}

export async function togglePaymentStatus(id: string) {
  await connectDB()

  const payment = await Payment.findById(id)

  if (!payment) {
    return { error: "Pago no encontrado" }
  }

  payment.status = payment.status === "paid" ? "pending" : "paid"
  await payment.save()

  revalidatePath("/dashboard/pagos")

  return { success: true, status: payment.status }
}

export async function getPaymentsSummary() {
  await connectDB()

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  const [totalThisMonth, pendingTotal, paidTotal] = await Promise.all([
    Payment.aggregate([
      {
        $match: {
          date: { $gte: startOfMonth, $lte: endOfMonth },
          status: "paid",
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Payment.aggregate([
      { $match: { status: "pending" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Payment.aggregate([
      { $match: { status: "paid" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
  ])

  return {
    thisMonth: totalThisMonth[0]?.total || 0,
    pending: pendingTotal[0]?.total || 0,
    totalPaid: paidTotal[0]?.total || 0,
  }
}
