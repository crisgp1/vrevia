import { NextRequest, NextResponse } from "next/server"
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js"
import { put } from "@vercel/blob"
import { EnglishLesson } from "@/lib/db/models"
import { connectDB } from "@/lib/db/connection"
import { auth } from "@clerk/nextjs/server"

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
})

// Voz en español (Rachel - calidad alta, natural)
const VOICE_ID = "21m00Tcm4TlvDq8ikWAM" // Rachel voice

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ lessonNumber: string; sectionIndex: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { lessonNumber, sectionIndex } = await params
    const lessonNum = parseInt(lessonNumber)
    const sectionIdx = parseInt(sectionIndex)

    if (isNaN(lessonNum) || isNaN(sectionIdx)) {
      return NextResponse.json({ error: "Parámetros inválidos" }, { status: 400 })
    }

    await connectDB()

    // Get lesson
    const lesson = await EnglishLesson.findOne({ lessonNumber: lessonNum })
    if (!lesson) {
      return NextResponse.json({ error: "Lección no encontrada" }, { status: 404 })
    }

    const section = lesson.content.sections[sectionIdx]
    if (!section) {
      return NextResponse.json({ error: "Sección no encontrada" }, { status: 404 })
    }

    // Check if audio already exists
    if (section.audioUrl) {
      return NextResponse.json({
        success: true,
        audioUrl: section.audioUrl,
        cached: true,
      })
    }

    // Generate audio with ElevenLabs
    console.log(`Generando audio para lección ${lessonNum}, sección ${sectionIdx}...`)

    const audio = await elevenlabs.textToSpeech.convert(VOICE_ID, {
      text: section.content,
      modelId: "eleven_multilingual_v2", // Soporta español
      voiceSettings: {
        stability: 0.5,
        similarityBoost: 0.75,
        style: 0.0,
        useSpeakerBoost: true,
      },
    })

    // Convert ReadableStream to Buffer
    const reader = audio.getReader()
    const chunks: Uint8Array[] = []
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      if (value) chunks.push(value)
    }
    const audioBuffer = Buffer.concat(chunks)

    // Upload to Vercel Blob
    const filename = `english/lessons/${lessonNum}/section-${sectionIdx}-${Date.now()}.mp3`
    const blob = await put(filename, audioBuffer, {
      access: "public",
      contentType: "audio/mpeg",
    })

    // Update lesson with audio URL
    lesson.content.sections[sectionIdx].audioUrl = blob.url
    await lesson.save()

    console.log(`✅ Audio generado: ${blob.url}`)

    return NextResponse.json({
      success: true,
      audioUrl: blob.url,
      cached: false,
    })
  } catch (error) {
    console.error("Error generando audio:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 }
    )
  }
}
