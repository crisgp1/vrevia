import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { getAllCertificates } from "@/lib/actions/english-certificates"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Award, Calendar } from "lucide-react"
import { LEVELS as ENGLISH_LEVELS } from "@/lib/constants"

export default async function CertificadosInglesAdminPage() {
  const user = await getCurrentUser()

  if (!user || user.role !== "admin") {
    redirect("/")
  }

  const result = await getAllCertificates()
  const certificates = result.success ? result.data : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Certificados Emitidos</h1>
        <p className="text-muted-foreground mt-1">
          {certificates.length} certificados generados
        </p>
      </div>

      {/* Certificates List */}
      {certificates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Award className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No hay certificados emitidos</p>
            <p className="text-sm text-muted-foreground">
              Los certificados se generan automáticamente al completar niveles
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {certificates.map((cert: any) => (
            <Card key={cert._id}>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Award className="h-5 w-5 text-yellow-600" />
                  <CardTitle>
                    {ENGLISH_LEVELS[cert.level as keyof typeof ENGLISH_LEVELS]}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium">{cert.student?.name || "Estudiante"}</p>
                  <p className="text-xs text-muted-foreground">{cert.student?.email}</p>
                </div>

                <div className="pt-2 border-t space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Número</span>
                    <Badge variant="outline">{cert.certificateNumber}</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(cert.issueDate).toLocaleDateString("es-MX")}
                    </span>
                  </div>
                  {cert.totalHours > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Horas totales</span>
                      <span className="font-medium">{cert.totalHours}h</span>
                    </div>
                  )}
                  {cert.finalScore && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Calificación</span>
                      <span className="font-medium">{cert.finalScore}%</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
