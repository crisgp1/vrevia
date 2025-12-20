import { redirect } from "next/navigation"
import { getEnglishStudent } from "@/lib/auth/english"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Clock, TrendingUp, Award } from "lucide-react"
import Link from "next/link"
import { SubscriptionGuard } from "@/components/ingles/subscription-guard"

export default async function InglesPage() {
  const student = await getEnglishStudent()

  if (!student) {
    redirect("/")
  }

  const completedCount = student.completedLessons.length
  const progressPercentage = Math.round((completedCount / 150) * 100)

  return (
    <SubscriptionGuard>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">¡Bienvenido, {student.name}!</h1>
          <p className="text-muted-foreground mt-1">
            Continúa tu aprendizaje de inglés profesional
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Lecciones Completadas
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedCount}/150</div>
              <p className="text-xs text-muted-foreground">
                {progressPercentage}% del curso
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Lección Actual
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{student.currentLesson}</div>
              <p className="text-xs text-muted-foreground">
                Nivel {student.currentLevel.toUpperCase()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Nivel Actual
              </CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{student.currentLevel.toUpperCase()}</div>
              <p className="text-xs text-muted-foreground">
                Avanzando bien
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Estado
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {student.hasActiveSubscription ? "Activo" : "Inactivo"}
              </div>
              <p className="text-xs text-muted-foreground">
                {student.hasActiveSubscription ? "Suscripción vigente" : "Renovar suscripción"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Progress Bar */}
        <Card>
          <CardHeader>
            <CardTitle>Tu Progreso General</CardTitle>
            <CardDescription>
              Has completado {completedCount} de 150 lecciones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full bg-secondary rounded-full h-4">
              <div
                className="bg-primary h-4 rounded-full transition-all"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Continuar Aprendiendo</CardTitle>
              <CardDescription>
                Retoma donde lo dejaste
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href={`/ingles/leccion/${student.currentLesson}`}>
                  Ir a Lección {student.currentLesson}
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Explorar Lecciones</CardTitle>
              <CardDescription>
                Ver todas las lecciones disponibles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/ingles/lecciones">
                  Ver Todas las Lecciones
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </SubscriptionGuard>
  )
}
