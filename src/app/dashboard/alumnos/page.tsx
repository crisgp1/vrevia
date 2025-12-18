export const dynamic = 'force-dynamic'

import { getStudents, getGroupsForSelect } from "@/lib/actions/users"
import { StudentForm } from "@/components/dashboard/student-form"
import { StudentTable } from "@/components/dashboard/student-table"
import { Card, CardContent } from "@/components/ui/card"
import { Users, UserCheck, GraduationCap, UsersRound } from "lucide-react"

export default async function AlumnosPage() {
  const [students, groups] = await Promise.all([
    getStudents(),
    getGroupsForSelect(),
  ])

  const activeStudents = students.filter(s => s.isActive)
  const withLevel = students.filter(s => s.level)
  const inGroups = students.filter(s => s.group)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Alumnos</h1>
          <p className="text-muted-foreground">
            Gestiona los alumnos de tu plataforma
          </p>
        </div>
        <StudentForm groups={groups} />
      </div>

      {students.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-primary/10 p-4 mb-4">
              <Users className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              Agrega tu primer alumno
            </h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Los alumnos deben registrarse primero en la plataforma con Google.
              Luego podrás buscarlos y asignarles un nivel y tipo de clase.
            </p>

            <div className="grid gap-4 md:grid-cols-3 w-full max-w-2xl mb-8">
              <div className="flex flex-col items-center p-4 rounded-lg bg-muted/50">
                <span className="text-2xl font-bold text-primary mb-1">1</span>
                <span className="text-sm font-medium">Alumno se registra</span>
                <span className="text-xs text-muted-foreground text-center">Con Google en la app</span>
              </div>
              <div className="flex flex-col items-center p-4 rounded-lg bg-muted/50">
                <span className="text-2xl font-bold text-primary mb-1">2</span>
                <span className="text-sm font-medium">Tú lo buscas</span>
                <span className="text-xs text-muted-foreground text-center">Por nombre o email</span>
              </div>
              <div className="flex flex-col items-center p-4 rounded-lg bg-muted/50">
                <span className="text-2xl font-bold text-primary mb-1">3</span>
                <span className="text-sm font-medium">Asignas nivel</span>
                <span className="text-xs text-muted-foreground text-center">A1, A2, B1, B2, B2+</span>
              </div>
            </div>

            <StudentForm groups={groups} />
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Stats Summary */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg p-2 bg-blue-100">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{students.length}</p>
                    <p className="text-sm text-muted-foreground">Total alumnos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg p-2 bg-green-100">
                    <UserCheck className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{activeStudents.length}</p>
                    <p className="text-sm text-muted-foreground">Activos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg p-2 bg-violet-100">
                    <GraduationCap className="h-5 w-5 text-violet-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{withLevel.length}</p>
                    <p className="text-sm text-muted-foreground">Con nivel</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg p-2 bg-orange-100">
                    <UsersRound className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{inGroups.length}</p>
                    <p className="text-sm text-muted-foreground">En grupos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <StudentTable students={students} />
        </>
      )}
    </div>
  )
}
