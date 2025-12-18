export const dynamic = 'force-dynamic'

import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { getPaymentsByStudent } from "@/lib/actions/payments"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatShortDate, formatCurrency } from "@/lib/utils"
import { CreditCard, CheckCircle, Clock } from "lucide-react"

export default async function EstudiantePagosPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/")
  }

  if (user.role !== "student") {
    redirect("/dashboard")
  }

  const payments = await getPaymentsByStudent(user.id)

  const paidPayments = payments.filter((p) => p.status === "paid")
  const pendingPayments = payments.filter((p) => p.status === "pending")
  const totalPending = pendingPayments.reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mis pagos</h1>
        <p className="text-muted-foreground">
          Historial de pagos y estado de cuenta
        </p>
      </div>

      {/* Status Card */}
      <Card
        className={
          pendingPayments.length === 0
            ? "bg-gradient-to-r from-green-600 to-green-500 text-white"
            : "bg-gradient-to-r from-yellow-500 to-yellow-400 text-white"
        }
      >
        <CardContent className="flex items-center justify-between py-6">
          <div>
            <p className="text-sm opacity-90">Estado de cuenta</p>
            <p className="text-2xl font-bold">
              {pendingPayments.length === 0 ? "Al corriente" : "Con pendientes"}
            </p>
            {pendingPayments.length > 0 && (
              <p className="text-sm opacity-90 mt-1">
                Pendiente: {formatCurrency(totalPending)}
              </p>
            )}
          </div>
          {pendingPayments.length === 0 ? (
            <CheckCircle className="h-12 w-12 opacity-80" />
          ) : (
            <Clock className="h-12 w-12 opacity-80" />
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pagos realizados
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paidPayments.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pagos pendientes
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingPayments.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* History */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de pagos</CardTitle>
          <CardDescription>Todos tus pagos registrados</CardDescription>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No hay pagos registrados
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Concepto</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        {payment.concept}
                      </TableCell>
                      <TableCell>{formatCurrency(payment.amount)}</TableCell>
                      <TableCell>{formatShortDate(payment.date)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            payment.status === "paid" ? "default" : "secondary"
                          }
                          className={
                            payment.status === "paid"
                              ? "bg-green-100 text-green-800 hover:bg-green-100"
                              : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                          }
                        >
                          {payment.status === "paid" ? "Pagado" : "Pendiente"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
