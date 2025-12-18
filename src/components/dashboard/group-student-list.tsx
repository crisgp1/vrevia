"use client"

import { useState } from "react"
import { toast } from "sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronRight, Award, Users, ClipboardCheck } from "lucide-react"
import { LEVELS, CURRICULUM, getLesson } from "@/lib/constants"
import { advanceStudentLesson, setStudentLesson } from "@/lib/actions/users"
import { advanceGroupLesson } from "@/lib/actions/groups"
import { addGrade } from "@/lib/actions/grades"
import { markGroupAttendance } from "@/lib/actions/attendance"

interface Student {
  id: string
  name: string
  email: string
  level?: string
  currentLesson: number
  isActive: boolean
}

interface GroupStudentListProps {
  groupId: string
  students: Student[]
  groupLevel: string
}

export function GroupStudentList({ groupId, students, groupLevel }: GroupStudentListProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false)
  const [attendanceDialogOpen, setAttendanceDialogOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [gradeScore, setGradeScore] = useState("")
  const [gradeType, setGradeType] = useState<"class" | "assessment" | "final">("class")
  const [attendanceLesson, setAttendanceLesson] = useState("")
  const [attendedStudents, setAttendedStudents] = useState<string[]>([])

  async function handleAdvanceAll() {
    setIsLoading(true)
    try {
      const result = await advanceGroupLesson(groupId)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success("Todos los alumnos avanzaron a la siguiente clase")
    } catch {
      toast.error("Error al avanzar lecciones")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleAdvanceStudent(student: Student) {
    setIsLoading(true)
    try {
      const result = await advanceStudentLesson(student.id)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success(`${student.name} avanzó a clase ${result.newLesson}`)
    } catch {
      toast.error("Error al avanzar lección")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSaveGrade() {
    if (!selectedStudent) return

    const score = parseFloat(gradeScore)
    if (isNaN(score) || score < 0 || score > 100) {
      toast.error("Calificación inválida (0-100)")
      return
    }

    setIsLoading(true)
    try {
      const result = await addGrade({
        studentId: selectedStudent.id,
        lesson: selectedStudent.currentLesson,
        type: gradeType,
        score,
      })

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success("Calificación guardada")
      setGradeDialogOpen(false)
      setGradeScore("")
      setSelectedStudent(null)
    } catch {
      toast.error("Error al guardar calificación")
    } finally {
      setIsLoading(false)
    }
  }

  function openAttendanceDialog() {
    // Default to most common lesson in the group
    const avgLesson = Math.round(students.reduce((sum, s) => sum + s.currentLesson, 0) / students.length)
    setAttendanceLesson(avgLesson.toString())
    setAttendedStudents(students.map(s => s.id)) // All present by default
    setAttendanceDialogOpen(true)
  }

  async function handleSaveAttendance() {
    const lesson = parseInt(attendanceLesson)
    if (isNaN(lesson) || lesson < 1 || lesson > 150) {
      toast.error("Número de clase inválido (1-150)")
      return
    }

    setIsLoading(true)
    try {
      const result = await markGroupAttendance(groupId, lesson, attendedStudents)

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success("Asistencia registrada correctamente")
      setAttendanceDialogOpen(false)
      setAttendanceLesson("")
      setAttendedStudents([])
    } catch {
      toast.error("Error al registrar asistencia")
    } finally {
      setIsLoading(false)
    }
  }

  function toggleStudentAttendance(studentId: string, checked: boolean) {
    if (checked) {
      setAttendedStudents(prev => [...prev, studentId])
    } else {
      setAttendedStudents(prev => prev.filter(id => id !== studentId))
    }
  }

  if (students.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <p className="mt-4 text-muted-foreground">No hay alumnos en este grupo</p>
        <p className="text-sm text-muted-foreground">
          Asigna alumnos desde la sección de Alumnos
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Alumnos del grupo</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={openAttendanceDialog} disabled={isLoading}>
            <ClipboardCheck className="mr-2 h-4 w-4" />
            Pasar asistencia
          </Button>
          <Button onClick={handleAdvanceAll} disabled={isLoading}>
            <ChevronRight className="mr-2 h-4 w-4" />
            Avanzar clase (todos)
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Alumno</TableHead>
              <TableHead>Nivel</TableHead>
              <TableHead>Clase actual</TableHead>
              <TableHead>Tema</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => {
              const lesson = getLesson(student.currentLesson)
              return (
                <TableRow key={student.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-xs text-muted-foreground">{student.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {student.level ? LEVELS[student.level as keyof typeof LEVELS] : "-"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono font-medium">
                      {student.currentLesson}/150
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[200px]">
                      <p className="text-sm truncate">{lesson?.grammar || "-"}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={student.isActive ? "default" : "secondary"}
                      className={student.isActive ? "bg-green-100 text-green-800" : ""}
                    >
                      {student.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedStudent(student)
                          setGradeDialogOpen(true)
                        }}
                        disabled={isLoading}
                      >
                        <Award className="mr-1 h-3 w-3" />
                        Calificar
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleAdvanceStudent(student)}
                        disabled={isLoading || student.currentLesson >= 150}
                      >
                        <ChevronRight className="mr-1 h-3 w-3" />
                        Avanzar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Grade Dialog */}
      <Dialog open={gradeDialogOpen} onOpenChange={setGradeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar calificación</DialogTitle>
            <DialogDescription>
              Califica a {selectedStudent?.name} en la clase {selectedStudent?.currentLesson}
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
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setGradeDialogOpen(false)
                setGradeScore("")
              }}
            >
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Pasar asistencia</DialogTitle>
            <DialogDescription>
              Selecciona la clase y marca los alumnos que asistieron
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
              <label className="text-sm font-medium">Alumnos ({attendedStudents.length} presentes)</label>
              <div className="max-h-[200px] overflow-y-auto border rounded-md p-3 space-y-3">
                {students.map((student) => (
                  <div key={student.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={`attendance-${student.id}`}
                      checked={attendedStudents.includes(student.id)}
                      onCheckedChange={(checked) => toggleStudentAttendance(student.id, checked === true)}
                    />
                    <label
                      htmlFor={`attendance-${student.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {student.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAttendanceDialogOpen(false)
                setAttendanceLesson("")
                setAttendedStudents([])
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleSaveAttendance} disabled={isLoading}>
              {isLoading ? "Guardando..." : "Guardar asistencia"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
