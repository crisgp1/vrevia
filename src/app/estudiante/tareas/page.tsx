export const dynamic = 'force-dynamic'

import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { getAssignmentsForStudent } from "@/lib/actions/assignments"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatShortDate } from "@/lib/utils"
import { ClipboardList, Calendar, Download, FileText, CheckCircle } from "lucide-react"
import { SubmitForm } from "@/components/estudiante/submit-form"

export default async function EstudianteTareasPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/")
  }

  if (user.role !== "student") {
    redirect("/dashboard")
  }

  const assignments = await getAssignmentsForStudent(user.id, user.level, user.group)

  const pending = assignments.filter((a) => !a.submission)
  const submitted = assignments.filter(
    (a) => a.submission && a.submission.grade === null
  )
  const graded = assignments.filter(
    (a) => a.submission && a.submission.grade !== null
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mis tareas</h1>
        <p className="text-muted-foreground">
          Revisa y entrega tus tareas
        </p>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pendientes ({pending.length})</TabsTrigger>
          <TabsTrigger value="submitted">Entregadas ({submitted.length})</TabsTrigger>
          <TabsTrigger value="graded">Calificadas ({graded.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          {pending.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="mx-auto h-12 w-12 text-green-600 mb-4" />
                <p className="text-muted-foreground">
                  No tienes tareas pendientes
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pending.map((assignment) => {
                const isPastDue = new Date(assignment.dueDate) < new Date()
                return (
                  <Card key={assignment.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-orange-100 rounded-lg">
                            <ClipboardList className="h-5 w-5 text-orange-600" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">
                              {assignment.title}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-1">
                              <Calendar className="h-3 w-3" />
                              Fecha límite: {formatShortDate(assignment.dueDate)}
                              {isPastDue && (
                                <Badge variant="destructive" className="ml-2">
                                  Vencida
                                </Badge>
                              )}
                            </CardDescription>
                          </div>
                        </div>
                        <SubmitForm assignmentId={assignment.id} studentId={user.id} />
                      </div>
                    </CardHeader>
                    {(assignment.description || assignment.attachmentUrl) && (
                      <CardContent>
                        {assignment.description && (
                          <p className="text-sm text-muted-foreground mb-3">
                            {assignment.description}
                          </p>
                        )}
                        {assignment.attachmentUrl && (
                          <Button variant="outline" size="sm" asChild>
                            <a
                              href={assignment.attachmentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Download className="mr-2 h-4 w-4" />
                              {assignment.attachmentName || "Ver adjunto"}
                            </a>
                          </Button>
                        )}
                      </CardContent>
                    )}
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="submitted">
          {submitted.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No tienes tareas entregadas pendientes de calificación
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {submitted.map((assignment) => (
                <Card key={assignment.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <ClipboardList className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            {assignment.title}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            Entregada: {formatShortDate(assignment.submission!.submittedAt)}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant="secondary">En revisión</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={assignment.submission!.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Ver mi entrega
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="graded">
          {graded.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Aún no tienes tareas calificadas
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {graded.map((assignment) => (
                <Card key={assignment.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <ClipboardList className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            {assignment.title}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            Calificada: {formatShortDate(assignment.submission!.gradedAt!)}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge
                        className={
                          assignment.submission!.grade! >= 70
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }
                      >
                        {assignment.submission!.grade}/100
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {assignment.submission!.feedback && (
                      <div className="p-3 bg-muted rounded-lg mb-3">
                        <p className="text-sm font-medium mb-1">
                          Retroalimentación:
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {assignment.submission!.feedback}
                        </p>
                      </div>
                    )}
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={assignment.submission!.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Ver mi entrega
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
