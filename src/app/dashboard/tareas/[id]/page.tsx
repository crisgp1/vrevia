export const dynamic = 'force-dynamic'

import { notFound } from "next/navigation"
import Link from "next/link"
import { getAssignmentById } from "@/lib/actions/assignments"
import { formatShortDate, formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, FileText, AlertCircle } from "lucide-react"
import { GradeForm } from "@/components/dashboard/grade-form"

interface AssignmentDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function AssignmentDetailPage({
  params,
}: AssignmentDetailPageProps) {
  const { id } = await params
  const assignment = await getAssignmentById(id)

  if (!assignment) {
    notFound()
  }

  const isPastDue = new Date(assignment.dueDate) < new Date()
  const studentsWithSubmission = assignment.students.filter(s => s.submission)
  const studentsWithoutSubmission = assignment.students.filter(s => !s.submission)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/tareas">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {assignment.title}
          </h1>
          <p className="text-muted-foreground">
            Fecha límite: {formatDate(assignment.dueDate)}
            {isPastDue && (
              <Badge variant="destructive" className="ml-2">
                Vencida
              </Badge>
            )}
          </p>
        </div>
      </div>

      {assignment.description && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Instrucciones</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{assignment.description}</p>
            {assignment.attachmentUrl && (
              <Button variant="outline" className="mt-4" asChild>
                <a
                  href={assignment.attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Download className="mr-2 h-4 w-4" />
                  {assignment.attachmentName || "Descargar adjunto"}
                </a>
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Students with submissions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          Entregas ({studentsWithSubmission.length}/{assignment.students.length})
        </h2>

        {studentsWithSubmission.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">
                Aún no hay entregas para esta tarea
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {studentsWithSubmission.map((student) => (
              <Card key={student.studentId}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">
                        {student.studentName}
                      </CardTitle>
                      <CardDescription>{student.studentEmail}</CardDescription>
                    </div>
                    <Badge
                      variant={student.submission?.grade !== null && student.submission?.grade !== undefined ? "default" : "secondary"}
                    >
                      {student.submission?.grade !== null && student.submission?.grade !== undefined
                        ? `${student.submission.grade}/100`
                        : "Sin calificar"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {student.submission?.fileUrl && (
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={student.submission.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <FileText className="mr-2 h-4 w-4" />
                            {student.submission.fileName}
                          </a>
                        </Button>
                      )}
                      <span className="text-xs text-muted-foreground">
                        Entregado: {formatShortDate(student.submission!.submittedAt)}
                      </span>
                    </div>
                    <GradeForm
                      submissionId={student.submission!.id}
                      currentGrade={student.submission!.grade}
                      currentFeedback={student.submission!.feedback}
                    />
                  </div>
                  {student.submission?.feedback && (
                    <div className="mt-3 p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium">Retroalimentación:</p>
                      <p className="text-sm text-muted-foreground">
                        {student.submission.feedback}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Students without submissions */}
      {studentsWithoutSubmission.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            Sin entrega ({studentsWithoutSubmission.length})
          </h2>

          <div className="space-y-4">
            {studentsWithoutSubmission.map((student) => (
              <Card key={student.studentId} className="border-orange-200 bg-orange-50/50">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">
                        {student.studentName}
                      </CardTitle>
                      <CardDescription>{student.studentEmail}</CardDescription>
                    </div>
                    <Badge variant="outline" className="text-orange-600 border-orange-300">
                      Sin entrega
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Este alumno no ha entregado la tarea
                    </p>
                    <GradeForm
                      assignmentId={assignment.id}
                      studentId={student.studentId}
                      studentName={student.studentName}
                      currentGrade={null}
                      currentFeedback=""
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
