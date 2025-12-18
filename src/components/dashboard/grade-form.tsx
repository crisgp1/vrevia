"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
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
import { Checkbox } from "@/components/ui/checkbox"
import { gradeSubmissionSchema } from "@/lib/validations/assignment"
import { gradeSubmission, gradeStudentWithoutSubmission } from "@/lib/actions/assignments"
import type { GradeSubmissionInput } from "@/lib/validations/assignment"
import { Star } from "lucide-react"

interface GradeFormPropsWithSubmission {
  submissionId: string
  currentGrade: number | null | undefined
  currentFeedback: string
  assignmentId?: never
  studentId?: never
  studentName?: never
}

interface GradeFormPropsWithoutSubmission {
  submissionId?: never
  assignmentId: string
  studentId: string
  studentName: string
  currentGrade: number | null | undefined
  currentFeedback: string
}

type GradeFormProps = GradeFormPropsWithSubmission | GradeFormPropsWithoutSubmission

export function GradeForm(props: GradeFormProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const isSubmissionMode = "submissionId" in props && !!props.submissionId
  const { currentGrade, currentFeedback } = props

  const form = useForm<GradeSubmissionInput>({
    resolver: zodResolver(gradeSubmissionSchema),
    defaultValues: {
      grade: currentGrade ?? 0,
      feedback: currentFeedback || "",
      isExtraordinary: false,
    },
  })

  async function onSubmit(data: GradeSubmissionInput) {
    setIsLoading(true)
    try {
      let result

      if (props.submissionId) {
        result = await gradeSubmission(props.submissionId, data)
      } else if (props.assignmentId && props.studentId) {
        result = await gradeStudentWithoutSubmission(props.assignmentId, props.studentId, data)
      } else {
        toast.error("Error: datos incompletos para calificar")
        return
      }

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success("Calificación guardada exitosamente")
      setOpen(false)
    } catch {
      toast.error("Error al guardar la calificación")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">
          <Star className="mr-2 h-4 w-4" />
          {currentGrade !== null && currentGrade !== undefined ? "Editar" : "Calificar"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>
            {isSubmissionMode ? "Calificar entrega" : `Calificar a ${"studentName" in props ? props.studentName : "alumno"}`}
          </DialogTitle>
          <DialogDescription>
            {isSubmissionMode
              ? "Asigna una calificación y retroalimentación"
              : "Califica al alumno aunque no haya entregado"
            }
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="grade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Calificación (0-100)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="feedback"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Retroalimentación (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Comentarios para el alumno..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isExtraordinary"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-amber-50">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Calificación extraordinaria</FormLabel>
                    <p className="text-xs text-muted-foreground">
                      Marcar si es un acuerdo especial con el alumno
                    </p>
                  </div>
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
