import { redirect } from "next/navigation"
import { getEnglishStudent } from "@/lib/auth/english"
import { getMySubscription } from "@/lib/actions/english-subscriptions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  SUBSCRIPTION_STATUS_LABELS,
  SUBSCRIPTION_STATUS_COLORS,
  SUBSCRIPTION_TYPES,
  getDaysRemaining,
  isSubscriptionExpiringSoon
} from "@/lib/constants/english"
import { Calendar, CreditCard, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default async function SuscripcionPage() {
  const student = await getEnglishStudent()

  if (!student) {
    redirect("/")
  }

  const result = await getMySubscription()
  const subscription = result.success ? result.data : null

  const isActive = subscription?.status === "active" && new Date(subscription.endDate) > new Date()
  const daysRemaining = subscription?.endDate ? getDaysRemaining(new Date(subscription.endDate)) : 0
  const expiringSoon = subscription?.endDate ? isSubscriptionExpiringSoon(new Date(subscription.endDate)) : false

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Mi Suscripción</h1>
        <p className="text-muted-foreground mt-1">
          Gestiona tu suscripción al curso de inglés
        </p>
      </div>

      {/* Expiring Soon Alert */}
      {isActive && expiringSoon && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Tu suscripción está por vencer</AlertTitle>
          <AlertDescription>
            Te quedan {daysRemaining} días. Contacta al administrador para renovar.
          </AlertDescription>
        </Alert>
      )}

      {/* Subscription Info */}
      {subscription ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Estado de Suscripción</CardTitle>
              <Badge className={SUBSCRIPTION_STATUS_COLORS[subscription.status as keyof typeof SUBSCRIPTION_STATUS_COLORS]}>
                {SUBSCRIPTION_STATUS_LABELS[subscription.status as keyof typeof SUBSCRIPTION_STATUS_LABELS]}
              </Badge>
            </div>
            <CardDescription>
              Detalles de tu plan actual
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tipo de Plan</p>
                <p className="text-lg font-semibold">
                  {SUBSCRIPTION_TYPES[subscription.type as keyof typeof SUBSCRIPTION_TYPES]?.name || subscription.type}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Precio</p>
                <p className="text-lg font-semibold">
                  ${subscription.price} {subscription.currency}
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Fecha de Inicio</p>
                  <p className="text-sm">
                    {new Date(subscription.startDate).toLocaleDateString("es-MX")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Fecha de Vencimiento</p>
                  <p className="text-sm">
                    {new Date(subscription.endDate).toLocaleDateString("es-MX")}
                  </p>
                </div>
              </div>
            </div>

            {isActive && (
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">Tiempo restante</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.max(0, Math.min(100, (daysRemaining / (subscription.type === "monthly" ? 30 : 365)) * 100))}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium">{daysRemaining} días</span>
                </div>
              </div>
            )}

            {subscription.paymentMethod && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CreditCard className="h-4 w-4" />
                <span>Método de pago: {subscription.paymentMethod}</span>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Sin Suscripción Activa</CardTitle>
            <CardDescription>
              No tienes una suscripción al curso de inglés
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Contacta al administrador para obtener acceso al curso de inglés.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle>Beneficios de tu Suscripción</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {subscription && SUBSCRIPTION_TYPES[subscription.type as keyof typeof SUBSCRIPTION_TYPES]?.features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2 text-sm">
                <span className="text-green-600">✓</span>
                {feature}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Renewal Info */}
      {!isActive && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Renovación Necesaria</AlertTitle>
          <AlertDescription>
            Tu suscripción ha vencido. Contacta al administrador para renovar tu acceso al curso.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
