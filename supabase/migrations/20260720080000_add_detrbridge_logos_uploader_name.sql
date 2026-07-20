-- Logo uploader's display name, shown in the /detrbridge Logo Seçimi list.
-- Replaces the admin-set single rating (already dropped in favor of
-- detrbridge_logo_votes) with a per-logo "who uploaded this" label.
alter table public.detrbridge_logos
  add column if not exists uploader_name text not null default 'Ortak';
