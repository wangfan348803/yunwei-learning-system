import { evaluateAnswer } from '../_shared/answer.js'
import { json, readJson } from '../_shared/http.js'
import { questions } from '../_shared/questions.js'

/** @param {EventContext<Env, string, unknown>} context */
export async function onRequestPost({ request, env }) {
  const body = await readJson(request)
  if (!body || typeof body.questionId !== 'string' || !Array.isArray(body.selected)) {
    return json({ error: 'Invalid answer payload.' }, { status: 400 })
  }

  const question = questions.find((item) => item.id === body.questionId)
  if (!question) {
    return json({ error: 'Question not found.' }, { status: 404 })
  }

  const result = evaluateAnswer(question, body.selected)
  if (env.DB) {
    const answeredAt = new Date().toISOString()
    await env.DB.prepare(
      `INSERT INTO answer_events (user_id, question_id, category, selected, is_correct, answered_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        typeof body.userId === 'string' ? body.userId : 'anonymous',
        question.id,
        question.category,
        JSON.stringify(body.selected),
        result.isCorrect ? 1 : 0,
        answeredAt,
      )
      .run()

    if (result.isCorrect) {
      await env.DB.prepare(
        `DELETE FROM mistakes WHERE user_id = ? AND question_id = ?`,
      )
        .bind(
          typeof body.userId === 'string' ? body.userId : 'anonymous',
          question.id,
        )
        .run()
    } else {
      await env.DB.prepare(
        `INSERT INTO mistakes (user_id, question_id, category, review_count, last_wrong_at)
         VALUES (?, ?, ?, 0, ?)
         ON CONFLICT(user_id, question_id)
         DO UPDATE SET review_count = review_count + 1, last_wrong_at = excluded.last_wrong_at`,
      )
        .bind(
          typeof body.userId === 'string' ? body.userId : 'anonymous',
          question.id,
          question.category,
          answeredAt,
        )
        .run()
    }
  }

  return json(result)
}
