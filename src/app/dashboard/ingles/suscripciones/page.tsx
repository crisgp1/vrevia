import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { getEnglishSubscriptions } from "@/lib/actions/english-subscriptions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Calendar } from "lucide-react"
import {
  SUBSCRIPTION_STATUS_LABELS,
  SUBSCRIPTION_STATUS_COLORS,
  SUBSCRIPTION_TYPES,
  getDaysRemaining,
} from "@/lib/constants/english"
import { SubscriptionForm } from "@/components/dashboard/ingles/subscription-form"
import { getEnglishStudents } from "@/lib/actions/english-students"

export default async function SuscripcionesInglesPage() {
  const user = await getCurrentUser()

  if (!user || user.role !== "admin") {
    redirect("/")
  }

  const result = await getEnglishSubscriptions()
  const subscriptions = result.success ? result.data : []

  const studentsResult = await getEnglishStudents()
  const students = studentsResult.success ? studentsResult.data : []

  const activeSubs = subscriptions.filter(
    (s: any) => s.status === "active" && new Date(s.endDate) > new Date()
  )
  const expiringSoon = subscriptions.filter(
    (s: any) =>
      s.status === "active" &&
      getDaysRemaining(new Date(s.endDate)) <= 7 &&
      getDaysRemaining(new Date(s.endDate)) > 0
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Suscripciones</h1>
          <p className="text-muted-foreground mt-1">
            {subscriptions.length} suscripciones registradas • {activeSubs.length} activas
          </p>
        </div>
        <SubscriptionForm students={students} />
      </div>

      {/* Alerts */}
      {expiringSoon.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800">
              ⚠️ {expiringSoon.length} suscripciones por vencer
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-yellow-700">
            Hay {expiringSoon.length} suscripciones que vencen en los próximos 7 días
          </CardContent>
        </Card>
      )}

      {/* Subscriptions List */}
      {subscriptions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center space-y-4">
              <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">No hay suscripciones registradas</p>
              <p className="text-sm text-muted-foreground">
                Comienza creando la primera suscripción
              </p>
              {students.length > 0 ? (
                <SubscriptionForm students={students} />
              ) : (
                <p className="text-sm text-amber-600">
                  Primero registra un estudiante en el módulo
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {subscriptions.map((subscription: any) => {
            const daysRemaining = getDaysRemaining(new Date(subscription.endDate))
            const isActive = subscription.status === "active" && daysRemaining > 0

            return (
              <Card key={subscription._id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-lg">
                          {subscription.student?.name || "Estudiante"}
                        </CardTitle>
                        <Badge
                          className={
                            SUBSCRIPTION_STATUS_COLORS[
                              subscription.status as keyof typeof SUBSCRIPTION_STATUS_COLORS
                            ]
                          }
                        >
                          {
                            SUBSCRIPTION_STATUS_LABELS[
                              subscription.status as keyof typeof SUBSCRIPTION_STATUS_LABELS
                            ]
                          }
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {subscription.student?.email}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-5 text-sm">
                    <div>
                      <p className="text-muted-foreground">Tipo</p>
                      <p className="font-medium">
                        {
                          SUBSCRIPTION_TYPES[
                            subscription.type as keyof typeof SUBSCRIPTION_TYPES
                          ]?.name
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Precio</p>
                      <p className="font-medium">
                        ${subscription.price} {subscription.currency}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Inicio</p>
                      <p className="font-medium">
                        {new Date(subscription.startDate).toLocaleDateString("es-MX")}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Vencimiento</p>
                      <p className="font-medium">
                        {new Date(subscription.endDate).toLocaleDateString("es-MX")}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Días Restantes</p>
                      <p className="font-medium">
                        {isActive ? `${daysRemaining} días` : "Vencida"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
