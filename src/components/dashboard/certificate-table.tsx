"use client"

import { useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { toast } from "sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { deleteCertificate } from "@/lib/actions/certificates"
import { LEVELS } from "@/lib/constants"
import { Trash2, Download, Award } from "lucide-react"

interface Certificate {
  id: string
  student: {
    id: string
    name: string
    email: string
  }
  level: string
  issueDate: Date
  certificateNumber: string
  issuedBy: string
  notes?: string
}

interface CertificateTableProps {
  certificates: Certificate[]
}

export function CertificateTable({ certificates }: CertificateTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleDelete(id: string) {
    if (!confirm("¿Estás seguro de que quieres eliminar este certificado?")) {
      return
    }

    setDeletingId(id)
    try {
      const result = await deleteCertificate(id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Certificado eliminado")
      }
    } catch {
      toast.error("Error al eliminar el certificado")
    } finally {
      setDeletingId(null)
    }
  }

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
      <div className="text-center py-12 border rounded-lg bg-muted/20">
        <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No hay certificados emitidos</h3>
        <p className="text-muted-foreground">
          Emite certificados a estudiantes que hayan completado un nivel
        </p>
      </div>
    )
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Estudiante</TableHead>
            <TableHead>Nivel</TableHead>
            <TableHead>Número</TableHead>
            <TableHead>Fecha emisión</TableHead>
            <TableHead>Emitido por</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {certificates.map((cert) => (
            <TableRow key={cert.id}>
              <TableCell>
                <div>
                  <div className="font-medium">{cert.student.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {cert.student.email}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="secondary">
                  {LEVELS[cert.level as keyof typeof LEVELS]}
                </Badge>
              </TableCell>
              <TableCell>
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  {cert.certificateNumber}
                </code>
              </TableCell>
              <TableCell>
                {format(new Date(cert.issueDate), "dd MMM yyyy", { locale: es })}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {cert.issuedBy}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(cert.id, cert.certificateNumber)}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Descargar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(cert.id)}
                    disabled={deletingId === cert.id}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
