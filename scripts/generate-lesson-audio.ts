import mongoose from "mongoose"
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js"
import { put } from "@vercel/blob"
import { EnglishLesson } from "../src/lib/db/models"

const MONGODB_URI = process.env.MONGODB_URI
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable")
}

if (!ELEVENLABS_API_KEY) {
  throw new Error("Please define the ELEVENLABS_API_KEY environment variable")
}

const elevenlabs = new ElevenLabsClient({
  apiKey: ELEVENLABS_API_KEY,
})

// Voz en español (Rachel - calidad alta, natural)
const VOICE_ID = "21m00Tcm4TlvDq8ikWAM"

async function generateAudioForSection(
  lessonNumber: number,
  sectionIndex: number,
  content: string
): Promise<string> {
  console.log(`  📢 Generando audio para sección ${sectionIndex + 1}...`)

  try {
    // Generate audio with ElevenLabs
    const audio = await elevenlabs.textToSpeech.convert(VOICE_ID, {
      text: content,
      modelId: "eleven_multilingual_v2",
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
    const filename = `english/lessons/${lessonNumber}/section-${sectionIndex}-${Date.now()}.mp3`
    const blob = await put(filename, audioBuffer, {
      access: "public",
      contentType: "audio/mpeg",
    })

    console.log(`  ✅ Audio generado: ${blob.url}`)
    return blob.url
  } catch (error) {
    console.error(`  ❌ Error generando audio:`, error)
    throw error
  }
}

async function generateLessonAudio(lessonNumber: number) {
  try {
    const lesson = await EnglishLesson.findOne({ lessonNumber })

    if (!lesson) {
      console.log(`❌ Lección ${lessonNumber} no encontrada`)
      return
    }

    console.log(`\n📖 Procesando Lección ${lessonNumber}: ${lesson.title}`)
    console.log(`   Secciones: ${lesson.content.sections.length}`)

    let generatedCount = 0
    let skippedCount = 0

    for (let i = 0; i < lesson.content.sections.length; i++) {
      const section = lesson.content.sections[i]

      // Skip if already has audio
      if (section.audioUrl) {
        console.log(`  ⏭️  Sección ${i + 1} ya tiene audio, omitiendo...`)
        skippedCount++
        continue
      }

      // Only generate for text sections
      if (section.type !== "text") {
        console.log(`  ⏭️  Sección ${i + 1} no es texto, omitiendo...`)
        skippedCount++
        continue
      }

      // Generate audio
      const audioUrl = await generateAudioForSection(lessonNumber, i, section.content)
      lesson.content.sections[i].audioUrl = audioUrl
      generatedCount++

      // Wait a bit between requests to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    // Save lesson
    await lesson.save()

    console.log(`\n✅ Lección ${lessonNumber} completada:`)
    console.log(`   - Audio generado: ${generatedCount} secciones`)
    console.log(`   - Omitidas: ${skippedCount} secciones`)
  } catch (error) {
    console.error(`❌ Error procesando lección ${lessonNumber}:`, error)
  }
}

async function generateAllLessonsAudio() {
  try {
    await mongoose.connect(MONGODB_URI as string)
    console.log("✅ Conectado a MongoDB")

    // Get all lessons with published content
    const lessons = await EnglishLesson.find({ isPublished: true }).sort({ lessonNumber: 1 })

    console.log(`\n📚 Encontradas ${lessons.length} lecciones publicadas`)

    for (const lesson of lessons) {
      await generateLessonAudio(lesson.lessonNumber)
    }

    console.log("\n🎉 ¡Proceso completado!")
  } catch (error) {
    console.error("❌ Error:", error)
  } finally {
    await mongoose.connection.close()
    console.log("👋 Desconectado de MongoDB")
  }
}

// If a lesson number is provided as argument, generate only that lesson
// Otherwise, generate all lessons
const lessonNumber = process.argv[2] ? parseInt(process.argv[2]) : null

if (lessonNumber) {
  ;(async () => {
    try {
      await mongoose.connect(MONGODB_URI as string)
      console.log("✅ Conectado a MongoDB")
      await generateLessonAudio(lessonNumber)
    } catch (error) {
      console.error("❌ Error:", error)
    } finally {
      await mongoose.connection.close()
      console.log("👋 Desconectado de MongoDB")
    }
  })()
} else {
  generateAllLessonsAudio()
}
