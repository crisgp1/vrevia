import { put } from "@vercel/blob"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No se proporcionó archivo" }, { status: 400 })
    }

    // Validate file type (PDFs only)
    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Solo se permiten archivos PDF" }, { status: 400 })
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "El archivo no puede superar 10MB" }, { status: 400 })
    }

    // Upload to Vercel Blob
    const timestamp = Date.now()
    const filename = `${timestamp}-${file.name}`
    const folder = formData.get("folder") as string || "uploads"
    const pathname = `${folder}/${filename}`

    const blob = await put(pathname, file, {
      access: "public",
      addRandomSuffix: false,
    })

    return NextResponse.json({
      url: blob.url,
      name: file.name,
      size: file.size,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "Error al subir el archivo" },
      { status: 500 }
    )
  }
}
