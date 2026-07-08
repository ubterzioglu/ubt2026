-- File attachments for DETR todos (/detr). Multiple files per todo; the
-- Storage objects live in the private detr-files bucket and are served via
-- signed URLs generated server-side at read time.
create table if not exists public.detr_todo_attachments (
  id uuid primary key default gen_random_uuid(),
  todo_id uuid not null
    references public.detr_todos(id) on delete cascade,
  -- Storage object path inside the detr-files bucket.
  storage_path text not null,
  -- Original file name, kept for display (storage path is sanitized).
  file_name text not null,
  size_bytes bigint not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists detr_todo_attachments_todo_idx
  on public.detr_todo_attachments (todo_id, created_at);

-- RLS on, with NO policy for anon/authenticated — service-role only,
-- matching detr_todos and detr_todo_comments.
alter table public.detr_todo_attachments enable row level security;

-- Private bucket for todo files. Service-role uploads + signed URLs.
insert into storage.buckets (id, name, public)
values ('detr-files', 'detr-files', false)
on conflict (id) do nothing;
