"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { FileUpload } from "@/components/ui/file-upload"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { submitAssignment } from "@/lib/actions/assignments"
import { Upload, FileText, X } from "lucide-react"

interface SubmitFormProps {
  assignmentId: string
  studentId: string
}

export function SubmitForm({ assignmentId, studentId }: SubmitFormProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<{
    url: string
    name: string
  } | null>(null)

  async function handleSubmit() {
    if (!uploadedFile) {
      toast.error("Por favor sube un archivo PDF")
      return
    }

    setIsLoading(true)
    try {
      const result = await submitAssignment(
        assignmentId,
        studentId,
        uploadedFile.url,
        uploadedFile.name
      )

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success("Tarea entregada exitosamente")
      setUploadedFile(null)
      setOpen(false)
    } catch {
      toast.error("Error al entregar la tarea")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Entregar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Entregar tarea</DialogTitle>
          <DialogDescription>
            Sube tu archivo PDF para entregar la tarea
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {uploadedFile ? (
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <span className="text-sm truncate max-w-[250px]">
                  {uploadedFile.name}
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setUploadedFile(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 hover:border-muted-foreground/50 transition-colors">
              <FileUpload
                folder="submissions"
                buttonVariant="default"
                onUploadComplete={(file) => {
                  setUploadedFile({
                    url: file.url,
                    name: file.name,
                  })
                }}
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !uploadedFile}
            >
              {isLoading ? "Entregando..." : "Confirmar entrega"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
