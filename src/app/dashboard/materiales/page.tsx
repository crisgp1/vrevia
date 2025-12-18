export const dynamic = 'force-dynamic'

import { getMaterials } from "@/lib/actions/materials"
import { getGroupsForSelect, getStudents } from "@/lib/actions/users"
import { MaterialForm } from "@/components/dashboard/material-form"
import { MaterialCard } from "@/components/dashboard/material-card"

export default async function MaterialesPage() {
  const [materials, groups, students] = await Promise.all([
    getMaterials(),
    getGroupsForSelect(),
    getStudents(),
  ])

  const studentsForSelect = students.map((s) => ({ id: s.id, name: s.name }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Materiales</h1>
          <p className="text-muted-foreground">
            Gestiona el material de apoyo para tus clases
          </p>
        </div>
        <MaterialForm groups={groups} students={studentsForSelect} />
      </div>

      {materials.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No hay materiales subidos</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {materials.map((material) => (
            <MaterialCard key={material.id} material={material} />
          ))}
        </div>
      )}
    </div>
  )
}
