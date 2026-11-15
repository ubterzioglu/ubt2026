import "server-only";

import { headers } from "next/headers";
import { after } from "next/server";

import { guides } from "@/content/guides";
import { GUIDES_FIRST_VISIT_HEADER, GUIDES_VISITOR_HEADER } from "@/lib/session-constants";
import { createServiceClient } from "@/lib/supabase-server";
import type {
  GuideDailyCount,
  GuideEvent,
  GuideEventType,
  GuideLanguage,
  GuideOpenCount,
  GuideStats,
  GuideStatsResult
} from "@/types/guides";

const TABLE = "guide_events";
const BOT_PATTERN =
  /bot|crawl|spider|slurp|preview|headless|lighthouse|facebookexternalhit|whatsapp|telegram|discord|slack|curl|wget|python|node-fetch|axios|go-http/i;
const DAILY_WINDOW_DAYS = 30;
const RECENT_LIMIT = 25;
const ROW_LIMIT = 20000;
const SITE_HOSTS = new Set(["ubterzioglu.de", "www.ubterzioglu.de", "localhost"]);

interface GuideEventRow {
  id: string;
  event: GuideEventType;
  guide_id: string | null;
  language: GuideLanguage;
  visitor_id: string;
  is_new_visitor: boolean;
  referrer_host: string | null;
  created_at: string;
}

interface GuideEventInsert {
  event: GuideEventType;
  guideId: string | null;
  language: GuideLanguage;
  visitorId: string;
  isNewVisitor: boolean;
  referrerHost: string | null;
}

function toGuideEvent(row: GuideEventRow): GuideEvent {
  return {
    id: row.id,
    event: row.event,
    guideId: row.guide_id,
    language: row.language,
    visitorId: row.visitor_id,
    isNewVisitor: row.is_new_visitor,
    referrerHost: row.referrer_host,
    createdAt: row.created_at
  };
}

export function isBotUserAgent(userAgent: string | null): boolean {
  return !userAgent || BOT_PATTERN.test(userAgent);
}

export function externalReferrerHost(referer: string | null): string | null {
  if (!referer) return null;
  try {
    const host = new URL(referer).hostname.replace(/^www\./, "");
    return SITE_HOSTS.has(host) || SITE_HOSTS.has(`www.${host}`) ? null : host;
  } catch {
    return null;
  }
}

async function insertGuideEvent(input: GuideEventInsert): Promise<void> {
  const supabase = createServiceClient();
  if (!supabase) return;
  try {
    await supabase.from(TABLE).insert({
      event: input.event,
      guide_id: input.guideId,
      language: input.language,
      visitor_id: input.visitorId,
      is_new_visitor: input.isNewVisitor,
      referrer_host: input.referrerHost
    });
  } catch {
    return;
  }
}

export async function recordGuidePageView(language: GuideLanguage): Promise<void> {
  const headerStore = await headers();
  if (headerStore.get("next-router-prefetch") || headerStore.get("purpose") === "prefetch") return;
  if (isBotUserAgent(headerStore.get("user-agent"))) return;

  const visitorId = headerStore.get(GUIDES_VISITOR_HEADER);
  if (!visitorId) return;

  const isClientNavigation = headerStore.get("rsc") === "1";
  const event: GuideEventInsert = {
    event: isClientNavigation ? "switch" : "view",
    guideId: null,
    language,
    visitorId,
    isNewVisitor: headerStore.get(GUIDES_FIRST_VISIT_HEADER) === "1",
    referrerHost: isClientNavigation ? null : externalReferrerHost(headerStore.get("referer"))
  };
  after(() => insertGuideEvent(event));
}

export function recordGuideOpen(input: {
  guideId: string;
  language: GuideLanguage;
  visitorId: string;
  isNewVisitor: boolean;
}): void {
  after(() =>
    insertGuideEvent({
      event: "open",
      guideId: input.guideId,
      language: input.language,
      visitorId: input.visitorId,
      isNewVisitor: input.isNewVisitor,
      referrerHost: null
    })
  );
}

const dayFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Berlin",
  year: "numeric",
  month: "2-digit",
  day: "2-digit"
});

function dayKey(date: Date): string {
  return dayFormatter.format(date);
}

function buildDaily(events: readonly GuideEvent[], now: Date): GuideDailyCount[] {
  const days: GuideDailyCount[] = [];
  const index = new Map<string, GuideDailyCount>();
  for (let offset = DAILY_WINDOW_DAYS - 1; offset >= 0; offset -= 1) {
    const entry = { date: dayKey(new Date(now.getTime() - offset * 86_400_000)), views: 0, opens: 0 };
    days.push(entry);
    index.set(entry.date, entry);
  }
  for (const event of events) {
    const entry = index.get(dayKey(new Date(event.createdAt)));
    if (!entry) continue;
    if (event.event === "view") entry.views += 1;
    if (event.event === "open") entry.opens += 1;
  }
  return days;
}

function buildOpensByGuide(events: readonly GuideEvent[]): GuideOpenCount[] {
  return guides
    .map((guide) => {
      const opens = events.filter((event) => event.event === "open" && event.guideId === guide.id);
      const tr = opens.filter((event) => event.language === "tr").length;
      const en = opens.filter((event) => event.language === "en").length;
      return { id: guide.id, title: guide.title.tr, tr, en, total: tr + en };
    })
    .sort((left, right) => right.total - left.total);
}

function buildReferrers(events: readonly GuideEvent[]): { host: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const event of events) {
    if (event.event !== "view") continue;
    const host = event.referrerHost ?? "direct";
    counts.set(host, (counts.get(host) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([host, count]) => ({ host, count }))
    .sort((left, right) => right.count - left.count)
    .slice(0, 8);
}

function buildStats(events: readonly GuideEvent[], now: Date): GuideStats {
  const views = events.filter((event) => event.event === "view");
  const opens = events.filter((event) => event.event === "open");
  const dayAgo = now.getTime() - 86_400_000;
  const inLastDay = (event: GuideEvent) => new Date(event.createdAt).getTime() >= dayAgo;

  return {
    views: views.length,
    uniqueVisitors: new Set(events.filter((event) => event.event !== "open").map((event) => event.visitorId)).size,
    switches: events.filter((event) => event.event === "switch").length,
    opens: opens.length,
    uniqueOpeners: new Set(opens.map((event) => event.visitorId)).size,
    last24hViews: views.filter(inLastDay).length,
    last24hOpens: opens.filter(inLastDay).length,
    viewsByLanguage: {
      tr: views.filter((event) => event.language === "tr").length,
      en: views.filter((event) => event.language === "en").length
    },
    opensByGuide: buildOpensByGuide(events),
    referrers: buildReferrers(events),
    daily: buildDaily(events, now),
    recent: events.slice(0, RECENT_LIMIT),
    firstEventAt: events.length > 0 ? events[events.length - 1].createdAt : null
  };
}

export async function getGuideStats(): Promise<GuideStatsResult> {
  const supabase = createServiceClient();
  if (!supabase) return { source: "env-missing", stats: null };

  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select("id, event, guide_id, language, visitor_id, is_new_visitor, referrer_host, created_at")
      .order("created_at", { ascending: false })
      .limit(ROW_LIMIT);
    if (error) throw new Error(error.message);

    const events = ((data ?? []) as GuideEventRow[]).map(toGuideEvent);
    if (events.length === 0) return { source: "empty", stats: buildStats([], new Date()) };
    return { source: "remote", stats: buildStats(events, new Date()) };
  } catch (error) {
    return {
      source: "error",
      stats: null,
      errorMessage: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
