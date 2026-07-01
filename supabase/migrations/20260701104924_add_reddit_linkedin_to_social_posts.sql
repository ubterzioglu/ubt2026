-- Extend the social content board with two more platforms: Reddit + LinkedIn.
-- Each post can now be marked as shared on six platforms total.
alter table public.social_posts
  add column if not exists shared_reddit boolean not null default false,
  add column if not exists shared_linkedin boolean not null default false;
