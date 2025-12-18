export const dynamic = 'force-dynamic'

import { getPayments, getPaymentsSummary } from "@/lib/actions/payments"
import { getStudents } from "@/lib/actions/users"
import { PaymentForm } from "@/components/dashboard/payment-form"
import { PaymentTable } from "@/components/dashboard/payment-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { DollarSign, Clock, TrendingUp } from "lucide-react"

export default async function PagosPage() {
  const [payments, students, summary] = await Promise.all([
    getPayments(),
    getStudents(),
    getPaymentsSummary(),
  ])

  const studentsForSelect = students.map((s) => ({ id: s.id, name: s.name }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pagos</h1>
          <p className="text-muted-foreground">
            Gestiona los pagos de tus alumnos
          </p>
        </div>
        <PaymentForm students={studentsForSelect} />
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Este mes
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(summary.thisMonth)}
            </div>
            <p className="text-xs text-muted-foreground">Pagos recibidos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pendientes
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {formatCurrency(summary.pending)}
            </div>
            <p className="text-xs text-muted-foreground">Por cobrar</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total histórico
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summary.totalPaid)}
            </div>
            <p className="text-xs text-muted-foreground">Pagos totales</p>
          </CardContent>
        </Card>
      </div>

      <PaymentTable payments={payments} />
    </div>
  )
}
