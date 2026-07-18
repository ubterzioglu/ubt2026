-- Logo candidates for the /detrbridge board. Standalone board behind its
-- own single-password gate (DETRBRIDGE); admin-managed only, not exposed to
-- anon/authenticated.
create table if not exists public.detrbridge_logos (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  rating smallint not null
    check (rating between 1 and 5),
  is_selected boolean not null default false,
  -- Storage object path inside the detrbridge-logos bucket.
  storage_path text not null,
  -- Original file name, kept for display (storage path is sanitized).
  file_name text not null,
  size_bytes bigint not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists detrbridge_logos_rating_idx
  on public.detrbridge_logos (rating desc, created_at);

-- RLS on, with NO policy for anon/authenticated — service-role only,
-- matching detr_todos and detr_todo_attachments.
alter table public.detrbridge_logos enable row level security;

-- Private bucket for logo files. Service-role uploads + signed URLs.
insert into storage.buckets (id, name, public)
values ('detrbridge-logos', 'detrbridge-logos', false)
on conflict (id) do nothing;
