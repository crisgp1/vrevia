import { redirect } from "next/navigation"
import { requireActiveSubscription } from "@/lib/auth/english"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LEVELS as ENGLISH_LEVELS, LEVEL_DETAILS } from "@/lib/constants"
import Link from "next/link"
import { BookOpen } from "lucide-react"

export default async function LeccionesPage() {
  const student = await requireActiveSubscription()

  if (!student) {
    redirect("/")
  }

  const levels = Object.entries(ENGLISH_LEVELS) as [keyof typeof ENGLISH_LEVELS, string][]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Lecciones de Inglés</h1>
        <p className="text-muted-foreground mt-1">
          Explora las lecciones organizadas por nivel
        </p>
      </div>

      {/* Levels Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {levels.map(([levelKey, levelName]) => {
          const details = LEVEL_DETAILS[levelKey]
          const isCurrentLevel = student.currentLevel === levelKey
          const levelNumber = levelKey === "a1" ? 1 : levelKey === "a2" ? 2 : levelKey === "b1" ? 3 : levelKey === "b2" ? 4 : 5
          const studentLevelNumber = student.currentLevel === "a1" ? 1 : student.currentLevel === "a2" ? 2 : student.currentLevel === "b1" ? 3 : student.currentLevel === "b2" ? 4 : 5
          const isUnlocked = levelNumber <= studentLevelNumber

          return (
            <Card key={levelKey} className={isCurrentLevel ? "border-primary" : ""}>
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <CardTitle>{details.name}</CardTitle>
                  {isCurrentLevel && (
                    <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                      Actual
                    </span>
                  )}
                </div>
                <CardDescription>{details.subtitle}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BookOpen className="h-4 w-4" />
                  <span>Clases {details.classes}</span>
                  <span>•</span>
                  <span>{details.totalClasses} lecciones</span>
                </div>

                {isUnlocked ? (
                  <Button asChild className="w-full">
                    <Link href={`/ingles/lecciones/${levelKey}`}>
                      Ver Lecciones
                    </Link>
                  </Button>
                ) : (
                  <Button disabled className="w-full">
                    Bloqueado
                  </Button>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
