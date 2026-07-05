// Radar tarama motoru — corteqsmvp Edge Function (radar-news-scan/index.ts)
// gövdesinin Node portu. HTTP/auth katmanı yok: /dm server action'ı service-role
// client ile çağırır.

import type { SupabaseClient } from "@supabase/supabase-js";

import { atomAdapter } from "@/lib/radar/adapters/atom";
import { gdeltAdapter } from "@/lib/radar/adapters/gdelt";
import { rssAdapter } from "@/lib/radar/adapters/rss";
import { checkDuplicate } from "@/lib/radar/dedupe";
import { normalizeItem } from "@/lib/radar/normalize-item";
import { acquireScanLock, closeScanRun, openScanRun } from "@/lib/radar/scan-lock";
import type { ScoringKeyword } from "@/lib/radar/relevance-score";
import type {
  NormalizedNewsItem,
  RadarNewsAdapter,
  RadarNewsSourceRow,
  RadarReviewStatus,
  RadarTriggerType,
  ScanResult,
  ScanSummary
} from "@/lib/radar/types";

const ADAPTERS: Record<string, RadarNewsAdapter> = {
  gdelt_doc_v2: gdeltAdapter,
  rss: rssAdapter,
  atom: atomAdapter
};

// Kaynaklar arası gecikme — aynı sağlayıcı (ör. GDELT) paylaşımlı egress
// IP'sini art arda sorgularda rate-limit (429) eder.
const INTER_SOURCE_DELAY_MS = 6000;

// Bu eşiğin ALTINDA kalan haberler doğrudan "archived" statüsüyle kaydedilir
// (kuyruğa/pending'e gelmez). Varsayılan 0 = arşive-atma KAPALI. Kod deploy
// etmeden ayarlanabilsin diye ENV'den okunur.
function minScoreToQueue(): number {
  const raw = process.env.RADAR_NEWS_MIN_SCORE;
  const parsed = raw != null ? Number(raw) : NaN;
  return Number.isFinite(parsed) ? parsed : 0;
}

export class ScanLockError extends Error {
  constructor() {
    super("Zaten çalışan bir tarama var");
    this.name = "ScanLockError";
  }
}

function candidateInsertRow(
  sourceId: string,
  runId: string,
  normalized: NormalizedNewsItem,
  reviewStatus: RadarReviewStatus
): Record<string, unknown> {
  return {
    source_id: sourceId,
    scan_run_id: runId,
    source_external_id: normalized.sourceExternalId,
    source_name: normalized.sourceName,
    source_url: normalized.sourceUrl,
    original_url: normalized.originalUrl,
    canonical_url: normalized.canonicalUrl,
    title: normalized.title,
    normalized_title: normalized.normalizedTitle,
    summary: normalized.summary,
    image_source_url: normalized.imageSourceUrl,
    category: normalized.category,
    language: normalized.language,
    country: normalized.country,
    city: normalized.city,
    published_at: normalized.publishedAt,
    relevance_score: normalized.relevanceScore,
    relevance_reasons: normalized.relevanceReasons,
    canonical_url_hash: normalized.canonicalUrlHash,
    content_hash: normalized.contentHash,
    review_status: reviewStatus,
    raw_payload: normalized.rawPayload
  };
}

export interface RunRadarScanOptions {
  triggerType?: RadarTriggerType;
  sourceIds?: string[];
  dryRun?: boolean;
}

