-- First-visit log for the /detrbridge board's welcome card: one row per
-- unique visitor (tracked via a long-lived cookie), recording how long
-- after the share moment (2026-07-19 07:00 Europe/Istanbul) they first
-- opened the panel. Admin-only, shown as a login log in the panel.
create table if not exists public.detrbridge_visits (
  id uuid primary key default gen_random_uuid(),
  visitor_token text not null unique,
  hours_after_share numeric(10, 2) not null,
  user_agent text,
  first_seen_at timestamptz not null default now()
);

create index if not exists detrbridge_visits_first_seen_idx
  on public.detrbridge_visits (first_seen_at desc);

-- RLS on, with NO policy for anon/authenticated — service-role only,
-- matching detrbridge_logos.
alter table public.detrbridge_visits enable row level security;
