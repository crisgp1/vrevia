"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Calendar, Clock } from "lucide-react"
import { createClassRequest, getAvailableLessonsForClass } from "@/lib/actions/english-class-requests"
import { PRIVATE_CLASS_PRICE } from "@/lib/constants/english"

const AVAILABLE_TIMES = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
]

interface ClassRequestFormProps {
  studentId: string
}

export function ClassRequestForm({ studentId }: ClassRequestFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [lessons, setLessons] = useState<any[]>([])
  const [selectedLesson, setSelectedLesson] = useState("")
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [notes, setNotes] = useState("")

  // Load available lessons
  useEffect(() => {
    async function loadLessons() {
      const result = await getAvailableLessonsForClass()
      if (result.success) {
        setLessons(result.data || [])
      }
    }
    loadLessons()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!selectedLesson || !selectedDate || !selectedTime) {
      toast.error("Por favor completa todos los campos obligatorios")
      return
    }

    setLoading(true)

    const result = await createClassRequest({
      lessonNumber: parseInt(selectedLesson),
      requestedDate: selectedDate,
      requestedTime: selectedTime,
      notes: notes || undefined,
    })

    if (result.success) {
      toast.success("Solicitud enviada exitosamente")
      toast.info("Recibirás confirmación por email en las próximas 24 horas")
      router.push("/ingles/soporte")
    } else {
      toast.error(result.error || "Error al enviar solicitud")
    }

    setLoading(false)
  }

  const selectedLessonData = lessons.find((l) => l.lessonNumber === parseInt(selectedLesson))

  // Get minimum date (tomorrow)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split("T")[0]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detalles de la Clase</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Lesson Selection */}
          <div className="space-y-2">
            <Label htmlFor="lesson">Lección *</Label>
            <Select value={selectedLesson} onValueChange={setSelectedLesson} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona la lección que quieres reforzar" />
              </SelectTrigger>
              <SelectContent>
                {lessons.map((lesson) => (
                  <SelectItem key={lesson._id} value={lesson.lessonNumber.toString()}>
                    Lección {lesson.lessonNumber} - {lesson.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedLessonData && (
              <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                <p className="font-medium mb-1">Sobre esta lección:</p>
                <p>• Gramática: {selectedLessonData.grammar}</p>
                <p>• Vocabulario: {selectedLessonData.vocabulary}</p>
              </div>
            )}
          </div>

          {/* Date Selection */}
          <div className="space-y-2">
            <Label htmlFor="date">Fecha Preferida *</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="date"
                type="date"
                min={minDate}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="pl-9"
                required
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Debes agendar con al menos 24 horas de anticipación
            </p>
          </div>

          {/* Time Selection */}
          <div className="space-y-2">
            <Label htmlFor="time">Hora Preferida *</Label>
            <Select value={selectedTime} onValueChange={setSelectedTime} required>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Selecciona una hora" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_TIMES.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Horarios disponibles: Lunes a Viernes, 9:00 AM - 8:00 PM
            </p>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas Adicionales (Opcional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="¿Hay algún tema específico que quieres cubrir en la clase?"
              rows={3}
            />
          </div>

          {/* Price Summary */}
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <p className="font-medium text-sm">Resumen:</p>
            <div className="flex justify-between items-center">
              <span className="text-sm">Precio de la clase:</span>
              <span className="text-lg font-bold text-green-600">${PRIVATE_CLASS_PRICE} MXN</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Recibirás instrucciones de pago después de que tu solicitud sea confirmada
            </p>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || !selectedLesson || !selectedDate || !selectedTime}
            >
              {loading ? "Enviando..." : "Enviar Solicitud"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
