import "server-only";

import { randomUUID } from "node:crypto";
import { cookies, headers } from "next/headers";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** UBT'nin /detrbridge linkini paylaştığı an (TR saatiyle 19 Temmuz 2026, 07:00). */
export const DETRBRIDGE_SHARE_MOMENT = new Date("2026-07-19T07:00:00+03:00");

export const DETRBRIDGE_VISITOR_COOKIE = "ubt_detrbridge_visitor";
const VISITOR_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365 * 5; // 5 years

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
 * Reads the visitor cookie; if absent, this is the visitor's first-ever
 * visit — a token is minted, the cookie is set, and the visit is logged.
 * Returns the elapsed hours since the share moment either way, so the
 * welcome card can always show "X saat sonra geldin" on first visit.
 */
export async function recordDetrbridgeVisit(): Promise<FirstVisit> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(DETRBRIDGE_VISITOR_COOKIE)?.value;
  const now = new Date();
  const hoursAfterShare = hoursSinceShare(now);

  if (existing) {
    return { isFirstVisit: false, hoursAfterShare };
  }

  const token = randomUUID();
  cookieStore.set(DETRBRIDGE_VISITOR_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/detrbridge",
    maxAge: VISITOR_COOKIE_MAX_AGE_SECONDS
  });

  const supabase = createServiceClient();
  if (supabase) {
    const headerStore = await headers();
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
