import mongoose from "mongoose"
import { EnglishLesson, EnglishExercise } from "../src/lib/db/models"

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable")
}

async function createExercisesForLesson1() {
  try {
    await mongoose.connect(MONGODB_URI as string)
    console.log("✅ Connected to MongoDB")

    // Get lesson 1
    const lesson = await EnglishLesson.findOne({ lessonNumber: 1 })

    if (!lesson) {
      console.log("❌ Lección 1 no encontrada")
      return
    }

    console.log(`📖 Creando ejercicios para: ${lesson.title}`)

    // Delete existing exercises for lesson 1
    await EnglishExercise.deleteMany({ lessonNumber: 1 })
    console.log("🗑️  Ejercicios anteriores eliminados")

    // Exercise 1: Fill-in-the-blank (dinámico con campos)
    const exercise1 = await EnglishExercise.create({
      lesson: lesson._id,
      lessonNumber: 1,
      title: "Complete las oraciones con TO BE",
      type: "fill-blank",
      questions: [
        {
          id: "q1",
          type: "fill-blank",
          question: "I {{blank:1}} a student.",
          blanks: [
            {
              id: "1",
              correctAnswer: ["am", "AM", "'m"],
              caseSensitive: false,
            },
          ],
          points: 1,
          hint: "Usa la forma correcta de TO BE para 'I'",
          explanation: "Para el pronombre 'I', usamos 'am': I am a student.",
        },
        {
          id: "q2",
          type: "fill-blank",
          question: "She {{blank:1}} a teacher and he {{blank:2}} a doctor.",
          blanks: [
            {
              id: "1",
              correctAnswer: ["is", "IS", "'s"],
              caseSensitive: false,
            },
            {
              id: "2",
              correctAnswer: ["is", "IS", "'s"],
              caseSensitive: false,
            },
          ],
          points: 2,
          hint: "She y He usan la misma forma de TO BE",
          explanation: "Para He/She/It usamos 'is': She is / He is.",
        },
        {
          id: "q3",
          type: "fill-blank",
          question: "We {{blank:1}} from Mexico.",
          blanks: [
            {
              id: "1",
              correctAnswer: ["are", "ARE", "'re"],
              caseSensitive: false,
            },
          ],
          points: 1,
          hint: "Recuerda que 'we' es plural",
          explanation: "Para We/You/They usamos 'are': We are from Mexico.",
        },
      ],
      passingScore: 70,
      allowRetry: true,
      maxAttempts: 5,
      order: 1,
      isRequired: true,
    })

    console.log("✅ Ejercicio 1 creado: Fill-in-the-blank dinámico")

    // Exercise 2: Multiple Choice
    const exercise2 = await EnglishExercise.create({
      lesson: lesson._id,
      lessonNumber: 1,
      title: "Selecciona la respuesta correcta",
      type: "multiple-choice",
      questions: [
        {
          id: "q1",
          type: "multiple-choice",
          question: "How do you say 'Yo soy estudiante' in English?",
          options: [
            "I am a student",
            "I is a student",
            "I are a student",
            "I be a student",
          ],
          correctAnswer: "I am a student",
          points: 1,
          explanation: "La forma correcta es 'I am' (contraído: I'm). Nunca usamos 'is' o 'are' con 'I'.",
        },
        {
          id: "q2",
          type: "multiple-choice",
          question: "What is the correct form? '_____ a teacher.'",
          options: [
            "She is",
            "She am",
            "She are",
            "She be",
          ],
          correctAnswer: "She is",
          points: 1,
          hint: "She, He, It usan la misma forma",
          explanation: "Con She/He/It usamos 'is': She is a teacher.",
        },
      ],
      passingScore: 70,
      allowRetry: true,
      maxAttempts: 3,
      order: 2,
      isRequired: true,
    })

    console.log("✅ Ejercicio 2 creado: Multiple Choice")

    // Exercise 3: Short Answer (Traducciones)
    const exercise3 = await EnglishExercise.create({
      lesson: lesson._id,
      lessonNumber: 1,
      title: "Traduce al inglés",
      type: "translation",
      questions: [
        {
          id: "q1",
          type: "translation",
          question: "Traduce: 'Yo soy de México'",
          correctAnswer: [
            "I am from Mexico",
            "I'm from Mexico",
            "i am from mexico",
            "i'm from mexico",
          ],
          points: 1,
          hint: "I + [verbo TO BE] + from + [país]",
          explanation: "La respuesta correcta es: I am from Mexico (o I'm from Mexico).",
        },
        {
          id: "q2",
          type: "translation",
          question: "Traduce: 'Nosotros somos maestros'",
          correctAnswer: [
            "We are teachers",
            "We're teachers",
            "we are teachers",
            "we're teachers",
          ],
          points: 1,
          hint: "We + [verbo TO BE] + [profesión en plural]",
          explanation: "La respuesta correcta es: We are teachers (o We're teachers).",
        },
      ],
      passingScore: 70,
      allowRetry: true,
      order: 3,
      isRequired: false,
    })

    console.log("✅ Ejercicio 3 creado: Traducciones")

    // Exercise 4: Matching
    const exercise4 = await EnglishExercise.create({
      lesson: lesson._id,
      lessonNumber: 1,
      title: "Empareja los pronombres con TO BE",
      type: "matching",
      questions: [
        {
          id: "q1",
          type: "matching",
          question: "Empareja cada pronombre con su forma correcta de TO BE:",
          pairs: [
            { left: "I", right: "am" },
            { left: "You", right: "are" },
            { left: "He", right: "is" },
            { left: "We", right: "are" },
            { left: "They", right: "are" },
          ],
          points: 5,
          explanation: "I am, You are, He/She/It is, We are, They are.",
        },
      ],
      passingScore: 70,
      allowRetry: true,
      order: 4,
      isRequired: false,
    })

    console.log("✅ Ejercicio 4 creado: Matching")

    console.log("\n🎉 ¡Todos los ejercicios creados exitosamente!")
    console.log("\nResumen:")
    console.log(`- Ejercicio 1: Fill-blank dinámico (${exercise1.questions.length} preguntas)`)
    console.log(`- Ejercicio 2: Multiple choice (${exercise2.questions.length} preguntas)`)
    console.log(`- Ejercicio 3: Traducciones (${exercise3.questions.length} preguntas)`)
    console.log(`- Ejercicio 4: Matching (${exercise4.questions.length} preguntas)`)
  } catch (error) {
    console.error("❌ Error:", error)
  } finally {
    await mongoose.connection.close()
    console.log("👋 Desconectado de MongoDB")
  }
}

createExercisesForLesson1()
