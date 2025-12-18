export const dynamic = 'force-dynamic'

import { redirect } from "next/navigation"
import Link from "next/link"
import { getCurrentUser } from "@/lib/auth"
import { getDashboardStats } from "@/lib/actions/stats"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { formatShortDate } from "@/lib/utils"
import { LEVELS } from "@/lib/constants"
import {
  Users,
  UserCheck,
  UsersRound,
  ClipboardList,
  CreditCard,
  Plus,
  ArrowRight,
  GraduationCap,
  TrendingUp,
} from "lucide-react"

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/")
  }

  if (user.role !== "admin") {
    redirect("/estudiante")
  }

  const stats = await getDashboardStats()

  const levelColors: Record<string, string> = {
    a1: "bg-emerald-500",
    a2: "bg-blue-500",
    b1: "bg-violet-500",
    b2: "bg-orange-500",
    b2plus: "bg-rose-500",
  }

  const totalWithLevel = Object.values(stats.levelDistribution).reduce((a, b) => a + b, 0)

  return (
    <div className="space-y-8">
      {/* Header with Quick Actions */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Hola, {user.name?.split(" ")[0]}
          </h1>
          <p className="text-muted-foreground">
            Aquí tienes un resumen de tu plataforma
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard/alumnos">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo alumno
            </Button>
          </Link>
          <Link href="/dashboard/grupos">
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo grupo
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Alumnos
            </CardTitle>
            <div className="rounded-lg p-2 bg-blue-100">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeStudents} activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Grupos Activos
            </CardTitle>
            <div className="rounded-lg p-2 bg-green-100">
              <UsersRound className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeGroups}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalGroups} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Por Calificar
            </CardTitle>
            <div className="rounded-lg p-2 bg-orange-100">
              <ClipboardList className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingSubmissions}</div>
            <p className="text-xs text-muted-foreground">
              Tareas pendientes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pagos Pendientes
            </CardTitle>
            <div className="rounded-lg p-2 bg-red-100">
              <CreditCard className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingPayments}</div>
            <p className="text-xs text-muted-foreground">
              Por cobrar
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Level Distribution - takes 1 column */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Distribución por nivel
            </CardTitle>
            <CardDescription>
              {totalWithLevel} alumnos con nivel asignado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {totalWithLevel === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground">
                  No hay alumnos con nivel asignado
                </p>
                <Link href="/dashboard/alumnos">
                  <Button variant="link" size="sm">
                    Asignar niveles
                  </Button>
                </Link>
              </div>
            ) : (
              Object.entries(LEVELS).map(([key, label]) => {
                const count = stats.levelDistribution[key] || 0
                const percentage = totalWithLevel > 0 ? (count / totalWithLevel) * 100 : 0
                return (
                  <div key={key} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{label}</span>
                      <span className="text-muted-foreground">{count} alumnos</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full ${levelColors[key]} transition-all`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        {/* Recent Students & Groups - takes 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Groups */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Grupos</CardTitle>
                <CardDescription>Grupos activos recientes</CardDescription>
              </div>
              <Link href="/dashboard/grupos">
                <Button variant="ghost" size="sm">
                  Ver todos
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {stats.recentGroups.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed rounded-lg">
                  <UsersRound className="mx-auto h-10 w-10 text-muted-foreground/50" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    No hay grupos creados
                  </p>
                  <Link href="/dashboard/grupos">
                    <Button variant="link" size="sm" className="mt-2">
                      <Plus className="mr-1 h-4 w-4" />
                      Crear primer grupo
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.recentGroups.map((group) => (
                    <Link
                      key={group.id}
                      href={`/dashboard/grupos/${group.id}`}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-8 rounded-full ${levelColors[group.level]}`} />
                        <div>
                          <p className="font-medium">{group.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {LEVELS[group.level as keyof typeof LEVELS]}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary">
                        {group.studentCount} alumnos
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Students */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Alumnos recientes</CardTitle>
                <CardDescription>Últimos alumnos registrados</CardDescription>
              </div>
              <Link href="/dashboard/alumnos">
                <Button variant="ghost" size="sm">
                  Ver todos
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {stats.recentStudents.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed rounded-lg">
                  <Users className="mx-auto h-10 w-10 text-muted-foreground/50" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    No hay alumnos registrados
                  </p>
                  <Link href="/dashboard/alumnos">
                    <Button variant="link" size="sm" className="mt-2">
                      <Plus className="mr-1 h-4 w-4" />
                      Agregar primer alumno
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.recentStudents.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {student.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-xs text-muted-foreground">{student.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {student.level ? (
                          <>
                            <Badge variant="outline" className="mb-1">
                              {LEVELS[student.level as keyof typeof LEVELS]}
                            </Badge>
                            <p className="text-xs text-muted-foreground">
                              Clase {student.currentLesson}/150
                            </p>
                          </>
                        ) : (
                          <Badge variant="secondary">Sin nivel</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Row - Submissions & Assignments */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Upcoming Assignments */}
        <Card>
          <CardHeader>
            <CardTitle>Próximas Entregas</CardTitle>
            <CardDescription>Tareas con fecha límite cercana</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.upcomingAssignments.length === 0 ? (
              <div className="text-center py-6">
                <ClipboardList className="mx-auto h-8 w-8 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">
                  No hay tareas próximas
                </p>
                <Link href="/dashboard/tareas">
                  <Button variant="link" size="sm">
                    Crear tarea
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {stats.upcomingAssignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium">{assignment.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Vence: {formatShortDate(assignment.dueDate)}
                      </p>
                    </div>
                    <Badge variant="outline">Pendiente</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Submissions */}
        <Card>
          <CardHeader>
            <CardTitle>Entregas Recientes</CardTitle>
            <CardDescription>Tareas por calificar</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentSubmissions.length === 0 ? (
              <div className="text-center py-6">
                <UserCheck className="mx-auto h-8 w-8 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">
                  No hay entregas pendientes
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {stats.recentSubmissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {submission.studentName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {submission.assignmentTitle}
                      </p>
                    </div>
                    <Badge variant="secondary">Por calificar</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
