"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Play, Headphones, FileText, Volume2, Loader2 } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { toast } from "sonner"

interface LessonContentClientProps {
  lesson: any
  progress: any
  isCompleted: boolean
  lessonNumber: number
}

export function LessonContentClient({
  lesson,
  progress,
  isCompleted,
  lessonNumber,
}: LessonContentClientProps) {
  const sections = lesson.content?.sections || []
  const [currentSection, setCurrentSection] = useState(0)
  const [generatingAudio, setGeneratingAudio] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)

  // Update audio URL when section changes
  useEffect(() => {
    const sortedSections = [...sections].sort((a: any, b: any) => a.order - b.order)
    const currentAudioUrl = sortedSections[currentSection]?.audioUrl || null
    setAudioUrl(currentAudioUrl)
  }, [currentSection, sections])

  if (sections.length === 0) {
    return (
      <Card className="p-12 text-center border-2 border-dashed">
        <div className="max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-2">Contenido en desarrollo</h3>
            <p className="text-sm text-muted-foreground">
              El contenido detallado de esta lección estará disponible pronto.
            </p>
          </div>
        </div>
      </Card>
    )
  }

  const sortedSections = [...sections].sort((a: any, b: any) => a.order - b.order)
  const totalSections = sortedSections.length
  const section = sortedSections[currentSection]

  const goToNext = () => {
    if (currentSection < totalSections - 1) {
      const nextIndex = currentSection + 1
      setCurrentSection(nextIndex)
      setAudioUrl(sortedSections[nextIndex].audioUrl || null)
    }
  }

  const goToPrevious = () => {
    if (currentSection > 0) {
      const prevIndex = currentSection - 1
      setCurrentSection(prevIndex)
      setAudioUrl(sortedSections[prevIndex].audioUrl || null)
    }
  }

  const generateAudio = async () => {
    if (section.type !== "text") return

    setGeneratingAudio(true)
    try {
      const response = await fetch(
        `/api/ingles/lessons/${lessonNumber}/sections/${currentSection}/generate-audio`,
        { method: "POST" }
      )

      if (!response.ok) {
        throw new Error("Error generando audio")
      }

      const data = await response.json()
      setAudioUrl(data.audioUrl)

      // Update section in state
      section.audioUrl = data.audioUrl

      if (data.cached) {
        toast.success("Audio cargado")
      } else {
        toast.success("Audio generado exitosamente")
      }
    } catch (error) {
      toast.error("Error al generar audio")
      console.error(error)
    } finally {
      setGeneratingAudio(false)
    }
  }

  const getSectionIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Play className="h-5 w-5" />
      case "audio":
        return <Headphones className="h-5 w-5" />
      default:
        return <FileText className="h-5 w-5" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Section Navigator */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {sortedSections.map((sec: any, index: number) => (
          <button
            key={index}
            onClick={() => setCurrentSection(index)}
            className={`
              flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${
                index === currentSection
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
              }
            `}
          >
            <span className="flex items-center gap-2">
              <span className="text-xs opacity-70">{index + 1}</span>
              <span className="hidden sm:inline">{sec.title}</span>
            </span>
          </button>
        ))}
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Sección {currentSection + 1} de {totalSections}
        </span>
        <div className="flex items-center gap-2">
          <div className="w-32 h-1.5 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${((currentSection + 1) / totalSections) * 100}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground">
            {Math.round(((currentSection + 1) / totalSections) * 100)}%
          </span>
        </div>
      </div>

      {/* Section Content */}
      <Card className="overflow-hidden border-2">
        <div className="bg-gradient-to-r from-primary/5 via-primary/3 to-transparent p-6 border-b">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              {getSectionIcon(section.type)}
            </div>
            <div>
              <Badge variant="outline" className="mb-2">
                {section.type === "text" ? "Lectura" : section.type === "video" ? "Video" : "Audio"}
              </Badge>
              <h2 className="text-2xl font-bold">{section.title}</h2>
            </div>
          </div>
        </div>

        <div className="p-8">
          {section.type === "text" && (
            <div className="space-y-6">
              {/* Audio Controls */}
              <div className="flex items-center gap-3 pb-4 border-b">
                {(audioUrl || section.audioUrl) ? (
                  <div className="flex items-center gap-3 flex-1">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                      <Volume2 className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <audio
                        controls
                        src={audioUrl || section.audioUrl}
                        className="w-full h-10"
                        preload="metadata"
                      >
                        Tu navegador no soporta audio.
                      </audio>
                    </div>
                  </div>
                ) : (
                  <Button
                    onClick={generateAudio}
                    disabled={generatingAudio}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    {generatingAudio ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Generando audio...
                      </>
                    ) : (
                      <>
                        <Volume2 className="h-4 w-4" />
                        Escuchar esta sección
                      </>
                    )}
                  </Button>
                )}
              </div>

              {/* Text Content */}
              <div className="prose prose-slate dark:prose-invert max-w-none
                prose-headings:font-bold prose-headings:text-foreground
                prose-p:text-foreground/90 prose-p:leading-relaxed
                prose-strong:text-foreground prose-strong:font-semibold
                prose-ul:text-foreground/90 prose-li:text-foreground/90
                prose-code:text-primary prose-code:bg-primary/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
              ">
                <ReactMarkdown>{section.content}</ReactMarkdown>
              </div>
            </div>
          )}

          {section.type === "video" && (
            <div className="space-y-4">
              <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 rounded-xl flex items-center justify-center border-2 border-dashed">
                <div className="text-center space-y-3">
                  <Play className="h-16 w-16 mx-auto text-muted-foreground/50" />
                  <p className="text-muted-foreground">Video: {section.content}</p>
                </div>
              </div>
            </div>
          )}

          {section.type === "audio" && (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-xl p-8 border-2 border-purple-200/50">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-purple-500/20 rounded-full">
                    <Headphones className="h-8 w-8 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium mb-1">Audio</p>
                    <p className="text-sm text-muted-foreground">{section.content}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          onClick={goToPrevious}
          disabled={currentSection === 0}
          size="lg"
          className="flex-1 max-w-xs"
        >
          <ChevronLeft className="h-5 w-5 mr-2" />
          Anterior
        </Button>

        <div className="text-center flex-shrink-0">
          <p className="text-xs text-muted-foreground">
            {currentSection + 1} / {totalSections}
          </p>
        </div>

        <Button
          onClick={goToNext}
          disabled={currentSection === totalSections - 1}
          size="lg"
          className="flex-1 max-w-xs"
        >
          Siguiente
          <ChevronRight className="h-5 w-5 ml-2" />
        </Button>
      </div>
    </div>
  )
}
