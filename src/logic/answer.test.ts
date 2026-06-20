import { describe, expect, it } from 'vitest'
import { evaluateAnswer } from './answer'
import type { Question } from '../types'

const singleQuestion: Question = {
  id: 'linux-port-owner',
  category: 'linux',
  type: 'single',
  level: 'basic',
  title: '查 80 端口占用',
  prompt: '要确认 80 端口被哪个进程占用，优先使用哪个命令？',
  options: [
    { id: 'a', text: 'df -h' },
    { id: 'b', text: 'ss -lntp | grep :80' },
    { id: 'c', text: 'free -m' },
  ],
  answer: ['b'],
  explanation: 'ss -lntp 可以查看监听端口和进程信息。',
  wrongReasons: {
    a: 'df -h 用于查看磁盘空间。',
    c: 'free -m 用于查看内存。',
  },
  skillTags: ['port', 'process'],
  relatedCommand: 'ss -lntp | grep :80',
  estimatedTime: 45,
}

const multiQuestion: Question = {
  ...singleQuestion,
  id: 'devops-k8s-pod-pending',
  category: 'devops',
  type: 'multiple',
  prompt: 'Pod Pending 时，哪些检查通常有效？',
  options: [
    { id: 'a', text: 'kubectl describe pod' },
    { id: 'b', text: 'kubectl get events' },
    { id: 'c', text: 'curl localhost' },
  ],
  answer: ['a', 'b'],
}

describe('evaluateAnswer', () => {
  it('marks single-choice answers correct and returns explanation metadata', () => {
    expect(evaluateAnswer(singleQuestion, ['b'])).toMatchObject({
      isCorrect: true,
      correctAnswer: ['b'],
      relatedCommand: 'ss -lntp | grep :80',
    })
  })

  it('normalizes multi-choice answer order', () => {
    expect(evaluateAnswer(multiQuestion, ['b', 'a']).isCorrect).toBe(true)
  })

  it('returns wrong option reasons when the selected answer is wrong', () => {
    expect(evaluateAnswer(singleQuestion, ['a'])).toMatchObject({
      isCorrect: false,
      selectedWrongReasons: ['df -h 用于查看磁盘空间。'],
    })
  })
})