export async function runRadarScan(
  supabase: SupabaseClient,
  options: RunRadarScanOptions = {}
): Promise<ScanSummary> {
  const startMs = Date.now();
  const triggerType: RadarTriggerType = options.triggerType ?? "manual";
  const dryRun = options.dryRun === true;
  const filterSourceIds = options.sourceIds?.length ? options.sourceIds : null;

  // ── Scan lock ──
  const canRun = await acquireScanLock(supabase);
  if (!canRun) throw new ScanLockError();

  // ── Scan run aç ──
  const runId = dryRun ? "dry-run" : await openScanRun(supabase, triggerType, null);

  // ── Kaynakları yükle ──
  let sourcesQuery = supabase
    .from("radar_news_sources")
    .select("*")
    .eq("is_enabled", true)
    .eq("terms_checked", true);

  if (filterSourceIds) {
    sourcesQuery = sourcesQuery.in("id", filterSourceIds);
  }

  const { data: sources, error: sourcesError } = await sourcesQuery;
  if (sourcesError) {
    if (!dryRun) {
      await closeScanRun(supabase, runId, "failed", {
        source_count: 0,
        fetched_count: 0,
        inserted_count: 0,
        duplicate_count: 0,
        filtered_count: 0,
        failed_source_count: 0,
        error_message: sourcesError.message
      });
    }
    throw new Error(sourcesError.message);
  }

  // ── Skorlama keyword'lerini yükle (admin DB'den yönetir) ──
  const { data: keywordRows } = await supabase
    .from("radar_news_keywords")
    .select("keyword, category, weight, is_negative")
    .eq("is_enabled", true);

  const dbKeywords: ScoringKeyword[] = (keywordRows ?? []).map((k) => ({
    keyword: k.keyword as string,
    category: (k.category as string | null) ?? null,
    weight: Number(k.weight ?? 0),
    isNegative: k.is_negative === true
  }));

  const results: ScanResult[] = [];
  let totalFetched = 0;
  let totalInserted = 0;
  let totalDuplicate = 0;
  let totalFiltered = 0;
  let failedSources = 0;
  const minScore = minScoreToQueue();

  const sourceList = (sources ?? []) as RadarNewsSourceRow[];
  for (let sourceIndex = 0; sourceIndex < sourceList.length; sourceIndex++) {
    const source = sourceList[sourceIndex];
    if (sourceIndex > 0) {
      await new Promise((r) => setTimeout(r, INTER_SOURCE_DELAY_MS));
    }
    const adapter = ADAPTERS[source.adapter_key];
    if (!adapter) {
      results.push({
        sourceId: source.id,
        sourceName: source.name,
        fetched: 0,
        inserted: 0,
        duplicate: 0,
        filtered: 0,
        error: `Adapter bulunamadı: ${source.adapter_key}`
      });
      failedSources++;
      continue;
    }

    let fetched = 0;
    let inserted = 0;
    let duplicate = 0;
    let filtered = 0;
    let sourceError: string | null = null;

    try {
      const rawItems = await adapter.fetchItems(source);
      fetched = rawItems.length;
      totalFetched += fetched;

      for (const raw of rawItems) {
        const normalized = await normalizeItem(raw, source, dbKeywords);
        if (!normalized) {
          filtered++;
          continue;
        }

        if (normalized.relevanceScore < minScore) {
          filtered++;
          if (!dryRun) {
            // Arşive yaz (tuning için sakla)
            await supabase
              .from("radar_news_candidates")
              .insert(candidateInsertRow(source.id, runId, normalized, "archived"))
              .select("id")
              .maybeSingle();
          }
          continue;
        }

        const dupeCheck = await checkDuplicate(supabase, normalized);
        if (dupeCheck.isDupe) {
          duplicate++;
          continue;
        }

        if (!dryRun) {
          const { error: insertError } = await supabase
            .from("radar_news_candidates")
            .insert(candidateInsertRow(source.id, runId, normalized, "pending"));

          if (!insertError) {
            inserted++;
          } else if (insertError.code === "23505") {
            // unique constraint — duplicate
            duplicate++;
          } else {
            filtered++;
          }
        } else {
          inserted++; // dry-run'da sayıyoruz ama yazmıyoruz
        }
      }

      // Kaynak son başarı zamanını güncelle
      if (!dryRun) {
        await supabase
          .from("radar_news_sources")
          .update({
            last_success_at: new Date().toISOString(),
            last_error_message: null
          })
          .eq("id", source.id);
      }
    } catch (err) {
      sourceError = err instanceof Error ? err.message : String(err);
      failedSources++;
      if (!dryRun) {
        await supabase
          .from("radar_news_sources")
          .update({
            last_error_at: new Date().toISOString(),
            last_error_message: sourceError
          })
          .eq("id", source.id);
      }
    }

    results.push({
      sourceId: source.id,
      sourceName: source.name,
      fetched,
      inserted,
      duplicate,
      filtered,
      error: sourceError
    });
    totalInserted += inserted;
    totalDuplicate += duplicate;
    totalFiltered += filtered;
  }

  const durationMs = Date.now() - startMs;
  const finalStatus =
    failedSources === (sources?.length ?? 0) && (sources?.length ?? 0) > 0
      ? "failed"
      : failedSources > 0
        ? "partial"
        : "completed";

  if (!dryRun) {
    await closeScanRun(supabase, runId, finalStatus, {
      source_count: sources?.length ?? 0,
      fetched_count: totalFetched,
      inserted_count: totalInserted,
      duplicate_count: totalDuplicate,
      filtered_count: totalFiltered,
      failed_source_count: failedSources
    });
  }

  return {
    runId,
    triggerType,
    status: finalStatus,
    sourceCount: sources?.length ?? 0,
    fetchedCount: totalFetched,
    insertedCount: totalInserted,
    duplicateCount: totalDuplicate,
    filteredCount: totalFiltered,
    failedSourceCount: failedSources,
    results,
    durationMs
  };
}
