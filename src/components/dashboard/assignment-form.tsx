"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { FileUpload } from "@/components/ui/file-upload"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { createAssignmentSchema } from "@/lib/validations/assignment"
import { createAssignment, updateAssignment } from "@/lib/actions/assignments"
import { LEVELS, LEVEL_DETAILS, getLessonsByLevel } from "@/lib/constants"
import type { CreateAssignmentInput } from "@/lib/validations/assignment"
import { Plus, FileText, X, Edit2 } from "lucide-react"

interface Assignment {
  id: string
  title: string
  description: string
  dueDate: Date
  lesson?: number | null
  attachmentUrl?: string
  attachmentName?: string
  assignedTo: {
    type: "level" | "group" | "student"
    id: string
  }
}

interface AssignmentFormProps {
  groups: { id: string; name: string; level: string }[]
  students: { id: string; name: string }[]
  assignment?: Assignment
  trigger?: React.ReactNode
}

export function AssignmentForm({ groups, students, assignment, trigger }: AssignmentFormProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const isEditMode = !!assignment

  // Determine initial level from lesson number
  const getLevelFromLesson = (lesson: number | null | undefined): string => {
    if (!lesson) return "a1"
    if (lesson <= 30) return "a1"
    if (lesson <= 60) return "a2"
    if (lesson <= 90) return "b1"
    if (lesson <= 120) return "b2"
    return "b2plus"
  }

  const [selectedLevel, setSelectedLevel] = useState(
    assignment?.lesson ? getLevelFromLesson(assignment.lesson) : "a1"
  )
  const [isExtracurricular, setIsExtracurricular] = useState(!assignment?.lesson)

  const formatDateForInput = (date: Date) => {
    const d = new Date(date)
    return d.toISOString().slice(0, 16)
  }

  const [uploadedFile, setUploadedFile] = useState<{
    url: string
    name: string
  } | null>(assignment?.attachmentUrl ? { url: assignment.attachmentUrl, name: assignment.attachmentName || "Archivo" } : null)

  const form = useForm<CreateAssignmentInput>({
    resolver: zodResolver(createAssignmentSchema),
    defaultValues: {
      title: assignment?.title || "",
      description: assignment?.description || "",
      attachmentUrl: assignment?.attachmentUrl || "",
      attachmentName: assignment?.attachmentName || "",
      dueDate: assignment?.dueDate ? formatDateForInput(assignment.dueDate) : "",
      lesson: assignment?.lesson || null,
      assignedTo: assignment?.assignedTo || {
        type: "level",
        id: "basico",
      },
    },
  })

  const assignmentType = form.watch("assignedTo.type")
  const lessons = getLessonsByLevel(selectedLevel as "a1" | "a2" | "b1" | "b2" | "b2plus")

  async function onSubmit(data: CreateAssignmentInput) {
    setIsLoading(true)
    try {
      const payload = {
        ...data,
        lesson: isExtracurricular ? null : data.lesson,
        attachmentUrl: uploadedFile?.url,
        attachmentName: uploadedFile?.name,
      }

      const result = isEditMode
        ? await updateAssignment(assignment.id, payload)
        : await createAssignment(payload)

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success(isEditMode ? "Tarea actualizada exitosamente" : "Tarea creada exitosamente")
      if (!isEditMode) {
        form.reset()
        setUploadedFile(null)
      }
      setOpen(false)
    } catch {
      toast.error(isEditMode ? "Error al actualizar la tarea" : "Error al crear la tarea")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Crear tarea
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Editar tarea" : "Nueva tarea"}</DialogTitle>
          <DialogDescription>
            {isEditMode ? "Modifica los datos de la tarea" : "Crea una nueva tarea para tus alumnos"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Ejercicios de gramática" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instrucciones</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descripción de la tarea..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de entrega</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Lesson Selection */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="extracurricular"
                  checked={isExtracurricular}
                  onCheckedChange={(checked) => {
                    setIsExtracurricular(checked === true)
                    if (checked) {
                      form.setValue("lesson", null)
                    }
                  }}
                />
                <label
                  htmlFor="extracurricular"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Tarea extracurricular (sin clase específica)
                </label>
              </div>

              {!isExtracurricular && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <FormLabel>Nivel</FormLabel>
                    <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(LEVELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <FormField
                    control={form.control}
                    name="lesson"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Clase</FormLabel>
                        <Select
                          value={field.value?.toString() || ""}
                          onValueChange={(v) => field.onChange(parseInt(v))}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona clase" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {lessons.map((lesson) => (
                              <SelectItem key={lesson.lessonNumber} value={lesson.lessonNumber.toString()}>
                                Clase {lesson.lessonNumber} - {lesson.grammar.substring(0, 30)}...
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>

            {/* File Upload (optional) */}
            <div className="space-y-2">
              <FormLabel>Archivo adjunto (opcional)</FormLabel>
              {uploadedFile ? (
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="text-sm truncate max-w-[300px]">
                      {uploadedFile.name}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setUploadedFile(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 hover:border-muted-foreground/50 transition-colors">
                  <FileUpload
                    folder="assignments"
                    buttonVariant="secondary"
                    onUploadComplete={(file) => {
                      setUploadedFile({
                        url: file.url,
                        name: file.name,
                      })
                    }}
                  />
                </div>
              )}
            </div>

            {/* Assignment Type */}
            <FormField
              control={form.control}
              name="assignedTo.type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Asignar a</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value)
                      form.setValue("assignedTo.id", "")
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Tipo de asignación" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="level">Nivel completo</SelectItem>
                      <SelectItem value="group">Grupo específico</SelectItem>
                      <SelectItem value="student">Alumno individual</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Assignment Target */}
            <FormField
              control={form.control}
              name="assignedTo.id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {assignmentType === "level"
                      ? "Nivel"
                      : assignmentType === "group"
                      ? "Grupo"
                      : "Alumno"}
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {assignmentType === "level" &&
                        Object.entries(LEVELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      {assignmentType === "group" &&
                        groups.map((group) => (
                          <SelectItem key={group.id} value={group.id}>
                            {group.name}
                          </SelectItem>
                        ))}
                      {assignmentType === "student" &&
                        students.map((student) => (
                          <SelectItem key={student.id} value={student.id}>
                            {student.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
