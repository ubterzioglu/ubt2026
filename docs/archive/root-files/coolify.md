# Coolify Deployment Notes

Use the root `Dockerfile`.

Required environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (accepted alias: `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- `SUPABASE_SERVICE_ROLE_KEY`
- `APPOINTMENT_ADMIN_ACCESS_KEY` — protects the `/admin` dashboard. If unset, admin is open to everyone.

Optional environment variables:

- `RESEND_API_KEY` — enables booking confirmation emails. If unset, emails are silently skipped.
- `APPOINTMENT_NOTIFICATION_TO` — recipient address for new booking alerts.
- `APPOINTMENT_NOTIFICATION_FROM` — sender display name + address.
- `APPOINTMENT_NOTIFICATION_REPLY_TO` — defaults to booker's email.

Recommended settings:

- Port: `3000`
- Health check path: `/`
- Build pack: `Dockerfile`

The app will still boot without Supabase env vars and will show local fallback content for featured sections.
