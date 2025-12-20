import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { getEnglishStudents } from "@/lib/actions/english-students"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Mail, Phone } from "lucide-react"
import { LEVELS as ENGLISH_LEVELS } from "@/lib/constants"
import { EnglishStudentForm } from "@/components/dashboard/ingles/english-student-form"

export default async function EstudiantesInglesPage() {
  const user = await getCurrentUser()

  if (!user || user.role !== "admin") {
    redirect("/")
  }

  const result = await getEnglishStudents()
  const students = result.success ? result.data : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Estudiantes del Módulo</h1>
          <p className="text-muted-foreground mt-1">
            {students.length} estudiantes registrados
          </p>
        </div>
        <EnglishStudentForm />
      </div>

      {/* Students List */}
      {students.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center space-y-4">
              <p className="text-lg font-medium">No hay estudiantes registrados</p>
              <p className="text-sm text-muted-foreground">
                Comienza agregando tu primer estudiante al módulo
              </p>
              <EnglishStudentForm />
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {students.map((student: any) => {
            const hasActiveSubscription = student.subscription?.status === "active" &&
              new Date(student.subscription.endDate) > new Date()

            return (
              <Card key={student._id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle>{student.name}</CardTitle>
                        {student.isActive ? (
                          <Badge variant="outline" className="bg-green-100 text-green-800">
                            Activo
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-100 text-gray-800">
                            Inactivo
                          </Badge>
                        )}
                        {hasActiveSubscription && (
                          <Badge variant="outline" className="bg-blue-100 text-blue-800">
                            Suscrito
                          </Badge>
                        )}
                      </div>
                      <CardDescription>
                        <div className="flex flex-col gap-1 mt-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3 w-3" />
                            {student.email}
                          </div>
                          {student.phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-3 w-3" />
                              {student.phone}
                            </div>
                          )}
                        </div>
                      </CardDescription>
                    </div>
                    <Button asChild size="sm">
                      <Link href={`/dashboard/ingles/estudiantes/${student._id}`}>
                        Ver Detalles
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Nivel Actual</p>
                      <p className="font-medium">
                        {ENGLISH_LEVELS[student.currentLevel as keyof typeof ENGLISH_LEVELS]}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Lección Actual</p>
                      <p className="font-medium">{student.currentLesson}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Lecciones Completadas</p>
                      <p className="font-medium">{student.completedLessons?.length || 0}/150</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Fecha de Inicio</p>
                      <p className="font-medium">
                        {new Date(student.startDate).toLocaleDateString("es-MX")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
