import { describe, expect, it } from 'vitest'
import { reconcileProgress } from './sync'
import type { LearningProgress } from './types'

const make = (updatedAt: string | undefined, answered: number): LearningProgress => ({
  userId: 'u1',
  answered,
  correct: 0,
  streak: 0,
  categoryStats: {},
  mistakes: [],
  updatedAt,
})

describe('reconcileProgress', () => {
  it('returns local when remote is null', () => {
    const local = make('2026-06-01T00:00:00.000Z', 5)
    expect(reconcileProgress(local, null)).toBe(local)
  })

  it('returns remote when local is null', () => {
    const remote = make('2026-06-01T00:00:00.000Z', 5)
    expect(reconcileProgress(null, remote)).toBe(remote)
  })

  it('returns null when both are null', () => {
    expect(reconcileProgress(null, null)).toBeNull()
  })

  it('picks the snapshot with the newer updatedAt (remote newer)', () => {
    const local = make('2026-06-01T00:00:00.000Z', 5)
    const remote = make('2026-06-02T00:00:00.000Z', 3)
    expect(reconcileProgress(local, remote)).toBe(remote)
  })

  it('keeps local when it is newer or equal', () => {
    const local = make('2026-06-02T00:00:00.000Z', 5)
    const remote = make('2026-06-01T00:00:00.000Z', 3)
    expect(reconcileProgress(local, remote)).toBe(local)
  })

  it('treats a missing updatedAt as oldest', () => {
    const local = make(undefined, 5)
    const remote = make('2026-06-01T00:00:00.000Z', 3)
    expect(reconcileProgress(local, remote)).toBe(remote)
  })
})
