"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { UserButton } from "@clerk/nextjs"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import {
  Home,
  FileText,
  ClipboardList,
  Award,
  CreditCard,
  Menu,
  GraduationCap,
} from "lucide-react"
import { useState } from "react"

const navItems = [
  { href: "/estudiante", label: "Inicio", icon: Home },
  { href: "/estudiante/plan-estudios", label: "Plan de estudios", icon: GraduationCap },
  { href: "/estudiante/materiales", label: "Mis materiales", icon: FileText },
  { href: "/estudiante/tareas", label: "Mis tareas", icon: ClipboardList },
  { href: "/estudiante/calificaciones", label: "Calificaciones", icon: Award },
  { href: "/estudiante/pagos", label: "Mis pagos", icon: CreditCard },
]

function SidebarContent({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col bg-card border-r">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/estudiante" className="flex items-center gap-2">
          <span className="text-2xl font-bold">
            <span className="text-secondary">V</span>
            <span className="text-primary">revia</span>
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onLinkClick}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="border-t p-4">
        <div className="flex items-center gap-3 px-3 py-2">
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "h-8 w-8",
              },
            }}
          />
          <span className="text-sm font-medium text-muted-foreground">
            Mi cuenta
          </span>
        </div>
      </div>
    </div>
  )
}

export function StudentSidebar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed left-4 top-4 z-40 lg:hidden"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Abrir menú</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
          <SidebarContent onLinkClick={() => setIsOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  )
}
