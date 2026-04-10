alter table public.cv_review_requests
add column if not exists cv_reviewed boolean not null default false,
add column if not exists linkedin_reviewed boolean not null default false;
