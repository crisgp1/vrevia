"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, CreditCard } from "lucide-react"
import Link from "next/link"

interface SubscriptionStatus {
  hasActiveSubscription: boolean
  subscriptionType?: string
  subscriptionEndDate?: string
}

export function SubscriptionGuard({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<SubscriptionStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkSubscription() {
      try {
        const response = await fetch("/api/ingles/subscription/validate")
        const data = await response.json()

        setStatus(data)
      } catch (error) {
        console.error("Error verificando suscripción:", error)
        setStatus({ hasActiveSubscription: false })
      } finally {
        setLoading(false)
      }
    }

    checkSubscription()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando suscripción...</p>
        </div>
      </div>
    )
  }

  if (!status?.hasActiveSubscription) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center gap-2 text-yellow-600 mb-2">
              <AlertCircle className="h-5 w-5" />
              <CardTitle>Suscripción Requerida</CardTitle>
            </div>
            <CardDescription>
              Necesitas una suscripción activa para acceder al contenido del curso de inglés
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Obtén acceso ilimitado a:
            </p>
            <ul className="text-sm space-y-2 text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                150 lecciones de inglés profesional
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                Ejercicios interactivos ilimitados
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                Seguimiento de progreso personalizado
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                Certificados al completar cada nivel
              </li>
            </ul>
            <Button asChild className="w-full">
              <Link href="/ingles/suscripcion">
                <CreditCard className="h-4 w-4 mr-2" />
                Ver Planes de Suscripción
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
