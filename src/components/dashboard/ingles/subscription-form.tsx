"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createSubscription } from "@/lib/actions/english-subscriptions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { CreditCard } from "lucide-react"

interface SubscriptionFormProps {
  students: Array<{ _id: string; name: string; email: string }>
}

export function SubscriptionForm({ students }: SubscriptionFormProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState("")
  const [selectedType, setSelectedType] = useState<"monthly" | "annual">("monthly")

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const price = selectedType === "monthly" ? 499 : 4990

    const result = await createSubscription({
      studentId: selectedStudent,
      type: selectedType,
      price,
    })

    if (result.success) {
      toast.success("Suscripción creada exitosamente")
      setOpen(false)
      router.refresh()
    } else {
      toast.error(result.error || "Error al crear suscripción")
    }

    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <CreditCard className="h-4 w-4 mr-2" />
          Nueva Suscripción
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear Suscripción</DialogTitle>
          <DialogDescription>
            Asigna una suscripción a un estudiante del módulo de inglés
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="student">Estudiante *</Label>
            <Select
              value={selectedStudent}
              onValueChange={setSelectedStudent}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un estudiante" />
              </SelectTrigger>
              <SelectContent>
                {students.map((student) => (
                  <SelectItem key={student._id} value={student._id}>
                    {student.name} ({student.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tipo de Suscripción *</Label>
            <Select
              value={selectedType}
              onValueChange={(value) => setSelectedType(value as "monthly" | "annual")}
              required
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Mensual - $499 MXN</SelectItem>
                <SelectItem value="annual">Anual - $4,990 MXN</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {selectedType === "monthly"
                ? "Duración: 30 días"
                : "Duración: 365 días (ahorro del 17%)"}
            </p>
          </div>

          <div className="rounded-lg bg-muted p-4 space-y-2 text-sm">
            <p className="font-medium">Resumen:</p>
            <div className="flex justify-between">
              <span>Precio:</span>
              <span className="font-semibold">
                ${selectedType === "monthly" ? "499" : "4,990"} MXN
              </span>
            </div>
            <div className="flex justify-between">
              <span>Duración:</span>
              <span>{selectedType === "monthly" ? "30 días" : "365 días"}</span>
            </div>
            <div className="flex justify-between">
              <span>Estado inicial:</span>
              <span className="text-green-600 font-medium">Activa</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !selectedStudent}>
              {loading ? "Creando..." : "Crear Suscripción"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
