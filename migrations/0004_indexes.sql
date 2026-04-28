-- Add indexes to improve search and history retrieval performance
CREATE INDEX IF NOT EXISTS idx_tool_history_user_tool ON tool_history(user_id, tool_id);
CREATE INDEX IF NOT EXISTS idx_notes_user_updated ON notes(user_id, updated_at DESC);
