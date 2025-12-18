export const dynamic = 'force-dynamic'

import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { getCurrentUser } from "@/lib/auth"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LEVELS, LEVEL_DETAILS, getLessonsByLevel } from "@/lib/constants"
import { ArrowLeft, CheckCircle2, Lock, Circle, BookOpen, FileText, ClipboardList } from "lucide-react"

interface PageProps {
  params: Promise<{ level: string }>
}

export default async function LevelDetailPage({ params }: PageProps) {
  const { level } = await params
  const user = await getCurrentUser()

  if (!user) {
    redirect("/")
  }

  if (user.role !== "student") {
    redirect("/dashboard")
  }

  // Validate level
  if (!LEVELS[level as keyof typeof LEVELS]) {
    notFound()
  }

  const levelName = LEVELS[level as keyof typeof LEVELS]
  const details = LEVEL_DETAILS[level as keyof typeof LEVEL_DETAILS]
  const lessons = getLessonsByLevel(level as "a1" | "a2" | "b1" | "b2" | "b2plus")
  const currentLesson = user.currentLesson

  const [start] = details.classes.split("-").map(Number)

  // Check if level is accessible
  const isLocked = currentLesson < start

  if (isLocked) {
    redirect("/estudiante/plan-estudios")
  }

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
        <Link href="/estudiante/plan-estudios">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-8 rounded-full ${levelColors[level]}`} />
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{levelName}</h1>
              <p className="text-muted-foreground">{details.subtitle}</p>
            </div>
          </div>
        </div>
        <Badge variant="outline">Clases {details.classes}</Badge>
      </div>

      {/* Classes List */}
      <div className="space-y-3">
        {lessons.map((lesson) => {
          const isCompleted = lesson.lessonNumber < currentLesson
          const isCurrent = lesson.lessonNumber === currentLesson
          const isLessonLocked = lesson.lessonNumber > currentLesson

          return (
            <Link
              key={lesson.lessonNumber}
              href={isLessonLocked ? "#" : `/estudiante/plan-estudios/clase/${lesson.lessonNumber}`}
              className={isLessonLocked ? "cursor-not-allowed" : ""}
            >
              <Card className={`transition-all ${isCurrent ? "ring-2 ring-primary" : ""} ${isLessonLocked ? "opacity-50" : "hover:shadow-md"}`}>
                <CardContent className="py-4">
                  <div className="flex items-center gap-4">
                    {/* Status Icon */}
                    <div className="flex-shrink-0">
                      {isCompleted && (
                        <CheckCircle2 className="h-6 w-6 text-green-500" />
                      )}
                      {isCurrent && (
                        <Circle className="h-6 w-6 text-primary fill-primary" />
                      )}
                      {isLessonLocked && (
                        <Lock className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>

                    {/* Lesson Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Clase {lesson.lessonNumber}</span>
                        {isCurrent && (
                          <Badge variant="default" className="text-xs">Actual</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {lesson.grammar}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        <span className="font-medium">Vocabulario:</span> {lesson.vocabulary}
                      </p>
                    </div>

                    {/* Indicators */}
                    {!isLessonLocked && (
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <div className="flex items-center gap-1" title="Materiales">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div className="flex items-center gap-1" title="Tareas">
                          <ClipboardList className="h-4 w-4" />
                        </div>
                      </div>
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
