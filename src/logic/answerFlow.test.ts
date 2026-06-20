import { describe, expect, it } from 'vitest'
import { canAdvanceAfterAnswer, getAdjacentQuestion, shouldEvaluateSelection } from './answerFlow'
import type { Question } from '../types'

const baseQuestion: Question = {
  id: 'linux-port-owner',
  category: 'linux',
  type: 'single',
  level: 'basic',
  title: '查端口占用',
  prompt: '要确认端口被哪个进程占用，优先使用哪个命令？',
  options: [
    { id: 'a', text: 'df -h' },
    { id: 'b', text: 'ss -lntp' },
  ],
  answer: ['b'],
  explanation: 'ss 可以查看监听端口和进程信息。',
  wrongReasons: {
    a: 'df -h 用于查看磁盘空间。',
  },
  skillTags: ['port'],
  estimatedTime: 40,
}

describe('answerFlow', () => {
  it('enables next only after the evaluated answer is correct', () => {
    expect(canAdvanceAfterAnswer(null)).toBe(false)
    expect(canAdvanceAfterAnswer({ isCorrect: false })).toBe(false)
    expect(canAdvanceAfterAnswer({ isCorrect: true })).toBe(true)
  })

  it('evaluates single-choice selections immediately but waits for enough multi-choice selections', () => {
    const multiQuestion: Question = {
      ...baseQuestion,
      type: 'multiple',
      answer: ['a', 'b'],
    }

    expect(shouldEvaluateSelection(baseQuestion, ['a'])).toBe(true)
    expect(shouldEvaluateSelection(multiQuestion, ['a'])).toBe(false)
    expect(shouldEvaluateSelection(multiQuestion, ['a', 'b'])).toBe(true)
    expect(shouldEvaluateSelection(multiQuestion, ['a', 'b', 'c'])).toBe(true)
  })

  it('wraps previous and next navigation inside the active question pool', () => {
    const pool = [
      baseQuestion,
      { ...baseQuestion, id: 'linux-systemd-log' },
      { ...baseQuestion, id: 'linux-disk-usage' },
    ]

    expect(getAdjacentQuestion(pool, 'linux-port-owner', 'previous')?.id).toBe('linux-disk-usage')
    expect(getAdjacentQuestion(pool, 'linux-port-owner', 'next')?.id).toBe('linux-systemd-log')
    expect(getAdjacentQuestion([], 'missing', 'next')).toBeNull()
  })
})
