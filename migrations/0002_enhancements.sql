-- Add tags to notes
ALTER TABLE notes ADD COLUMN tags TEXT DEFAULT '';

-- User preferences (pinned tools, recent tools, etc.)
CREATE TABLE IF NOT EXISTS user_prefs (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
