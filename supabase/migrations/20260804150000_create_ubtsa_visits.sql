-- Sign-in log for the /ubtsa board: one row per successful gate sign-in, so
-- it is visible who opened the board and when. Only two people can sign in
-- (ubt, serkan), so this stays small and needs no retention policy.
--
-- RLS enabled with no policies -> service-role only, same as ubtsa_comments.
create table if not exists public.ubtsa_visits (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  signed_in_at timestamptz not null default now()
);

create index if not exists ubtsa_visits_recent_idx
  on public.ubtsa_visits (signed_in_at desc);

alter table public.ubtsa_visits enable row level security;
