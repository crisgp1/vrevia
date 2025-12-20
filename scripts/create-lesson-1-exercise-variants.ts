import mongoose from "mongoose"
import { EnglishLesson, EnglishExercise } from "../src/lib/db/models"

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable")
}

async function createExerciseVariants() {
  try {
    await mongoose.connect(MONGODB_URI as string)
    console.log("✅ Connected to MongoDB")

    const lesson = await EnglishLesson.findOne({ lessonNumber: 1 })

    if (!lesson) {
      console.log("❌ Lección 1 no encontrada")
      return
    }

    console.log(`📖 Creando variantes de ejercicios para: ${lesson.title}`)

    // Delete existing exercises
    await EnglishExercise.deleteMany({ lessonNumber: 1 })
    console.log("🗑️  Ejercicios anteriores eliminados")

    // EJERCICIO 1: Fill-blank con POOL grande de preguntas
    // Se mostrarán 4 preguntas aleatorias de este pool
    const exercise1 = await EnglishExercise.create({
      lesson: lesson._id,
      lessonNumber: 1,
      title: "Complete las oraciones con TO BE",
      type: "fill-blank",
      questions: [
        // Pool de 10 preguntas variadas - se seleccionan aleatoriamente
        {
          id: "q1",
          type: "fill-blank",
          question: "I {{blank:1}} a student.",
          blanks: [{ id: "1", correctAnswer: ["am", "AM", "'m"], caseSensitive: false }],
          points: 1,
          hint: "Usa la forma correcta de TO BE para 'I'",
          explanation: "Para el pronombre 'I', usamos 'am': I am a student.",
        },
        {
          id: "q2",
          type: "fill-blank",
          question: "You {{blank:1}} my friend.",
          blanks: [{ id: "1", correctAnswer: ["are", "ARE", "'re"], caseSensitive: false }],
          points: 1,
          hint: "You siempre usa 'are'",
          explanation: "Para 'You' usamos 'are': You are my friend.",
        },
        {
          id: "q3",
          type: "fill-blank",
          question: "He {{blank:1}} a doctor.",
          blanks: [{ id: "1", correctAnswer: ["is", "IS", "'s"], caseSensitive: false }],
          points: 1,
          hint: "He/She/It usan la misma forma",
          explanation: "Para He/She/It usamos 'is': He is a doctor.",
        },
        {
          id: "q4",
          type: "fill-blank",
          question: "We {{blank:1}} from Mexico.",
          blanks: [{ id: "1", correctAnswer: ["are", "ARE", "'re"], caseSensitive: false }],
          points: 1,
          hint: "We es plural",
          explanation: "Para We/You/They usamos 'are': We are from Mexico.",
        },
        {
          id: "q5",
          type: "fill-blank",
          question: "She {{blank:1}} a teacher.",
          blanks: [{ id: "1", correctAnswer: ["is", "IS", "'s"], caseSensitive: false }],
          points: 1,
          hint: "She usa la misma forma que He",
          explanation: "Para She usamos 'is': She is a teacher.",
        },
        {
          id: "q6",
          type: "fill-blank",
          question: "They {{blank:1}} engineers.",
          blanks: [{ id: "1", correctAnswer: ["are", "ARE", "'re"], caseSensitive: false }],
          points: 1,
          hint: "They es plural",
          explanation: "Para They usamos 'are': They are engineers.",
        },
        {
          id: "q7",
          type: "fill-blank",
          question: "It {{blank:1}} a book.",
          blanks: [{ id: "1", correctAnswer: ["is", "IS", "'s"], caseSensitive: false }],
          points: 1,
          hint: "It usa la misma forma que He/She",
          explanation: "Para It usamos 'is': It is a book.",
        },
        {
          id: "q8",
          type: "fill-blank",
          question: "I {{blank:1}} happy today.",
          blanks: [{ id: "1", correctAnswer: ["am", "AM", "'m"], caseSensitive: false }],
          points: 1,
          hint: "I siempre usa 'am'",
          explanation: "Para I usamos 'am': I am happy.",
        },
        {
          id: "q9",
          type: "fill-blank",
          question: "You {{blank:1}} a good programmer.",
          blanks: [{ id: "1", correctAnswer: ["are", "ARE", "'re"], caseSensitive: false }],
          points: 1,
          hint: "You usa 'are'",
          explanation: "Para You usamos 'are': You are a good programmer.",
        },
        {
          id: "q10",
          type: "fill-blank",
          question: "Maria {{blank:1}} from Spain.",
          blanks: [{ id: "1", correctAnswer: ["is", "IS", "'s"], caseSensitive: false }],
          points: 1,
          hint: "Un nombre propio usa la misma forma que She",
          explanation: "Para nombres propios usamos 'is': Maria is from Spain.",
        },
      ],
      passingScore: 70,
      allowRetry: true,
      maxAttempts: 5,
      order: 1,
      isRequired: true,
    })

    console.log("✅ Ejercicio 1 creado: Fill-blank con 10 preguntas variadas")

    // EJERCICIO 2: Multiple Choice con variantes
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
          options: ["I am a student", "I is a student", "I are a student", "I be a student"],
          correctAnswer: "I am a student",
          points: 1,
          explanation: "La forma correcta es 'I am'. Nunca usamos 'is' o 'are' con 'I'.",
        },
        {
          id: "q2",
          type: "multiple-choice",
          question: "Complete: 'She ___ a teacher.'",
          options: ["is", "am", "are", "be"],
          correctAnswer: "is",
          points: 1,
          hint: "She, He, It usan la misma forma",
          explanation: "Con She/He/It usamos 'is': She is a teacher.",
        },
        {
          id: "q3",
          type: "multiple-choice",
          question: "Complete: 'We ___ from Mexico.'",
          options: ["are", "is", "am", "be"],
          correctAnswer: "are",
          points: 1,
          hint: "We es plural",
          explanation: "Para We/You/They usamos 'are': We are from Mexico.",
        },
        {
          id: "q4",
          type: "multiple-choice",
          question: "Complete: 'You ___ my friend.'",
          options: ["are", "is", "am", "be"],
          correctAnswer: "are",
          points: 1,
          explanation: "Para You usamos 'are': You are my friend.",
        },
        {
          id: "q5",
          type: "multiple-choice",
          question: "Complete: 'They ___ doctors.'",
          options: ["are", "is", "am", "be"],
          correctAnswer: "are",
          points: 1,
          explanation: "Para They usamos 'are': They are doctors.",
        },
      ],
      passingScore: 70,
      allowRetry: true,
      maxAttempts: 3,
      order: 2,
      isRequired: true,
    })

    console.log("✅ Ejercicio 2 creado: Multiple Choice con 5 preguntas variadas")

    // EJERCICIO 3: Traducciones variadas
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
          correctAnswer: ["I am from Mexico", "I'm from Mexico"],
          points: 1,
          hint: "I + am/is/are + from + país",
          explanation: "La respuesta correcta es: I am from Mexico (o I'm from Mexico).",
        },
        {
          id: "q2",
          type: "translation",
          question: "Traduce: 'Ella es doctora'",
          correctAnswer: ["She is a doctor", "She's a doctor"],
          points: 1,
          hint: "She + am/is/are + profesión",
          explanation: "La respuesta correcta es: She is a doctor.",
        },
        {
          id: "q3",
          type: "translation",
          question: "Traduce: 'Nosotros somos estudiantes'",
          correctAnswer: ["We are students", "We're students"],
          points: 1,
          hint: "We + am/is/are + profesión plural",
          explanation: "La respuesta correcta es: We are students.",
        },
        {
          id: "q4",
          type: "translation",
          question: "Traduce: 'Tú eres mi amigo'",
          correctAnswer: ["You are my friend", "You're my friend"],
          points: 1,
          hint: "You + am/is/are + ...",
          explanation: "La respuesta correcta es: You are my friend.",
        },
      ],
      passingScore: 70,
      allowRetry: true,
      order: 3,
      isRequired: false,
    })

    console.log("✅ Ejercicio 3 creado: Traducciones con 4 preguntas")

    console.log("\n🎉 ¡Ejercicios con variantes creados exitosamente!")
    console.log("\nResumen:")
    console.log(`- Ejercicio 1: Fill-blank con POOL de ${exercise1.questions.length} preguntas`)
    console.log(`- Ejercicio 2: Multiple choice con ${exercise2.questions.length} preguntas variadas`)
    console.log(`- Ejercicio 3: Traducciones con ${exercise3.questions.length} preguntas`)
    console.log("\nCada reintento mostrará preguntas diferentes del pool!")
  } catch (error) {
    console.error("❌ Error:", error)
  } finally {
    await mongoose.connection.close()
    console.log("👋 Desconectado de MongoDB")
  }
}

createExerciseVariants()
