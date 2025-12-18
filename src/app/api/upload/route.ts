import { put } from "@vercel/blob"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      console.error("Upload attempt without authentication")
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      console.error("No file provided in upload request")
      return NextResponse.json({ error: "No se proporcionó archivo" }, { status: 400 })
    }

    console.log("Upload attempt:", {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      userId
    })

    // Validate file type (PDFs only)
    if (file.type !== "application/pdf") {
      console.error("Invalid file type:", file.type)
      return NextResponse.json({
        error: `Solo se permiten archivos PDF. Tipo recibido: ${file.type}`
      }, { status: 400 })
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

    console.log("Upload successful:", { url: blob.url, pathname })

    return NextResponse.json({
      url: blob.url,
      name: file.name,
      size: file.size,
    })
  } catch (error) {
    console.error("Upload error:", error)
    const errorMessage = error instanceof Error ? error.message : "Error desconocido"
    return NextResponse.json(
      { error: `Error al subir el archivo: ${errorMessage}` },
      { status: 500 }
    )
  }
}
