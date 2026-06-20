import { describe, expect, it } from 'vitest'
import { recordAnswer } from './progress'
import type { LearningProgress } from '../types'

const initial: LearningProgress = {
  userId: 'local',
  answered: 0,
  correct: 0,
  streak: 0,
  categoryStats: {},
  mistakes: [],
}

describe('recordAnswer', () => {
  it('increments totals and category stats after a correct answer', () => {
    const next = recordAnswer(initial, {
      questionId: 'linux-port-owner',
      category: 'linux',
      isCorrect: true,
      selected: ['b'],
      answeredAt: '2026-06-02T00:00:00.000Z',
    })

    expect(next.answered).toBe(1)
    expect(next.correct).toBe(1)
    expect(next.streak).toBe(1)
    expect(next.categoryStats.linux).toMatchObject({ answered: 1, correct: 1 })
  })

  it('records mistakes and resets streak after a wrong answer', () => {
    const next = recordAnswer(initial, {
      questionId: 'k8s-service-selector',
      category: 'devops',
      isCorrect: false,
      selected: ['c'],
      answeredAt: '2026-06-02T00:00:00.000Z',
    })

    expect(next.correct).toBe(0)
    expect(next.streak).toBe(0)
    expect(next.mistakes).toEqual([
      {
        questionId: 'k8s-service-selector',
        category: 'devops',
        reviewCount: 0,
        lastWrongAt: '2026-06-02T00:00:00.000Z',
      },
    ])
  })

  it('updates an existing mistake instead of duplicating it', () => {
    const withMistake = recordAnswer(initial, {
      questionId: 'docker-volume-lost',
      category: 'devops',
      isCorrect: false,
      selected: ['a'],
      answeredAt: '2026-06-02T00:00:00.000Z',
    })
    const next = recordAnswer(withMistake, {
      questionId: 'docker-volume-lost',
      category: 'devops',
      isCorrect: false,
      selected: ['b'],
      answeredAt: '2026-06-03T00:00:00.000Z',
    })

    expect(next.mistakes).toHaveLength(1)
    expect(next.mistakes[0]).toMatchObject({
      reviewCount: 1,
      lastWrongAt: '2026-06-03T00:00:00.000Z',
    })
  })
})
