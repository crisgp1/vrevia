"use client"

import { format } from "date-fns"
import { es } from "date-fns/locale"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LEVELS } from "@/lib/constants"
import { Award, Download, CheckCircle2 } from "lucide-react"

interface Certificate {
  id: string
  level: string
  issueDate: Date
  certificateNumber: string
  issuedBy: string
  notes?: string
}

interface StudentCertificatesListProps {
  certificates: Certificate[]
}

export function StudentCertificatesList({ certificates }: StudentCertificatesListProps) {
  function handleDownload(id: string, certificateNumber: string) {
    const link = document.createElement("a")
    link.href = `/api/certificates/${id}/pdf`
    link.download = `certificado-${certificateNumber}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("Descargando certificado...")
  }

  if (certificates.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 pb-8 text-center">
          <Award className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Aún no tienes certificados</h3>
          <p className="text-muted-foreground">
            Cuando completes un nivel, recibirás un certificado oficial
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2">
        {certificates.map((cert) => (
          <Card key={cert.id} className="overflow-hidden">
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 border-b">
              <div className="flex items-start justify-between">
                <div>
                  <Badge variant="secondary" className="mb-2">
                    {LEVELS[cert.level as keyof typeof LEVELS]}
                  </Badge>
                  <h3 className="text-xl font-bold">Certificado de Nivel</h3>
                  <p className="text-sm text-muted-foreground mt-1">Vrevia English Academy</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>
            </div>

            <CardHeader>
              <CardTitle className="text-base">Detalles del certificado</CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
              <div>
                <div className="text-sm text-muted-foreground">Número de certificado</div>
                <code className="text-sm bg-muted px-2 py-1 rounded mt-1 inline-block">
                  {cert.certificateNumber}
                </code>
              </div>

              <div>
                <div className="text-sm text-muted-foreground">Fecha de emisión</div>
                <div className="font-medium">
                  {format(new Date(cert.issueDate), "dd 'de' MMMM 'de' yyyy", { locale: es })}
                </div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground">Emitido por</div>
                <div className="font-medium">{cert.issuedBy}</div>
              </div>

              {cert.notes && (
                <div>
                  <div className="text-sm text-muted-foreground">Notas</div>
                  <div className="text-sm mt-1">{cert.notes}</div>
                </div>
              )}

              <Button
                className="w-full mt-4"
                variant="outline"
                onClick={() => handleDownload(cert.id, cert.certificateNumber)}
              >
                <Download className="mr-2 h-4 w-4" />
                Descargar certificado
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-base">Sobre tus certificados</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>• Los certificados son oficiales y verificables mediante el número único</p>
          <p>• Puedes descargar tus certificados en formato PDF en cualquier momento</p>
          <p>• Los certificados acreditan tu nivel de inglés completado en Vrevia</p>
        </CardContent>
      </Card>
    </>
  )
}
