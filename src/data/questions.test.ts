import { describe, expect, it } from 'vitest'
import { categories, questions } from './questions'

describe('question bank coverage', () => {
  it('ships job-market-driven coverage across all operations domains', () => {
    const expectedCounts = new Map([
      ['linux', 42],
      ['network', 42],
      ['cloud', 42],
      ['devops', 42],
      ['middleware', 42],
      ['sre', 42],
    ])

    expect(questions).toHaveLength(252)

    for (const category of categories) {
      const expectedCount = expectedCounts.get(category.id)
      expect(expectedCount).toBeDefined()
      expect(questions.filter((question) => question.category === category.id)).toHaveLength(
        expectedCount as number,
      )
    }
  })

  it('keeps every question answerable and explainable', () => {
    const ids = new Set<string>()

    for (const question of questions) {
      expect(ids.has(question.id)).toBe(false)
      ids.add(question.id)
      expect(question.options.length).toBeGreaterThanOrEqual(4)
      expect(question.answer.length).toBeGreaterThanOrEqual(1)
      expect(question.explanation.length).toBeGreaterThan(10)
      expect(question.skillTags.length).toBeGreaterThan(0)
      expect(question.answer.every((answer) => question.options.some((option) => option.id === answer))).toBe(
        true,
      )
    }
  })
})
