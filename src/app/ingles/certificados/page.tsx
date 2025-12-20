import { redirect } from "next/navigation"
import { requireActiveSubscription } from "@/lib/auth/english"
import { getMyCertificates } from "@/lib/actions/english-certificates"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LEVELS as ENGLISH_LEVELS } from "@/lib/constants"
import { Award, Download, Calendar } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default async function CertificadosPage() {
  const student = await requireActiveSubscription()

  if (!student) {
    redirect("/")
  }

  const result = await getMyCertificates()
  const certificates = result.success ? result.data : []

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Mis Certificados</h1>
        <p className="text-muted-foreground mt-1">
          Certificados obtenidos al completar cada nivel
        </p>
      </div>

      {certificates.length === 0 ? (
        <Alert>
          <Award className="h-4 w-4" />
          <AlertTitle>Aún no tienes certificados</AlertTitle>
          <AlertDescription>
            Completa todas las lecciones de un nivel para obtener tu certificado.
            ¡Sigue adelante con tu aprendizaje!
          </AlertDescription>
        </Alert>
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
                <CardDescription>
                  Certificado #{cert.certificateNumber}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Emitido el {new Date(cert.issueDate).toLocaleDateString("es-MX")}
                    </span>
                  </div>
                  {cert.totalHours > 0 && (
                    <div className="text-muted-foreground">
                      Total de horas: {cert.totalHours}
                    </div>
                  )}
                  {cert.finalScore && (
                    <div className="text-muted-foreground">
                      Calificación: {cert.finalScore}%
                    </div>
                  )}
                </div>

                {cert.pdfUrl ? (
                  <Button asChild className="w-full">
                    <a href={cert.pdfUrl} target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4 mr-2" />
                      Descargar PDF
                    </a>
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full" disabled>
                    PDF en proceso
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>¿Cómo obtener un certificado?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>Para obtener un certificado, debes:</p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>Completar todas las lecciones del nivel</li>
            <li>Aprobar todos los ejercicios requeridos</li>
            <li>El sistema generará automáticamente tu certificado</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
