export const dynamic = 'force-dynamic'

import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { getMaterialsForStudent } from "@/lib/actions/materials"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatShortDate } from "@/lib/utils"
import { FileText, Download } from "lucide-react"

export default async function EstudianteMaterialesPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/")
  }

  if (user.role !== "student") {
    redirect("/dashboard")
  }

  const materials = await getMaterialsForStudent(user.id, user.currentLesson, user.group)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mis materiales</h1>
        <p className="text-muted-foreground">
          Material de apoyo para tus clases
        </p>
      </div>

      {materials.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              No hay materiales disponibles todavía
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {materials.map((material) => (
            <Card key={material.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base truncate">
                      {material.title}
                    </CardTitle>
                    <CardDescription className="text-xs mt-1">
                      Clase {material.lesson} • {formatShortDate(material.uploadedAt)}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {material.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {material.description}
                  </p>
                )}
                <Button className="w-full" asChild>
                  <a
                    href={material.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Descargar PDF
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
