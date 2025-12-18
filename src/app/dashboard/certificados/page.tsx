import { requireAdmin } from "@/lib/auth"
import { getCertificates } from "@/lib/actions/certificates"
import { getStudents } from "@/lib/actions/users"
import { CertificateForm } from "@/components/dashboard/certificate-form"
import { CertificateTable } from "@/components/dashboard/certificate-table"
import { Award } from "lucide-react"

export default async function CertificatesPage() {
  await requireAdmin()

  const [certificates, students] = await Promise.all([
    getCertificates(),
    getStudents(),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Award className="h-8 w-8 text-primary" />
            Certificados
          </h1>
          <p className="text-muted-foreground mt-2">
            Gestiona los certificados de nivel de tus estudiantes
          </p>
        </div>
        <CertificateForm students={students} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="border rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Total emitidos</div>
          <div className="text-2xl font-bold mt-1">{certificates.length}</div>
        </div>
        <div className="border rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Este mes</div>
          <div className="text-2xl font-bold mt-1">
            {
              certificates.filter(
                (c) =>
                  new Date(c.issueDate).getMonth() === new Date().getMonth() &&
                  new Date(c.issueDate).getFullYear() === new Date().getFullYear()
              ).length
            }
          </div>
        </div>
        <div className="border rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Estudiantes certificados</div>
          <div className="text-2xl font-bold mt-1">
            {new Set(certificates.map((c) => c.student.id)).size}
          </div>
        </div>
      </div>

      <CertificateTable certificates={certificates} />
    </div>
  )
}
