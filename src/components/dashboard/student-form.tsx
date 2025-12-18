"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { searchUsers, assignStudentRole } from "@/lib/actions/users"
import { LEVELS, CLASS_TYPES, LEVEL_DETAILS } from "@/lib/constants"
import { Plus, Search, User, Check } from "lucide-react"
import { cn } from "@/lib/utils"

const formSchema = z.object({
  userId: z.string().min(1, "Selecciona un usuario"),
  phone: z.string().optional(),
  level: z.enum(["a1", "a2", "b1", "b2", "b2plus"]),
  classType: z.enum(["individual", "grupal"]),
  group: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface SearchResult {
  id: string
  clerkId: string
  email: string
  name: string
  level?: string
  hasLevel: boolean
}

interface StudentFormProps {
  groups: { id: string; name: string; level: string }[]
}

export function StudentForm({ groups }: StudentFormProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedUser, setSelectedUser] = useState<SearchResult | null>(null)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: "",
      phone: "",
      level: "a1",
      classType: "individual",
      group: "",
    },
  })

  const classType = form.watch("classType")

  // Search users with debounce
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        setIsSearching(true)
        try {
          const results = await searchUsers(searchQuery)
          setSearchResults(results)
        } catch {
          setSearchResults([])
        } finally {
          setIsSearching(false)
        }
      } else {
        setSearchResults([])
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  function handleSelectUser(user: SearchResult) {
    setSelectedUser(user)
    form.setValue("userId", user.id)
    setSearchQuery("")
    setSearchResults([])
  }

  function handleClearUser() {
    setSelectedUser(null)
    form.setValue("userId", "")
  }

  async function onSubmit(data: FormData) {
    setIsLoading(true)
    try {
      const result = await assignStudentRole(data.userId, {
        level: data.level,
        classType: data.classType,
        group: data.group,
        phone: data.phone,
      })

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success("Alumno configurado exitosamente")
      form.reset()
      setSelectedUser(null)
      setSearchQuery("")
      setOpen(false)
    } catch {
      toast.error("Error al configurar el alumno")
    } finally {
      setIsLoading(false)
    }
  }

  function handleOpenChange(newOpen: boolean) {
    setOpen(newOpen)
    if (!newOpen) {
      form.reset()
      setSelectedUser(null)
      setSearchQuery("")
      setSearchResults([])
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Agregar alumno
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Configurar alumno</DialogTitle>
          <DialogDescription>
            Busca un usuario registrado por nombre o email y asígnale su nivel.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* User Search */}
            <FormField
              control={form.control}
              name="userId"
              render={() => (
                <FormItem>
                  <FormLabel>Usuario</FormLabel>
                  {selectedUser ? (
                    <div className="flex items-center justify-between p-3 border rounded-md bg-muted/50">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{selectedUser.name}</p>
                          <p className="text-xs text-muted-foreground">{selectedUser.email}</p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleClearUser}
                      >
                        Cambiar
                      </Button>
                    </div>
                  ) : (
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar por nombre o email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                      {/* Search Results Dropdown */}
                      {(searchResults.length > 0 || isSearching) && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-md z-50 max-h-48 overflow-auto">
                          {isSearching ? (
                            <div className="p-3 text-sm text-muted-foreground text-center">
                              Buscando...
                            </div>
                          ) : (
                            searchResults.map((user) => (
                              <button
                                key={user.id}
                                type="button"
                                onClick={() => handleSelectUser(user)}
                                className={cn(
                                  "w-full flex items-center justify-between p-3 hover:bg-muted text-left",
                                  user.hasLevel && "opacity-50"
                                )}
                                disabled={user.hasLevel}
                              >
                                <div>
                                  <p className="text-sm font-medium">{user.name}</p>
                                  <p className="text-xs text-muted-foreground">{user.email}</p>
                                </div>
                                {user.hasLevel ? (
                                  <span className="text-xs text-muted-foreground">
                                    Ya tiene nivel
                                  </span>
                                ) : (
                                  <Check className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100" />
                                )}
                              </button>
                            ))
                          )}
                          {!isSearching && searchResults.length === 0 && searchQuery.length >= 2 && (
                            <div className="p-3 text-sm text-muted-foreground text-center">
                              No se encontraron usuarios
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedUser && (
              <>
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono (opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="+52 33 1234 5678" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nivel</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un nivel" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(LEVELS).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label} (Clases {LEVEL_DETAILS[value as keyof typeof LEVEL_DETAILS]?.classes})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="classType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de clase</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona el tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(CLASS_TYPES).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {classType === "grupal" && (
                  <FormField
                    control={form.control}
                    name="group"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Grupo</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un grupo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {groups.map((group) => (
                              <SelectItem key={group.id} value={group.id}>
                                {group.name} ({LEVELS[group.level as keyof typeof LEVELS]})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading || !selectedUser}>
                {isLoading ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
