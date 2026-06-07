CREATE TABLE IF NOT EXISTS zelifs_state (
  id TEXT PRIMARY KEY DEFAULT 'elif',
  trips JSONB NOT NULL DEFAULT '[]'::jsonb,
  plus_notes JSONB NOT NULL DEFAULT '[]'::jsonb,
  minus_notes JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO zelifs_state (id) VALUES ('elif') ON CONFLICT (id) DO NOTHING;
