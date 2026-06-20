import type { AnswerEvent, CategoryStat, LearningProgress, Mistake } from '../types'

const emptyStat = (): CategoryStat => ({ answered: 0, correct: 0 })

function updateMistakes(progress: LearningProgress, event: AnswerEvent): Mistake[] {
  if (event.isCorrect) {
    // "Heal" the mistake: remove it from the list when answered correctly
    return progress.mistakes.filter((item) => item.questionId !== event.questionId)
  }

  const existing = progress.mistakes.find((item) => item.questionId === event.questionId)
  if (!existing) {
    return [
      ...progress.mistakes,
      {
        questionId: event.questionId,
        category: event.category,
        reviewCount: 0,
        lastWrongAt: event.answeredAt,
      },
    ]
  }

  return progress.mistakes.map((item) =>
    item.questionId === event.questionId
      ? {
          ...item,
          reviewCount: item.reviewCount + 1,
          lastWrongAt: event.answeredAt,
        }
      : item,
  )
}

export function recordAnswer(progress: LearningProgress, event: AnswerEvent): LearningProgress {
  const currentCategory = progress.categoryStats[event.category] ?? emptyStat()

  return {
    ...progress,
    answered: progress.answered + 1,
    correct: progress.correct + (event.isCorrect ? 1 : 0),
    streak: event.isCorrect ? progress.streak + 1 : 0,
    categoryStats: {
      ...progress.categoryStats,
      [event.category]: {
        answered: currentCategory.answered + 1,
        correct: currentCategory.correct + (event.isCorrect ? 1 : 0),
      },
    },
    mistakes: updateMistakes(progress, event),
  }
}

export function accuracy(progress: Pick<LearningProgress, 'answered' | 'correct'>): number {
  if (progress.answered === 0) {
    return 0
  }

  return Math.round((progress.correct / progress.answered) * 100)
}
