-- Yorum deposu for the /ubtsa board ("Weiterbildung ve İş Birliği Konsepti").
-- One row per comment; `item_key` points at a madde key from
-- content/ubtsa-konsept.ts (e.g. 'b3-m2'). Deliberately NOT a foreign key —
-- the maddeler live in code, not in the database.
--
-- RLS is enabled with no policies, so only the service-role client (the
-- Next.js server actions behind the ubtsa gate) can read or write. Anon/
-- authenticated keys see nothing, matching every other board here.
create table if not exists public.ubtsa_comments (
  id uuid primary key default gen_random_uuid(),
  item_key text not null,
  body text not null,
  author text not null default 'ubt',
  created_at timestamptz not null default now()
);

create index if not exists ubtsa_comments_item_idx
  on public.ubtsa_comments (item_key, created_at);

alter table public.ubtsa_comments enable row level security;
