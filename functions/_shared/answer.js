/**
 * @typedef {object} ServerQuestion
 * @property {string} id
 * @property {string} [category]
 * @property {string[]} answer
 * @property {string} explanation
 * @property {Record<string, string | undefined>} wrongReasons
 * @property {string} [relatedCommand]
 */

/** @param {string[]} values */
const normalize = (values) => [...new Set(values)].sort()

/**
 * @param {ServerQuestion} question
 * @param {string[]} selected
 */
export function evaluateAnswer(question, selected) {
  const normalizedSelected = normalize(Array.isArray(selected) ? selected : [])
  const normalizedAnswer = normalize(question.answer)
  const isCorrect =
    normalizedSelected.length === normalizedAnswer.length &&
    normalizedSelected.every((item, index) => item === normalizedAnswer[index])

  return {
    isCorrect,
    correctAnswer: normalizedAnswer,
    explanation: question.explanation,
    selectedWrongReasons: isCorrect
      ? []
      : normalizedSelected
          .filter((optionId) => !normalizedAnswer.includes(optionId))
          .map((optionId) => question.wrongReasons[optionId])
          .filter(Boolean),
    relatedCommand: question.relatedCommand,
  }
}

/** @param {any} question */
export function publicQuestion(question) {
  const safeQuestion = { ...question }
  delete safeQuestion.answer
  delete safeQuestion.wrongReasons
  return safeQuestion
}
