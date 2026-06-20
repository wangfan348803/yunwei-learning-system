import type { AnswerResult, Question } from '../types'

const normalize = (values: string[]) => [...new Set(values)].sort()

export function evaluateAnswer(question: Question, selected: string[]): AnswerResult {
  const normalizedSelected = normalize(selected)
  const normalizedAnswer = normalize(question.answer)
  const isCorrect =
    normalizedSelected.length === normalizedAnswer.length &&
    normalizedSelected.every((item, index) => item === normalizedAnswer[index])

  let relatedCommand = question.relatedCommand
  if (question.type === 'command') {
    const correctOptionId = question.answer[0]
    const option = question.options.find((o) => o.id === correctOptionId)
    if (option && option.text && !/[\u4e00-\u9fa5]/.test(option.text)) {
      relatedCommand = option.text
    }
  }

  return {
    isCorrect,
    correctAnswer: normalizedAnswer,
    explanation: question.explanation,
    selectedWrongReasons: isCorrect
      ? []
      : normalizedSelected
          .filter((optionId) => !normalizedAnswer.includes(optionId))
          .map((optionId) => question.wrongReasons[optionId])
          .filter((reason): reason is string => Boolean(reason)),
    relatedCommand,
  }
}
