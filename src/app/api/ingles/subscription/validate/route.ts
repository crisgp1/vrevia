import { NextResponse } from "next/server"
import { getEnglishStudent } from "@/lib/auth/english"

export async function GET() {
  try {
    const student = await getEnglishStudent()

    if (!student) {
      return NextResponse.json(
        {
          hasActiveSubscription: false,
          error: "No estás registrado en el módulo de inglés",
        },
        { status: 403 }
      )
    }

    return NextResponse.json({
      hasActiveSubscription: student.hasActiveSubscription,
      subscriptionType: student.subscriptionType,
      subscriptionEndDate: student.subscriptionEndDate,
    })
  } catch (error) {
    console.error("Error validating subscription:", error)
    return NextResponse.json(
      {
        hasActiveSubscription: false,
        error: "Error al validar suscripción",
      },
      { status: 500 }
    )
  }
}
