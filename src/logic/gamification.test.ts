import { describe, expect, it } from 'vitest'
import { getLevelInfo, calculateXpGain, checkNewAchievements } from './gamification'
import type { LearningProgress } from '../types'

const baseProgress: LearningProgress = {
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
}

describe('getLevelInfo', () => {
  it('returns level 1 for 0 XP', () => {
    const info = getLevelInfo(0)
    expect(info.level).toBe(1)
    expect(info.title).toBe('运维萌新')
    expect(info.percent).toBe(0)
    expect(info.currentLevelXp).toBe(0)
    expect(info.nextLevelXp).toBe(100)
  })

  it('returns correct progress within level 1', () => {
    const info = getLevelInfo(50)
    expect(info.level).toBe(1)
    expect(info.percent).toBe(50)
    expect(info.currentLevelXp).toBe(50)
  })

  it('advances to level 2 at exactly 100 XP', () => {
    const info = getLevelInfo(100)
    expect(info.level).toBe(2)
    expect(info.title).toBe('初级系统管理员')
    expect(info.currentLevelXp).toBe(0)
    expect(info.percent).toBe(0)
  })

  it('reaches each level boundary correctly', () => {
    const boundaries = [0, 100, 300, 600, 1000, 1500]
    boundaries.forEach((xp, i) => {
      const info = getLevelInfo(xp)
      expect(info.level).toBe(i + 1)
    })
  })

  it('handles max level (level 6 at 1500 XP)', () => {
    const info = getLevelInfo(1500)
    expect(info.level).toBe(6)
    expect(info.title).toBe('首席系统架构总监')
    expect(info.currentLevelXp).toBe(0)
  })

  it('handles XP beyond max level gracefully', () => {
    const info = getLevelInfo(2200)
    expect(info.level).toBe(6)
    expect(info.percent).toBeLessThanOrEqual(100)
    expect(info.totalXp).toBe(2200)
  })

  it('handles negative XP without crashing', () => {
    const info = getLevelInfo(-10)
    expect(info.level).toBe(1)
    expect(info.percent).toBe(0)
  })
})

describe('calculateXpGain', () => {
  it('gives 1 XP for wrong answers (participation point)', () => {
    expect(calculateXpGain(false, 0)).toBe(1)
    expect(calculateXpGain(false, 10)).toBe(1)
  })

  it('gives 10 base XP for correct answer with no streak', () => {
    expect(calculateXpGain(true, 0)).toBe(10)
  })

  it('adds +2 XP per streak level', () => {
    expect(calculateXpGain(true, 1)).toBe(12)
    expect(calculateXpGain(true, 2)).toBe(14)
    expect(calculateXpGain(true, 3)).toBe(16)
  })

  it('caps streak bonus at streak 5 (+10 max bonus)', () => {
    expect(calculateXpGain(true, 5)).toBe(20)
    expect(calculateXpGain(true, 6)).toBe(20)
    expect(calculateXpGain(true, 100)).toBe(20)
  })
})

describe('checkNewAchievements', () => {
  it('returns empty array for fresh progress', () => {
    expect(checkNewAchievements(baseProgress)).toEqual([])
  })

  it('unlocks first-correct after 1 correct answer', () => {
    const progress = { ...baseProgress, correct: 1 }
    const unlocked = checkNewAchievements(progress)
    expect(unlocked).toContain('first-correct')
  })

  it('unlocks streak-3 at streak = 3', () => {
    const progress = { ...baseProgress, correct: 3, streak: 3 }
    const unlocked = checkNewAchievements(progress)
    expect(unlocked).toContain('streak-3')
  })

  it('unlocks both streak-3 and streak-7 at streak = 7', () => {
    const progress = { ...baseProgress, correct: 7, streak: 7 }
    const unlocked = checkNewAchievements(progress)
    expect(unlocked).toContain('streak-3')
    expect(unlocked).toContain('streak-7')
  })

  it('unlocks linux-master at 15 linux correct', () => {
    const progress = {
      ...baseProgress,
      correct: 15,
      categoryStats: { linux: { answered: 20, correct: 15 } },
    }
    const unlocked = checkNewAchievements(progress)
    expect(unlocked).toContain('linux-master')
  })

  it('unlocks sre-savior at 15 sre correct', () => {
    const progress = {
      ...baseProgress,
      correct: 15,
      categoryStats: { sre: { answered: 20, correct: 15 } },
    }
    const unlocked = checkNewAchievements(progress)
    expect(unlocked).toContain('sre-savior')
  })

  it('unlocks versatile when 3+ categories have 5+ correct', () => {
    const progress = {
      ...baseProgress,
      correct: 15,
      categoryStats: {
        linux: { answered: 6, correct: 5 },
        network: { answered: 7, correct: 5 },
        cloud: { answered: 8, correct: 6 },
      },
    }
    const unlocked = checkNewAchievements(progress)
    expect(unlocked).toContain('versatile')
  })

  it('does NOT unlock versatile with only 2 qualifying categories', () => {
    const progress = {
      ...baseProgress,
      correct: 10,
      categoryStats: {
        linux: { answered: 6, correct: 5 },
        network: { answered: 7, correct: 5 },
        cloud: { answered: 8, correct: 2 },
      },
    }
    const unlocked = checkNewAchievements(progress)
    expect(unlocked).not.toContain('versatile')
  })

  it('does NOT re-unlock already unlocked achievements (idempotency)', () => {
    const progress = {
      ...baseProgress,
      correct: 10,
      streak: 5,
      unlockedAchievements: ['first-correct', 'streak-3'],
    }
    const unlocked = checkNewAchievements(progress)
    expect(unlocked).not.toContain('first-correct')
    expect(unlocked).not.toContain('streak-3')
  })

  it('handles missing unlockedAchievements gracefully (undefined)', () => {
    const progress = {
      ...baseProgress,
      correct: 1,
      unlockedAchievements: undefined,
    } as LearningProgress
    const unlocked = checkNewAchievements(progress)
    expect(unlocked).toContain('first-correct')
  })
})
