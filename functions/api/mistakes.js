import { json } from '../_shared/http.js'

/** @param {EventContext<Env, string, unknown>} context */
export async function onRequestGet({ request, env }) {
  const userId = new URL(request.url).searchParams.get('userId') || 'anonymous'
  if (!env.DB) {
    return json({ mistakes: [] })
  }

  const rows = await env.DB.prepare(
    `SELECT question_id, category, review_count, last_wrong_at
     FROM mistakes
     WHERE user_id = ?
     ORDER BY last_wrong_at DESC`,
  )
    .bind(userId)
    .all()

  return json({
    mistakes: (rows.results ?? []).map((row) => ({
      questionId: String(row.question_id),
      category: row.category,
      reviewCount: Number(row.review_count),
      lastWrongAt: String(row.last_wrong_at),
    })),
  })
}
