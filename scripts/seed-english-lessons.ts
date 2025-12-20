import mongoose from "mongoose"
import { CURRICULUM } from "../src/lib/constants"
import connectDB from "../src/lib/db/connection"
import { EnglishLesson } from "../src/lib/db/models"

async function seedEnglishLessons() {
  console.log("🌱 Iniciando seed de lecciones de inglés...")

  try {
    // Conectar a la base de datos
    await connectDB()
    console.log("✅ Conectado a la base de datos")

    // Limpiar lecciones existentes (opcional - comentar si no quieres eliminar)
    const existingCount = await EnglishLesson.countDocuments()
    if (existingCount > 0) {
      console.log(`⚠️  Ya existen ${existingCount} lecciones en la base de datos`)
      console.log("   Puedes comentar la línea de deleteMany() si no quieres eliminarlas")
      await EnglishLesson.deleteMany({})
      console.log("🗑️  Lecciones anteriores eliminadas")
    }

    // Crear lecciones desde el CURRICULUM
    let created = 0
    let skipped = 0

    for (const lesson of CURRICULUM) {
      try {
        // Verificar si ya existe
        const existing = await EnglishLesson.findOne({ lessonNumber: lesson.lessonNumber })

        if (existing) {
          console.log(`⏭️  Lección ${lesson.lessonNumber} ya existe, saltando...`)
          skipped++
          continue
        }

        // Crear lección básica
        await EnglishLesson.create({
          lessonNumber: lesson.lessonNumber,
          level: lesson.level,
          title: `${lesson.grammar}`,
          description: `Lección ${lesson.lessonNumber}: ${lesson.grammar} - ${lesson.vocabulary}`,
          grammar: lesson.grammar,
          vocabulary: lesson.vocabulary,
          content: {
            sections: [
              {
                type: "text",
                title: "Introducción",
                content: `En esta lección aprenderás sobre: ${lesson.grammar}`,
                order: 1,
              },
              {
                type: "text",
                title: "Vocabulario",
                content: `Vocabulario clave: ${lesson.vocabulary}`,
                order: 2,
              },
            ],
          },
          resources: [],
          estimatedDuration: 60, // 60 minutos por defecto
          isPublished: true, // Publicar automáticamente
        })

        created++
        console.log(`✅ Lección ${lesson.lessonNumber} creada: ${lesson.grammar}`)
      } catch (error) {
        console.error(
          `❌ Error al crear lección ${lesson.lessonNumber}:`,
          error instanceof Error ? error.message : "Error desconocido"
        )
      }
    }

    console.log("\n📊 Resumen:")
    console.log(`   ✅ Lecciones creadas: ${created}`)
    console.log(`   ⏭️  Lecciones omitidas: ${skipped}`)
    console.log(`   📚 Total en CURRICULUM: ${CURRICULUM.length}`)
    console.log("\n✨ ¡Seed completado exitosamente!")
  } catch (error) {
    console.error("❌ Error durante el seed:", error)
  } finally {
    // Cerrar conexión
    await mongoose.connection.close()
    console.log("👋 Conexión cerrada")
  }
}

// Ejecutar seed
seedEnglishLessons()
