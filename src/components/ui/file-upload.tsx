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
    if (!file) {
      console.log("No file selected")
      return
    }

    console.log("File selected:", {
      name: file.name,
      type: file.type,
      size: file.size,
      accept,
      folder
    })

    // Validate file type
    if (!file.type.match(accept.replace("application/", ""))) {
      console.error("File type validation failed:", file.type)
      toast.error("Tipo de archivo no permitido")
      return
    }

    // Validate file size
    if (file.size > maxSize) {
      console.error("File size validation failed:", file.size)
      toast.error(`El archivo no puede superar ${Math.round(maxSize / 1024 / 1024)}MB`)
      return
    }

    console.log("Starting upload...")
    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", folder)

      console.log("Sending upload request to /api/upload")
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      console.log("Upload response status:", response.status)

      if (!response.ok) {
        const error = await response.json()
        console.error("Upload failed:", error)
        throw new Error(error.error || "Error al subir el archivo")
      }

      const data = await response.json()
      console.log("Upload successful, calling onUploadComplete with:", data)
      onUploadComplete({ url: data.url, name: data.name })
      toast.success("Archivo subido exitosamente")

      // Reset input
      if (inputRef.current) {
        inputRef.current.value = ""
      }
    } catch (error) {
      console.error("Upload error caught:", error)
      toast.error(error instanceof Error ? error.message : "Error al subir el archivo")
    } finally {
      console.log("Upload finished, setting isUploading to false")
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
      />
      <Button
        type="button"
        variant={buttonVariant}
        disabled={isUploading}
        onClick={() => inputRef.current?.click()}
        className="w-full"
      >
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
      </Button>
      <p className="text-xs text-muted-foreground mt-2 text-center">
        Archivos PDF hasta {Math.round(maxSize / 1024 / 1024)}MB
      </p>
    </div>
  )
}
