// @ts-expect-error The shared runtime question bank is JavaScript and is asserted below.
import { questions as sharedQuestions } from '../../functions/_shared/questions.js'
import type { CategoryId, Question } from '../types'

export const categories: Array<{
  id: CategoryId
  name: string
  description: string
  accent: string
}> = [
  { id: 'linux', name: 'Linux 自动化', description: '系统、脚本、日志、巡检与权限', accent: '#32d583' },
  { id: 'network', name: '网络安全', description: 'DNS、TLS、LB、防火墙与访问边界', accent: '#38bdf8' },
  { id: 'cloud', name: '云平台数据中心', description: 'VPC、SLB、IAM、备份、合规与机房', accent: '#f59e0b' },
  { id: 'devops', name: '容器 DevOps', description: 'Docker、K8s、CI/CD、发布与回滚', accent: '#60a5fa' },
  { id: 'middleware', name: '数据库中间件', description: 'MySQL、Redis、Nginx、MQ、JVM 与 AI/GPU', accent: '#a78bfa' },
  { id: 'sre', name: 'SRE 交付闭环', description: '告警、事故、容量、Runbook、验收与现场', accent: '#fb7185' },
]

function shuffleQuestions(array: Question[]): Question[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = arr[i]
    arr[i] = arr[j]
    arr[j] = temp
  }
  return arr
}

const orderKey = 'yunwei-question-order-v1'

/**
 * Shuffle once per session and remember the order, so refreshing/navigating
 * keeps a stable sequence (the index counter and prev/next no longer jump).
 * A new browser session reshuffles to keep practice fresh.
 */
function getStableShuffled(all: Question[]): Question[] {
  if (typeof sessionStorage === 'undefined') {
    return shuffleQuestions(all)
  }

  const byId = new Map(all.map((question) => [question.id, question]))
  try {
    const savedRaw = sessionStorage.getItem(orderKey)
    if (savedRaw) {
      const savedIds: unknown = JSON.parse(savedRaw)
      if (Array.isArray(savedIds)) {
        const ordered = savedIds
          .map((id) => byId.get(String(id)))
          .filter((question): question is Question => Boolean(question))
        const seen = new Set(ordered.map((question) => question.id))
        const added = all.filter((question) => !seen.has(question.id))
        // Reuse the saved order only if it still covers the current bank exactly.
        if (ordered.length === all.length && added.length === 0) {
          return ordered
        }
      }
    }
  } catch {
    /* fall through to a fresh shuffle */
  }

  const shuffled = shuffleQuestions(all)
  try {
    sessionStorage.setItem(orderKey, JSON.stringify(shuffled.map((question) => question.id)))
  } catch {
    /* ignore persistence failures */
  }
  return shuffled
}

export const questions = getStableShuffled(sharedQuestions as Question[])

export function getQuestionsByCategory(category: CategoryId | 'all'): Question[] {
  return category === 'all' ? questions : questions.filter((question) => question.category === category)
}
