"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  GraduationCap,
  Mail,
  Phone,
  Calendar,
  Users,
  BookOpen,
  ChevronRight,
  Edit2,
  Award,
  Settings,
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Pencil,
} from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { LEVELS, CLASS_TYPES, LEVEL_DETAILS, getLesson, CURRICULUM } from "@/lib/constants"
import { advanceStudentLesson, setStudentLesson, updateStudent } from "@/lib/actions/users"
import { addGrade } from "@/lib/actions/grades"
import { markAttendance } from "@/lib/actions/attendance"

interface Student {
  id: string
  name: string
  email: string
  phone: string
  level?: string
  currentLesson: number
  classType?: string
  group: { id: string; name: string; level: string } | null
  isActive: boolean
  startDate?: Date
  createdAt: Date
}

interface Grade {
  id: string
  lesson: number
  type: string
  score: number
  maxScore: number
  notes?: string
  isExtraordinary: boolean
  originalScore?: number
  originalGradedBy?: string
  originalGradedAt?: Date
  createdAt: Date
}

interface AttendanceRecord {
  id: string
  lesson: number
  attended: boolean
  status: "attended" | "absent_justified" | "absent_unjustified"
  date: Date
  notes?: string
}

interface Group {
  id: string
  name: string
  level: string
}

interface StudentDetailViewProps {
  student: Student
  grades: Grade[]
  attendance: AttendanceRecord[]
  groups: Group[]
}

