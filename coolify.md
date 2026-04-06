# Coolify Deployment Notes

Use the root `Dockerfile`.

Required environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Recommended settings:

- Port: `3000`
- Health check path: `/`
- Build pack: `Dockerfile`

The app will still boot without Supabase env vars and will show local fallback content for featured sections.
