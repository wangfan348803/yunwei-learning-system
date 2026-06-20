import type { LearningProgress, CategoryId } from '../types'

export interface LevelInfo {
  level: number
  title: string
  currentLevelXp: number // XP accumulated inside this level
  nextLevelXp: number // XP needed to level up from the start of this level
  percent: number // Percentage of progress in current level
  totalXp: number
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  conditionDesc: string
}

export const levels = [
  { level: 1, title: '运维萌新', minXp: 0 },
  { level: 2, title: '初级系统管理员', minXp: 100 },
  { level: 3, title: '自动化运维专家', minXp: 300 },
  { level: 4, title: '云原生架构师', minXp: 600 },
  { level: 5, title: 'SRE 保障专家', minXp: 1000 },
  { level: 6, title: '首席系统架构总监', minXp: 1500 }
]

export const achievements: Achievement[] = [
  {
    id: 'first-correct',
    title: '初试锋芒',
    description: '首次成功解答了一道运维实战题！',
    icon: '🌱',
    conditionDesc: '首次答对 1 道题目'
  },
  {
    id: 'streak-3',
    title: '渐入佳境',
    description: '连续答对 3 道题，火焰开始燃烧了！',
    icon: '🔥',
    conditionDesc: '连对次数达到 3 次'
  },
  {
    id: 'streak-7',
    title: '势不可挡',
    description: '达成连对 7 次，你对系统操作已经了如指掌！',
    icon: '⚡',
    conditionDesc: '连对次数达到 7 次'
  },
  {
    id: 'linux-master',
    title: 'Linux 行家里手',
    description: '成功答对 15 道 Linux 自动化相关的核心题目。',
    icon: '🐧',
    conditionDesc: 'Linux 分类答对 15 道题'
  },
  {
    id: 'sre-savior',
    title: 'SRE 现场救火员',
    description: '成功答对 15 道 SRE 交付闭环与故障排查相关的难题。',
    icon: '🚒',
    conditionDesc: 'SRE 分类答对 15 道题'
  },
  {
    id: 'versatile',
    title: '全能战士',
    description: '在至少 3 个不同的运维类别中分别答对过 5 道及以上题目。',
    icon: '🏆',
    conditionDesc: '至少 3 个分类分别答对 5 道题'
  }
]

// Get detailed Level info based on total XP
export function getLevelInfo(xp: number): LevelInfo {
  let currentLevel = levels[0]
  let nextLevel = levels[1]
  let isMaxLevel = false

  for (let i = 0; i < levels.length; i++) {
    if (xp >= levels[i].minXp) {
      currentLevel = levels[i]
      if (i === levels.length - 1) {
        isMaxLevel = true
        nextLevel = { level: levels[i].level + 1, title: levels[i].title, minXp: levels[i].minXp + 1000 }
      } else {
        nextLevel = levels[i + 1]
      }
    } else {
      break
    }
  }

  const levelRange = nextLevel.minXp - currentLevel.minXp
  const levelProgress = xp - currentLevel.minXp
  const percent = isMaxLevel ? 100 : Math.min(100, Math.max(0, Math.round((levelProgress / levelRange) * 100)))

  return {
    level: currentLevel.level,
    title: currentLevel.title,
    currentLevelXp: levelProgress,
    nextLevelXp: levelRange,
    percent,
    totalXp: xp
  }
}

// Calculate XP gained from an answer
export function calculateXpGain(isCorrect: boolean, currentStreak: number): number {
  if (!isCorrect) {
    return 1 // Encouragement/participation point for incorrect answers
  }
  
  const base = 10
  // Streak bonus: +2 XP per streak up to a maximum of +10 XP (streak count of 5)
  const bonus = Math.min(currentStreak, 5) * 2
  return base + bonus
}

// Evaluate which new achievements are unlocked
export function checkNewAchievements(progress: LearningProgress): string[] {
  const currentUnlocked = new Set(progress.unlockedAchievements || [])
  const newlyUnlocked: string[] = []

  // Helper to check and push if not already unlocked
  const tryUnlock = (id: string) => {
    if (!currentUnlocked.has(id)) {
      newlyUnlocked.push(id)
    }
  }

  // 1. Check first-correct
  if (progress.correct >= 1) {
    tryUnlock('first-correct')
  }

  // 2. Check streak achievements
  if (progress.streak >= 3) {
    tryUnlock('streak-3')
  }
  if (progress.streak >= 7) {
    tryUnlock('streak-7')
  }

  // 3. Check categories
  const linuxCorrect = progress.categoryStats['linux']?.correct || 0
  if (linuxCorrect >= 15) {
    tryUnlock('linux-master')
  }

  const sreCorrect = progress.categoryStats['sre']?.correct || 0
  if (sreCorrect >= 15) {
    tryUnlock('sre-savior')
  }

  // 4. Check versatile (at least 3 categories with >= 5 correct answers)
  let countCategoriesWith5 = 0
  const categoriesList: CategoryId[] = ['linux', 'network', 'cloud', 'devops', 'middleware', 'sre']
  categoriesList.forEach(cat => {
    const correctCount = progress.categoryStats[cat]?.correct || 0
    if (correctCount >= 5) {
      countCategoriesWith5++
    }
  })
  if (countCategoriesWith5 >= 3) {
    tryUnlock('versatile')
  }

  return newlyUnlocked
}
