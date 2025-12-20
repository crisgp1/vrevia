"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, Lightbulb } from "lucide-react"

interface Question {
  id: string
  question: string
  type: "multiple-choice" | "fill-blank" | "matching" | "ordering" | "short-answer" | "translation"
  options?: string[]
  correctAnswer?: string | string[]
  blanks?: Array<{ id: string; correctAnswer: string | string[]; caseSensitive?: boolean }>
  pairs?: Array<{ left: string; right: string }>
  items?: Array<{ text: string; correctPosition: number }>
  points: number
  explanation?: string
  hint?: string
}

interface ExerciseQuestionProps {
  question: Question
  questionNumber: number
  userAnswer: any
  onAnswerChange: (answer: any) => void
  showFeedback?: boolean
  isCorrect?: boolean
}

export function ExerciseQuestion({
  question,
  questionNumber,
  userAnswer,
  onAnswerChange,
  showFeedback = false,
  isCorrect = false,
}: ExerciseQuestionProps) {
  const [showHint, setShowHint] = useState(false)

  // Render fill-in-the-blank
  const renderFillBlank = () => {
    // Split question by {{blank:X}} markers
    const parts = question.question.split(/(\{\{blank:\d+\}\})/g)
    const blankAnswers = userAnswer || {}

    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {parts.map((part, index) => {
            const blankMatch = part.match(/\{\{blank:(\d+)\}\}/)
            if (blankMatch) {
              const blankId = blankMatch[1]
              const blank = question.blanks?.find((b) => b.id === blankId)
              const answer = blankAnswers[blankId] || ""

              return (
                <Input
                  key={index}
                  value={answer}
                  onChange={(e) =>
                    onAnswerChange({ ...blankAnswers, [blankId]: e.target.value })
                  }
                  disabled={showFeedback}
                  className={`w-32 inline-block ${
                    showFeedback
                      ? isCorrect
                        ? "border-green-500 bg-green-50"
                        : "border-red-500 bg-red-50"
                      : ""
                  }`}
                  placeholder="..."
                />
              )
            }
            return (
              <span key={index} className="inline">
                {part}
              </span>
            )
          })}
        </div>

        {showFeedback && !isCorrect && (
          <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
            <p className="font-medium mb-1">Respuestas correctas:</p>
            {question.blanks?.map((blank) => (
              <div key={blank.id}>
                Espacio {blank.id}:{" "}
                <span className="font-medium">
                  {Array.isArray(blank.correctAnswer)
                    ? blank.correctAnswer.join(" / ")
                    : blank.correctAnswer}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Render multiple choice
  const renderMultipleChoice = () => {
    return (
      <div className="space-y-3">
        {question.options?.map((option, index) => {
          const isSelected = userAnswer === option
          const isCorrectOption = option === question.correctAnswer

          return (
            <button
              key={index}
              onClick={() => !showFeedback && onAnswerChange(option)}
              disabled={showFeedback}
              className={`
                w-full text-left p-4 rounded-lg border-2 transition-all
                ${isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}
                ${
                  showFeedback && isCorrectOption
                    ? "border-green-500 bg-green-50"
                    : showFeedback && isSelected && !isCorrectOption
                    ? "border-red-500 bg-red-50"
                    : ""
                }
                ${showFeedback ? "cursor-not-allowed" : "cursor-pointer"}
              `}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`
                  w-6 h-6 rounded-full border-2 flex items-center justify-center
                  ${isSelected ? "border-primary bg-primary" : "border-border"}
                  ${showFeedback && isCorrectOption ? "border-green-500 bg-green-500" : ""}
                `}
                >
                  {isSelected && (
                    <div className="w-3 h-3 rounded-full bg-white" />
                  )}
                  {showFeedback && isCorrectOption && (
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  )}
                </div>
                <span className="flex-1">{option}</span>
                {showFeedback && isSelected && !isCorrectOption && (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
              </div>
            </button>
          )
        })}
      </div>
    )
  }

  // Render short answer / translation
  const renderShortAnswer = () => {
    return (
      <div className="space-y-3">
        <Input
          value={userAnswer || ""}
          onChange={(e) => onAnswerChange(e.target.value)}
          disabled={showFeedback}
          placeholder="Escribe tu respuesta..."
          className={`
            ${
              showFeedback
                ? isCorrect
                  ? "border-green-500 bg-green-50"
                  : "border-red-500 bg-red-50"
                : ""
            }
          `}
        />
        {showFeedback && !isCorrect && (
          <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
            <p className="font-medium mb-1">Respuesta correcta:</p>
            <p className="font-medium">
              {Array.isArray(question.correctAnswer)
                ? question.correctAnswer.join(" / ")
                : question.correctAnswer}
            </p>
          </div>
        )}
      </div>
    )
  }

  // Render matching
  const renderMatching = () => {
    const userMatches = userAnswer || {}

    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground mb-4">
          Arrastra o selecciona para emparejar los elementos:
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left column */}
          <div className="space-y-2">
            {question.pairs?.map((pair, index) => (
              <div
                key={index}
                className="p-3 bg-primary/5 border-2 border-primary/20 rounded-lg font-medium"
              >
                {pair.left}
              </div>
            ))}
          </div>

          {/* Right column (shuffled) */}
          <div className="space-y-2">
            {question.pairs?.map((pair, index) => (
              <Input
                key={index}
                value={userMatches[pair.left] || ""}
                onChange={(e) =>
                  onAnswerChange({ ...userMatches, [pair.left]: e.target.value })
                }
                disabled={showFeedback}
                placeholder={`Empareja con ${pair.left}...`}
                className={`
                  ${
                    showFeedback
                      ? userMatches[pair.left] === pair.right
                        ? "border-green-500 bg-green-50"
                        : "border-red-500 bg-red-50"
                      : ""
                  }
                `}
              />
            ))}
          </div>
        </div>

        {showFeedback && (
          <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
            <p className="font-medium mb-2">Respuestas correctas:</p>
            {question.pairs?.map((pair, index) => (
              <div key={index}>
                {pair.left} → <span className="font-medium">{pair.right}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Question header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">Pregunta {questionNumber}</Badge>
              <Badge variant="outline">{question.points} puntos</Badge>
              {question.hint && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHint(!showHint)}
                  className="gap-2"
                >
                  <Lightbulb className="h-4 w-4" />
                  Pista
                </Button>
              )}
            </div>
            <p className="text-lg font-medium">
              {!question.question.includes("{{blank:") && question.question}
            </p>
          </div>
          {showFeedback && (
            <div>
              {isCorrect ? (
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              ) : (
                <XCircle className="h-8 w-8 text-red-500" />
              )}
            </div>
          )}
        </div>

        {/* Hint */}
        {showHint && question.hint && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <p className="text-sm text-blue-900">💡 {question.hint}</p>
          </div>
        )}

        {/* Question content */}
        <div>
          {question.type === "fill-blank" && renderFillBlank()}
          {question.type === "multiple-choice" && renderMultipleChoice()}
          {(question.type === "short-answer" || question.type === "translation") &&
            renderShortAnswer()}
          {question.type === "matching" && renderMatching()}
        </div>

        {/* Explanation */}
        {showFeedback && question.explanation && (
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm font-medium mb-1">Explicación:</p>
            <p className="text-sm text-muted-foreground">{question.explanation}</p>
          </div>
        )}
      </div>
    </Card>
  )
}
