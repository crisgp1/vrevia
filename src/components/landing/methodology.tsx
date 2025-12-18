"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Video, FileText, UserCheck, Clock } from "lucide-react"

const features = [
  {
    icon: Video,
    title: "Clases en vivo por Zoom",
    description:
      "Sesiones interactivas en tiempo real desde la comodidad de tu hogar u oficina.",
  },
  {
    icon: FileText,
    title: "Material descargable incluido",
    description:
      "Accede a recursos, ejercicios y material de apoyo para practicar entre clases.",
  },
  {
    icon: UserCheck,
    title: "Seguimiento personalizado",
    description:
      "Monitoreo constante de tu progreso con retroalimentación detallada en cada tarea.",
  },
  {
    icon: Clock,
    title: "Horarios flexibles",
    description:
      "Elige el horario que mejor se adapte a tu rutina. Clases mañana, tarde o noche.",
  },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export function Methodology() {
  return (
    <section id="metodologia" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-foreground mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Nuestra metodología
          </motion.h2>
          <motion.p
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Un enfoque práctico y personalizado para que aprendas inglés de
            manera efectiva
          </motion.p>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {features.map((feature) => (
            <motion.div key={feature.title} variants={item}>
              <Card className="h-full hover:shadow-lg transition-shadow bg-card">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
