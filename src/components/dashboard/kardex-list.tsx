"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FileText, Download, Award, FileCheck, Search, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { LEVELS } from "@/lib/constants"

interface Student {
  id: string
  name: string
  email: string
  phone: string
  level?: string
  currentLesson: number
  isActive: boolean
}

interface KardexListProps {
  students: Student[]
}

type KardexType = "unofficial" | "official" | "constancia"

export function KardexList({ students }: KardexListProps) {
  const [search, setSearch] = useState("")
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [kardexType, setKardexType] = useState<KardexType>("unofficial")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [generating, setGenerating] = useState(false)

  // Form state for official kardex
  const [kardexName, setKardexName] = useState("")
  const [kardexPhone, setKardexPhone] = useState("")
  const [kardexAddressee, setKardexAddressee] = useState("")

  // Form state for constancia
  const [constanciaName, setConstanciaName] = useState("")
  const [constanciaPhone, setConstanciaPhone] = useState("")
  const [constanciaAddressee, setConstanciaAddressee] = useState("A QUIEN CORRESPONDA")
  const [constanciaGender, setConstanciaGender] = useState<"male" | "female">("male")
  const [constanciaIssuerName, setConstanciaIssuerName] = useState("")
  const [constanciaIssuerRole, setConstanciaIssuerRole] = useState("director")
  const [constanciaIssuerCustomRole, setConstanciaIssuerCustomRole] = useState("")

  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(search.toLowerCase()) ||
    student.email.toLowerCase().includes(search.toLowerCase())
  )

  const handleOpenDialog = (student: Student, type: KardexType) => {
    setSelectedStudent(student)
    setKardexType(type)
    setKardexName(student.name)
    setKardexPhone(student.phone || "")
    setConstanciaName(student.name)
    setConstanciaPhone(student.phone || "")
    setDialogOpen(true)
  }

  const handleGenerate = async () => {
    if (!selectedStudent) return

    setGenerating(true)
    try {
      let url = ""
      let filename = ""

      if (kardexType === "unofficial") {
        url = `/api/kardex/${selectedStudent.id}?type=unofficial`
        filename = `Kardex_${selectedStudent.name.replace(/\s+/g, "_")}.pdf`
      } else if (kardexType === "official") {
        const params = new URLSearchParams({
          type: "official",
          name: kardexName,
          phone: kardexPhone,
          addressee: kardexAddressee,
        })
        url = `/api/kardex/${selectedStudent.id}?${params}`
        filename = `Kardex_Oficial_${selectedStudent.name.replace(/\s+/g, "_")}.pdf`
      } else if (kardexType === "constancia") {
        const issuerRole = constanciaIssuerRole === "other"
          ? constanciaIssuerCustomRole
          : constanciaIssuerRole

        const params = new URLSearchParams({
          name: constanciaName,
          phone: constanciaPhone,
          addressee: constanciaAddressee,
          gender: constanciaGender,
          issuerName: constanciaIssuerName,
          issuerRole: issuerRole,
        })
        url = `/api/constancia/${selectedStudent.id}?${params}`
        filename = `Constancia_${selectedStudent.name.replace(/\s+/g, "_")}.pdf`
      }

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error("Error al generar el documento")
      }

      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = downloadUrl
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(downloadUrl)
      document.body.removeChild(a)

      toast.success("Documento generado exitosamente")
      setDialogOpen(false)
      setKardexAddressee("")
      setConstanciaAddressee("A QUIEN CORRESPONDA")
    } catch (error) {
      toast.error("Error al generar el documento")
    } finally {
      setGenerating(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Estudiantes</CardTitle>
              <CardDescription>
                Selecciona un estudiante para generar su kardex o documentos oficiales
              </CardDescription>
            </div>
            <div className="w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar estudiante..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Nivel</TableHead>
                <TableHead>Clase</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No se encontraron estudiantes
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-muted-foreground">{student.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {student.level ? (
                        <Badge variant="outline">
                          {LEVELS[student.level as keyof typeof LEVELS]}
                        </Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">Sin nivel</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{student.currentLesson} / 150</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={student.isActive ? "default" : "secondary"}>
                        {student.isActive ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDialog(student, "unofficial")}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Kardex
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDialog(student, "official")}
                        >
                          <Award className="h-4 w-4 mr-2" />
                          Oficial
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDialog(student, "constancia")}
                        >
                          <FileCheck className="h-4 w-4 mr-2" />
                          Constancia
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog for generating documents */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {kardexType === "unofficial" && "Generar Kardex"}
              {kardexType === "official" && "Generar Kardex Oficial"}
              {kardexType === "constancia" && "Generar Constancia"}
            </DialogTitle>
            <DialogDescription>
              {selectedStudent?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {kardexType === "unofficial" && (
              <p className="text-sm text-muted-foreground">
                Se generará un kardex de consulta con las calificaciones actuales del estudiante.
              </p>
            )}

            {kardexType === "official" && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nombre completo del estudiante</label>
                  <Input
                    value={kardexName}
                    onChange={(e) => setKardexName(e.target.value)}
                    placeholder="Nombre completo"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Teléfono</label>
                  <Input
                    value={kardexPhone}
                    onChange={(e) => setKardexPhone(e.target.value)}
                    placeholder="+52 123 456 7890"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Dirigido a / Propósito</label>
                  <Input
                    value={kardexAddressee}
                    onChange={(e) => setKardexAddressee(e.target.value)}
                    placeholder="A quien corresponda, Para trámites laborales, etc."
                  />
                </div>
              </>
            )}

            {kardexType === "constancia" && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nombre completo</label>
                  <Input
                    value={constanciaName}
                    onChange={(e) => setConstanciaName(e.target.value)}
                    placeholder="Nombre completo"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Género</label>
                  <Select value={constanciaGender} onValueChange={(v) => setConstanciaGender(v as "male" | "female")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Masculino</SelectItem>
                      <SelectItem value="female">Femenino</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Teléfono (opcional)</label>
                  <Input
                    value={constanciaPhone}
                    onChange={(e) => setConstanciaPhone(e.target.value)}
                    placeholder="+52 123 456 7890"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Dirigida a</label>
                  <Input
                    value={constanciaAddressee}
                    onChange={(e) => setConstanciaAddressee(e.target.value)}
                    placeholder="A quien corresponda"
                  />
                </div>
                <div className="border-t pt-4">
                  <h4 className="text-sm font-semibold mb-3">Datos del emisor</h4>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Nombre del emisor</label>
                      <Input
                        value={constanciaIssuerName}
                        onChange={(e) => setConstanciaIssuerName(e.target.value)}
                        placeholder="Juan Pérez"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Cargo</label>
                      <Select value={constanciaIssuerRole} onValueChange={setConstanciaIssuerRole}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="director">Director Académico</SelectItem>
                          <SelectItem value="coordinator">Coordinador Académico</SelectItem>
                          <SelectItem value="administrator">Administrador</SelectItem>
                          <SelectItem value="other">Otro (especificar)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {constanciaIssuerRole === "other" && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Especificar cargo</label>
                        <Input
                          value={constanciaIssuerCustomRole}
                          onChange={(e) => setConstanciaIssuerCustomRole(e.target.value)}
                          placeholder="Secretario General"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleGenerate} disabled={generating}>
              {generating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Generar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
