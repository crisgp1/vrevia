"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, CheckCircle2, Lock, Circle, FileText, ClipboardList, LayoutGrid, LayoutList, UserX, AlertCircle } from "lucide-react"
import type { AttendanceStatus } from "@/lib/db/models"

interface Lesson {
  lessonNumber: number
  grammar: string
  vocabulary: string
  level: string
}

interface LevelDetails {
  name: string
  subtitle: string
  classes: string
  totalClasses: number
}

interface AttendanceRecord {
  id: string
  lesson: number
  attended: boolean
  status: AttendanceStatus
  date: Date
  notes?: string
}

interface LevelDetailClientProps {
  level: string
  levelName: string
  details: LevelDetails
  lessons: Lesson[]
  currentLesson: number
  attendance: AttendanceRecord[]
}

type ViewMode = "rows" | "cards"

export function LevelDetailClient({
  level,
  levelName,
  details,
  lessons,
  currentLesson,
  attendance,
}: LevelDetailClientProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("rows")

  const levelColors: Record<string, string> = {
    a1: "bg-emerald-500",
    a2: "bg-blue-500",
    b1: "bg-violet-500",
    b2: "bg-orange-500",
    b2plus: "bg-rose-500",
  }

  // Helper function to check if a lesson was missed
  const getLessonAttendance = (lessonNumber: number) => {
    return attendance.find((a) => a.lesson === lessonNumber)
  }

  const wasAbsent = (lessonNumber: number) => {
    const record = getLessonAttendance(lessonNumber)
    return record && !record.attended
  }

  const isAbsentUnjustified = (lessonNumber: number) => {
    const record = getLessonAttendance(lessonNumber)
    return record && record.status === "absent_unjustified"
  }

  // Count absences in current level
  const levelLessonNumbers = lessons.map(l => l.lessonNumber)
  const levelAbsences = attendance.filter(a =>
    levelLessonNumbers.includes(a.lesson) && !a.attended
  )
  const unjustifiedAbsences = levelAbsences.filter(a => a.status === "absent_unjustified")

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <Link href="/estudiante/plan-estudios">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-10 rounded-full ${levelColors[level]}`} />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{levelName}</h1>
              <p className="text-muted-foreground mt-1">{details.subtitle}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-sm py-1.5 px-3">
            Clases {details.classes}
          </Badge>

          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
            <Button
              variant={viewMode === "rows" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("rows")}
              className="h-8 w-8 p-0"
            >
              <LayoutList className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "cards" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("cards")}
              className="h-8 w-8 p-0"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Absence Warning */}
      {levelAbsences.length > 0 && (
        <Alert variant={unjustifiedAbsences.length > 0 ? "destructive" : "default"} className="border-red-300 dark:border-red-800">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {unjustifiedAbsences.length > 0 ? (
              <span>
                Tienes <strong>{unjustifiedAbsences.length}</strong> {unjustifiedAbsences.length === 1 ? 'falta injustificada' : 'faltas injustificadas'} en este nivel.
                {unjustifiedAbsences.length === 1 ? ' Esta clase es irrecuperable.' : ' Estas clases son irrecuperables.'}
              </span>
            ) : (
              <span>
                Tienes <strong>{levelAbsences.length}</strong> {levelAbsences.length === 1 ? 'falta justificada' : 'faltas justificadas'} en este nivel.
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Classes - Row View */}
      {viewMode === "rows" && (
        <div className="space-y-4">
          {lessons.map((lesson) => {
            const isCompleted = lesson.lessonNumber < currentLesson
            const isCurrent = lesson.lessonNumber === currentLesson
            const isLessonLocked = lesson.lessonNumber > currentLesson
            const absent = wasAbsent(lesson.lessonNumber)
            const unjustified = isAbsentUnjustified(lesson.lessonNumber)

            return (
              <Link
                key={lesson.lessonNumber}
                href={isLessonLocked ? "#" : `/estudiante/plan-estudios/clase/${lesson.lessonNumber}`}
                className={`block ${isLessonLocked ? "cursor-not-allowed" : ""}`}
              >
                <Card
                  className={`
                    transition-all duration-200
                    ${isCurrent ? "ring-2 ring-primary shadow-lg" : ""}
                    ${absent ? "bg-red-50 dark:bg-red-950/20 border-red-300 dark:border-red-800 ring-2 ring-red-400 dark:ring-red-700" : ""}
                    ${isLessonLocked ? "opacity-60" : absent ? "hover:shadow-xl hover:scale-[1.01] cursor-pointer" : "hover:shadow-lg hover:scale-[1.01] hover:border-primary/50 cursor-pointer"}
                  `}
                >
                  <CardContent className="py-5 px-6">
                    <div className="flex items-center gap-6">
                      {/* Status Icon */}
                      <div className="flex-shrink-0">
                        {absent ? (
                          <UserX className="h-7 w-7 text-red-600 dark:text-red-500" />
                        ) : isCompleted ? (
                          <CheckCircle2 className="h-7 w-7 text-green-500" />
                        ) : isCurrent ? (
                          <Circle className="h-7 w-7 text-primary fill-primary" />
                        ) : isLessonLocked ? (
                          <Lock className="h-6 w-6 text-muted-foreground" />
                        ) : null}
                      </div>

                      {/* Lesson Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`font-semibold text-lg ${absent ? "text-red-700 dark:text-red-400" : ""}`}>
                            Clase {lesson.lessonNumber}
                          </span>
                          {isCurrent && !absent && (
                            <Badge variant="default">Actual</Badge>
                          )}
                          {absent && (
                            <Badge variant="destructive" className="gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {unjustified ? "Falta injustificada" : "Falta"}
                            </Badge>
                          )}
                        </div>
                        <p className="text-base font-medium text-foreground mb-1.5">
                          {lesson.grammar}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium">Vocabulario:</span> {lesson.vocabulary}
                        </p>
                      </div>

                      {/* Indicators */}
                      {!isLessonLocked && (
                        <div className="flex items-center gap-4 text-muted-foreground">
                          <div className="flex flex-col items-center gap-1" title="Materiales">
                            <FileText className="h-5 w-5" />
                            <span className="text-xs">Material</span>
                          </div>
                          <div className="flex flex-col items-center gap-1" title="Tareas">
                            <ClipboardList className="h-5 w-5" />
                            <span className="text-xs">Tareas</span>
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
      )}

      {/* Classes - Card View */}
      {viewMode === "cards" && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {lessons.map((lesson) => {
            const isCompleted = lesson.lessonNumber < currentLesson
            const isCurrent = lesson.lessonNumber === currentLesson
            const isLessonLocked = lesson.lessonNumber > currentLesson
            const absent = wasAbsent(lesson.lessonNumber)
            const unjustified = isAbsentUnjustified(lesson.lessonNumber)

            return (
              <Link
                key={lesson.lessonNumber}
                href={isLessonLocked ? "#" : `/estudiante/plan-estudios/clase/${lesson.lessonNumber}`}
                className={`block ${isLessonLocked ? "cursor-not-allowed" : ""}`}
              >
                <Card
                  className={`
                    h-full transition-all duration-200
                    ${isCurrent ? "ring-2 ring-primary shadow-lg" : ""}
                    ${absent ? "bg-red-50 dark:bg-red-950/20 border-red-300 dark:border-red-800 ring-2 ring-red-400 dark:ring-red-700" : ""}
                    ${isLessonLocked ? "opacity-60" : absent ? "hover:shadow-xl hover:scale-[1.03] cursor-pointer" : "hover:shadow-xl hover:scale-[1.03] hover:border-primary/50 cursor-pointer"}
                  `}
                >
                  <CardContent className="p-6">
                    {/* Card Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          {absent ? (
                            <UserX className="h-8 w-8 text-red-600 dark:text-red-500" />
                          ) : isCompleted ? (
                            <CheckCircle2 className="h-8 w-8 text-green-500" />
                          ) : isCurrent ? (
                            <Circle className="h-8 w-8 text-primary fill-primary" />
                          ) : isLessonLocked ? (
                            <Lock className="h-7 w-7 text-muted-foreground" />
                          ) : null}
                        </div>
                        <div>
                          <span className={`font-bold text-xl ${absent ? "text-red-700 dark:text-red-400" : ""}`}>
                            Clase {lesson.lessonNumber}
                          </span>
                          {isCurrent && !absent && (
                            <Badge variant="default" className="ml-2 text-xs">Actual</Badge>
                          )}
                          {absent && (
                            <Badge variant="destructive" className="ml-2 text-xs gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {unjustified ? "Injustificada" : "Falta"}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                          Gramática
                        </p>
                        <p className="text-sm font-semibold text-foreground leading-snug">
                          {lesson.grammar}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                          Vocabulario
                        </p>
                        <p className="text-sm text-muted-foreground leading-snug">
                          {lesson.vocabulary}
                        </p>
                      </div>

                      {/* Footer Icons */}
                      {!isLessonLocked && (
                        <div className="flex items-center gap-4 pt-3 border-t text-muted-foreground">
                          <div className="flex items-center gap-1.5" title="Materiales">
                            <FileText className="h-4 w-4" />
                            <span className="text-xs">Material</span>
                          </div>
                          <div className="flex items-center gap-1.5" title="Tareas">
                            <ClipboardList className="h-4 w-4" />
                            <span className="text-xs">Tareas</span>
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
      )}
    </div>
  )
}
