/**
 * @param {unknown} data
 * @param {ResponseInit} [init]
 */
export function json(data, init = {}) {
  const headers = new Headers(init.headers)
  headers.set('content-type', 'application/json; charset=utf-8')

  return new Response(JSON.stringify(data), {
    ...init,
    headers,
  })
}

/** @param {Request} request */
export async function readJson(request) {
  try {
    return await request.json()
  } catch {
    return null
  }
}
