-- Second, independent todo board for /detrbridge ("Görevler 2"). Schema
-- copy of detrbridge_todos/detrbridge_todo_comments/detrbridge_todo_attachments
-- under the detrbridge_todos2 prefix — a fresh, empty board, no data
-- carried over from the original.
create table if not exists public.detrbridge_todos2 (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  assignee text not null default 'Ortak',
  due_date date,
  status text not null default 'open'
    check (status in ('open', 'done')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists detrbridge_todos2_status_idx
  on public.detrbridge_todos2 (status, due_date, created_at);

create table if not exists public.detrbridge_todo2_comments (
  id uuid primary key default gen_random_uuid(),
  todo_id uuid not null
    references public.detrbridge_todos2(id) on delete cascade,
  body text not null,
  author text not null default 'Ortak',
  created_at timestamptz not null default now()
);

create index if not exists detrbridge_todo2_comments_todo_idx
  on public.detrbridge_todo2_comments (todo_id, created_at);

create table if not exists public.detrbridge_todo2_attachments (
  id uuid primary key default gen_random_uuid(),
  todo_id uuid not null
    references public.detrbridge_todos2(id) on delete cascade,
  storage_path text not null,
  file_name text not null,
  size_bytes bigint not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists detrbridge_todo2_attachments_todo_idx
  on public.detrbridge_todo2_attachments (todo_id, created_at);

create or replace function public.set_detrbridge_todo2_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_detrbridge_todo2_updated_at on public.detrbridge_todos2;
create trigger set_detrbridge_todo2_updated_at
before update on public.detrbridge_todos2
for each row
execute function public.set_detrbridge_todo2_updated_at();

alter table public.detrbridge_todos2 enable row level security;
alter table public.detrbridge_todo2_comments enable row level security;
alter table public.detrbridge_todo2_attachments enable row level security;

insert into storage.buckets (id, name, public)
values ('detrbridge-files2', 'detrbridge-files2', false)
on conflict (id) do nothing;
