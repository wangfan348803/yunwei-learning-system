import { describe, expect, it } from 'vitest'
import { evaluateAnswer, publicQuestion } from './answer.js'

const question = {
  id: 'k8s-pod-pending',
  answer: ['a', 'b'],
  explanation: 'describe 和 events 是入口。',
  wrongReasons: {
    c: '删除系统命名空间是破坏性操作。',
  },
  relatedCommand: 'kubectl describe pod <pod>',
}

describe('server answer helpers', () => {
  it('validates answers on the server without trusting client correctness', () => {
    const result = evaluateAnswer(question, ['b', 'a'])

    expect(result.isCorrect).toBe(true)
    expect(result.correctAnswer).toEqual(['a', 'b'])
  })

  it('removes private answer fields from public questions', () => {
    const safe = publicQuestion(question)

    expect(safe).not.toHaveProperty('answer')
    expect(safe).not.toHaveProperty('wrongReasons')
    expect(safe).toHaveProperty('id', 'k8s-pod-pending')
  })
})
