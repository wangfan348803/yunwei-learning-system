export type CategoryId = 'linux' | 'network' | 'cloud' | 'devops' | 'middleware' | 'sre'

export type QuestionType =
  | 'single'
  | 'multiple'
  | 'command'
  | 'log-analysis'
  | 'config'
  | 'scenario'

export type Level = 'basic' | 'intermediate' | 'advanced'

export interface Option {
  id: string
  text: string
}

export interface Question {
  id: string
  category: CategoryId
  type: QuestionType
  level: Level
  title: string
  prompt: string
  context?: string
  options: Option[]
  answer: string[]
  explanation: string
  /** One-line mnemonic (口诀) shown in the feedback drawer to aid recall. */
  mnemonic?: string
  wrongReasons: Partial<Record<string, string>>
  skillTags: string[]
  relatedCommand?: string
  docsLink?: string
  estimatedTime: number
}

export interface AnswerResult {
  isCorrect: boolean
  correctAnswer: string[]
  explanation: string
  selectedWrongReasons: string[]
  relatedCommand?: string
}

export interface CategoryStat {
  answered: number
  correct: number
}

export interface Mistake {
  questionId: string
  category: CategoryId
  reviewCount: number
  lastWrongAt: string
}

export interface LearningProgress {
  userId: string
  answered: number
  correct: number
  streak: number
  xp?: number
  level?: number
  unlockedAchievements?: string[]
  soundEnabled?: boolean
  categoryStats: Partial<Record<CategoryId, CategoryStat>>
  mistakes: Mistake[]
  /** ISO timestamp of the last local write; used for last-write-wins cloud sync. */
  updatedAt?: string
}

export interface AnswerEvent {
  questionId: string
  category: CategoryId
  isCorrect: boolean
  selected: string[]
  answeredAt: string
}
