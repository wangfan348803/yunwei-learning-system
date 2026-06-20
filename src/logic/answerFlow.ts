import type { AnswerResult, Question } from '../types'

export function canAdvanceAfterAnswer(result: Pick<AnswerResult, 'isCorrect'> | null): boolean {
  return Boolean(result?.isCorrect)
}

export function shouldEvaluateSelection(question: Question, selected: string[]): boolean {
  if (selected.length === 0) {
    return false
  }

  if (question.type === 'multiple') {
    return selected.length >= question.answer.length
  }

  return true
}

export function getAdjacentQuestion(
  pool: Question[],
  currentQuestionId: string,
  direction: 'previous' | 'next',
): Question | null {
  if (pool.length === 0) {
    return null
  }

  const foundIndex = pool.findIndex((question) => question.id === currentQuestionId)
  if (foundIndex === -1) {
    return direction === 'next' ? pool[0] : pool[pool.length - 1]
  }
  const offset = direction === 'next' ? 1 : -1
  const nextIndex = (foundIndex + offset + pool.length) % pool.length

  return pool[nextIndex]
}

