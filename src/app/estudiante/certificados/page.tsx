import { requireStudent } from "@/lib/auth"
import { getStudentCertificates } from "@/lib/actions/certificates"
import { StudentCertificatesList } from "@/components/estudiante/student-certificates-list"
import { Award } from "lucide-react"

export default async function StudentCertificatesPage() {
  const user = await requireStudent()
  const certificates = await getStudentCertificates(user.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Award className="h-8 w-8 text-primary" />
          Mis certificados
        </h1>
        <p className="text-muted-foreground mt-2">
          Certificados oficiales de los niveles completados
        </p>
      </div>

      <StudentCertificatesList certificates={certificates} />
    </div>
  )
}
