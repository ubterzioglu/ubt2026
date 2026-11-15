-- Anonymous usage counter for the public /guides page.
-- event: 'view' = full page load, 'switch' = in-page language toggle, 'open' = PDF opened.
-- visitor_id is a random id from a first-party cookie; no IP, name or user agent is stored.
--
-- RLS enabled with no policies -> service-role only.
create table if not exists public.guide_events (
  id uuid primary key default gen_random_uuid(),
  event text not null check (event in ('view', 'switch', 'open')),
  guide_id text,
  language text not null check (language in ('tr', 'en')),
  visitor_id text not null,
  is_new_visitor boolean not null default false,
  referrer_host text,
  created_at timestamptz not null default now()
);

create index if not exists guide_events_recent_idx
  on public.guide_events (created_at desc);

alter table public.guide_events enable row level security;
