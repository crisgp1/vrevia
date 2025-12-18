"use client"

import { useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { MoreHorizontal, ClipboardList, Calendar, Users, Trash2, Eye, Edit2 } from "lucide-react"
import { formatShortDate } from "@/lib/utils"
import { deleteAssignment } from "@/lib/actions/assignments"
import { AssignmentForm } from "./assignment-form"

interface Assignment {
  id: string
  title: string
  description: string
  dueDate: Date
  assignedTo: {
    type: "level" | "group" | "student"
    id: string
  }
  assignedToName: string
  submissionCount: number
  gradedCount: number
  attachmentUrl?: string
  attachmentName?: string
}

interface Group {
  id: string
  name: string
  level: string
}

interface Student {
  id: string
  name: string
}

interface AssignmentCardProps {
  assignment: Assignment
  groups: Group[]
  students: Student[]
}

export function AssignmentCard({ assignment, groups, students }: AssignmentCardProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const isPastDue = new Date(assignment.dueDate) < new Date()

  async function handleDelete() {
    setIsLoading(true)
    try {
      const result = await deleteAssignment(assignment.id)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success("Tarea eliminada exitosamente")
      setDeleteDialogOpen(false)
    } catch {
      toast.error("Error al eliminar la tarea")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between pb-2">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-secondary/10 rounded-lg">
              <ClipboardList className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <CardTitle className="text-base">{assignment.title}</CardTitle>
              <CardDescription className="text-xs mt-1">
                {assignment.assignedToName}
              </CardDescription>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" disabled={isLoading}>
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Acciones</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/tareas/${assignment.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  Ver entregas
                </Link>
              </DropdownMenuItem>
              <AssignmentForm
                groups={groups}
                students={students}
                assignment={assignment}
                trigger={
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Edit2 className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                }
              />
              <DropdownMenuSeparator />
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
          {assignment.description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {assignment.description}
            </p>
          )}
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge variant={isPastDue ? "destructive" : "outline"}>
              <Calendar className="mr-1 h-3 w-3" />
              {formatShortDate(assignment.dueDate)}
            </Badge>
            <Badge variant="secondary">
              <Users className="mr-1 h-3 w-3" />
              {assignment.gradedCount}/{assignment.submissionCount} calificadas
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar tarea</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar &quot;{assignment.title}&quot;?
              Se eliminarán también todas las entregas asociadas.
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
