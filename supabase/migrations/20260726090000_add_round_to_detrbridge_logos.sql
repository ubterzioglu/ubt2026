-- Adds a voting-round marker to detrbridge_logos so the original open
-- vote can be frozen (round 1, read-only) while a curated top-N subset
-- is promoted into a fresh round (round 2) for re-voting from zero.
alter table public.detrbridge_logos
  add column if not exists round smallint not null default 1;

create index if not exists detrbridge_logos_round_idx
  on public.detrbridge_logos (round, created_at);
