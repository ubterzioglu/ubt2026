-- Resets the /detrbridge login log to record who signed in, not just an
-- anonymous visitor token. The old cookie-based "first visit" log couldn't
-- name a visitor until after they authenticated, so most rows were nameless.
-- Going forward, one row is inserted per successful sign-in (see
-- recordDetrbridgeSignIn), always carrying the allowlisted name.
drop table if exists public.detrbridge_visits;

create table public.detrbridge_visits (
  id uuid primary key default gen_random_uuid(),
  voter_name text not null,
  hours_after_share numeric(10, 2) not null,
  user_agent text,
  first_seen_at timestamptz not null default now()
);

create index detrbridge_visits_first_seen_idx
  on public.detrbridge_visits (first_seen_at desc);

-- RLS on, with NO policy for anon/authenticated — service-role only,
-- matching detrbridge_logos.
alter table public.detrbridge_visits enable row level security;
