import { requireAdmin } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getStudents } from "@/lib/actions/users"
import { KardexList } from "@/components/dashboard/kardex-list"

export default async function KardexPage() {
  const user = await requireAdmin()

  if (!user) {
    redirect("/")
  }

  const students = await getStudents()

  if (!students || students.length === 0) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Papelería</h1>
        <p className="text-muted-foreground">No hay estudiantes registrados</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Papelería</h1>
        <p className="text-muted-foreground mt-2">
          Genera y descarga documentos oficiales de estudiantes
        </p>
      </div>

      <KardexList students={students} />
    </div>
  )
}