export function StudentDetailView({ student, grades, attendance, groups }: StudentDetailViewProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false)
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false)
  const [attendanceDialogOpen, setAttendanceDialogOpen] = useState(false)
  const [newLessonNumber, setNewLessonNumber] = useState(student.currentLesson.toString())

  // Edit form state
  const [editLevel, setEditLevel] = useState(student.level || "a1")
  const [editClassType, setEditClassType] = useState(student.classType || "individual")
  const [editGroup, setEditGroup] = useState(student.group?.id || "")
  const [editPhone, setEditPhone] = useState(student.phone || "")

  // Grade form state
  const [gradeScore, setGradeScore] = useState("")
  const [gradeType, setGradeType] = useState<"class" | "assessment" | "final">("class")
  const [isExtraordinary, setIsExtraordinary] = useState(false)

  // Attendance form state
  const [attendanceLesson, setAttendanceLesson] = useState(student.currentLesson.toString())
  const [attendanceStatus, setAttendanceStatus] = useState<"attended" | "absent_justified" | "absent_unjustified">("attended")
  const [attendanceNotes, setAttendanceNotes] = useState("")

  const currentLessonData = getLesson(student.currentLesson)
  const levelDetails = student.level ? LEVEL_DETAILS[student.level as keyof typeof LEVEL_DETAILS] : null

  async function handleAdvanceLesson() {
    setIsLoading(true)
    try {
      const result = await advanceStudentLesson(student.id)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success(`Avanzado a clase ${result.newLesson}`)
      router.refresh()
    } catch {
      toast.error("Error al avanzar lección")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSetLesson() {
    const lessonNum = parseInt(newLessonNumber)
    if (isNaN(lessonNum) || lessonNum < 1 || lessonNum > 150) {
      toast.error("Número de lección inválido (1-150)")
      return
    }

    setIsLoading(true)
    try {
      const result = await setStudentLesson(student.id, lessonNum)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success(`Lección establecida a ${lessonNum}`)
      setLessonDialogOpen(false)
      router.refresh()
    } catch {
      toast.error("Error al establecer lección")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSaveEdit() {
    setIsLoading(true)
    try {
      const result = await updateStudent(student.id, {
        level: editLevel as "a1" | "a2" | "b1" | "b2" | "b2plus",
        classType: editClassType as "individual" | "grupal",
        group: editClassType === "grupal" ? editGroup : null,
        phone: editPhone,
      })

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success("Alumno actualizado")
      setEditDialogOpen(false)
      router.refresh()
    } catch {
      toast.error("Error al actualizar alumno")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSaveGrade() {
    const score = parseFloat(gradeScore)
    if (isNaN(score) || score < 0 || score > 100) {
      toast.error("Calificación inválida (0-100)")
      return
    }

    setIsLoading(true)
    try {
      const result = await addGrade({
        studentId: student.id,
        lesson: student.currentLesson,
        type: gradeType,
        score,
        isExtraordinary,
      })

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success(isExtraordinary ? "Calificación extraordinaria guardada" : "Calificación guardada")
      setGradeDialogOpen(false)
      setGradeScore("")
      setIsExtraordinary(false)
      router.refresh()
    } catch {
      toast.error("Error al guardar calificación")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleMarkAttendance() {
    const lesson = parseInt(attendanceLesson)
    if (isNaN(lesson) || lesson < 1 || lesson > 150) {
      toast.error("Número de clase inválido (1-150)")
      return
    }

    setIsLoading(true)
    try {
      const result = await markAttendance(student.id, lesson, attendanceStatus, attendanceNotes || undefined)

      if (result.error) {
        toast.error(result.error)
        return
      }

      const statusMessages = {
        attended: "Asistencia registrada (consumido)",
        absent_justified: "Falta registrada (sin contar hora)",
        absent_unjustified: "Falta registrada (irrecuperable)",
      }
      toast.success(statusMessages[attendanceStatus])
      setAttendanceDialogOpen(false)
      setAttendanceNotes("")
      router.refresh()
    } catch {
      toast.error("Error al registrar asistencia")
    } finally {
      setIsLoading(false)
    }
  }

  const statusLabels = {
    attended: { label: "Consumido", color: "bg-green-100 text-green-800", icon: CheckCircle2 },
    absent_justified: { label: "Falta (sin contar)", color: "bg-yellow-100 text-yellow-800", icon: Clock },
    absent_unjustified: { label: "Irrecuperable", color: "bg-red-100 text-red-800", icon: XCircle },
  }

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Student Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Información
              <Button variant="ghost" size="icon" onClick={() => setEditDialogOpen(true)}>
                <Settings className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{student.email}</span>
            </div>
            {student.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{student.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {student.classType ? CLASS_TYPES[student.classType as keyof typeof CLASS_TYPES] : "Sin asignar"}
              </span>
            </div>
            {student.group && (
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{student.group.name}</span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                Desde {new Date(student.createdAt).toLocaleDateString("es-MX")}
              </span>
            </div>
            <div className="pt-2">
              <Badge variant={student.isActive ? "default" : "secondary"}>
                {student.isActive ? "Activo" : "Inactivo"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Progress Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Progreso
            </CardTitle>
            <CardDescription>
              {student.level
                ? `Nivel ${LEVELS[student.level as keyof typeof LEVELS]}`
                : "Sin nivel asignado"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {student.level ? (
              <div className="space-y-6">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Clase {student.currentLesson} de 150</span>
                    <span className="text-muted-foreground">
                      {Math.round((student.currentLesson / 150) * 100)}% completado
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${(student.currentLesson / 150) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Current Lesson Info */}
                {currentLessonData && (
                  <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                    <h4 className="font-medium">Clase actual: {student.currentLesson}</h4>
                    <p className="text-sm"><strong>Gramática:</strong> {currentLessonData.grammar}</p>
                    <p className="text-sm"><strong>Vocabulario:</strong> {currentLessonData.vocabulary}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  <Button onClick={handleAdvanceLesson} disabled={isLoading || student.currentLesson >= 150}>
                    <ChevronRight className="mr-2 h-4 w-4" />
                    Avanzar clase
                  </Button>
                  <Button variant="outline" onClick={() => setLessonDialogOpen(true)} disabled={isLoading}>
                    <Edit2 className="mr-2 h-4 w-4" />
                    Cambiar clase
                  </Button>
                  <Button variant="outline" onClick={() => setGradeDialogOpen(true)} disabled={isLoading}>
                    <Award className="mr-2 h-4 w-4" />
                    Calificar
                  </Button>
                  <Button variant="outline" onClick={() => setAttendanceDialogOpen(true)} disabled={isLoading}>
                    <ClipboardCheck className="mr-2 h-4 w-4" />
                    Asistencia
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <GraduationCap className="mx-auto h-10 w-10 text-muted-foreground/50" />
                <p className="mt-2 text-muted-foreground">Este alumno no tiene nivel asignado</p>
                <Button className="mt-4" onClick={() => setEditDialogOpen(true)}>
                  <Settings className="mr-2 h-4 w-4" />
                  Configurar nivel
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Grades Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Calificaciones
          </CardTitle>
          <CardDescription>
            Historial de evaluaciones del alumno
          </CardDescription>
        </CardHeader>
        <CardContent>
          {grades.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed rounded-lg">
              <Award className="mx-auto h-10 w-10 text-muted-foreground/50" />
              <p className="mt-2 text-muted-foreground">No hay calificaciones registradas</p>
              {student.level && (
                <Button variant="link" className="mt-2" onClick={() => setGradeDialogOpen(true)}>
                  Agregar calificación
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Clase</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Calificación</TableHead>
                  <TableHead>Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {grades.map((grade) => (
                  <TableRow key={grade.id}>
                    <TableCell>Clase {grade.lesson}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {grade.type === "class" ? "Clase" : grade.type === "assessment" ? "Evaluación" : "Final"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {grade.isExtraordinary && grade.originalScore !== undefined ? (
                        <div className="flex items-center gap-2">
                          <span className="line-through text-muted-foreground text-sm">
                            {grade.originalScore}/{grade.maxScore}
                          </span>
                          <Pencil className="h-3 w-3 text-muted-foreground" />
                          <span className={`font-medium ${grade.score >= 70 ? "text-green-600" : "text-red-600"}`}>
                            {grade.score}/{grade.maxScore}
                          </span>
                        </div>
                      ) : (
                        <span className={`font-medium ${grade.score >= 70 ? "text-green-600" : "text-red-600"}`}>
                          {grade.score}/{grade.maxScore}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(grade.createdAt).toLocaleDateString("es-MX")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Attendance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5" />
            Asistencia
          </CardTitle>
          <CardDescription>
            Historial de asistencias del alumno
          </CardDescription>
        </CardHeader>
        <CardContent>
          {attendance.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed rounded-lg">
              <ClipboardCheck className="mx-auto h-10 w-10 text-muted-foreground/50" />
              <p className="mt-2 text-muted-foreground">No hay asistencias registradas</p>
              {student.level && (
                <Button variant="link" className="mt-2" onClick={() => setAttendanceDialogOpen(true)}>
                  Registrar asistencia
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Clase</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Notas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendance.map((record) => {
                  const statusInfo = statusLabels[record.status] || statusLabels.attended
                  const StatusIcon = statusInfo.icon
                  return (
                    <TableRow key={record.id}>
                      <TableCell>Clase {record.lesson}</TableCell>
                      <TableCell>
                        <Badge className={statusInfo.color}>
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {statusInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(record.date).toLocaleDateString("es-MX")}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {record.notes || "-"}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurar alumno</DialogTitle>
            <DialogDescription>
              Establece el nivel, tipo de clase y grupo para {student.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Teléfono</label>
              <Input
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                placeholder="+52 33 1234 5678"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Nivel</label>
              <Select value={editLevel} onValueChange={setEditLevel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(LEVELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label} (Clases {LEVEL_DETAILS[value as keyof typeof LEVEL_DETAILS]?.classes})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de clase</label>
              <Select value={editClassType} onValueChange={setEditClassType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CLASS_TYPES).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {editClassType === "grupal" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Grupo</label>
                <Select value={editGroup} onValueChange={setEditGroup}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un grupo" />
                  </SelectTrigger>
                  <SelectContent>
                    {groups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name} ({LEVELS[group.level as keyof typeof LEVELS]})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit} disabled={isLoading}>
              {isLoading ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Set Lesson Dialog */}
      <Dialog open={lessonDialogOpen} onOpenChange={setLessonDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar clase</DialogTitle>
            <DialogDescription>
              El nivel se actualizará automáticamente según la clase
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              type="number"
              min={1}
              max={150}
              value={newLessonNumber}
              onChange={(e) => setNewLessonNumber(e.target.value)}
              placeholder="Número de clase (1-150)"
            />
            <p className="text-xs text-muted-foreground mt-2">
              A1: 1-30 | A2: 31-60 | B1: 61-90 | B2: 91-120 | B2+: 121-150
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLessonDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSetLesson} disabled={isLoading}>
              {isLoading ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Grade Dialog */}
      <Dialog open={gradeDialogOpen} onOpenChange={setGradeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar calificación</DialogTitle>
            <DialogDescription>
              Califica la clase {student.currentLesson}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de evaluación</label>
              <Select value={gradeType} onValueChange={(v) => setGradeType(v as typeof gradeType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="class">Clase regular</SelectItem>
                  <SelectItem value="assessment">Evaluación</SelectItem>
                  <SelectItem value="final">Examen final de nivel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Calificación (0-100)</label>
              <Input
                type="number"
                min={0}
                max={100}
                value={gradeScore}
                onChange={(e) => setGradeScore(e.target.value)}
                placeholder="85"
              />
            </div>
            <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
              <Checkbox
                id="extraordinary"
                checked={isExtraordinary}
                onCheckedChange={(checked) => setIsExtraordinary(checked === true)}
              />
              <label
                htmlFor="extraordinary"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Calificación extraordinaria (reemplaza la anterior)
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGradeDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveGrade} disabled={isLoading}>
              {isLoading ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Attendance Dialog */}
      <Dialog open={attendanceDialogOpen} onOpenChange={setAttendanceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar asistencia</DialogTitle>
            <DialogDescription>
              Registra la asistencia para {student.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Número de clase</label>
              <Input
                type="number"
                min={1}
                max={150}
                value={attendanceLesson}
                onChange={(e) => setAttendanceLesson(e.target.value)}
                placeholder="1-150"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Estado</label>
              <Select value={attendanceStatus} onValueChange={(v) => setAttendanceStatus(v as typeof attendanceStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="attended">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      Consumido (asistió)
                    </div>
                  </SelectItem>
                  <SelectItem value="absent_justified">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-yellow-600" />
                      Falta sin contar hora pagada
                    </div>
                  </SelectItem>
                  <SelectItem value="absent_unjustified">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      Irrecuperable
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Notas (opcional)</label>
              <Input
                value={attendanceNotes}
                onChange={(e) => setAttendanceNotes(e.target.value)}
                placeholder="Razón de la falta, etc."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAttendanceDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleMarkAttendance} disabled={isLoading}>
              {isLoading ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
