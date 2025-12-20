import mongoose from "mongoose"
import { EnglishLesson } from "../src/lib/db/models"

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable")
}

async function updateLesson1() {
  try {
    await mongoose.connect(MONGODB_URI as string)
    console.log("✅ Connected to MongoDB")

    const lesson = await EnglishLesson.findOne({ lessonNumber: 1 })

    if (!lesson) {
      console.log("❌ Lección 1 no encontrada")
      return
    }

    // Update with rich content
    lesson.content = {
      sections: [
        {
          type: "text",
          title: "Introduction to TO BE",
          content: `Welcome to your first English lesson! In this lesson, you'll learn one of the most important verbs in English: TO BE.

The verb TO BE is used to:
- Introduce yourself
- Describe people and things
- Talk about professions
- Indicate locations`,
          order: 1,
        },
        {
          type: "text",
          title: "Affirmative Forms",
          content: `The verb TO BE has three forms in the present tense:

**I am** (I'm)
- I am a student.
- I'm from Mexico.

**You/We/They are** (You're/We're/They're)
- You are my friend.
- We are students.
- They are teachers.

**He/She/It is** (He's/She's/It's)
- He is a doctor.
- She is happy.
- It is a book.`,
          order: 2,
        },
        {
          type: "text",
          title: "Professional Introductions",
          content: `Let's practice professional introductions!

**Basic structure:**
Hello, my name is [name].
I am a [profession].
I am from [country/city].

**Examples:**
- "Hello, my name is María. I am a teacher. I am from Mexico City."
- "Hi, I'm Carlos. I'm an engineer. I'm from Guadalajara."
- "Good morning, my name is Ana. I am a student. I am from Monterrey."`,
          order: 3,
        },
        {
          type: "text",
          title: "Common Professions Vocabulary",
          content: `Here are some common professions in English:

- Teacher (maestro/a)
- Student (estudiante)
- Doctor (doctor/a)
- Nurse (enfermero/a)
- Engineer (ingeniero/a)
- Lawyer (abogado/a)
- Accountant (contador/a)
- Manager (gerente)
- Designer (diseñador/a)
- Programmer (programador/a)`,
          order: 4,
        },
        {
          type: "text",
          title: "Practice Exercise",
          content: `Now it's your turn! Try to introduce yourself using this structure:

1. Hello, my name is ________________.
2. I am a ________________.
3. I am from ________________.

**Example answers:**
- "Hello, my name is Pedro. I am a programmer. I am from Mexico."
- "Hi, I'm Laura. I'm a designer. I'm from Spain."

Practice saying this out loud several times!`,
          order: 5,
        },
      ],
    }

    await lesson.save()

    console.log("✅ Lección 1 actualizada con contenido completo")
    console.log("Secciones:", lesson.content.sections.length)
  } catch (error) {
    console.error("❌ Error:", error)
  } finally {
    await mongoose.connection.close()
  }
}

updateLesson1()
