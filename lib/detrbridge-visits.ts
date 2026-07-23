import "server-only";

import { headers } from "next/headers";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** UBT'nin /detrbridge linkini paylaştığı an (TR saatiyle 23 Temmuz 2026, 12:29 — yeniden paylaşım). */
export const DETRBRIDGE_SHARE_MOMENT = new Date("2026-07-23T12:29:00+03:00");

/**
 * Set by middleware.ts, NOT here: Server Components can't call
 * cookies().set() during a render (Next.js throws in production), so the
 * visitor cookie is minted in middleware and its result is threaded through
 * this request header instead.
 */
const FIRST_VISIT_HEADER = "x-detrbridge-first-visit";

/** One row per successful sign-in — always carries the allowlisted name. */
export interface DetrbridgeVisit {
  id: string;
  voterName: string;
  hoursAfterShare: number;
  userAgent: string | null;
  firstSeenAt: string;
}

export interface FirstVisit {
  isFirstVisit: boolean;
  hoursAfterShare: number;
}

interface SupabaseVisitRow {
  id: string;
  voter_name: string;
  hours_after_share: number;
  user_agent: string | null;
  first_seen_at: string;
}

function getServiceEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) return null;
  return { url, serviceRoleKey };
}

function createServiceClient(): SupabaseClient | null {
  const env = getServiceEnv();
  if (!env) return null;
  return createClient(env.url, env.serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

function hoursSinceShare(now: Date): number {
  const diffMs = now.getTime() - DETRBRIDGE_SHARE_MOMENT.getTime();
  return Math.max(0, Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100);
}

/**
 * Reads the first-visit signal middleware.ts already computed (via a request
 * header, since the cookie itself was minted there). Purely informational —
 * just tells the welcome card whether to show "X saat sonra geldin"; no
 * longer writes to Supabase (see recordDetrbridgeSignIn for the login log).
 */
export async function recordDetrbridgeVisit(): Promise<FirstVisit> {
  const headerStore = await headers();
  const isFirstVisit = headerStore.get(FIRST_VISIT_HEADER) === "1";
  const hoursAfterShare = hoursSinceShare(new Date());
  return { isFirstVisit, hoursAfterShare };
}

/**
 * Logs one login-log row for a successful detrbridge sign-in, always
 * carrying the allowlisted name (unlike the old anonymous-cookie visit log,
 * which couldn't name a visitor until after they'd already authenticated).
 * Best-effort: a logging failure must never block sign-in.
 */
export async function recordDetrbridgeSignIn(voterName: string): Promise<void> {
  const supabase = createServiceClient();
  if (!supabase) return;
  const headerStore = await headers();
  const userAgent = headerStore.get("user-agent");
  const hoursAfterShare = hoursSinceShare(new Date());
  try {
    await supabase.from("detrbridge_visits").insert({
      voter_name: voterName,
      hours_after_share: hoursAfterShare,
      user_agent: userAgent
    });
  } catch {
    // Best-effort logging; sign-in must still succeed either way.
  }
}

/** Every logged sign-in, newest first — for the admin login log. */
export async function getDetrbridgeVisits(): Promise<DetrbridgeVisit[]> {
  const supabase = createServiceClient();
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("detrbridge_visits")
      .select("id, voter_name, hours_after_share, user_agent, first_seen_at")
      .order("first_seen_at", { ascending: false });
    if (error) throw error;
    const rows = (data ?? []) as SupabaseVisitRow[];
    return rows.map((row) => ({
      id: row.id,
      voterName: row.voter_name,
      hoursAfterShare: row.hours_after_share,
      userAgent: row.user_agent,
      firstSeenAt: row.first_seen_at
    }));
  } catch {
    return [];
  }
}
