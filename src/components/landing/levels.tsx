"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle } from "lucide-react"

const levels = [
  {
    name: "Básico",
    badge: "A1-A2",
    description: "Para quienes inician su camino en el inglés",
    features: [
      "Vocabulario esencial para situaciones cotidianas",
      "Gramática fundamental y estructuras básicas",
      "Pronunciación y comprensión auditiva básica",
      "Conversaciones simples del día a día",
    ],
    color: "bg-blue-500",
  },
  {
    name: "Intermedio",
    badge: "B1-B2",
    description: "Para quienes buscan fluidez y confianza",
    features: [
      "Vocabulario ampliado para contextos profesionales",
      "Gramática avanzada y tiempos verbales complejos",
      "Comprensión de películas y series en inglés",
      "Conversaciones fluidas sobre temas variados",
    ],
    color: "bg-secondary",
    popular: true,
  },
  {
    name: "Avanzado",
    badge: "C1-C2",
    description: "Para perfeccionar y dominar el idioma",
    features: [
      "Vocabulario técnico y expresiones idiomáticas",
      "Redacción profesional y académica",
      "Debates y presentaciones en inglés",
      "Preparación para certificaciones internacionales",
    ],
    color: "bg-primary",
  },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export function Levels() {
  return (
    <section id="niveles" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-foreground mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Niveles de aprendizaje
          </motion.h2>
          <motion.p
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Encuentra el nivel adecuado para ti y avanza a tu propio ritmo
          </motion.p>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {levels.map((level) => (
            <motion.div key={level.name} variants={item}>
              <Card
                className={`h-full relative ${
                  level.popular ? "border-secondary shadow-lg" : ""
                }`}
              >
                {level.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-secondary text-white">
                      Más popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-4">
                  <div
                    className={`w-16 h-16 rounded-full ${level.color} mx-auto mb-4 flex items-center justify-center`}
                  >
                    <span className="text-white font-bold text-lg">
                      {level.badge}
                    </span>
                  </div>
                  <CardTitle className="text-2xl">{level.name}</CardTitle>
                  <CardDescription className="text-base">
                    {level.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {level.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
