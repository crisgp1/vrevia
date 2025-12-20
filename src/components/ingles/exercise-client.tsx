"use client"

import { useState, useMemo } from "react"
import { ExerciseQuestion } from "./exercise-question"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, XCircle, RotateCcw, Trophy, AlertCircle } from "lucide-react"
import { submitExercise } from "@/lib/actions/english-exercises"
import { toast } from "sonner"

interface ExerciseClientProps {
  exercise: any
  attempts: any[]
  bestScore?: number
  passed?: boolean
}

export function ExerciseClient({
  exercise,
  attempts,
  bestScore,
  passed,
}: ExerciseClientProps) {
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({})
  const [showFeedback, setShowFeedback] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<any>(null)

  // Randomize questions for each attempt (different questions on retry)
  const selectedQuestions = useMemo(() => {
    const allQuestions = exercise.questions || []

    // Si hay más de 5 preguntas, seleccionar 4 aleatorias
    // Esto da variedad en cada intento
    if (allQuestions.length > 5) {
      const shuffled = [...allQuestions].sort(() => Math.random() - 0.5)
      return shuffled.slice(0, 4)
    }

    // Si hay 5 o menos, mezclar el orden pero usar todas
    return [...allQuestions].sort(() => Math.random() - 0.5)
  }, [exercise.questions, attempts.length]) // Regenera cuando cambia el número de intentos

  const canRetry = exercise.allowRetry && (!exercise.maxAttempts || attempts.length < exercise.maxAttempts)

  const handleAnswerChange = (questionId: string, answer: any) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }))
  }

  const handleSubmit = async () => {
    // Validate all questions answered
    const allAnswered = selectedQuestions.every((q: any) => userAnswers[q.id] !== undefined)

    if (!allAnswered) {
      toast.error("Por favor responde todas las preguntas")
      return
    }

    setSubmitting(true)

    try {
      const answers = selectedQuestions.map((q: any) => ({
        questionId: q.id,
        answer: userAnswers[q.id],
      }))

      const response = await submitExercise({
        exerciseId: exercise._id,
        answers,
      })

      if (!response.success || !response.data) {
        toast.error(response.error || "Error al enviar el ejercicio")
        return
      }

      setResult(response.data)
      setShowFeedback(true)

      if (response.data.passed) {
        toast.success(`¡Felicitaciones! Aprobaste con ${response.data.score.toFixed(1)}%`)
      } else {
        toast.error(`No aprobaste. Obtuviste ${response.data.score.toFixed(1)}%`)
      }
    } catch (error) {
      toast.error("Error al enviar el ejercicio")
      console.error(error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleRetry = () => {
    setUserAnswers({})
    setShowFeedback(false)
    setResult(null)
  }

  const getQuestionResult = (questionId: string) => {
    if (!result || !showFeedback) return null
    const answer = result.attempt.answers.find((a: any) => a.questionId === questionId)
    return answer?.isCorrect
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">Ejercicio</Badge>
              {passed && (
                <Badge className="bg-green-500 hover:bg-green-600">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Aprobado
                </Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold">{exercise.title}</h1>
          </div>

          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-500" />
              <span>
                Puntuación mínima: <strong>{exercise.passingScore}%</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-blue-500" />
              <span>
                Preguntas: <strong>{selectedQuestions.length}</strong>
              </span>
            </div>
            {exercise.maxAttempts && (
              <div className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4 text-purple-500" />
                <span>
                  Intentos: <strong>{attempts.length} / {exercise.maxAttempts}</strong>
                </span>
              </div>
            )}
            {bestScore !== undefined && (
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-orange-500" />
                <span>
                  Mejor puntuación: <strong>{bestScore.toFixed(1)}%</strong>
                </span>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Result Card */}
      {showFeedback && result && (
        <Card className={`p-6 border-2 ${result.passed ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"}`}>
          <div className="flex items-center gap-4">
            {result.passed ? (
              <CheckCircle2 className="h-12 w-12 text-green-500 flex-shrink-0" />
            ) : (
              <XCircle className="h-12 w-12 text-red-500 flex-shrink-0" />
            )}
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-1">
                {result.passed ? "¡Aprobado!" : "No aprobado"}
              </h3>
              <p className="text-muted-foreground mb-3">
                Obtuviste {result.score.toFixed(1)}% (necesitas {exercise.passingScore}% para aprobar)
              </p>
              <Progress value={result.score} className="h-2" />
            </div>
          </div>

          {result.canRetry && !result.passed && (
            <div className="mt-4">
              <Button onClick={handleRetry} variant="outline" className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Intentar nuevamente
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Questions */}
      <div className="space-y-4">
        {selectedQuestions.map((question: any, index: number) => (
          <ExerciseQuestion
            key={question.id}
            question={question}
            questionNumber={index + 1}
            userAnswer={userAnswers[question.id]}
            onAnswerChange={(answer) => handleAnswerChange(question.id, answer)}
            showFeedback={showFeedback}
            isCorrect={getQuestionResult(question.id) ?? false}
          />
        ))}
      </div>

      {/* Submit Button */}
      {!showFeedback && (
        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={submitting}
            className="gap-2 min-w-[200px]"
          >
            {submitting ? (
              <>Enviando...</>
            ) : (
              <>
                <CheckCircle2 className="h-5 w-5" />
                Enviar respuestas
              </>
            )}
          </Button>
        </div>
      )}

      {/* Previous Attempts */}
      {attempts.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Intentos anteriores</h3>
          <div className="space-y-2">
            {attempts.map((attempt: any, index: number) => (
              <div
                key={attempt._id}
                className="flex items-center justify-between p-3 bg-muted rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Badge variant="outline">Intento {attempt.attemptNumber}</Badge>
                  {attempt.passed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span className="font-medium">{attempt.score.toFixed(1)}%</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {new Date(attempt.completedAt).toLocaleDateString("es-MX", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
