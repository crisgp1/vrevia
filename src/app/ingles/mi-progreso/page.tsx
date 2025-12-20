import { redirect } from "next/navigation"
import { requireActiveSubscription } from "@/lib/auth/english"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LEVELS as ENGLISH_LEVELS, LEVEL_DETAILS } from "@/lib/constants"
import { BookOpen, Clock, Award, TrendingUp } from "lucide-react"
import connectDB from "@/lib/db/connection"
import { EnglishProgress } from "@/lib/db/models"

export default async function MiProgresoPage() {
  const student = await requireActiveSubscription()

  if (!student) {
    redirect("/")
  }

  await connectDB()

  // Obtener progreso total
  const allProgress = await EnglishProgress.find({ student: student.id }).lean()

  const completedLessons = allProgress.filter((p) => p.status === "completed").length
  const inProgressLessons = allProgress.filter((p) => p.status === "in-progress").length
  const totalTimeSpent = allProgress.reduce((sum, p) => sum + (p.timeSpent || 0), 0)
  const totalTimeHours = Math.round(totalTimeSpent / 60)

  // Progreso por nivel
  const progressByLevel = Object.keys(ENGLISH_LEVELS).map((levelKey) => {
    const details = LEVEL_DETAILS[levelKey as keyof typeof LEVEL_DETAILS]
    const levelLessons = allProgress.filter((p) => {
      const lessonNum = p.lessonNumber
      if (levelKey === "a1") return lessonNum >= 1 && lessonNum <= 30
      if (levelKey === "a2") return lessonNum >= 31 && lessonNum <= 60
      if (levelKey === "b1") return lessonNum >= 61 && lessonNum <= 90
      if (levelKey === "b2") return lessonNum >= 91 && lessonNum <= 120
      return lessonNum >= 121 && lessonNum <= 150
    })

    const completed = levelLessons.filter((p) => p.status === "completed").length
    const percentage = Math.round((completed / details.totalClasses) * 100)

    return {
      level: levelKey,
      name: details.name,
      completed,
      total: details.totalClasses,
      percentage,
    }
  })

  const overallPercentage = Math.round((completedLessons / 150) * 100)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Mi Progreso</h1>
        <p className="text-muted-foreground mt-1">
          Seguimiento detallado de tu aprendizaje
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completadas
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedLessons}</div>
            <p className="text-xs text-muted-foreground">
              de 150 lecciones
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              En Progreso
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressLessons}</div>
            <p className="text-xs text-muted-foreground">
              lecciones iniciadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tiempo Total
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTimeHours}h</div>
            <p className="text-xs text-muted-foreground">
              de estudio
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Progreso General
            </CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallPercentage}%</div>
            <p className="text-xs text-muted-foreground">
              del curso total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Progreso General del Curso</CardTitle>
          <CardDescription>
            {completedLessons} de 150 lecciones completadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full bg-secondary rounded-full h-4">
            <div
              className="bg-primary h-4 rounded-full transition-all"
              style={{ width: `${overallPercentage}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Progress by Level */}
      <Card>
        <CardHeader>
          <CardTitle>Progreso por Nivel</CardTitle>
          <CardDescription>
            Desglose de tu avance en cada nivel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {progressByLevel.map((level) => (
              <div key={level.level}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium">{level.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {level.completed} de {level.total} lecciones
                    </p>
                  </div>
                  <span className="text-sm font-medium">{level.percentage}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${level.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
