-- Yorum deposu for the "Toplantı Özeti" tab of the /detrbridge board.
-- One row per comment; `item_key` points at a brief item key from
-- content/detrbridge-brief.ts (e.g. 'task-04', 'open-02'). Deliberately NOT a
-- foreign key — the brief maddeleri live in code, not in the database.
--
-- RLS is enabled with no policies, so only the service-role client (the
-- Next.js server actions behind the detrbridge gate) can read or write.
-- Anon/authenticated keys see nothing, matching every other board here.
create table if not exists public.detrbridge_brief_comments (
  id uuid primary key default gen_random_uuid(),
  item_key text not null,
  body text not null,
  author text not null default 'ubt',
  created_at timestamptz not null default now()
);

create index if not exists detrbridge_brief_comments_item_idx
  on public.detrbridge_brief_comments (item_key, created_at);

alter table public.detrbridge_brief_comments enable row level security;
