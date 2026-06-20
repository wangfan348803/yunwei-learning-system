import { describe, expect, it } from 'vitest'
import { createQuestionImportTemplate, parseImportedQuestions } from './questionImport'

describe('question import', () => {
  it('parses the bundled import template', () => {
    const result = parseImportedQuestions(createQuestionImportTemplate())

    expect(result.errors).toEqual([])
    expect(result.questions).toHaveLength(1)
    expect(result.questions[0]).toMatchObject({
      id: 'custom-linux-log-001',
      category: 'linux',
      type: 'single',
      level: 'basic',
      answer: ['a'],
      relatedCommand: 'journalctl -u nginx -n 100',
    })
  })

  it('accepts an array payload and normalizes string options', () => {
    const result = parseImportedQuestions([
      {
        id: 'custom-network-001',
        category: 'network',
        type: 'single',
        level: 'basic',
        title: '确认本机监听端口',
        prompt: '要查看 TCP 监听端口，哪个命令更合适？',
        options: ['ss -lntp', 'df -h', 'free -m'],
        answer: 'a',
        explanation: 'ss -lntp 可以查看 TCP 监听端口和进程信息。',
      },
    ])

    expect(result.errors).toEqual([])
    expect(result.questions[0].options).toEqual([
      { id: 'a', text: 'ss -lntp' },
      { id: 'b', text: 'df -h' },
      { id: 'c', text: 'free -m' },
    ])
    expect(result.questions[0].skillTags).toEqual(['自定义导入'])
    expect(result.questions[0].estimatedTime).toBe(60)
  })

  it('reports validation errors for malformed questions', () => {
    const result = parseImportedQuestions({
      questions: [
        // Invalid question — bad category, empty title, 1 option, answer refs nonexistent id.
        // It is discarded and does NOT claim its id in seenIds.
        {
          id: 'bad-001',
          category: 'bad-category',
          title: '',
          prompt: '缺少足够字段',
          options: [{ id: 'a', text: '选项 A' }],
          answer: ['z'],
        },
        // Valid question sharing the same id as the discarded one above.
        // Because the invalid question never registered its id, this should be accepted.
        {
          id: 'bad-001',
          category: 'linux',
          type: 'single',
          level: 'basic',
          title: '与无效题目同 id',
          prompt: '与无效题目共享 id，但本身合法，应被接受。',
          options: [
            { id: 'a', text: 'A' },
            { id: 'b', text: 'B' },
          ],
          answer: ['a'],
          explanation: '无效题目被丢弃后不占用其 id，本题应通过。',
        },
        // Second valid question with a different id, then a duplicate of it —
        // this tests that genuine duplicates (two valid questions) are still caught.
        {
          id: 'dup-valid-001',
          category: 'linux',
          type: 'single',
          level: 'basic',
          title: '第一个合法题目',
          prompt: '测试真正的重复 ID。',
          options: [
            { id: 'a', text: 'A' },
            { id: 'b', text: 'B' },
          ],
          answer: ['a'],
          explanation: '第一个 dup-valid-001，应通过。',
        },
        {
          id: 'dup-valid-001',
          category: 'linux',
          type: 'single',
          level: 'basic',
          title: '重复的合法题目',
          prompt: '测试真正的重复 ID（第二次出现）。',
          options: [
            { id: 'a', text: 'A' },
            { id: 'b', text: 'B' },
          ],
          answer: ['a'],
          explanation: '第二个 dup-valid-001，应报重复 ID 错误。',
        },
      ],
    })

    // bad-001 valid question + dup-valid-001 first occurrence both pass
    expect(result.questions).toHaveLength(2)
    expect(result.errors.some((error) => error.includes('category 必须是'))).toBe(true)
    expect(result.errors.some((error) => error.includes('options 至少需要 2 个选项'))).toBe(true)
    expect(result.errors.some((error) => error.includes('answer 必须引用 options'))).toBe(true)
    // The genuine duplicate (two valid questions with same id) is still caught
    expect(result.errors.some((error) => error.includes('在导入文件里重复'))).toBe(true)
  })
})
