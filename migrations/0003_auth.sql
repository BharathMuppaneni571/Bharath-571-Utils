-- 1. Create the users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- We need a default admin user to own the current data.
-- We'll insert one with an empty password hash so it can be overwritten if they claim it,
-- or we can just let 'admin' own it securely since no one can log into 'admin' without a matching hash.
INSERT INTO users (id, username, password_hash) VALUES ('admin', 'admin', 'N/A');

-- 2. Modify notes table to use (user_id, id) as compound primary key
CREATE TABLE new_notes (
  user_id TEXT,
  id TEXT,
  content TEXT,
  tags TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, id)
);
INSERT INTO new_notes (user_id, id, content, tags, updated_at)
SELECT 'admin', id, content, tags, updated_at FROM notes;
DROP TABLE notes;
ALTER TABLE new_notes RENAME TO notes;

-- 3. Modify user_prefs table to use (user_id, key) as compound primary key
CREATE TABLE new_user_prefs (
  user_id TEXT,
  key TEXT,
  value TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, key)
);
INSERT INTO new_user_prefs (user_id, key, value, updated_at)
SELECT 'admin', key, value, updated_at FROM user_prefs;
DROP TABLE user_prefs;
ALTER TABLE new_user_prefs RENAME TO user_prefs;

-- 4. Simple alter for tool_history since its PK is just an auto-incrementing integer
ALTER TABLE tool_history ADD COLUMN user_id TEXT DEFAULT 'admin';
