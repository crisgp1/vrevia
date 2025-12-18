"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageCircle, Mail, Phone } from "lucide-react"

export function Contact() {
  return (
    <section id="contacto" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              ¿Listo para empezar?
            </h2>
            <p className="text-lg text-muted-foreground">
              Escríbeme y platicamos sobre tus objetivos. La primera consulta es
              sin compromiso.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="bg-card">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Contáctame</CardTitle>
                <CardDescription>
                  Elige el medio que prefieras para comunicarte
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    size="lg"
                    className="w-full bg-[#25D366] hover:bg-[#25D366]/90 text-white h-14"
                    asChild
                  >
                    <a
                      href="https://wa.me/5233407249622?text=Hola,%20me%20interesa%20aprender%20inglés"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="mr-2 h-5 w-5" />
                      WhatsApp
                    </a>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full h-14"
                    asChild
                  >
                    <a href="mailto:cristian@vrevia.com">
                      <Mail className="mr-2 h-5 w-5" />
                      Email
                    </a>
                  </Button>
                </div>

                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span>+52 33 4072 4962</span>
                </div>

                <p className="text-center text-sm text-muted-foreground">
                  Respondo en menos de 24 horas. ¡Te espero!
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
