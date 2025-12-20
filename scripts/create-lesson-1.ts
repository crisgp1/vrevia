import mongoose from "mongoose"
import { EnglishLesson } from "../src/lib/db/models"

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable")
}

async function createLesson1() {
  try {
    await mongoose.connect(MONGODB_URI as string)
    console.log("✅ Connected to MongoDB")

    // Check if lesson 1 already exists
    const existing = await EnglishLesson.findOne({ lessonNumber: 1 })
    if (existing) {
      console.log("⚠️  Lección 1 ya existe:")
      console.log({
        lessonNumber: existing.lessonNumber,
        title: existing.title,
        level: existing.level,
      })
      return
    }

    // Create lesson 1
    const lesson1 = await EnglishLesson.create({
      lessonNumber: 1,
      level: "a1",
      title: "Greetings and Introductions",
      description: "Learn how to greet people and introduce yourself in English",
      grammar: "Present simple of 'to be' (I am, you are, he/she is)",
      vocabulary: "Basic greetings (hello, hi, good morning, goodbye)",
      content: {
        sections: [
          {
            type: "text" as const,
            title: "Introduction",
            content: "In this lesson, you will learn how to greet people and introduce yourself in English. This is one of the most important skills for beginners!",
            order: 1,
          },
          {
            type: "text" as const,
            title: "Common Greetings",
            content: `
**Informal:**
- Hi! / Hello!
- Hey!
- What's up?

**Formal:**
- Good morning
- Good afternoon
- Good evening
            `.trim(),
            order: 2,
          },
          {
            type: "text" as const,
            title: "Introducing Yourself",
            content: `
**Basic introduction:**
- My name is [name]
- I am [name]
- I'm from [country]

**Examples:**
- "Hi! My name is Maria. I'm from Mexico."
- "Hello! I am Carlos. I'm from Spain."
            `.trim(),
            order: 3,
          },
        ],
      },
      resources: [],
      estimatedDuration: 30,
      isPublished: true,
    })

    console.log("✅ Lección 1 creada exitosamente:")
    console.log({
      lessonNumber: lesson1.lessonNumber,
      title: lesson1.title,
      level: lesson1.level,
      _id: lesson1._id,
    })
  } catch (error) {
    console.error("❌ Error:", error)
  } finally {
    await mongoose.connection.close()
    console.log("👋 Desconectado de MongoDB")
  }
}

createLesson1()
