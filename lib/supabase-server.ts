import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const SERVICE_CREDENTIALS_MISSING = "Service credentials missing.";

const SERVER_CLIENT_OPTIONS = {
  auth: { persistSession: false, autoRefreshToken: false }
};

export function createServiceClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) return null;
  return createClient(url, serviceRoleKey, SERVER_CLIENT_OPTIONS);
}

export function createAnonClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return createClient(url, anonKey, SERVER_CLIENT_OPTIONS);
}
