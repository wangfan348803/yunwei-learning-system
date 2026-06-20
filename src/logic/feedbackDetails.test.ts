import { describe, expect, it } from 'vitest'
import { buildFeedbackDetails } from './feedbackDetails'
import type { AnswerResult, Question } from '../types'

const question: Question = {
  id: 'linux-port-owner',
  category: 'linux',
  type: 'command',
  level: 'basic',
  title: '查端口占用',
  prompt: '要确认 80 端口被哪个进程监听，优先使用哪个命令？',
  options: [
    { id: 'a', text: 'df -h' },
    { id: 'b', text: 'ss -lntp | grep :80' },
  ],
  answer: ['b'],
  explanation: 'ss -lntp 可以同时看到监听端口、协议和进程信息，是定位端口占用的常用入口。',
  mnemonic: '查端口三件套：s 监听、n 数字、t TCP、p 进程。',
  wrongReasons: {
    a: 'df -h 只能看磁盘空间，不能定位端口占用。',
  },
  skillTags: ['port', 'process', 'ss'],
  relatedCommand: 'ss -lntp | grep :80',
  estimatedTime: 45,
}

const correctResult: AnswerResult = {
  isCorrect: true,
  correctAnswer: ['b'],
  explanation: question.explanation,
  selectedWrongReasons: [],
  relatedCommand: question.relatedCommand,
}

describe('buildFeedbackDetails', () => {
  it('builds a lean teaching summary: conclusion hook, mechanism, mnemonic — no boilerplate', () => {
    const details = buildFeedbackDetails(question, correctResult)

    expect(details.statusTitle).toBe('判断正确')
    expect(details.correctAnswerText).toBe('B. ss -lntp | grep :80')
    expect(details.sections.map((section) => section.title)).toEqual([
      '先记住结论',
      '为什么这样判断',
      '口诀',
    ])
    // The conclusion hook states the answer without restating the full prompt.
    expect(details.sections[0].body).toContain('正确答案')
    expect(details.sections[0].body).not.toContain(question.prompt)
  })

  it('omits the mnemonic section when the question has no mnemonic', () => {
    const withoutMnemonic: Question = { ...question, mnemonic: undefined }
    const details = buildFeedbackDetails(withoutMnemonic, correctResult)

    expect(details.sections.map((section) => section.title)).toEqual([
      '先记住结论',
      '为什么这样判断',
    ])
  })

  it('adds selected wrong reasons when the answer needs review', () => {
    const details = buildFeedbackDetails(question, {
      ...correctResult,
      isCorrect: false,
      selectedWrongReasons: ['df -h 只能看磁盘空间，不能定位端口占用。'],
    })

    expect(details.statusTitle).toBe('需要复盘')
    expect(details.sections.some((section) => section.title === '这次错在哪里')).toBe(true)
  })
})
