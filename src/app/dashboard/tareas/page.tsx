export const dynamic = 'force-dynamic'

import { getAssignments } from "@/lib/actions/assignments"
import { getGroupsForSelect, getStudents } from "@/lib/actions/users"
import { AssignmentForm } from "@/components/dashboard/assignment-form"
import { AssignmentCard } from "@/components/dashboard/assignment-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function TareasPage() {
  const [assignments, groups, students] = await Promise.all([
    getAssignments(),
    getGroupsForSelect(),
    getStudents(),
  ])

  const studentsForSelect = students.map((s) => ({ id: s.id, name: s.name }))

  const pendingGrading = assignments.filter(
    (a) => a.submissionCount > a.gradedCount
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tareas</h1>
          <p className="text-muted-foreground">
            Gestiona las tareas y calificaciones
          </p>
        </div>
        <AssignmentForm groups={groups} students={studentsForSelect} />
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">
            Por calificar ({pendingGrading.length})
          </TabsTrigger>
          <TabsTrigger value="all">Todas ({assignments.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          {pendingGrading.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No hay tareas pendientes por calificar
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pendingGrading.map((assignment) => (
                <AssignmentCard key={assignment.id} assignment={assignment} groups={groups} students={studentsForSelect} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all">
          {assignments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No hay tareas creadas</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {assignments.map((assignment) => (
                <AssignmentCard key={assignment.id} assignment={assignment} groups={groups} students={studentsForSelect} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
