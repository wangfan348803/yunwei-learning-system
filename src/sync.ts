import type { AnswerEvent, LearningProgress } from './types'
import { getUserId } from './storage'

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'offline'

type SyncListener = (status: SyncStatus) => void

const listeners = new Set<SyncListener>()
let currentStatus: SyncStatus = 'idle'

function setStatus(status: SyncStatus) {
  currentStatus = status
  for (const listener of listeners) listener(status)
}

export function getSyncStatus(): SyncStatus {
  return currentStatus
}

export function subscribeSyncStatus(listener: SyncListener): () => void {
  listeners.add(listener)
  listener(currentStatus)
  return () => listeners.delete(listener)
}

/**
 * Last-write-wins reconciliation between the local and remote snapshots.
 * Pure and side-effect free so it can be unit tested. A snapshot without
 * `updatedAt` is treated as the oldest possible.
 */
export function reconcileProgress(
  local: LearningProgress | null,
  remote: LearningProgress | null,
): LearningProgress | null {
  if (!remote) return local
  if (!local) return remote
  const localTime = local.updatedAt ?? ''
  const remoteTime = remote.updatedAt ?? ''
  return remoteTime > localTime ? remote : local
}

/** Fetch the remote snapshot for the current user. Returns null when absent/unreachable. */
export async function fetchRemoteProgress(
  userId: string = getUserId(),
): Promise<LearningProgress | null> {
  try {
    const res = await fetch(`/api/progress?userId=${encodeURIComponent(userId)}`)
    if (!res.ok) {
      setStatus('offline')
      return null
    }
    const data = (await res.json()) as { progress?: LearningProgress | null }
    return data.progress ?? null
  } catch {
    setStatus('offline')
    return null
  }
}

let pushTimer: ReturnType<typeof setTimeout> | null = null
let pendingProgress: LearningProgress | null = null

async function flushProgress(): Promise<void> {
  if (!pendingProgress) return
  const snapshot = pendingProgress
  pendingProgress = null
  setStatus('syncing')
  try {
    const res = await fetch('/api/progress', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ userId: getUserId(), progress: snapshot }),
    })
    setStatus(res.ok ? 'synced' : 'offline')
  } catch {
    setStatus('offline')
  }
}

/** Debounced push of the full progress snapshot to the cloud (last-write-wins). */
export function scheduleProgressSync(progress: LearningProgress, delayMs = 1500): void {
  pendingProgress = progress
  if (pushTimer) clearTimeout(pushTimer)
  pushTimer = setTimeout(() => {
    pushTimer = null
    void flushProgress()
  }, delayMs)
}

/** Fire-and-forget answer event logging for server-side analytics. */
export function sendAnswerEvent(event: AnswerEvent): void {
  try {
    void fetch('/api/answer', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        userId: getUserId(),
        questionId: event.questionId,
        selected: event.selected,
      }),
    }).catch(() => undefined)
  } catch {
    /* best-effort only */
  }
}
