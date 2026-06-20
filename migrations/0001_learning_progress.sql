CREATE TABLE IF NOT EXISTS answer_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  question_id TEXT NOT NULL,
  category TEXT NOT NULL,
  selected TEXT NOT NULL,
  is_correct INTEGER NOT NULL CHECK (is_correct IN (0, 1)),
  answered_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_answer_events_user_time
  ON answer_events (user_id, answered_at);

CREATE TABLE IF NOT EXISTS mistakes (
  user_id TEXT NOT NULL,
  question_id TEXT NOT NULL,
  category TEXT NOT NULL,
  review_count INTEGER NOT NULL DEFAULT 0,
  last_wrong_at TEXT NOT NULL,
  PRIMARY KEY (user_id, question_id)
);

CREATE TABLE IF NOT EXISTS progress_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  progress_json TEXT NOT NULL,
  saved_at TEXT NOT NULL
);
