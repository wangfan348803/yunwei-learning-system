/**
 * Resolve a question audio file to a full URL.
 *
 * In production set `VITE_AUDIO_BASE_URL` to the R2 public bucket URL so the
 * 83MB of audio is served from object storage instead of being bundled into
 * the deploy. Falls back to the same-origin "/audio" path for local dev.
 */
const audioBase = (import.meta.env.VITE_AUDIO_BASE_URL ?? '/audio').replace(/\/$/, '')

export function audioUrl(file: string): string {
  return `${audioBase}/${file}`
}
