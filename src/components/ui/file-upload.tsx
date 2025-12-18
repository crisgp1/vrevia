"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface FileUploadProps {
  onUploadComplete: (file: { url: string; name: string }) => void
  folder?: string
  accept?: string
  maxSize?: number
  className?: string
  buttonText?: string
  buttonVariant?: "default" | "secondary" | "outline" | "ghost"
}

export function FileUpload({
  onUploadComplete,
  folder = "uploads",
  accept = "application/pdf",
  maxSize = 10 * 1024 * 1024, // 10MB default
  className = "",
  buttonText = "Seleccionar archivo PDF",
  buttonVariant = "default",
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.match(accept.replace("application/", ""))) {
      toast.error("Tipo de archivo no permitido")
      return
    }

    // Validate file size
    if (file.size > maxSize) {
      toast.error(`El archivo no puede superar ${Math.round(maxSize / 1024 / 1024)}MB`)
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", folder)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al subir el archivo")
      }

      const data = await response.json()
      onUploadComplete({ url: data.url, name: data.name })
      toast.success("Archivo subido exitosamente")

      // Reset input
      if (inputRef.current) {
        inputRef.current.value = ""
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al subir el archivo")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        disabled={isUploading}
        className="hidden"
        id="file-upload"
      />
      <label htmlFor="file-upload">
        <Button
          type="button"
          variant={buttonVariant}
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
          className="w-full"
          asChild
        >
          <span>
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Subiendo...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                {buttonText}
              </>
            )}
          </span>
        </Button>
      </label>
      <p className="text-xs text-muted-foreground mt-2 text-center">
        Archivos PDF hasta {Math.round(maxSize / 1024 / 1024)}MB
      </p>
    </div>
  )
}
