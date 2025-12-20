import { redirect } from "next/navigation"
import { requireActiveSubscription } from "@/lib/auth/english"
import { getExerciseById } from "@/lib/actions/english-exercises"
import { ExerciseClient } from "@/components/ingles/exercise-client"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function ExercisePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const student = await requireActiveSubscription()

  if (!student) {
    redirect("/")
  }

  const result = await getExerciseById(id)

  if (!result.success || !result.data) {
    redirect("/ingles/lecciones")
  }

  const { exercise, attempts, bestScore, passed } = result.data

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Top Navigation */}
      <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between px-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/ingles/leccion/${exercise.lessonNumber}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a la lección
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <ExerciseClient
          exercise={exercise}
          attempts={attempts}
          bestScore={bestScore}
          passed={passed}
        />
      </div>
    </div>
  )
}
