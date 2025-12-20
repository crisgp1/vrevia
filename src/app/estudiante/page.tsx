export const dynamic = 'force-dynamic'

import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { getMaterialsForStudent } from "@/lib/actions/materials"
import { getAssignmentsForStudent } from "@/lib/actions/assignments"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { LEVELS, CURRICULUM, getLevelFromLesson, LEVEL_DETAILS } from "@/lib/constants"
import { formatShortDate } from "@/lib/utils"
import { BookOpen, ClipboardList, Award, GraduationCap, ChevronRight } from "lucide-react"
import Link from "next/link"

export default async function EstudiantePage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/")
  }

  if (user.role !== "student") {
    redirect("/dashboard")
  }

  const [materials, assignments] = await Promise.all([
    getMaterialsForStudent(user.id, user.currentLesson, user.group),
    getAssignmentsForStudent(user.id, user.level, user.group),
  ])

  const pendingAssignments = assignments.filter((a) => !a.submission)
  const gradedAssignments = assignments.filter((a) => a.submission?.grade !== null && a.submission?.grade !== undefined)

  // Progress calculations
  const currentLesson = user.currentLesson || 1
  const totalProgress = Math.round((currentLesson / 150) * 100)
  const currentLevelKey = getLevelFromLesson(currentLesson)
  const currentLessonData = CURRICULUM[currentLesson - 1]
  const levelDetails = LEVEL_DETAILS[currentLevelKey]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Hola, {user.name?.split(" ")[0]}
        </h1>
        <p className="text-muted-foreground">
          Bienvenido a tu panel de estudiante
        </p>
      </div>

      {/* Progress Card */}
      <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <CardContent className="py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm opacity-90">Tu progreso</p>
              <p className="text-3xl font-bold">{currentLesson}/150</p>
              <p className="text-sm opacity-75">clases completadas</p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90">Nivel actual</p>
              <p className="text-xl font-bold">
                {user.level ? LEVELS[user.level as keyof typeof LEVELS] : "Sin asignar"}
              </p>
            </div>
          </div>
          <Progress value={totalProgress} className="h-3 bg-primary-foreground/20" />
          <div className="flex justify-between mt-2 text-xs opacity-75">
            <span>{totalProgress}% completado</span>
            <span>{150 - currentLesson} clases restantes</span>
          </div>
        </CardContent>
      </Card>

      {/* Current Lesson Card */}
      {currentLessonData && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                <CardTitle>Próxima clase</CardTitle>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/estudiante/plan-estudios">
                  Ver plan completo
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
            <CardDescription>{levelDetails.subtitle}</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={`/estudiante/plan-estudios/clase/${currentLesson}`}>
              <div className="p-5 bg-primary/5 rounded-lg border-l-4 border-primary hover:bg-primary/10 transition-all duration-200 hover:shadow-md cursor-pointer group">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="default" className="text-sm py-1">Clase {currentLesson}</Badge>
                  <Badge variant="outline">{LEVELS[currentLevelKey]}</Badge>
                  <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
                <div className="grid md:grid-cols-2 gap-4 mt-3">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Gramática</p>
                    <p className="font-semibold text-foreground">{currentLessonData.grammar}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Vocabulario</p>
                    <p className="font-medium text-muted-foreground">{currentLessonData.vocabulary}</p>
                  </div>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Materiales
            </CardTitle>
            <BookOpen className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{materials.length}</div>
            <p className="text-xs text-muted-foreground">Disponibles</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tareas pendientes
            </CardTitle>
            <ClipboardList className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingAssignments.length}</div>
            <p className="text-xs text-muted-foreground">Por entregar</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Calificaciones
            </CardTitle>
            <Award className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{gradedAssignments.length}</div>
            <p className="text-xs text-muted-foreground">Tareas calificadas</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Access */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Pending Assignments */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tareas pendientes</CardTitle>
            <CardDescription>Entregas próximas</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingAssignments.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">
                No tienes tareas pendientes
              </p>
            ) : (
              <div className="space-y-3">
                {pendingAssignments.slice(0, 3).map((assignment) => (
                  <Link
                    key={assignment.id}
                    href="/estudiante/tareas"
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-all duration-200 hover:shadow-sm border border-transparent hover:border-border"
                  >
                    <div>
                      <p className="text-sm font-semibold">{assignment.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Vence: {formatShortDate(assignment.dueDate)}
                      </p>
                    </div>
                    <Badge variant="outline">Pendiente</Badge>
                  </Link>
                ))}
                {pendingAssignments.length > 3 && (
                  <Link
                    href="/estudiante/tareas"
                    className="block text-sm text-primary hover:underline mt-4"
                  >
                    Ver todas ({pendingAssignments.length})
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Materials */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Materiales recientes</CardTitle>
            <CardDescription>Últimos recursos disponibles</CardDescription>
          </CardHeader>
          <CardContent>
            {materials.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">
                No hay materiales disponibles
              </p>
            ) : (
              <div className="space-y-3">
                {materials.slice(0, 3).map((material) => (
                  <Link
                    key={material.id}
                    href="/estudiante/materiales"
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-all duration-200 hover:shadow-sm border border-transparent hover:border-border"
                  >
                    <div>
                      <p className="text-sm font-semibold">{material.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatShortDate(material.uploadedAt)}
                      </p>
                    </div>
                    <Badge variant="secondary">PDF</Badge>
                  </Link>
                ))}
                {materials.length > 3 && (
                  <Link
                    href="/estudiante/materiales"
                    className="block text-sm text-primary hover:underline mt-4"
                  >
                    Ver todos ({materials.length})
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
