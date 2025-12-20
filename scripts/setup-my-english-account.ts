import mongoose from "mongoose"
import { EnglishStudent, EnglishSubscription } from "../src/lib/db/models"

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable")
}

// CAMBIA ESTOS DATOS CON TU INFORMACIÓN
const MY_CLERK_ID = "user_36zov0HDNcJJ7UOVKzwwYDhlSO4" // Tu Clerk ID del sidebar
const MY_EMAIL = "tu-email@example.com" // Tu email
const MY_NAME = "Tu Nombre" // Tu nombre

async function setupMyAccount() {
  try {
    await mongoose.connect(MONGODB_URI as string)
    console.log("✅ Connected to MongoDB")

    // 1. Check if I'm already registered as English student
    let student = await EnglishStudent.findOne({ clerkId: MY_CLERK_ID })

    if (student) {
      console.log("✅ Ya estás registrado como estudiante de inglés")
    } else {
      // Create English student profile
      student = await EnglishStudent.create({
        clerkId: MY_CLERK_ID,
        email: MY_EMAIL,
        name: MY_NAME,
        currentLevel: "a1",
        currentLesson: 1,
        completedLessons: [],
        isActive: true,
        startDate: new Date(),
      })
      console.log("✅ Estudiante de inglés creado:", {
        name: student.name,
        email: student.email,
        level: student.currentLevel,
      })
    }

    // 2. Check if I have an active subscription
    const existingSub = await EnglishSubscription.findOne({
      student: student._id,
      status: "active",
      endDate: { $gt: new Date() },
    })

    if (existingSub) {
      console.log("✅ Ya tienes una suscripción activa hasta:", existingSub.endDate)
    } else {
      // Create annual subscription (365 days)
      const startDate = new Date()
      const endDate = new Date()
      endDate.setDate(endDate.getDate() + 365)

      const subscription = await EnglishSubscription.create({
        student: student._id,
        type: "annual",
        status: "active",
        startDate,
        endDate,
        price: 4990,
        currency: "MXN",
        autoRenew: false,
      })

      console.log("✅ Suscripción anual creada:")
      console.log({
        type: "Anual",
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        status: subscription.status,
      })
    }

    console.log("\n🎉 ¡Todo listo! Ahora puedes acceder a /ingles")
  } catch (error) {
    console.error("❌ Error:", error)
  } finally {
    await mongoose.connection.close()
    console.log("👋 Desconectado de MongoDB")
  }
}

setupMyAccount()
