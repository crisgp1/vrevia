"use client"

import { SignInButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { BookOpen, MessageCircle } from "lucide-react"

export function Hero() {
  return (
    <section
      id="inicio"
      className="relative overflow-hidden py-20 md:py-32 bg-gradient-to-b from-background to-muted/30"
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block px-4 py-2 mb-6 text-sm font-medium bg-secondary/10 text-secondary rounded-full">
              Clases de inglés personalizadas
            </span>
          </motion.div>

          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Aprende inglés de forma{" "}
            <span className="text-primary">personalizada</span>
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Clases individuales y grupales adaptadas a tu ritmo y objetivos.
            Aprende con metodología efectiva, material descargable y horarios
            que se ajustan a ti.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Button
              size="lg"
              className="bg-secondary hover:bg-secondary/90 text-white"
              asChild
            >
              <a
                href="https://wa.me/5233407249622?text=Hola,%20me%20interesa%20aprender%20inglés"
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                Comienza ahora
              </a>
            </Button>
            <SignInButton mode="modal">
              <Button size="lg" variant="outline">
                <BookOpen className="mr-2 h-5 w-5" />
                Ya tengo cuenta
              </Button>
            </SignInButton>
          </motion.div>

          {/* Decorative elements */}
          <motion.div
            className="mt-16 relative w-full max-w-3xl"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 blur-3xl opacity-50" />
            <div className="relative bg-card rounded-2xl shadow-xl border p-8">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-3xl font-bold text-primary">100+</div>
                  <div className="text-sm text-muted-foreground">Estudiantes</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-secondary">5+</div>
                  <div className="text-sm text-muted-foreground">Años de experiencia</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">98%</div>
                  <div className="text-sm text-muted-foreground">Satisfacción</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
