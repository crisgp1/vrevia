import { redirect } from "next/navigation"
import { requireActiveSubscription } from "@/lib/auth/english"
import { getLessonWithProgress, markLessonComplete } from "@/lib/actions/english-lessons"
import { getExercisesByLesson } from "@/lib/actions/english-exercises"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { CheckCircle2, BookOpen, Clock, ArrowLeft, Trophy, Target, BookCheck, PlayCircle } from "lucide-react"
import Link from "next/link"
import { LEVELS as ENGLISH_LEVELS } from "@/lib/constants"
import { LessonContentClient } from "@/components/ingles/lesson-content-client"

async function handleComplete(lessonNumber: number) {
  "use server"
  await markLessonComplete({ lessonNumber })
}

export default async function LeccionPage({
  params,
}: {
  params: Promise<{ number: string }>
}) {
  const { number } = await params
  const lessonNumber = parseInt(number)

  const student = await requireActiveSubscription()

  if (!student) {
    redirect("/")
  }

  // Verificar que la lección no esté bloqueada
  if (lessonNumber > student.currentLesson) {
    redirect("/ingles/lecciones")
  }

  const result = await getLessonWithProgress(lessonNumber)

  if (!result.success || !result.data) {
    redirect("/ingles/lecciones")
  }

  const { lesson, progress } = result.data

  const isCompleted = progress.status === "completed"
  const levelName = ENGLISH_LEVELS[lesson.level as keyof typeof ENGLISH_LEVELS]

  // Get exercises for this lesson
  const exercisesResult = await getExercisesByLesson(lesson._id.toString())
  const exercises = exercisesResult.success ? exercisesResult.data : []

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between px-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/ingles/lecciones/${lesson.level}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {levelName}
            </Link>
          </Button>

          <div className="flex items-center gap-3">
            <Badge variant="secondary">Lección {lesson.lessonNumber}</Badge>
            {isCompleted && (
              <Badge className="bg-green-500 hover:bg-green-600">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Completada
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[1fr_320px] gap-8 max-w-[1400px] mx-auto">
          {/* Left: Main Content */}
          <div className="space-y-6">
            {/* Lesson Header */}
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-xl p-8">
              <h1 className="text-3xl font-bold mb-3">{lesson.title}</h1>
              <p className="text-lg text-muted-foreground mb-6">{lesson.description}</p>

              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <BookOpen className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Gramática</p>
                    <p className="text-muted-foreground">{lesson.grammar}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <Target className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium">Vocabulario</p>
                    <p className="text-muted-foreground">{lesson.vocabulary}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="p-2 bg-orange-500/10 rounded-lg">
                    <Clock className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium">Duración</p>
                    <p className="text-muted-foreground">{lesson.estimatedDuration} min</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Lesson Content */}
            <LessonContentClient
              lesson={lesson}
              progress={progress}
              isCompleted={isCompleted}
              lessonNumber={lessonNumber}
            />

            {/* Exercises Section */}
            {exercises.length > 0 && (
              <div className="mt-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <BookCheck className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Ejercicios de Práctica</h2>
                    <p className="text-muted-foreground">
                      Pon a prueba lo que has aprendido
                    </p>
                  </div>
                </div>

                <div className="grid gap-4">
                  {exercises.map((exercise: any, index: number) => (
                    <Card key={exercise._id} className="p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-lg font-bold text-primary">{index + 1}</span>
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div>
                              <h3 className="font-semibold text-lg mb-1">{exercise.title}</h3>
                              <div className="flex flex-wrap gap-2">
                                <Badge variant="outline">
                                  {exercise.questions.length} pregunta{exercise.questions.length > 1 ? 's' : ''}
                                </Badge>
                                <Badge variant="outline">
                                  Aprobación: {exercise.passingScore}%
                                </Badge>
                                {exercise.isRequired && (
                                  <Badge variant="secondary">Requerido</Badge>
                                )}
                              </div>
                            </div>

                            {exercise.passed && (
                              <Badge className="bg-green-500 hover:bg-green-600 flex-shrink-0">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Aprobado
                              </Badge>
                            )}
                          </div>

                          {exercise.bestScore !== undefined && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                              <Trophy className="h-4 w-4 text-yellow-500" />
                              <span>Mejor puntuación: <strong>{exercise.bestScore.toFixed(1)}%</strong></span>
                              <span className="text-xs">•</span>
                              <span>Intentos: {exercise.attempts}</span>
                            </div>
                          )}

                          <Button asChild className="gap-2">
                            <Link href={`/ingles/ejercicio/${exercise._id}`}>
                              <PlayCircle className="h-4 w-4" />
                              {exercise.attempts > 0 ? "Ver resultados / Reintentar" : "Comenzar ejercicio"}
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Sidebar */}
          <div className="space-y-6">
            {/* Progress Card */}
            <div className="sticky top-20 space-y-6">
              <div className="bg-card border rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  <h3 className="font-semibold">Tu Progreso</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Avance</span>
                      <span className="font-semibold">{progress.progress}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-primary to-primary/80 h-full rounded-full transition-all duration-500"
                        style={{ width: `${progress.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm pt-4 border-t">
                    <span className="text-muted-foreground">Estado</span>
                    <Badge variant={isCompleted ? "default" : "secondary"}>
                      {isCompleted ? "Completada" : progress.status === "in-progress" ? "En Progreso" : "No Iniciada"}
                    </Badge>
                  </div>

                  {progress.timeSpent > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Tiempo</span>
                      <span className="font-medium">{Math.round(progress.timeSpent)} min</span>
                    </div>
                  )}
                </div>

                {!isCompleted && (
                  <form action={handleComplete.bind(null, lessonNumber)} className="mt-6">
                    <Button type="submit" className="w-full" size="lg">
                      <CheckCircle2 className="h-5 w-5 mr-2" />
                      Marcar Completada
                    </Button>
                  </form>
                )}
              </div>

              {/* Resources Card */}
              {lesson.resources && lesson.resources.length > 0 && (
                <div className="bg-card border rounded-xl p-6 shadow-sm">
                  <h3 className="font-semibold mb-4">Recursos</h3>
                  <div className="space-y-2">
                    {lesson.resources.map((resource: any, index: number) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="w-full justify-start"
                        asChild
                      >
                        <a href={resource.url} target="_blank" rel="noopener noreferrer">
                          <BookOpen className="h-4 w-4 mr-2" />
                          {resource.title}
                        </a>
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
