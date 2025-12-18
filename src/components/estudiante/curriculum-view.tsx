"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LEVELS, LEVEL_DETAILS, CURRICULUM, getLevelFromLesson, type Level } from "@/lib/constants"
import { CheckCircle, Circle, BookOpen, Target } from "lucide-react"
import { cn } from "@/lib/utils"

interface CurriculumViewProps {
  currentLesson: number
  level: string
}

export function CurriculumView({ currentLesson, level }: CurriculumViewProps) {
  const [activeTab, setActiveTab] = useState<Level>(level as Level || "a1")

  const totalProgress = Math.round((currentLesson / 150) * 100)
  const currentLevelData = LEVEL_DETAILS[getLevelFromLesson(currentLesson)]

  // Calculate level progress
  const levelStartLesson = {
    a1: 1, a2: 31, b1: 61, b2: 91, b2plus: 121
  }
  const levelEndLesson = {
    a1: 30, a2: 60, b1: 90, b2: 120, b2plus: 150
  }

  const currentLevelKey = getLevelFromLesson(currentLesson)
  const lessonsInCurrentLevel = currentLesson - levelStartLesson[currentLevelKey] + 1
  const levelProgress = Math.round((lessonsInCurrentLevel / 30) * 100)

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <CardContent className="py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm opacity-90">Tu progreso general</p>
              <p className="text-3xl font-bold">{currentLesson}/150 clases</p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90">Nivel actual</p>
              <p className="text-xl font-bold">{LEVELS[currentLevelKey]}</p>
            </div>
          </div>
          <Progress value={totalProgress} className="h-3 bg-primary-foreground/20" />
          <p className="text-xs opacity-75 mt-2">{totalProgress}% completado</p>
        </CardContent>
      </Card>

      {/* Current Lesson Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <CardTitle>Próxima clase</CardTitle>
          </div>
          <CardDescription>{currentLevelData.subtitle}</CardDescription>
        </CardHeader>
        <CardContent>
          {CURRICULUM.find(l => l.lessonNumber === currentLesson) && (
            <div className="p-4 bg-primary/5 rounded-lg border-2 border-primary">
              <div className="flex items-center gap-3 mb-3">
                <Badge variant="default" className="text-lg px-3 py-1">
                  Clase {currentLesson}
                </Badge>
                <Badge variant="outline">{LEVELS[currentLevelKey]}</Badge>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Gramática</p>
                  <p className="font-medium">{CURRICULUM[currentLesson - 1].grammar}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Vocabulario</p>
                  <p className="font-medium">{CURRICULUM[currentLesson - 1].vocabulary}</p>
                </div>
              </div>
            </div>
          )}
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">
              Progreso en {LEVELS[currentLevelKey]}: {lessonsInCurrentLevel}/30 clases ({levelProgress}%)
            </p>
            <Progress value={levelProgress} className="h-2 mt-2" />
          </div>
        </CardContent>
      </Card>

      {/* Curriculum by Level */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <CardTitle>Plan de estudios</CardTitle>
          </div>
          <CardDescription>150 clases organizadas en 5 niveles</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as Level)}>
            <TabsList className="grid w-full grid-cols-5">
              {(Object.keys(LEVELS) as Level[]).map((lvl) => (
                <TabsTrigger
                  key={lvl}
                  value={lvl}
                  className={cn(
                    currentLesson > levelEndLesson[lvl] && "text-green-600",
                    getLevelFromLesson(currentLesson) === lvl && "text-primary font-bold"
                  )}
                >
                  {lvl.toUpperCase().replace("PLUS", "+")}
                </TabsTrigger>
              ))}
            </TabsList>

            {(Object.keys(LEVELS) as Level[]).map((lvl) => {
              const levelLessons = CURRICULUM.filter(l => l.level === lvl)
              const details = LEVEL_DETAILS[lvl]

              return (
                <TabsContent key={lvl} value={lvl} className="mt-4">
                  <div className="mb-4">
                    <h3 className="font-semibold text-lg">{details.name}</h3>
                    <p className="text-sm text-muted-foreground">{details.subtitle}</p>
                    <p className="text-xs text-muted-foreground mt-1">Clases {details.classes}</p>
                  </div>

                  <div className="border rounded-lg overflow-hidden">
                    <div className="max-h-[400px] overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-muted sticky top-0">
                          <tr>
                            <th className="text-left p-3 w-16">#</th>
                            <th className="text-left p-3">Gramática</th>
                            <th className="text-left p-3">Vocabulario</th>
                            <th className="text-center p-3 w-20">Estado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {levelLessons.map((lesson) => {
                            const isCompleted = lesson.lessonNumber < currentLesson
                            const isCurrent = lesson.lessonNumber === currentLesson
                            const isAssessment = lesson.grammar.includes("ASSESSMENT")

                            return (
                              <tr
                                key={lesson.lessonNumber}
                                className={cn(
                                  "border-t",
                                  isCurrent && "bg-primary/10",
                                  isAssessment && "bg-yellow-50 dark:bg-yellow-900/10"
                                )}
                              >
                                <td className="p-3 font-medium">
                                  {lesson.lessonNumber}
                                </td>
                                <td className="p-3">
                                  <span className={cn(
                                    isCompleted && "text-muted-foreground",
                                    isAssessment && "font-semibold text-yellow-700 dark:text-yellow-500"
                                  )}>
                                    {lesson.grammar}
                                  </span>
                                </td>
                                <td className="p-3 text-muted-foreground">
                                  {lesson.vocabulary}
                                </td>
                                <td className="p-3 text-center">
                                  {isCompleted ? (
                                    <CheckCircle className="h-5 w-5 text-green-600 mx-auto" />
                                  ) : isCurrent ? (
                                    <Badge variant="default" className="text-xs">
                                      Actual
                                    </Badge>
                                  ) : (
                                    <Circle className="h-5 w-5 text-muted-foreground/30 mx-auto" />
                                  )}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </TabsContent>
              )
            })}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
