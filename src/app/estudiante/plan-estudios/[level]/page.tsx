export const dynamic = 'force-dynamic'

import { redirect, notFound } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { LEVELS, LEVEL_DETAILS, getLessonsByLevel } from "@/lib/constants"
import { LevelDetailClient } from "@/components/estudiante/level-detail-client"
import { getStudentAttendance } from "@/lib/actions/attendance"

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

  // Get student attendance
  const attendance = await getStudentAttendance(user.id)

  return (
    <LevelDetailClient
      level={level}
      levelName={levelName}
      details={details}
      lessons={lessons}
      currentLesson={currentLesson}
      attendance={attendance}
    />
  )
}
