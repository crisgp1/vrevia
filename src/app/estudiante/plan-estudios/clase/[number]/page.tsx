export const dynamic = 'force-dynamic'

import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { getCurrentUser } from "@/lib/auth"
import { getMaterialsForLesson } from "@/lib/actions/materials"
import { getStudentAttendance } from "@/lib/actions/attendance"
import { getAssignmentsForLesson } from "@/lib/actions/assignments"
import { getStudentGrades } from "@/lib/actions/grades"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LEVELS, getLesson, getLevelFromLesson } from "@/lib/constants"
import { formatShortDate } from "@/lib/utils"
import { ArrowLeft, CheckCircle2, XCircle, FileText, Download, BookOpen, ClipboardList, Calendar, Clock, AlertCircle, TrendingUp } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface PageProps {
  params: Promise<{ number: string }>
}

export default async function ClassDetailPage({ params }: PageProps) {
  const { number } = await params
  const lessonNumber = parseInt(number)
  const user = await getCurrentUser()

  if (!user) {
    redirect("/")
  }

  if (user.role !== "student") {
    redirect("/dashboard")
  }

  // Validate lesson number
  if (isNaN(lessonNumber) || lessonNumber < 1 || lessonNumber > 150) {
    notFound()
  }

  // Check if lesson is accessible (not future)
  if (lessonNumber > user.currentLesson) {
    redirect("/estudiante/plan-estudios")
  }

  const lessonData = getLesson(lessonNumber)
  if (!lessonData) {
    notFound()
  }

  const level = getLevelFromLesson(lessonNumber)
  const levelName = LEVELS[level as keyof typeof LEVELS]

  // Get materials, attendance, assignments and grades
  const [materials, attendanceRecords, assignments, allGrades] = await Promise.all([
    getMaterialsForLesson(lessonNumber, user.id, user.group),
    getStudentAttendance(user.id),
    getAssignmentsForLesson(lessonNumber, user.id, user.group),
    getStudentGrades(user.id),
  ])

  const attendance = attendanceRecords.find((a) => a.lesson === lessonNumber)
  const classGrade = allGrades.find((g) => g.lesson === lessonNumber && g.type === "class")
  const isCurrentLesson = lessonNumber === user.currentLesson
  const isCompleted = lessonNumber < user.currentLesson

  // Determine if student failed (below 70)
  const PASSING_GRADE = 70
  const isFailing = classGrade && classGrade.score < PASSING_GRADE
  const isPassing = classGrade && classGrade.score >= PASSING_GRADE

  const levelColors: Record<string, string> = {
    a1: "bg-emerald-500",
    a2: "bg-blue-500",
    b1: "bg-violet-500",
    b2: "bg-orange-500",
    b2plus: "bg-rose-500",
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/estudiante/plan-estudios/${level}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">Clase {lessonNumber}</h1>
            {isCurrentLesson && (
              <Badge variant="default">Actual</Badge>
            )}
            {isCompleted && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Completada
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">{levelName}</p>
        </div>
      </div>

      {/* Class Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content - 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Lesson Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Contenido de la clase
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Gramática</h4>
                <p className="font-medium">{lessonData.grammar}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Vocabulario</h4>
                <p className="font-medium">{lessonData.vocabulary}</p>
              </div>
            </CardContent>
          </Card>

          {/* Materials */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Materiales
              </CardTitle>
              <CardDescription>
                Archivos y recursos para esta clase
              </CardDescription>
            </CardHeader>
            <CardContent>
              {materials.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed rounded-lg">
                  <FileText className="mx-auto h-10 w-10 text-muted-foreground/50" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    No hay materiales para esta clase
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {materials.map((material) => (
                    <div
                      key={material.id}
                      className="flex items-center justify-between p-4 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{material.title}</p>
                          {material.description && (
                            <p className="text-sm text-muted-foreground">
                              {material.description}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {material.fileName}
                          </p>
                        </div>
                      </div>
                      <a href={material.fileUrl} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="outline">
                          <Download className="mr-2 h-4 w-4" />
                          Descargar
                        </Button>
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Assignments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                Tareas
              </CardTitle>
              <CardDescription>
                Tareas asignadas para esta clase
              </CardDescription>
            </CardHeader>
            <CardContent>
              {assignments.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed rounded-lg">
                  <ClipboardList className="mx-auto h-10 w-10 text-muted-foreground/50" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    No hay tareas para esta clase
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {assignments.map((assignment) => {
                    const isPastDue = new Date(assignment.dueDate) < new Date()
                    const isSubmitted = !!assignment.submission
                    const isGraded = assignment.submission?.grade !== null && assignment.submission?.grade !== undefined

                    return (
                      <div
                        key={assignment.id}
                        className="p-4 rounded-lg border"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium">{assignment.title}</p>
                              {isGraded && (
                                <Badge className="bg-green-100 text-green-800">
                                  {assignment.submission?.grade}/100
                                </Badge>
                              )}
                              {isSubmitted && !isGraded && (
                                <Badge variant="secondary">Entregada</Badge>
                              )}
                              {!isSubmitted && isPastDue && (
                                <Badge variant="destructive">Vencida</Badge>
                              )}
                              {!isSubmitted && !isPastDue && (
                                <Badge variant="outline">Pendiente</Badge>
                              )}
                            </div>
                            {assignment.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {assignment.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Vence: {formatShortDate(assignment.dueDate)}
                              </span>
                              {assignment.submission && (
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  Entregada: {formatShortDate(assignment.submission.submittedAt)}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            {assignment.attachmentUrl && (
                              <a href={assignment.attachmentUrl} target="_blank" rel="noopener noreferrer">
                                <Button size="sm" variant="outline">
                                  <Download className="mr-1 h-3 w-3" />
                                  Ver
                                </Button>
                              </a>
                            )}
                            <Link href="/estudiante/tareas">
                              <Button size="sm" variant={isSubmitted ? "outline" : "default"}>
                                {isSubmitted ? "Ver entrega" : "Entregar"}
                              </Button>
                            </Link>
                          </div>
                        </div>
                        {assignment.submission?.feedback && (
                          <div className="mt-3 p-3 bg-muted rounded-lg">
                            <p className="text-xs font-medium text-muted-foreground">Retroalimentación:</p>
                            <p className="text-sm">{assignment.submission.feedback}</p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - 1 column */}
        <div className="space-y-6">
          {/* Grade Alert - Show if failing */}
          {isFailing && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <p className="font-semibold">Clase reprobada</p>
                <p className="text-sm mt-1">
                  Calificación: <strong>{classGrade.score}/{classGrade.maxScore}</strong>
                  {classGrade.isExtraordinary && (
                    <span className="block text-xs mt-1">
                      (Extraordinario - Original: {classGrade.originalScore})
                    </span>
                  )}
                </p>
                <p className="text-sm mt-2">
                  Tu profesor puede asignarte un examen extraordinario para recuperar esta clase.
                </p>
              </AlertDescription>
            </Alert>
          )}

          {/* Class Grade */}
          {classGrade && (
            <Card className={isFailing ? "border-red-300 dark:border-red-800" : isPassing ? "border-green-300 dark:border-green-800" : ""}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Calificación de Clase
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`p-4 rounded-lg ${isFailing ? "bg-red-50 dark:bg-red-950/20" : "bg-green-50 dark:bg-green-950/20"}`}>
                  {classGrade.isExtraordinary && classGrade.originalScore !== undefined ? (
                    /* Mostrar ambas calificaciones cuando es extraordinario */
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="secondary" className="gap-1">
                          ⭐ Calificación Extraordinaria
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 justify-center flex-wrap">
                        {/* Calificación Original */}
                        <div className="flex items-center gap-2">
                          <XCircle className="h-6 w-6 text-red-500 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-medium text-muted-foreground">Original</p>
                            <p className="text-lg font-bold line-through decoration-2 text-red-600 dark:text-red-400">
                              {classGrade.originalScore}/{classGrade.maxScore}
                            </p>
                          </div>
                        </div>

                        {/* Flecha */}
                        <ArrowLeft className="h-4 w-4 text-muted-foreground rotate-180 mx-1" />

                        {/* Calificación Extraordinaria */}
                        <div className="flex items-center gap-2">
                          {classGrade.score >= PASSING_GRADE ? (
                            <CheckCircle2 className="h-7 w-7 text-green-500 flex-shrink-0" />
                          ) : (
                            <XCircle className="h-7 w-7 text-red-500 flex-shrink-0" />
                          )}
                          <div>
                            <p className="text-xs font-medium text-muted-foreground">Extra</p>
                            <p className={`text-xl font-bold ${classGrade.score >= PASSING_GRADE ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}>
                              {classGrade.score}/{classGrade.maxScore}
                            </p>
                            <p className={`text-xs font-medium ${classGrade.score >= PASSING_GRADE ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}>
                              {classGrade.score >= PASSING_GRADE ? "Aprobado" : "Reprobado"}
                            </p>
                          </div>
                        </div>
                      </div>
                      {classGrade.originalGradedBy && (
                        <p className="text-xs text-muted-foreground mt-3">
                          Profesor original: {classGrade.originalGradedBy}
                        </p>
                      )}
                    </div>
                  ) : (
                    /* Calificación normal (no extraordinaria) */
                    <div className="flex items-center gap-3">
                      {isFailing ? (
                        <XCircle className="h-10 w-10 text-red-500" />
                      ) : (
                        <CheckCircle2 className="h-10 w-10 text-green-500" />
                      )}
                      <div className="flex-1">
                        <p className="text-3xl font-bold">
                          {classGrade.score}
                          <span className="text-lg text-muted-foreground">/{classGrade.maxScore}</span>
                        </p>
                        <p className={`text-sm font-medium ${isFailing ? "text-red-700 dark:text-red-400" : "text-green-700 dark:text-green-400"}`}>
                          {isFailing ? "Reprobado" : "Aprobado"}
                        </p>
                      </div>
                    </div>
                  )}

                  {classGrade.notes && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Notas del profesor:</p>
                      <p className="text-sm">{classGrade.notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Attendance Status */}
          <Card>
            <CardHeader>
              <CardTitle>Asistencia</CardTitle>
            </CardHeader>
            <CardContent>
              {attendance ? (
                <div className={`flex items-center gap-3 p-4 rounded-lg ${attendance.attended ? "bg-green-50" : "bg-red-50"}`}>
                  {attendance.attended ? (
                    <>
                      <CheckCircle2 className="h-8 w-8 text-green-500" />
                      <div>
                        <p className="font-medium text-green-800">Asististe</p>
                        <p className="text-sm text-green-600">
                          {new Date(attendance.date).toLocaleDateString("es-MX")}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-8 w-8 text-red-500" />
                      <div>
                        <p className="font-medium text-red-800">Falta</p>
                        <p className="text-sm text-red-600">
                          {new Date(attendance.date).toLocaleDateString("es-MX")}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-muted-foreground">?</span>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Pendiente</p>
                    <p className="text-sm text-muted-foreground">
                      Asistencia no registrada
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Navigation */}
          <Card>
            <CardHeader>
              <CardTitle>Navegación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {lessonNumber > 1 && (
                <Link href={`/estudiante/plan-estudios/clase/${lessonNumber - 1}`} className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Clase {lessonNumber - 1}
                  </Button>
                </Link>
              )}
              {lessonNumber < user.currentLesson && (
                <Link href={`/estudiante/plan-estudios/clase/${lessonNumber + 1}`} className="block">
                  <Button variant="outline" className="w-full justify-start">
                    Clase {lessonNumber + 1}
                    <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                  </Button>
                </Link>
              )}
              <Link href={`/estudiante/plan-estudios/${level}`} className="block">
                <Button variant="ghost" className="w-full justify-start">
                  Ver todas las clases de {levelName}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
