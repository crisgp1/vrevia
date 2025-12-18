"use client"

import Link from "next/link"
import { SignInButton } from "@clerk/nextjs"

const navLinks = [
  { href: "#inicio", label: "Inicio" },
  { href: "#metodologia", label: "Metodología" },
  { href: "#niveles", label: "Niveles" },
  { href: "#contacto", label: "Contacto" },
]

export function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and description */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <span className="text-2xl font-bold">
                <span className="text-secondary">V</span>
                <span className="text-primary">revia</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm">
              Clases de inglés personalizadas para alcanzar tus metas. Aprende a
              tu ritmo con metodología efectiva.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Navegación</h3>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <SignInButton mode="modal">
                  <button
                    className="text-muted-foreground hover:text-primary transition-colors text-sm cursor-pointer"
                  >
                    Acceder
                  </button>
                </SignInButton>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Contacto</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a
                  href="mailto:cristian@vrevia.com"
                  className="hover:text-primary transition-colors"
                >
                  cristian@vrevia.com
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/5233407249622"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  +52 33 4072 4962
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Vrevia. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
