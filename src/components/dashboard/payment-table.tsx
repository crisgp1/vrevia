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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { MoreHorizontal, CheckCircle, XCircle, Trash2 } from "lucide-react"
import { formatShortDate, formatCurrency } from "@/lib/utils"
import { togglePaymentStatus, deletePayment } from "@/lib/actions/payments"

interface Payment {
  id: string
  studentName: string
  studentEmail: string
  amount: number
  concept: string
  date: Date
  status: "paid" | "pending"
}

interface PaymentTableProps {
  payments: Payment[]
}

export function PaymentTable({ payments }: PaymentTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleToggleStatus(payment: Payment) {
    setIsLoading(true)
    try {
      const result = await togglePaymentStatus(payment.id)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success(
        result.status === "paid"
          ? "Pago marcado como pagado"
          : "Pago marcado como pendiente"
      )
    } catch {
      toast.error("Error al cambiar el estado del pago")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDelete() {
    if (!selectedPayment) return

    setIsLoading(true)
    try {
      const result = await deletePayment(selectedPayment.id)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success("Pago eliminado exitosamente")
      setDeleteDialogOpen(false)
      setSelectedPayment(null)
    } catch {
      toast.error("Error al eliminar el pago")
    } finally {
      setIsLoading(false)
    }
  }

  if (payments.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No hay pagos registrados</p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Alumno</TableHead>
              <TableHead>Concepto</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{payment.studentName}</p>
                    <p className="text-xs text-muted-foreground">
                      {payment.studentEmail}
                    </p>
                  </div>
                </TableCell>
                <TableCell>{payment.concept}</TableCell>
                <TableCell className="font-medium">
                  {formatCurrency(payment.amount)}
                </TableCell>
                <TableCell>{formatShortDate(payment.date)}</TableCell>
                <TableCell>
                  <Badge
                    variant={payment.status === "paid" ? "default" : "secondary"}
                    className={
                      payment.status === "paid"
                        ? "bg-green-100 text-green-800 hover:bg-green-100"
                        : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                    }
                  >
                    {payment.status === "paid" ? "Pagado" : "Pendiente"}
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
                        onClick={() => handleToggleStatus(payment)}
                      >
                        {payment.status === "paid" ? (
                          <>
                            <XCircle className="mr-2 h-4 w-4" />
                            Marcar pendiente
                          </>
                        ) : (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Marcar pagado
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => {
                          setSelectedPayment(payment)
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
            <DialogTitle>Eliminar pago</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar este pago de{" "}
              {selectedPayment?.studentName}? Esta acción no se puede deshacer.
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
    </>
  )
}
