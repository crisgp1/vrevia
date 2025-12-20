import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { HeadphonesIcon, GraduationCap, Calendar } from "lucide-react"
import Link from "next/link"

export default function SoportePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Soporte</h1>
        <p className="text-muted-foreground mt-1">
          ¿Necesitas ayuda? Estamos aquí para apoyarte
        </p>
      </div>

      {/* Support Options */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Soporte Técnico */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-blue-100 rounded-lg">
                <HeadphonesIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <CardTitle>Soporte Técnico</CardTitle>
            <CardDescription>
              Problemas con la plataforma, acceso o funcionalidades
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Resolvemos dudas sobre el uso de la plataforma, problemas de acceso y
                cuestiones técnicas.
              </p>
              <div className="space-y-2">
                <p className="text-sm font-medium">Contacto:</p>
                <p className="text-sm">
                  📧 <a href="mailto:soporte@vrevia.com" className="text-blue-600 hover:underline">
                    soporte@vrevia.com
                  </a>
                </p>
                <p className="text-sm text-muted-foreground">
                  Tiempo de respuesta: 24-48 horas
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tutor */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-purple-100 rounded-lg">
                <GraduationCap className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <CardTitle>Consulta con Tutor</CardTitle>
            <CardDescription>
              Dudas sobre el contenido, ejercicios o metodología
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Nuestros tutores te ayudan con dudas sobre gramática, vocabulario y ejercicios.
              </p>
              <div className="space-y-2">
                <p className="text-sm font-medium">Contacto:</p>
                <p className="text-sm">
                  📧 <a href="mailto:tutor@vrevia.com" className="text-blue-600 hover:underline">
                    tutor@vrevia.com
                  </a>
                </p>
                <p className="text-sm text-muted-foreground">
                  Tiempo de respuesta: 12-24 horas
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Solicitar Clase */}
        <Card className="hover:shadow-lg transition-shadow border-2 border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-green-100 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <CardTitle>Solicitar Clase Privada</CardTitle>
            <CardDescription>
              Refuerzo personalizado para lecciones específicas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Agenda una sesión privada con un tutor para reforzar temas específicos.
              </p>
              <div className="space-y-2">
                <p className="text-sm font-medium">Precio:</p>
                <p className="text-lg font-bold text-green-600">$299 MXN</p>
                <p className="text-xs text-muted-foreground">por clase de 60 minutos</p>
                <p className="text-xs text-amber-600 font-medium">Máximo 3 tutorías por nivel</p>
              </div>
              <Button asChild className="w-full">
                <Link href="/ingles/soporte/solicitar-clase">
                  Solicitar Clase
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle>Preguntas Frecuentes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="font-medium text-sm mb-1">¿Cuándo usar cada tipo de soporte?</p>
            <p className="text-sm text-muted-foreground">
              <strong>Soporte Técnico:</strong> Problemas de acceso, errores en la plataforma, problemas con tu suscripción.<br />
              <strong>Tutor:</strong> Dudas sobre gramática, vocabulario, ejercicios específicos.<br />
              <strong>Clase Privada:</strong> Necesitas atención personalizada y práctica en tiempo real.
            </p>
          </div>
          <div>
            <p className="font-medium text-sm mb-1">¿Las clases privadas reemplazan mi suscripción?</p>
            <p className="text-sm text-muted-foreground">
              No, las clases privadas son un complemento opcional a tu suscripción regular.
              Son ideales para reforzar temas difíciles o practicar conversación.
            </p>
          </div>
          <div>
            <p className="font-medium text-sm mb-1">¿Puedo cancelar una clase programada?</p>
            <p className="text-sm text-muted-foreground">
              Sí, puedes cancelar con al menos 24 horas de anticipación para obtener un reembolso completo.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
