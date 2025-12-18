import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    return NextResponse.json({ role: user.role })
  } catch {
    return NextResponse.json({ error: "Error al obtener rol" }, { status: 500 })
  }
}
