import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { getAllLessons } from "@/lib/actions/english-lessons"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, Eye, EyeOff } from "lucide-react"
import { LEVELS as ENGLISH_LEVELS } from "@/lib/constants"

export default async function LeccionesInglesAdminPage() {
  const user = await getCurrentUser()

  if (!user || user.role !== "admin") {
    redirect("/")
  }

  const result = await getAllLessons()
  const lessons = result.success ? result.data : []

  const publishedCount = lessons.filter((l: any) => l.isPublished).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Lecciones</h1>
          <p className="text-muted-foreground mt-1">
            {lessons.length} lecciones • {publishedCount} publicadas
          </p>
        </div>
        <Button>
          <BookOpen className="h-4 w-4 mr-2" />
          Nueva Lección
        </Button>
      </div>

      {/* Lessons by Level */}
      {Object.entries(ENGLISH_LEVELS).map(([levelKey, levelName]) => {
        const levelLessons = lessons.filter((l: any) => l.level === levelKey)

        if (levelLessons.length === 0) return null

        return (
          <div key={levelKey} className="space-y-3">
            <h2 className="text-xl font-semibold">{levelName}</h2>
            <div className="grid gap-3">
              {levelLessons.map((lesson: any) => (
                <Card key={lesson._id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-muted-foreground">
                            Lección {lesson.lessonNumber}
                          </span>
                          {lesson.isPublished ? (
                            <Badge variant="outline" className="bg-green-100 text-green-800">
                              <Eye className="h-3 w-3 mr-1" />
                              Publicada
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-gray-100 text-gray-800">
                              <EyeOff className="h-3 w-3 mr-1" />
                              Borrador
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-lg">{lesson.title}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {lesson.description}
                        </p>
                      </div>
                      <Button size="sm" variant="outline">
                        Editar
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Gramática</p>
                        <p className="font-medium">{lesson.grammar}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Vocabulario</p>
                        <p className="font-medium">{lesson.vocabulary}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Duración</p>
                        <p className="font-medium">{lesson.estimatedDuration} min</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Secciones</p>
                        <p className="font-medium">
                          {lesson.content?.sections?.length || 0}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )
      })}

      {lessons.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No hay lecciones creadas</p>
            <p className="text-sm text-muted-foreground mb-4">
              Ejecuta el script de seed para crear las lecciones iniciales
            </p>
            <code className="text-xs bg-muted px-3 py-1 rounded">
              npx tsx scripts/seed-english-lessons.ts
            </code>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
