"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { UserButton } from "@clerk/nextjs"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Home,
  FileText,
  ClipboardList,
  Award,
  CreditCard,
  Menu,
  GraduationCap,
  Medal,
  Copy,
  Check,
  Info,
} from "lucide-react"
import { useState } from "react"
import type { CurrentUser } from "@/lib/auth"

const navItems = [
  { href: "/estudiante", label: "Inicio", icon: Home },
  { href: "/estudiante/plan-estudios", label: "Plan de estudios", icon: GraduationCap },
  { href: "/estudiante/materiales", label: "Mis materiales", icon: FileText },
  { href: "/estudiante/tareas", label: "Mis tareas", icon: ClipboardList },
  { href: "/estudiante/calificaciones", label: "Calificaciones", icon: Award },
  { href: "/estudiante/certificados", label: "Certificados", icon: Medal },
  { href: "/estudiante/pagos", label: "Mis pagos", icon: CreditCard },
]

function SidebarContent({ onLinkClick, user }: { onLinkClick?: () => void; user: CurrentUser | null }) {
  const pathname = usePathname()
  const [copied, setCopied] = useState(false)

  const copyClerkId = () => {
    if (user?.clerkId) {
      navigator.clipboard.writeText(user.clerkId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

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
        </div>
        {user && (
          <div className="mt-2 px-3">
            <div className="flex items-center gap-1 mb-1">
              <p className="text-xs text-muted-foreground">Clerk ID</p>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-muted-foreground/60 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-[200px]">
                    <p className="text-xs">Identificador único para soporte técnico. Compártelo si necesitas ayuda.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <button
              onClick={copyClerkId}
              className="flex items-center gap-2 text-xs text-foreground/80 hover:text-foreground bg-muted hover:bg-muted/80 px-2 py-1 rounded w-full transition-colors"
              title="Clic para copiar"
            >
              <code className="flex-1 truncate text-left">{user.clerkId}</code>
              {copied ? (
                <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
              ) : (
                <Copy className="h-3 w-3 flex-shrink-0" />
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export function StudentSidebar({ user }: { user: CurrentUser | null }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <SidebarContent user={user} />
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
          <SidebarContent user={user} onLinkClick={() => setIsOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  )
}
