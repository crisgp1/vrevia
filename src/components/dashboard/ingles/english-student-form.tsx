"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createEnglishStudent } from "@/lib/actions/english-students"
import { searchClerkUsers } from "@/lib/actions/clerk-users"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { UserPlus, Search, Loader2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function EnglishStudentForm() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searching, setSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [showManualInput, setShowManualInput] = useState(false)

  // Debounced search
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSearchResults([])
      return
    }

    const timer = setTimeout(async () => {
      setSearching(true)
      const result = await searchClerkUsers(searchQuery)
      if (result.success) {
        setSearchResults(result.data || [])
      } else {
        setSearchResults([])
      }
      setSearching(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery])

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)

    // If user selected from search, use their data
    let data
    if (selectedUser && !showManualInput) {
      data = {
        clerkId: selectedUser.id,
        email: selectedUser.email,
        name: selectedUser.name,
        phone: formData.get("phone") as string || undefined,
        currentLevel: "a1" as const,
        currentLesson: 1,
      }
    } else {
      data = {
        clerkId: formData.get("clerkId") as string,
        email: formData.get("email") as string,
        name: formData.get("name") as string,
        phone: formData.get("phone") as string || undefined,
        currentLevel: "a1" as const,
        currentLesson: 1,
      }
    }

    const result = await createEnglishStudent(data)

    if (result.success) {
      toast.success("Estudiante creado exitosamente")
      setOpen(false)
      setSelectedUser(null)
      setSearchQuery("")
      setSearchResults([])
      setShowManualInput(false)
      router.refresh()
    } else {
      toast.error(result.error || "Error al crear estudiante")
    }

    setLoading(false)
  }

  const handleSelectUser = (user: any) => {
    setSelectedUser(user)
    setSearchQuery("")
    setSearchResults([])
  }

  const handleClearSelection = () => {
    setSelectedUser(null)
    setSearchQuery("")
    setSearchResults([])
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Nuevo Estudiante
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar Estudiante de Inglés</DialogTitle>
          <DialogDescription>
            Registra un usuario existente en el módulo de inglés
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          {!showManualInput ? (
            <>
              {/* User Search */}
              {!selectedUser ? (
                <div className="space-y-2">
                  <Label htmlFor="search">Buscar Usuario</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar por nombre o email..."
                      className="pl-9"
                    />
                    {searching && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </div>

                  {/* Search Results */}
                  {searchResults.length > 0 && (
                    <div className="border rounded-lg divide-y max-h-48 overflow-y-auto">
                      {searchResults.map((user) => (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => handleSelectUser(user)}
                          className="w-full flex items-center gap-3 p-3 hover:bg-muted transition-colors text-left"
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.imageUrl} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{user.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  <Button
                    type="button"
                    variant="link"
                    onClick={() => setShowManualInput(true)}
                    className="text-xs px-0"
                  >
                    ¿No encuentras al usuario? Ingresar manualmente
                  </Button>
                </div>
              ) : (
                /* Selected User */
                <div className="space-y-2">
                  <Label>Usuario Seleccionado</Label>
                  <div className="border rounded-lg p-3 flex items-center gap-3 bg-muted/50">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={selectedUser.imageUrl} />
                      <AvatarFallback>{selectedUser.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{selectedUser.name}</p>
                      <p className="text-sm text-muted-foreground truncate">{selectedUser.email}</p>
                      <p className="text-xs text-muted-foreground font-mono">{selectedUser.id}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleClearSelection}
                    >
                      Cambiar
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono (opcional)</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+52 123 456 7890"
                />
              </div>
            </>
          ) : (
            /* Manual Input */
            <>
              <div className="flex justify-between items-center">
                <Label>Ingreso Manual</Label>
                <Button
                  type="button"
                  variant="link"
                  onClick={() => setShowManualInput(false)}
                  className="text-xs"
                >
                  ← Volver al buscador
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="clerkId">Clerk ID *</Label>
                <Input
                  id="clerkId"
                  name="clerkId"
                  required
                  placeholder="user_xxxxxxxxxxxxx"
                />
                <p className="text-xs text-muted-foreground">
                  Copia el Clerk ID desde el footer de la barra lateral
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="estudiante@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nombre Completo *</Label>
                <Input
                  id="name"
                  name="name"
                  required
                  placeholder="Juan Pérez"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono (opcional)</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+52 123 456 7890"
                />
              </div>
            </>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || (!selectedUser && !showManualInput)}
            >
              {loading ? "Creando..." : "Crear Estudiante"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
