-- The logo's own "name" field was replaced by uploader_name (logos are
-- unnamed; only the uploader is tracked) — see 20260720080000. That
-- migration added uploader_name but never dropped the old, still NOT
-- NULL "name" column, which made every insert fail once the application
-- code stopped sending it.
alter table public.detrbridge_logos drop column if exists name;
