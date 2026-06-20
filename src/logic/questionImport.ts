import type { CategoryId, Level, Question, QuestionType } from '../types'

const importedQuestionsStorageKey = 'yunwei-imported-questions-v1'

const categoryIds: CategoryId[] = ['linux', 'network', 'cloud', 'devops', 'middleware', 'sre']
const questionTypes: QuestionType[] = ['single', 'multiple', 'command', 'log-analysis', 'config', 'scenario']
const levels: Level[] = ['basic', 'intermediate', 'advanced']

type RawOption = string | { id?: unknown; text?: unknown }
type RawQuestion = Partial<Omit<Question, 'options' | 'answer' | 'wrongReasons' | 'skillTags'>> & {
  options?: RawOption[]
  answer?: unknown
  wrongReasons?: unknown
  skillTags?: unknown
}

export interface QuestionImportResult {
  questions: Question[]
  errors: string[]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(asString).filter(Boolean)
  }

  const single = asString(value)
  return single ? [single] : []
}

function normalizeOption(option: RawOption, index: number) {
  if (typeof option === 'string') {
    return {
      id: String.fromCharCode(97 + index),
      text: option.trim(),
    }
  }

  return {
    id: asString(option.id).toLowerCase(),
    text: asString(option.text),
  }
}

function normalizeWrongReasons(value: unknown): Partial<Record<string, string>> {
  if (!isRecord(value)) return {}

  return Object.entries(value).reduce<Partial<Record<string, string>>>((result, [key, reason]) => {
    const text = asString(reason)
    if (text) {
      result[key.toLowerCase()] = text
    }
    return result
  }, {})
}

function getPayloadQuestions(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload
  if (isRecord(payload) && Array.isArray(payload.questions)) return payload.questions
  return []
}

export function parseImportedQuestions(payload: unknown): QuestionImportResult {
  const rawQuestions = getPayloadQuestions(payload)
  const errors: string[] = []
  const seenIds = new Set<string>()
  const importedAt = Date.now()
  const parsedQuestions: Question[] = []

  if (rawQuestions.length === 0) {
    return {
      questions: [],
      errors: ['没有找到 questions 数组。文件可以是题目数组，也可以是 { "questions": [...] }。'],
    }
  }

  rawQuestions.forEach((raw, index) => {
    const rowLabel = `第 ${index + 1} 题`
    const rowErrors: string[] = []

    if (!isRecord(raw)) {
      errors.push(`${rowLabel}: 题目必须是对象。`)
      return
    }

    const item = raw as RawQuestion
    const id = asString(item.id) || `imported-${importedAt}-${index + 1}`
    const category = asString(item.category) as CategoryId
    const type = (asString(item.type) || 'single') as QuestionType
    const level = (asString(item.level) || 'basic') as Level
    const title = asString(item.title)
    const prompt = asString(item.prompt)
    const explanation = asString(item.explanation)
    const options = Array.isArray(item.options)
      ? item.options.map(normalizeOption).filter((option) => option.id && option.text)
      : []
    const answer = asStringArray(item.answer).map((answerId) => answerId.toLowerCase())
    const optionIds = new Set(options.map((option) => option.id))

    if (seenIds.has(id)) rowErrors.push(`id "${id}" 在导入文件里重复。`)
    if (!categoryIds.includes(category)) rowErrors.push(`category 必须是 ${categoryIds.join(', ')} 之一。`)
    if (!questionTypes.includes(type)) rowErrors.push(`type 必须是 ${questionTypes.join(', ')} 之一。`)
    if (!levels.includes(level)) rowErrors.push(`level 必须是 ${levels.join(', ')} 之一。`)
    if (!title) rowErrors.push('缺少 title。')
    if (!prompt) rowErrors.push('缺少 prompt。')
    if (options.length < 2) rowErrors.push('options 至少需要 2 个选项。')
    if (answer.length === 0) rowErrors.push('answer 至少需要 1 个答案。')
    if (answer.some((answerId) => !optionIds.has(answerId))) {
      rowErrors.push('answer 必须引用 options 里存在的 id。')
    }
    if (!explanation) rowErrors.push('缺少 explanation。')

    if (rowErrors.length > 0) {
      rowErrors.forEach((error) => errors.push(`${rowLabel}: ${error}`))
      return
    }

    seenIds.add(id)

    const skillTags = asStringArray(item.skillTags)

    parsedQuestions.push({
      id,
      category,
      type,
      level,
      title,
      prompt,
      context: asString(item.context) || undefined,
      options,
      answer,
      explanation,
      wrongReasons: normalizeWrongReasons(item.wrongReasons),
      skillTags: skillTags.length > 0 ? skillTags : ['自定义导入'],
      relatedCommand: asString(item.relatedCommand) || undefined,
      docsLink: asString(item.docsLink) || undefined,
      estimatedTime: Number(item.estimatedTime) > 0 ? Number(item.estimatedTime) : 60,
    })
  })

  return { questions: parsedQuestions, errors }
}

export function loadImportedQuestions(): Question[] {
  if (typeof window === 'undefined') return []

  try {
    const raw = window.localStorage.getItem(importedQuestionsStorageKey)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    return parseImportedQuestions(parsed).questions
  } catch (error) {
    console.warn('Failed to load imported questions:', error)
    return []
  }
}

export function saveImportedQuestions(importedQuestions: Question[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(importedQuestionsStorageKey, JSON.stringify({ questions: importedQuestions }))
}

export function clearImportedQuestions() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(importedQuestionsStorageKey)
}

export function createQuestionImportTemplate() {
  return {
    questions: [
      {
        id: 'custom-linux-log-001',
        category: 'linux',
        type: 'single',
        level: 'basic',
        title: '查看 systemd 服务日志',
        prompt: '线上服务异常时，想查看 nginx 这个 systemd 服务最近 100 行日志，优先使用哪个命令？',
        context: '',
        options: [
          { id: 'a', text: 'journalctl -u nginx -n 100' },
          { id: 'b', text: 'cat /etc/passwd' },
          { id: 'c', text: 'lsblk' },
          { id: 'd', text: 'whoami' },
        ],
        answer: ['a'],
        explanation:
          'journalctl -u 可以按 systemd unit 查看日志，-n 100 表示最近 100 行，适合快速定位服务异常。',
        wrongReasons: {
          b: 'cat /etc/passwd 查看的是用户信息，不是服务日志。',
          c: 'lsblk 查看块设备，不用于日志排查。',
          d: 'whoami 只显示当前用户。',
        },
        skillTags: ['journalctl', 'systemd', '日志'],
        relatedCommand: 'journalctl -u nginx -n 100',
        estimatedTime: 45,
      },
    ],
  }
}
