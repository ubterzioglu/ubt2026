// Raw item -> normalized candidate — ported from corteqsmvp.

import { canonicalizeUrl } from "@/lib/radar/canonicalize-url";
import { buildCanonicalUrlHash, buildContentHash, normalizeTitle } from "@/lib/radar/hash";
import { scoreRelevance } from "@/lib/radar/relevance-score";
import type { ScoringKeyword } from "@/lib/radar/relevance-score";
import type {
  NormalizedNewsItem,
  RadarNewsSourceRow,
  RawNewsItem
} from "@/lib/radar/types";

const MAX_SUMMARY_LENGTH = 600;

function sanitizeHtml(input: string): string {
  return input
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "")
    .replace(/on\w+='[^']*'/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

export async function normalizeItem(
  item: RawNewsItem,
  source: RadarNewsSourceRow,
  dbKeywords?: ScoringKeyword[]
): Promise<NormalizedNewsItem | null> {
  if (!item.title?.trim() || !item.url?.trim()) return null;

  const canonical = canonicalizeUrl(item.url);
  if (!canonical) return null;

  const title = item.title.trim().slice(0, 500);
  const nt = normalizeTitle(title);
  const summary = item.summary
    ? sanitizeHtml(item.summary).slice(0, MAX_SUMMARY_LENGTH)
    : null;

  const publishedAtMs = item.publishedAt ? Date.parse(item.publishedAt) : NaN;
  const publishedAt = Number.isFinite(publishedAtMs)
    ? new Date(publishedAtMs).toISOString()
    : null;
  if (item.publishedAt && !publishedAt) return null; // invalid date

  const canonicalUrlHash = await buildCanonicalUrlHash(canonical);
  const contentHash = await buildContentHash(nt, source.name, publishedAt);

  const { score, reasons } = scoreRelevance(title, summary, source, dbKeywords);

  return {
    sourceId: source.id,
    sourceName: source.name,
    sourceUrl: source.website_url,
    sourceExternalId: item.externalId ?? null,
    originalUrl: item.url,
    canonicalUrl: canonical,
    title,
    normalizedTitle: nt,
    summary,
    imageSourceUrl: item.imageUrl ?? null,
    category: item.category ?? source.category_default ?? null,
    language: item.language ?? source.language ?? null,
    country: item.country ?? source.country ?? null,
    city: item.city ?? null,
    publishedAt,
    relevanceScore: score,
    relevanceReasons: reasons,
    canonicalUrlHash,
    contentHash,
    rawPayload: item.rawPayload
  };
}
