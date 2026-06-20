import type { LearningProgress } from './types'
import { scheduleProgressSync } from './sync'

const storageKey = 'yunwei-learning-progress-v1'
const userIdKey = 'yunwei-user-id'

/**
 * Stable per-browser identity used as the cloud-sync code. Generated once and
 * persisted; acts as an unguessable bearer capability (no account/password).
 */
export function getUserId(): string {
  try {
    const existing = window.localStorage.getItem(userIdKey)
    if (existing) return existing
    const id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `u-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
    window.localStorage.setItem(userIdKey, id)
    return id
  } catch {
    return 'local'
  }
}

/** Switch to an existing sync code (e.g. when syncing a second device). */
export function setUserId(userId: string): void {
  try {
    window.localStorage.setItem(userIdKey, userId)
  } catch {
    /* ignore */
  }
}

const emptyProgress: Readonly<LearningProgress> = Object.freeze({
  userId: 'local',
  answered: 0,
  correct: 0,
  streak: 0,
  xp: 0,
  level: 1,
  unlockedAchievements: [],
  soundEnabled: true,
  categoryStats: {},
  mistakes: [],
})

/** Returns a fresh deep copy of the default progress — safe to mutate. */
function freshProgress(): LearningProgress {
  return structuredClone(emptyProgress) as LearningProgress
}

export { emptyProgress }

/** Whitelist and type-check parsed JSON to prevent corrupted data from crashing the app. */
function validateProgress(raw: unknown): Partial<LearningProgress> {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    return {}
  }

  const obj = raw as Record<string, unknown>
  const safe: Partial<LearningProgress> = {}

  if (typeof obj.userId === 'string') safe.userId = obj.userId
  if (typeof obj.answered === 'number' && obj.answered >= 0) safe.answered = obj.answered
  if (typeof obj.correct === 'number' && obj.correct >= 0) safe.correct = obj.correct
  if (typeof obj.streak === 'number' && obj.streak >= 0) safe.streak = obj.streak
  if (typeof obj.xp === 'number' && obj.xp >= 0) safe.xp = obj.xp
  if (typeof obj.level === 'number' && obj.level >= 1) safe.level = obj.level
  if (typeof obj.soundEnabled === 'boolean') safe.soundEnabled = obj.soundEnabled
  if (Array.isArray(obj.unlockedAchievements)) safe.unlockedAchievements = obj.unlockedAchievements.filter((a: unknown) => typeof a === 'string')
  if (typeof obj.categoryStats === 'object' && obj.categoryStats !== null && !Array.isArray(obj.categoryStats)) {
    const rawStats = obj.categoryStats as Record<string, unknown>
    const validatedStats: LearningProgress['categoryStats'] = {}
    for (const [key, value] of Object.entries(rawStats)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        const stat = value as Record<string, unknown>
        if (typeof stat.answered === 'number' && stat.answered >= 0 &&
            typeof stat.correct === 'number' && stat.correct >= 0) {
          validatedStats[key as keyof LearningProgress['categoryStats']] = {
            answered: stat.answered,
            correct: stat.correct,
          }
        }
      }
    }
    safe.categoryStats = validatedStats
  }
  if (Array.isArray(obj.mistakes)) safe.mistakes = obj.mistakes.filter((m: unknown) => typeof m === 'object' && m !== null && typeof (m as Record<string, unknown>).questionId === 'string') as LearningProgress['mistakes']
  if (typeof obj.updatedAt === 'string') safe.updatedAt = obj.updatedAt

  return safe
}

export function loadProgress(): LearningProgress {
  try {
    const raw = window.localStorage.getItem(storageKey)
    const base = freshProgress()
    base.userId = getUserId()
    if (!raw) {
      return base
    }

    const parsed = JSON.parse(raw)
    const progress = validateProgress(parsed)
    return {
      ...base,
      ...progress,
      userId: base.userId,
    }
  } catch {
    return freshProgress()
  }
}

/** Write to localStorage without re-stamping or triggering a remote push (used when applying a remote snapshot). */
export function writeProgressLocal(progress: LearningProgress): void {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(progress))
  } catch (e) {
    console.warn('Failed to save progress to localStorage:', e)
  }
}

export function saveProgress(progress: LearningProgress): void {
  const stamped: LearningProgress = {
    ...progress,
    userId: getUserId(),
    updatedAt: new Date().toISOString(),
  }
  writeProgressLocal(stamped)
  void scheduleProgressSync(stamped)
}
