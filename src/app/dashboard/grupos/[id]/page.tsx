export const dynamic = 'force-dynamic'

import { notFound } from "next/navigation"
import Link from "next/link"
import { getGroupById } from "@/lib/actions/groups"
import { GroupStudentList } from "@/components/dashboard/group-student-list"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Clock, Users } from "lucide-react"
import { LEVELS, LEVEL_DETAILS } from "@/lib/constants"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function GroupDetailPage({ params }: PageProps) {
  const { id } = await params
  const group = await getGroupById(id)

  if (!group) {
    notFound()
  }

  const levelDetails = LEVEL_DETAILS[group.level as keyof typeof LEVEL_DETAILS]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/grupos">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{group.name}</h1>
          <p className="text-muted-foreground">
            {group.description || "Sin descripción"}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Badge variant="outline" className="text-sm py-1 px-3">
          {LEVELS[group.level as keyof typeof LEVELS]}
        </Badge>
        <Badge variant="secondary" className="text-sm py-1 px-3">
          Clases {levelDetails?.classes || "1-30"}
        </Badge>
        <Badge variant={group.isActive ? "default" : "outline"} className="text-sm py-1 px-3">
          {group.isActive ? "Activo" : "Inactivo"}
        </Badge>
      </div>

      <div className="flex items-center gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span>{group.students.length} alumnos</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>{group.schedule}</span>
        </div>
      </div>

      <GroupStudentList groupId={group.id} students={group.students} groupLevel={group.level} />
    </div>
  )
}
