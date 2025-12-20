import mongoose from "mongoose"
import { EnglishLesson } from "../src/lib/db/models"

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable")
}

async function checkLesson() {
  try {
    await mongoose.connect(MONGODB_URI as string)
    console.log("✅ Connected to MongoDB")

    const lesson = await EnglishLesson.findOne({ lessonNumber: 1 }).lean()

    if (!lesson) {
      console.log("❌ Lección no encontrada")
      return
    }

    console.log("\n📖 Lección 1:")
    console.log("Title:", lesson.title)
    console.log("Grammar:", lesson.grammar)
    console.log("Vocabulary:", lesson.vocabulary)
    console.log("\nContent:", JSON.stringify(lesson.content, null, 2))
    console.log("\nHas content.sections?", !!(lesson.content && lesson.content.sections))
    if (lesson.content && lesson.content.sections) {
      console.log("Sections count:", lesson.content.sections.length)
    }
  } catch (error) {
    console.error("❌ Error:", error)
  } finally {
    await mongoose.connection.close()
  }
}

checkLesson()
