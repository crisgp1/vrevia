export const dynamic = 'force-dynamic'

import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { getAssignmentsForStudent } from "@/lib/actions/assignments"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatShortDate } from "@/lib/utils"
import { Award, TrendingUp, Star } from "lucide-react"

export default async function EstudianteCalificacionesPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/")
  }

  if (user.role !== "student") {
    redirect("/dashboard")
  }

  const assignments = await getAssignmentsForStudent(user.id, user.level, user.group)

  const graded = assignments.filter(
    (a) => a.submission && a.submission.grade !== null
  )

  const average =
    graded.length > 0
      ? Math.round(
          graded.reduce((sum, a) => sum + (a.submission?.grade || 0), 0) /
            graded.length
        )
      : null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Calificaciones</h1>
        <p className="text-muted-foreground">
          Historial de tus calificaciones
        </p>
      </div>

      {/* Average */}
      <Card className="bg-gradient-to-r from-secondary to-secondary/80 text-secondary-foreground">
        <CardContent className="flex items-center justify-between py-6">
          <div>
            <p className="text-sm opacity-90">Promedio general</p>
            <p className="text-4xl font-bold">
              {average !== null ? `${average}/100` : "Sin datos"}
            </p>
          </div>
          <TrendingUp className="h-12 w-12 opacity-80" />
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tareas calificadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{graded.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Mejor calificación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {graded.length > 0
                ? Math.max(...graded.map((a) => a.submission?.grade || 0))
                : "-"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Aprobadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {graded.filter((a) => (a.submission?.grade || 0) >= 70).length}/
              {graded.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* History */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de calificaciones</CardTitle>
          <CardDescription>Todas tus tareas calificadas</CardDescription>
        </CardHeader>
        <CardContent>
          {graded.length === 0 ? (
            <div className="text-center py-8">
              <Award className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Aún no tienes calificaciones
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tarea</TableHead>
                    <TableHead>Fecha de entrega</TableHead>
                    <TableHead>Calificación</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {graded.map((assignment) => {
                    const isExtraordinary = assignment.submission?.isExtraordinary
                    const originalGrade = assignment.submission?.originalGrade
                    const currentGrade = assignment.submission!.grade!

                    return (
                      <>
                        {/* Show original grade as cancelled if extraordinary */}
                        {isExtraordinary && originalGrade !== undefined && originalGrade !== null && (
                          <TableRow key={`${assignment.id}-original`} className="bg-red-50/50">
                            <TableCell className="font-medium text-muted-foreground">
                              {assignment.title}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {formatShortDate(assignment.submission!.submittedAt)}
                            </TableCell>
                            <TableCell>
                              <span className="text-muted-foreground line-through">
                                {originalGrade}/100
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-red-100 text-red-600 border-red-200">
                                Anulada
                              </Badge>
                            </TableCell>
                          </TableRow>
                        )}
                        {/* Current/Extraordinary grade */}
                        <TableRow key={assignment.id} className={isExtraordinary ? "bg-amber-50/50" : ""}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {assignment.title}
                              {isExtraordinary && (
                                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {formatShortDate(assignment.submission!.submittedAt)}
                          </TableCell>
                          <TableCell>
                            <span
                              className={
                                currentGrade >= 70
                                  ? "text-green-600 font-semibold"
                                  : "text-red-600 font-semibold"
                              }
                            >
                              {currentGrade}/100
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={currentGrade >= 70 ? "default" : "destructive"}
                                className={
                                  currentGrade >= 70
                                    ? "bg-green-100 text-green-800 hover:bg-green-100"
                                    : ""
                                }
                              >
                                {currentGrade >= 70 ? "Aprobada" : "Reprobada"}
                              </Badge>
                              {isExtraordinary && (
                                <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200">
                                  Extraordinaria
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      </>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
