import { publicQuestion } from '../_shared/answer.js'
import { json } from '../_shared/http.js'
import { questions } from '../_shared/questions.js'

/** @param {EventContext<Env, string, unknown>} context */
export async function onRequestGet({ request }) {
  const url = new URL(request.url)
  const category = url.searchParams.get('category')
  const filtered =
    category && category !== 'all'
      ? questions.filter((question) => question.category === category)
      : questions

  return json({ questions: filtered.map(publicQuestion) })
}
