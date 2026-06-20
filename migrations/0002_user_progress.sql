-- Full progress snapshot per user for cross-device cloud sync (last-write-wins by updated_at).
CREATE TABLE IF NOT EXISTS user_progress (
  user_id TEXT PRIMARY KEY,
  progress_json TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
