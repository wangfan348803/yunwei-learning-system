import { json, readJson } from '../_shared/http.js'

const MAX_PROGRESS_BYTES = 256 * 1024 // guard against oversized snapshots

/** @param {string} userId */
const isValidUserId = (userId) =>
  typeof userId === 'string' && userId.length > 0 && userId.length <= 128

/**
 * Read the user's full progress snapshot for cross-device sync.
 * @param {EventContext<Env, string, unknown>} context
 */
export async function onRequestGet({ request, env }) {
  const userId = new URL(request.url).searchParams.get('userId') || ''
  if (!isValidUserId(userId)) {
    return json({ error: 'Invalid userId.' }, { status: 400 })
  }
  if (!env.DB) {
    return json({ progress: null })
  }

  const row = await env.DB.prepare(
    `SELECT progress_json, updated_at FROM user_progress WHERE user_id = ?`,
  )
    .bind(userId)
    .first()

  if (!row) {
    return json({ progress: null })
  }

  let progress
  try {
    progress = JSON.parse(String(row.progress_json))
  } catch {
    progress = null
  }

  return json({ progress, updatedAt: row.updated_at ? String(row.updated_at) : null })
}

/**
 * Upsert the user's full progress snapshot (last-write-wins).
 * @param {EventContext<Env, string, unknown>} context
 */
export async function onRequestPost({ request, env }) {
  const body = await readJson(request)
  if (!body || !isValidUserId(body.userId) || typeof body.progress !== 'object' || body.progress === null) {
    return json({ error: 'Invalid progress payload.' }, { status: 400 })
  }

  const progressJson = JSON.stringify(body.progress)
  if (progressJson.length > MAX_PROGRESS_BYTES) {
    return json({ error: 'Progress snapshot too large.' }, { status: 413 })
  }

  if (!env.DB) {
    return json({ ok: true, persisted: false })
  }

  const updatedAt =
    typeof body.progress.updatedAt === 'string' ? body.progress.updatedAt : new Date().toISOString()

  await env.DB.prepare(
    `INSERT INTO user_progress (user_id, progress_json, updated_at)
     VALUES (?, ?, ?)
     ON CONFLICT(user_id)
     DO UPDATE SET progress_json = excluded.progress_json, updated_at = excluded.updated_at`,
  )
    .bind(body.userId, progressJson, updatedAt)
    .run()

  return json({ ok: true, persisted: true, updatedAt })
}
