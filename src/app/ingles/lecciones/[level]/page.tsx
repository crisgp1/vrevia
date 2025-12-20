import { redirect } from "next/navigation"
import { requireActiveSubscription } from "@/lib/auth/english"
import { getLessonsByLevel } from "@/lib/actions/english-lessons"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Lock, CheckCircle2, Circle } from "lucide-react"
import Link from "next/link"
import { LEVELS as ENGLISH_LEVELS } from "@/lib/constants"

export default async function LevelLessonsPage({
  params,
}: {
  params: Promise<{ level: string }>
}) {
  const { level } = await params
  const student = await requireActiveSubscription()

  if (!student) {
    redirect("/")
  }

  const result = await getLessonsByLevel(level)
  const lessons = result.success ? result.data : []

  const levelName = ENGLISH_LEVELS[level as keyof typeof ENGLISH_LEVELS] || level.toUpperCase()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">{levelName}</h1>
        <p className="text-muted-foreground mt-1">
          {lessons.length} lecciones disponibles en este nivel
        </p>
      </div>

      {/* Lessons List */}
      <div className="space-y-3">
        {lessons.map((lesson: any) => {
          const isCompleted = lesson.progress?.status === "completed"
          const isInProgress = lesson.progress?.status === "in-progress"
          const isLocked = lesson.lessonNumber > student.currentLesson
          const canAccess = !isLocked

          return (
            <Card key={lesson._id} className={isCompleted ? "bg-green-50/50" : ""}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-muted-foreground">
                        Lección {lesson.lessonNumber}
                      </span>
                      {isCompleted && (
                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Completada
                        </Badge>
                      )}
                      {isInProgress && !isCompleted && (
                        <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                          <Circle className="h-3 w-3 mr-1" />
                          En Progreso
                        </Badge>
                      )}
                      {isLocked && (
                        <Badge variant="outline" className="bg-gray-100 text-gray-800">
                          <Lock className="h-3 w-3 mr-1" />
                          Bloqueada
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg">{lesson.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {lesson.description}
                    </p>
                    <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        <span>Gramática: {lesson.grammar}</span>
                      </div>
                      <div>
                        <span>Vocabulario: {lesson.vocabulary}</span>
                      </div>
                    </div>
                    {lesson.progress && lesson.progress.progress > 0 && lesson.progress.progress < 100 && (
                      <div className="mt-3">
                        <div className="w-full bg-secondary rounded-full h-1.5">
                          <div
                            className="bg-blue-600 h-1.5 rounded-full transition-all"
                            style={{ width: `${lesson.progress.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  {canAccess ? (
                    <Button asChild>
                      <Link href={`/ingles/leccion/${lesson.lessonNumber}`}>
                        {isCompleted ? "Revisar" : isInProgress ? "Continuar" : "Comenzar"}
                      </Link>
                    </Button>
                  ) : (
                    <Button disabled>
                      <Lock className="h-4 w-4 mr-2" />
                      Bloqueada
                    </Button>
                  )}
                </div>
              </CardHeader>
            </Card>
          )
        })}
      </div>

      {lessons.length === 0 && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">
              No hay lecciones disponibles para este nivel
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
