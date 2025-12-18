export const dynamic = 'force-dynamic'

import { redirect } from "next/navigation"
import Link from "next/link"
import { getCurrentUser } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { LEVELS, LEVEL_DETAILS } from "@/lib/constants"
import { BookOpen, Lock, CheckCircle2, ArrowRight } from "lucide-react"

export default async function PlanEstudiosPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/")
  }

  if (user.role !== "student") {
    redirect("/dashboard")
  }

  const currentLesson = user.currentLesson
  const currentLevel = user.level || "a1"

  const levelColors: Record<string, { bg: string; text: string; border: string }> = {
    a1: { bg: "bg-emerald-500", text: "text-emerald-600", border: "border-emerald-500" },
    a2: { bg: "bg-blue-500", text: "text-blue-600", border: "border-blue-500" },
    b1: { bg: "bg-violet-500", text: "text-violet-600", border: "border-violet-500" },
    b2: { bg: "bg-orange-500", text: "text-orange-600", border: "border-orange-500" },
    b2plus: { bg: "bg-rose-500", text: "text-rose-600", border: "border-rose-500" },
  }

  const levelOrder = ["a1", "a2", "b1", "b2", "b2plus"]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Plan de estudios</h1>
        <p className="text-muted-foreground">
          VREVIA Professional English - 150 clases
        </p>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Progreso total</p>
              <p className="text-2xl font-bold">Clase {currentLesson} de 150</p>
            </div>
            <Badge className={levelColors[currentLevel].bg}>
              {LEVELS[currentLevel as keyof typeof LEVELS]}
            </Badge>
          </div>
          <Progress value={(currentLesson / 150) * 100} className="h-3" />
          <p className="text-sm text-muted-foreground mt-2">
            {Math.round((currentLesson / 150) * 100)}% completado
          </p>
        </CardContent>
      </Card>

      {/* Level Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {levelOrder.map((levelKey) => {
          const level = LEVELS[levelKey as keyof typeof LEVELS]
          const details = LEVEL_DETAILS[levelKey as keyof typeof LEVEL_DETAILS]
          const colors = levelColors[levelKey]
          const [start, end] = details.classes.split("-").map(Number)

          // Determine level status
          const isCompleted = currentLesson > end
          const isCurrent = currentLesson >= start && currentLesson <= end
          const isLocked = currentLesson < start

          // Calculate progress within level
          let levelProgress = 0
          if (isCompleted) {
            levelProgress = 100
          } else if (isCurrent) {
            levelProgress = ((currentLesson - start + 1) / (end - start + 1)) * 100
          }

          return (
            <Link
              key={levelKey}
              href={isLocked ? "#" : `/estudiante/plan-estudios/${levelKey}`}
              className={isLocked ? "cursor-not-allowed" : ""}
            >
              <Card className={`transition-all hover:shadow-md ${isCurrent ? `ring-2 ${colors.border}` : ""} ${isLocked ? "opacity-60" : ""}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className={`w-3 h-10 rounded-full ${colors.bg}`} />
                    <div className="flex-1 ml-3">
                      <CardTitle className="text-lg">{level}</CardTitle>
                      <CardDescription>{details.subtitle}</CardDescription>
                    </div>
                    {isCompleted && (
                      <CheckCircle2 className="h-6 w-6 text-green-500" />
                    )}
                    {isLocked && (
                      <Lock className="h-5 w-5 text-muted-foreground" />
                    )}
                    {isCurrent && (
                      <ArrowRight className={`h-5 w-5 ${colors.text}`} />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <BookOpen className="h-4 w-4" />
                      <span>Clases {details.classes}</span>
                      <span>•</span>
                      <span>{details.totalClasses} clases</span>
                    </div>

                    {!isLocked && (
                      <>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full ${colors.bg} transition-all`}
                            style={{ width: `${levelProgress}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {isCompleted
                            ? "Completado"
                            : isCurrent
                            ? `Clase ${currentLesson} de ${end}`
                            : "No iniciado"}
                        </p>
                      </>
                    )}

                    {isLocked && (
                      <p className="text-xs text-muted-foreground">
                        Completa el nivel anterior para desbloquear
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
