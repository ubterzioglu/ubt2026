create extension if not exists "pgcrypto";

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary text not null,
  content text not null,
  cover_image_url text,
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists blog_posts_published_idx
  on public.blog_posts (is_published, published_at desc);

create or replace function public.set_blog_post_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_blog_post_updated_at on public.blog_posts;
create trigger set_blog_post_updated_at
before update on public.blog_posts
for each row
execute function public.set_blog_post_updated_at();

alter table public.blog_posts enable row level security;

grant select on public.blog_posts to anon, authenticated;

drop policy if exists "Published blog posts are readable by everyone" on public.blog_posts;
create policy "Published blog posts are readable by everyone"
on public.blog_posts
for select
to anon, authenticated
using (is_published = true);
