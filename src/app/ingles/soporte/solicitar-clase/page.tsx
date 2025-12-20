import { redirect } from "next/navigation"
import { requireActiveSubscription } from "@/lib/auth/english"
import { getMyClassRequests } from "@/lib/actions/english-class-requests"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info, AlertTriangle } from "lucide-react"
import { ClassRequestForm } from "@/components/ingles/class-request-form"
import {
  PRIVATE_CLASS_PRICE,
  PRIVATE_CLASS_MAX_PER_LEVEL,
  PRIVATE_CLASS_DISCOUNT_THRESHOLD,
  PRIVATE_CLASS_BULK_DISCOUNT,
} from "@/lib/constants/english"

export default async function SolicitarClasePage() {
  let session
  let myRequests = []
  let activeRequests = []

  try {
    session = await requireActiveSubscription()
  } catch (error: any) {
    console.error("Error getting session:", error.message)
    redirect("/ingles")
  }

  try {
    // Get user's class requests to check limits
    const requestsResult = await getMyClassRequests()
    myRequests = requestsResult.success ? requestsResult.data : []
  } catch (error) {
    console.error("Error loading class requests:", error)
    // Continue without requests data
  }

  // Count classes for current level (all statuses except cancelled)
  const currentLevelRequests = myRequests.filter(
    (r: any) => {
      const lesson = r.lesson
      if (!lesson) return false
      return lesson.level === session.currentLevel && r.status !== "cancelled"
    }
  )

  const hasReachedLimit = currentLevelRequests.length >= PRIVATE_CLASS_MAX_PER_LEVEL
  const totalCompleted = myRequests.filter((r: any) => r.status === "completed").length
  const shouldSuggestFullCourse = totalCompleted >= PRIVATE_CLASS_DISCOUNT_THRESHOLD

    return (
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Solicitar Clase Privada</h1>
          <p className="text-muted-foreground mt-1">
            Agenda una sesión personalizada con un tutor para reforzar temas específicos
          </p>
        </div>

        {/* Limit reached */}
        {hasReachedLimit && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Límite alcanzado:</strong> Ya has agendado {currentLevelRequests.length} tutorías
              para tu nivel actual. El límite es de {PRIVATE_CLASS_MAX_PER_LEVEL} tutorías por nivel.
              Si necesitas más clases, considera el{" "}
              <a href="mailto:ventas@vrevia.com" className="underline font-semibold">
                curso completo con profesor
              </a>.
            </AlertDescription>
          </Alert>
        )}

        {/* Suggestion for full course */}
        {!hasReachedLimit && shouldSuggestFullCourse && (
          <Alert className="border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>¿Sabías que...</strong> has tomado {totalCompleted} clases privadas.
              Considera nuestro <strong>curso con profesor</strong> que incluye clases ilimitadas
              y sale más económico que pagar clases individuales.{" "}
              <a href="mailto:ventas@vrevia.com" className="underline font-medium">
                Contacta a ventas
              </a>
            </AlertDescription>
          </Alert>
        )}

        {/* Pricing Info */}
        <Card className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="flex-1 space-y-2">
              <p className="text-sm font-medium">Información de Precios</p>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• Precio por clase: <strong>${PRIVATE_CLASS_PRICE} MXN</strong></p>
                <p>• Límite: <strong>{PRIVATE_CLASS_MAX_PER_LEVEL} tutorías por nivel</strong></p>
                <p>• Duración: 60 minutos por sesión</p>
                <p>• Cancelación gratuita con 24 horas de anticipación</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Form */}
        {!hasReachedLimit ? (
          <ClassRequestForm studentId={session.id} />
        ) : (
          <Card className="p-6">
            <div className="text-center space-y-4">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
              <div>
                <h3 className="font-semibold text-lg">Límite de tutorías alcanzado</h3>
                <p className="text-muted-foreground mt-2">
                  Has agendado {currentLevelRequests.length} tutorías para tu nivel actual.
                  El límite es de {PRIVATE_CLASS_MAX_PER_LEVEL} tutorías por nivel.
                </p>
                <p className="text-sm text-muted-foreground mt-3">
                  Si necesitas más clases para dominar este nivel, te recomendamos el{" "}
                  <a href="mailto:ventas@vrevia.com" className="text-primary underline font-medium">
                    curso completo con profesor
                  </a>
                  {" "}que incluye clases ilimitadas.
                </p>
              </div>
              <Button asChild variant="outline">
                <a href="/ingles/soporte">Volver a Soporte</a>
              </Button>
            </div>
          </Card>
        )}
      </div>
    )
}
