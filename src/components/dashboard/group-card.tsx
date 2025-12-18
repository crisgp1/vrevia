"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { MoreHorizontal, Users, Clock, Trash2, Power, Eye } from "lucide-react"
import { LEVELS, LEVEL_DETAILS } from "@/lib/constants"
import { toggleGroupStatus, deleteGroup } from "@/lib/actions/groups"

interface Group {
  id: string
  name: string
  level: string
  schedule: string
  description: string
  isActive: boolean
  studentCount: number
}

interface GroupCardProps {
  group: Group
}

export function GroupCard({ group }: GroupCardProps) {
  const router = useRouter()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleToggleStatus() {
    setIsLoading(true)
    try {
      const result = await toggleGroupStatus(group.id)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success(
        result.isActive
          ? "Grupo activado exitosamente"
          : "Grupo desactivado exitosamente"
      )
    } catch {
      toast.error("Error al cambiar el estado del grupo")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDelete() {
    setIsLoading(true)
    try {
      const result = await deleteGroup(group.id)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success("Grupo eliminado exitosamente")
      setDeleteDialogOpen(false)
    } catch {
      toast.error("Error al eliminar el grupo")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Card className={!group.isActive ? "opacity-60" : ""}>
        <CardHeader className="flex flex-row items-start justify-between pb-2">
          <div className="space-y-1">
            <CardTitle className="text-lg">{group.name}</CardTitle>
            <CardDescription>{group.description || "Sin descripción"}</CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" disabled={isLoading}>
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Acciones</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push(`/dashboard/grupos/${group.id}`)}>
                <Eye className="mr-2 h-4 w-4" />
                Ver alumnos
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleToggleStatus}>
                <Power className="mr-2 h-4 w-4" />
                {group.isActive ? "Desactivar" : "Activar"}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="outline">
              {LEVELS[group.level as keyof typeof LEVELS]}
            </Badge>
            <Badge variant="secondary">
              Clases {LEVEL_DETAILS[group.level as keyof typeof LEVEL_DETAILS]?.classes || "1-30"}
            </Badge>
            <Badge variant={group.isActive ? "default" : "outline"}>
              {group.isActive ? "Activo" : "Inactivo"}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{group.studentCount} alumnos</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{group.schedule}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar grupo</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar el grupo &quot;{group.name}&quot;?
              Los alumnos asignados a este grupo quedarán sin grupo asignado.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
