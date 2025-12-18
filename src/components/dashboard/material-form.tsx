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
import { createMaterial } from "@/lib/actions/materials"
import { LEVELS, LEVEL_DETAILS, getLesson } from "@/lib/constants"
import { Plus, FileText, X } from "lucide-react"
import { z } from "zod"

const formSchema = z.object({
  title: z.string().min(2, "El título debe tener al menos 2 caracteres"),
  description: z.string().optional(),
  fileUrl: z.string(),
  fileName: z.string(),
  lesson: z.number().min(1).max(150),
  restrictTo: z.enum(["all", "group", "student"]),
  restrictId: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface MaterialFormProps {
  groups: { id: string; name: string; level: string }[]
  students: { id: string; name: string }[]
}

export function MaterialForm({ groups, students }: MaterialFormProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<{
    url: string
    name: string
  } | null>(null)
  const [selectedLevel, setSelectedLevel] = useState<string>("a1")

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      fileUrl: "",
      fileName: "",
      lesson: 1,
      restrictTo: "all",
      restrictId: "",
    },
  })

  const restrictTo = form.watch("restrictTo")
  const lessonNumber = form.watch("lesson")
  const lessonData = getLesson(lessonNumber)

  // Get lessons for selected level
  const getLessonsForLevel = (level: string) => {
    const details = LEVEL_DETAILS[level as keyof typeof LEVEL_DETAILS]
    if (!details) return []

    const [start, end] = details.classes.split("-").map(Number)
    const lessons = []
    for (let i = start; i <= end; i++) {
      const lesson = getLesson(i)
      if (lesson) {
        lessons.push({ number: i, grammar: lesson.grammar })
      }
    }
    return lessons
  }

  async function onSubmit(data: FormData) {
    if (!uploadedFile) {
      toast.error("Por favor sube un archivo PDF")
      return
    }

    setIsLoading(true)
    try {
      const materialData = {
        title: data.title,
        description: data.description,
        fileUrl: uploadedFile.url,
        fileName: uploadedFile.name,
        lesson: data.lesson,
        assignedTo: data.restrictTo !== "all" && data.restrictId ? {
          type: data.restrictTo as "group" | "student",
          id: data.restrictId,
        } : undefined,
      }

      const result = await createMaterial(materialData)

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success("Material creado exitosamente")
      form.reset()
      setUploadedFile(null)
      setOpen(false)
    } catch {
      toast.error("Error al crear el material")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Subir material
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nuevo material</DialogTitle>
          <DialogDescription>
            Sube un archivo PDF asociado a una clase específica
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
                    <Input placeholder="Gramática Básica - Unidad 1" {...field} />
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
                  <FormLabel>Descripción (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descripción del material..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* File Upload */}
            <div className="space-y-2">
              <FormLabel>Archivo PDF</FormLabel>
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
                    folder="materials"
                    buttonVariant="default"
                    onUploadComplete={(file) => {
                      setUploadedFile({
                        url: file.url,
                        name: file.name,
                      })
                      form.setValue("fileUrl", file.url)
                      form.setValue("fileName", file.name)
                    }}
                  />
                </div>
              )}
            </div>

            {/* Level Selection */}
            <div className="space-y-2">
              <FormLabel>Nivel</FormLabel>
              <Select value={selectedLevel} onValueChange={(v) => {
                setSelectedLevel(v)
                // Set first lesson of level as default
                const details = LEVEL_DETAILS[v as keyof typeof LEVEL_DETAILS]
                if (details) {
                  const start = parseInt(details.classes.split("-")[0])
                  form.setValue("lesson", start)
                }
              }}>
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

            {/* Lesson Selection */}
            <FormField
              control={form.control}
              name="lesson"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Clase</FormLabel>
                  <Select
                    value={field.value.toString()}
                    onValueChange={(v) => field.onChange(parseInt(v))}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-60">
                      {getLessonsForLevel(selectedLevel).map((lesson) => (
                        <SelectItem key={lesson.number} value={lesson.number.toString()}>
                          Clase {lesson.number}: {lesson.grammar.substring(0, 40)}...
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {lessonData && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {lessonData.grammar}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Restrict to specific group/student (optional) */}
            <FormField
              control={form.control}
              name="restrictTo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Visible para</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value)
                      form.setValue("restrictId", "")
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="all">Todos los alumnos de esta clase</SelectItem>
                      <SelectItem value="group">Solo un grupo específico</SelectItem>
                      <SelectItem value="student">Solo un alumno específico</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Group/Student selection if restricted */}
            {restrictTo !== "all" && (
              <FormField
                control={form.control}
                name="restrictId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {restrictTo === "group" ? "Grupo" : "Alumno"}
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {restrictTo === "group" &&
                          groups.map((group) => (
                            <SelectItem key={group.id} value={group.id}>
                              {group.name} ({LEVELS[group.level as keyof typeof LEVELS]})
                            </SelectItem>
                          ))}
                        {restrictTo === "student" &&
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
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading || !uploadedFile}>
                {isLoading ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
