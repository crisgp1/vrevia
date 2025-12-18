"use client"

import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Loader2 } from "lucide-react"

export function PortalButton({ variant = "default", className = "" }: { variant?: "default" | "outline" | "ghost", className?: string }) {
  const { user, isLoaded } = useUser()
  const [portalUrl, setPortalUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchUserRole() {
      if (!user) {
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch("/api/user-role")
        const data = await response.json()

        if (data.role === "admin") {
          setPortalUrl("/dashboard")
        } else {
          setPortalUrl("/estudiante")
        }
      } catch {
        // Default to student portal if error
        setPortalUrl("/estudiante")
      } finally {
        setIsLoading(false)
      }
    }

    if (isLoaded) {
      fetchUserRole()
    }
  }, [user, isLoaded])

  if (!isLoaded || isLoading) {
    return (
      <Button variant={variant} disabled className={className}>
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        Cargando...
      </Button>
    )
  }

  if (!portalUrl) {
    return null
  }

  return (
    <Button variant={variant} asChild className={className}>
      <Link href={portalUrl}>
        Ir a mi portal
        <ArrowRight className="ml-2 h-4 w-4" />
      </Link>
    </Button>
  )
}
