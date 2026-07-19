-- Public voting for /detrbridge logo candidates: one row per (logo,
-- voter name). Replaces the old admin-set detrbridge_logos.rating
-- column — the displayed/sorted rating is now the average of these
-- rows. RLS on, no anon/authenticated policy — service-role only,
-- matching detrbridge_logos.
create table if not exists public.detrbridge_logo_votes (
  id uuid primary key default gen_random_uuid(),
  logo_id uuid not null references public.detrbridge_logos (id) on delete cascade,
  voter_name text not null,
  rating smallint not null
    check (rating between 1 and 5),
  created_at timestamptz not null default now(),
  unique (logo_id, voter_name)
);

create index if not exists detrbridge_logo_votes_logo_id_idx
  on public.detrbridge_logo_votes (logo_id);

alter table public.detrbridge_logo_votes enable row level security;

-- The old admin-set single rating is replaced by the average of
-- detrbridge_logo_votes; drop the column and its now-unused index.
drop index if exists public.detrbridge_logos_rating_idx;
alter table public.detrbridge_logos drop column if exists rating;
