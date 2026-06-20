import type { AnswerResult, Question } from '../types'

export interface FeedbackSection {
  title: string
  body: string
}

export interface FeedbackDetails {
  statusTitle: string
  correctAnswerText: string
  sections: FeedbackSection[]
}

function optionLabel(question: Question, optionId: string): string {
  const option = question.options.find((item) => item.id === optionId)
  return `${optionId.toUpperCase()}. ${option?.text ?? optionId}`
}

/**
 * Build the teaching summary shown in the answer drawer.
 *
 * Design goals (see review):
 * - High knowledge density: no per-question-identical boilerplate. The old
 *   static "线上排查顺序" and generic "记忆方式" sections were removed because
 *   they read the same on every question and trained users to skip the drawer.
 *   The related command already renders prominently in the drawer UI, so it is
 *   not repeated here.
 * - "先记住结论" is a short hook (answer only), not a restatement of the prompt.
 * - "为什么这样判断" carries the mechanism (the explanation field).
 * - "口诀" only renders when the question actually has a mnemonic, so questions
 *   without one show no empty placeholder.
 */
export function buildFeedbackDetails(question: Question, result: AnswerResult): FeedbackDetails {
  const correctAnswerText = result.correctAnswer.map((optionId) => optionLabel(question, optionId)).join(' / ')

  const sections: FeedbackSection[] = [
    {
      title: '先记住结论',
      body: `正确答案：${correctAnswerText}。`,
    },
    {
      title: '为什么这样判断',
      body: result.explanation,
    },
  ]

  if (!result.isCorrect && result.selectedWrongReasons.length > 0) {
    sections.push({
      title: '这次错在哪里',
      body: result.selectedWrongReasons.join(' '),
    })
  }

  if (question.mnemonic) {
    sections.push({
      title: '口诀',
      body: question.mnemonic,
    })
  }

  return {
    statusTitle: result.isCorrect ? '判断正确' : '需要复盘',
    correctAnswerText,
    sections,
  }
}
