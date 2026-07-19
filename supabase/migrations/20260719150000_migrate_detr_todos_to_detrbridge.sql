-- Schema copy of detr_todos/detr_todo_comments/detr_todo_attachments under
-- the detrbridge_ prefix, plus a row copy of all surviving data. The old
-- detr_* tables and detr-files bucket are dropped in a LATER migration
-- (20260719160000) only after the copy is verified — see that file's
-- header comment for the verification this depends on.
create table if not exists public.detrbridge_todos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  assignee text not null default 'Ortak',
  due_date date,
  status text not null default 'open'
    check (status in ('open', 'done')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists detrbridge_todos_status_idx
  on public.detrbridge_todos (status, due_date, created_at);

create table if not exists public.detrbridge_todo_comments (
  id uuid primary key default gen_random_uuid(),
  todo_id uuid not null
    references public.detrbridge_todos(id) on delete cascade,
  body text not null,
  author text not null default 'Ortak',
  created_at timestamptz not null default now()
);

create index if not exists detrbridge_todo_comments_todo_idx
  on public.detrbridge_todo_comments (todo_id, created_at);

create table if not exists public.detrbridge_todo_attachments (
  id uuid primary key default gen_random_uuid(),
  todo_id uuid not null
    references public.detrbridge_todos(id) on delete cascade,
  storage_path text not null,
  file_name text not null,
  size_bytes bigint not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists detrbridge_todo_attachments_todo_idx
  on public.detrbridge_todo_attachments (todo_id, created_at);

create or replace function public.set_detrbridge_todo_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_detrbridge_todo_updated_at on public.detrbridge_todos;
create trigger set_detrbridge_todo_updated_at
before update on public.detrbridge_todos
for each row
execute function public.set_detrbridge_todo_updated_at();

alter table public.detrbridge_todos enable row level security;
alter table public.detrbridge_todo_comments enable row level security;
alter table public.detrbridge_todo_attachments enable row level security;

insert into storage.buckets (id, name, public)
values ('detrbridge-files', 'detrbridge-files', false)
on conflict (id) do nothing;

-- Row copy — preserves UUIDs so comment/attachment foreign keys stay valid.
-- No-op (0 rows copied) if detr_todos no longer exists (already cleaned up).
do $$
begin
  if to_regclass('public.detr_todos') is not null then
    insert into public.detrbridge_todos
      select * from public.detr_todos
      on conflict (id) do nothing;
  end if;

  if to_regclass('public.detr_todo_comments') is not null then
    insert into public.detrbridge_todo_comments
      select * from public.detr_todo_comments
      on conflict (id) do nothing;
  end if;

  if to_regclass('public.detr_todo_attachments') is not null then
    insert into public.detrbridge_todo_attachments
      select * from public.detr_todo_attachments
      on conflict (id) do nothing;
  end if;
end $$;
