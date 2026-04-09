alter table public.cv_review_requests
drop constraint cv_review_requests_status_check;

alter table public.cv_review_requests
add constraint cv_review_requests_status_check
check (status in ('new', 'approved'));
