export const dynamic = 'force-dynamic'

import { notFound } from "next/navigation"
import Link from "next/link"
import { getStudentById, getGroupsForSelect } from "@/lib/actions/users"
import { getStudentGrades } from "@/lib/actions/grades"
import { getStudentAttendance } from "@/lib/actions/attendance"
import { StudentDetailView } from "@/components/dashboard/student-detail-view"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function StudentDetailPage({ params }: PageProps) {
  const { id } = await params
  const [student, grades, attendance, groups] = await Promise.all([
    getStudentById(id),
    getStudentGrades(id),
    getStudentAttendance(id),
    getGroupsForSelect(),
  ])

  if (!student) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/alumnos">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{student.name}</h1>
          <p className="text-muted-foreground">{student.email}</p>
        </div>
      </div>

      <StudentDetailView student={student} grades={grades} attendance={attendance} groups={groups} />
    </div>
  )
}
