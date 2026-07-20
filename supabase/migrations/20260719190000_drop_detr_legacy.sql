-- Drops the legacy /detr todo tables. Safe to run ONLY after confirming
-- (see Task 7 in docs/superpowers/plans/2026-07-19-detrbridge-todos-migration.md)
-- that every row was copied into detrbridge_todos/detrbridge_todo_comments/
-- detrbridge_todo_attachments and the detr-files Storage bucket was already
-- emptied and deleted via scripts/delete-detr-files-bucket.ts.
drop table if exists public.detr_todo_attachments;
drop table if exists public.detr_todo_comments;
drop table if exists public.detr_todos;
drop function if exists public.set_detr_todo_updated_at();
