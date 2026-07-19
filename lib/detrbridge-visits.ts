import "server-only";

import { headers } from "next/headers";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** UBT'nin /detrbridge linkini paylaştığı an (TR saatiyle 19 Temmuz 2026, 07:00). */
export const DETRBRIDGE_SHARE_MOMENT = new Date("2026-07-19T07:00:00+03:00");

/**
 * Set by middleware.ts, NOT here: Server Components can't call
 * cookies().set() during a render (Next.js throws in production), so the
 * visitor cookie is minted in middleware and its result is threaded through
 * these two request headers instead.
 */
const FIRST_VISIT_HEADER = "x-detrbridge-first-visit";
const VISITOR_TOKEN_HEADER = "x-detrbridge-visitor-token";

export interface DetrbridgeVisit {
  id: string;
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
 * Reads the first-visit signal middleware.ts already computed (via request
 * headers, since the cookie itself was minted there). On a first visit,
 * logs the row to Supabase. Returns the elapsed hours since the share
 * moment either way, so the welcome card can always show "X saat sonra
 * geldin" on first visit.
 */
export async function recordDetrbridgeVisit(): Promise<FirstVisit> {
  const headerStore = await headers();
  const isFirstVisit = headerStore.get(FIRST_VISIT_HEADER) === "1";
  const now = new Date();
  const hoursAfterShare = hoursSinceShare(now);

  if (!isFirstVisit) {
    return { isFirstVisit: false, hoursAfterShare };
  }

  const token = headerStore.get(VISITOR_TOKEN_HEADER);
  const supabase = createServiceClient();
  if (supabase && token) {
    const userAgent = headerStore.get("user-agent");
    try {
      await supabase.from("detrbridge_visits").insert({
        visitor_token: token,
        hours_after_share: hoursAfterShare,
        user_agent: userAgent
      });
    } catch {
      // Best-effort logging; the welcome card still renders either way.
    }
  }

  return { isFirstVisit: true, hoursAfterShare };
}

/** Every logged first-visit, newest first — for the admin login log. */
export async function getDetrbridgeVisits(): Promise<DetrbridgeVisit[]> {
  const supabase = createServiceClient();
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("detrbridge_visits")
      .select("id, hours_after_share, user_agent, first_seen_at")
      .order("first_seen_at", { ascending: false });
    if (error) throw error;
    const rows = (data ?? []) as SupabaseVisitRow[];
    return rows.map((row) => ({
      id: row.id,
      hoursAfterShare: row.hours_after_share,
      userAgent: row.user_agent,
      firstSeenAt: row.first_seen_at
    }));
  } catch {
    return [];
  }
}
