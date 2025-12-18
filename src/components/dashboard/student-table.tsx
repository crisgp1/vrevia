"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { MoreHorizontal, UserX, UserCheck, Trash2, ChevronRight, Edit2, Eye, Settings } from "lucide-react"
import { LEVELS, CLASS_TYPES, LEVEL_DETAILS } from "@/lib/constants"
import { toggleStudentStatus, deleteStudent, advanceStudentLesson, setStudentLesson } from "@/lib/actions/users"

interface Student {
  id: string
  email: string
  name: string
  phone: string
  level?: string
  currentLesson: number
  classType?: string
  group: { id: string; name: string } | null
  isActive: boolean
  createdAt: Date
}

interface StudentTableProps {
  students: Student[]
}

export function StudentTable({ students }: StudentTableProps) {
  const router = useRouter()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [newLessonNumber, setNewLessonNumber] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  async function handleToggleStatus(student: Student) {
    setIsLoading(true)
    try {
      const result = await toggleStudentStatus(student.id)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success(
        result.isActive
          ? "Alumno activado exitosamente"
          : "Alumno desactivado exitosamente"
      )
    } catch {
      toast.error("Error al cambiar el estado del alumno")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleAdvanceLesson(student: Student) {
    setIsLoading(true)
    try {
      const result = await advanceStudentLesson(student.id)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success(`Avanzado a clase ${result.newLesson}`)
    } catch {
      toast.error("Error al avanzar lección")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSetLesson() {
    if (!selectedStudent) return

    const lessonNum = parseInt(newLessonNumber)
    if (isNaN(lessonNum) || lessonNum < 1 || lessonNum > 150) {
      toast.error("Número de lección inválido (1-150)")
      return
    }

    setIsLoading(true)
    try {
      const result = await setStudentLesson(selectedStudent.id, lessonNum)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success(`Lección establecida a ${lessonNum}`)
      setLessonDialogOpen(false)
      setNewLessonNumber("")
      setSelectedStudent(null)
    } catch {
      toast.error("Error al establecer lección")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDelete() {
    if (!selectedStudent) return

    setIsLoading(true)
    try {
      const result = await deleteStudent(selectedStudent.id)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success("Alumno eliminado exitosamente")
      setDeleteDialogOpen(false)
      setSelectedStudent(null)
    } catch {
      toast.error("Error al eliminar el alumno")
    } finally {
      setIsLoading(false)
    }
  }

  if (students.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No hay alumnos registrados</p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Nivel</TableHead>
              <TableHead>Progreso</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Grupo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id}>
                <TableCell>
                  <button
                    onClick={() => router.push(`/dashboard/alumnos/${student.id}`)}
                    className="font-medium hover:text-primary hover:underline text-left"
                  >
                    {student.name}
                  </button>
                </TableCell>
                <TableCell>{student.email}</TableCell>
                <TableCell>
                  {student.level ? (
                    <Badge variant="outline">
                      {LEVELS[student.level as keyof typeof LEVELS]}
                    </Badge>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell>
                  {student.level ? (
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium">
                        Clase {student.currentLesson}/{LEVEL_DETAILS[student.level as keyof typeof LEVEL_DETAILS]?.totalClasses ?
                          (student.level === "a1" ? 30 : student.level === "a2" ? 60 : student.level === "b1" ? 90 : student.level === "b2" ? 120 : 150) : 150}
                      </span>
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${(student.currentLesson / 150) * 100}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell>
                  {student.classType
                    ? CLASS_TYPES[student.classType as keyof typeof CLASS_TYPES]
                    : "-"}
                </TableCell>
                <TableCell>{student.group?.name || "-"}</TableCell>
                <TableCell>
                  <Badge
                    variant={student.isActive ? "default" : "secondary"}
                    className={
                      student.isActive
                        ? "bg-green-100 text-green-800 hover:bg-green-100"
                        : ""
                    }
                  >
                    {student.isActive ? "Activo" : "Inactivo"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" disabled={isLoading}>
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Acciones</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => router.push(`/dashboard/alumnos/${student.id}`)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Ver detalles
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => router.push(`/dashboard/alumnos/${student.id}`)}
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Configurar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {student.level && (
                        <>
                          <DropdownMenuItem
                            onClick={() => handleAdvanceLesson(student)}
                            disabled={student.currentLesson >= 150}
                          >
                            <ChevronRight className="mr-2 h-4 w-4" />
                            Avanzar clase
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedStudent(student)
                              setNewLessonNumber(student.currentLesson.toString())
                              setLessonDialogOpen(true)
                            }}
                          >
                            <Edit2 className="mr-2 h-4 w-4" />
                            Cambiar clase
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                      )}
                      <DropdownMenuItem
                        onClick={() => handleToggleStatus(student)}
                      >
                        {student.isActive ? (
                          <>
                            <UserX className="mr-2 h-4 w-4" />
                            Desactivar
                          </>
                        ) : (
                          <>
                            <UserCheck className="mr-2 h-4 w-4" />
                            Activar
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => {
                          setSelectedStudent(student)
                          setDeleteDialogOpen(true)
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar alumno</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar a {selectedStudent?.name}?
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading ? "Eliminando..." : "Eliminar"}
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
              Establece la clase actual para {selectedStudent?.name}.
              El nivel se actualizará automáticamente según la clase.
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
            <Button
              variant="outline"
              onClick={() => {
                setLessonDialogOpen(false)
                setNewLessonNumber("")
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSetLesson}
              disabled={isLoading}
            >
              {isLoading ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
