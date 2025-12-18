export const dynamic = 'force-dynamic'

import Link from "next/link"
import { getGroups } from "@/lib/actions/groups"
import { GroupForm } from "@/components/dashboard/group-form"
import { GroupCard } from "@/components/dashboard/group-card"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UsersRound, BookOpen, Clock, Users } from "lucide-react"

export default async function GruposPage() {
  const groups = await getGroups()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Grupos</h1>
          <p className="text-muted-foreground">
            Gestiona los grupos de clase
          </p>
        </div>
        <GroupForm />
      </div>

      {groups.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-primary/10 p-4 mb-4">
              <UsersRound className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              Crea tu primer grupo
            </h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Los grupos te permiten organizar a tus alumnos por nivel y horario.
              Podrás gestionar su progreso y avanzar las clases de todo el grupo a la vez.
            </p>

            <div className="grid gap-4 md:grid-cols-3 w-full max-w-2xl mb-8">
              <div className="flex flex-col items-center p-4 rounded-lg bg-muted/50">
                <BookOpen className="h-6 w-6 text-muted-foreground mb-2" />
                <span className="text-sm font-medium">Organiza por nivel</span>
                <span className="text-xs text-muted-foreground">A1, A2, B1, B2, B2+</span>
              </div>
              <div className="flex flex-col items-center p-4 rounded-lg bg-muted/50">
                <Clock className="h-6 w-6 text-muted-foreground mb-2" />
                <span className="text-sm font-medium">Define horarios</span>
                <span className="text-xs text-muted-foreground">Lun/Mié, Mar/Jue...</span>
              </div>
              <div className="flex flex-col items-center p-4 rounded-lg bg-muted/50">
                <Users className="h-6 w-6 text-muted-foreground mb-2" />
                <span className="text-sm font-medium">Avanza clases</span>
                <span className="text-xs text-muted-foreground">Todo el grupo a la vez</span>
              </div>
            </div>

            <GroupForm />
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Stats Summary */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg p-2 bg-green-100">
                    <UsersRound className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {groups.filter(g => g.isActive).length}
                    </p>
                    <p className="text-sm text-muted-foreground">Grupos activos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg p-2 bg-blue-100">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {groups.reduce((acc, g) => acc + g.studentCount, 0)}
                    </p>
                    <p className="text-sm text-muted-foreground">Alumnos en grupos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg p-2 bg-violet-100">
                    <BookOpen className="h-5 w-5 text-violet-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {new Set(groups.map(g => g.level)).size}
                    </p>
                    <p className="text-sm text-muted-foreground">Niveles diferentes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Groups Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {groups.map((group) => (
              <GroupCard key={group.id} group={group} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
