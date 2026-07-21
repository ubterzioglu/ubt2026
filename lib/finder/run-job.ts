// Service Finder iş yürütücüsü — corteqsmvp workers/service-finder/src/worker-loop.ts
// gövdesinin senkron Node portu. Ayrı worker süreci yok: /dm Scraper sekmesi
// action'ı service-role client ile çağırır (page.tsx maxDuration = 300).
// Worker'a özgü lease/heartbeat/claim RPC'leri kaldırıldı; çifte koşuya karşı
// koşullu UPDATE (status='queued' → 'running') ile tek atımlık kilit kullanılır.

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  AuthOrConfigError,
  BudgetExceededError,
  ProviderRateLimitError,
  errorCode,
  errorMessage
} from "@/lib/finder/errors";
import { extractDomain, makeDuplicateKey, normalizeUrl } from "@/lib/finder/dedupe";
import { CLASSIFIER_SYSTEM_PROMPT, buildClassifierUserPrompt } from "@/lib/finder/prompts";
import { createGeminiClassifier } from "@/lib/finder/providers/gemini";
import { createSerpApiSearchProvider } from "@/lib/finder/providers/serpapi";
import {
  createTavilyExtractProvider,
  createTavilySearchProvider
} from "@/lib/finder/providers/tavily";
import type { ClassifyUsage, SearchProvider } from "@/lib/finder/providers/types";
import { buildQueries } from "@/lib/finder/queries";
import { isRobotsAllowed } from "@/lib/finder/robots";
import { parseCandidateResult } from "@/lib/finder/validate";
import type {
  CandidateResult,
  FinderJobRow,
  FinderJobSourceRow,
  FinderProviderConfigRow,
  FinderTemplateRow
} from "@/lib/finder/types";

const SOFT_DEGRADE_MODEL = "gemini-2.5-flash";
const MIN_CONFIDENCE_TO_KEEP = 30;
const EXTRACT_BATCH_SIZE = 5;
// Informational lock tag (only ever written, never compared).
const LOCKED_BY = "dmscraper-server-action";

export class JobNotClaimableError extends Error {
  constructor() {
    super("İş kuyrukta değil (zaten çalışıyor ya da bitmiş olabilir)");
    this.name = "JobNotClaimableError";
  }
}

/** secret_ref (env değişken adı) → gerçek anahtar. Ham anahtar asla loglanmaz. */
function resolveSecret(secretRef: string): string {
  const value = process.env[secretRef];
  if (typeof value !== "string" || value.length === 0) {
    throw new AuthOrConfigError(`Sağlayıcı anahtarı bulunamadı: env ${secretRef} tanımlı değil`);
  }
  return value;
}

interface JobRuntime {
  db: SupabaseClient;
  job: FinderJobRow;
  providers: Map<string, FinderProviderConfigRow>;
  softCapHit: boolean;
  costTotalUsd: number;
}

function providerById(
  runtime: JobRuntime,
  providerId: string | null
): FinderProviderConfigRow | null {
  if (!providerId) return null;
  for (const config of runtime.providers.values()) {
    if (config.id === providerId) return config;
  }
  return null;
}

function providerByKey(runtime: JobRuntime, key: string): FinderProviderConfigRow | null {
  return runtime.providers.get(key) ?? null;
}

// ─── DB yardımcıları (worker db.ts karşılığı; RPC yok, doğrudan tablolar) ────

async function appendEvent(
  runtime: JobRuntime,
  eventType: string,
  message: string,
  options: { level?: string; payload?: Record<string, unknown> } = {}
): Promise<void> {
  // Olay yazımı kritik değil — hata işleme akışını durdurmaz.
  await runtime.db.from("service_finder_job_events").insert({
    job_id: runtime.job.id,
    event_type: eventType,
    event_level: options.level ?? "info",
    message: message.slice(0, 2000),
    event_payload: options.payload ?? {}
  });
}

async function updateProgress(
  runtime: JobRuntime,
  progress: Record<string, unknown>
): Promise<void> {
  await runtime.db
    .from("service_finder_jobs")
    .update({ progress })
    .eq("id", runtime.job.id);
}

interface CostEntry {
  provider_key: string;
  provider_config_id?: string | null;
  event_type: "search" | "extract" | "classify";
  billing_unit: string;
  quantity: number;
  unit_cost_usd: number;
  amount_usd: number;
  model_name?: string | null;
  query_id?: string | null;
  source_id?: string | null;
  request_meta?: Record<string, unknown>;
}

/**
 * Maliyeti deftere yazar, iş toplamını günceller ve cap'leri değerlendirir.
 * Hard cap aşımı BudgetExceededError fırlatır; soft cap aşımı ucuz moda geçirir.
 */
async function recordCost(runtime: JobRuntime, entry: CostEntry): Promise<void> {
  await runtime.db.from("service_finder_cost_ledger").insert({
    job_id: runtime.job.id,
    ...entry,
    request_meta: entry.request_meta ?? {}
  });

  runtime.costTotalUsd = Math.round((runtime.costTotalUsd + entry.amount_usd) * 10_000) / 10_000;
  await runtime.db
    .from("service_finder_jobs")
    .update({ cost_total_usd: runtime.costTotalUsd })
    .eq("id", runtime.job.id);

  if (runtime.costTotalUsd >= Number(runtime.job.hard_cap_usd)) {
    throw new BudgetExceededError(
      `Hard cap aşıldı: $${runtime.costTotalUsd} / $${runtime.job.hard_cap_usd}`
    );
  }
  if (runtime.costTotalUsd >= Number(runtime.job.soft_cap_usd) && !runtime.softCapHit) {
    runtime.softCapHit = true;
    await appendEvent(
      runtime,
      "soft_cap_reached",
      `Soft cap aşıldı ($${runtime.costTotalUsd}); ucuz moda geçiliyor.`,
      { level: "warn" }
    );
  }
}

interface QueryRecord {
  stage: "seed" | "expansion";
  provider_key: string;
  query_text: string;
  external_request_id?: string | null;
  usage_units: number;
  estimated_cost_usd: number;
  result_count: number;
  status: "succeeded" | "failed";
}

async function insertQuery(runtime: JobRuntime, record: QueryRecord): Promise<string | null> {
  const { data } = await runtime.db
    .from("service_finder_job_queries")
    .upsert(
      {
        job_id: runtime.job.id,
        ...record,
        executed_at: new Date().toISOString()
      },
      { onConflict: "job_id,stage,query_text" }
    )
    .select("id")
    .maybeSingle();
  return (data?.id as string | undefined) ?? null;
}

interface DiscoveredSource {
  discovery_query_id: string | null;
  provider_key: string;
  source_url: string;
  normalized_url: string;
  source_domain: string;
  source_title?: string | null;
  source_snippet?: string | null;
}

async function insertDiscoveredSources(
  runtime: JobRuntime,
  sources: DiscoveredSource[]
): Promise<number> {
  if (sources.length === 0) return 0;
  const { data, error } = await runtime.db
    .from("service_finder_job_sources")
    .upsert(
      sources.map((source) => ({ job_id: runtime.job.id, ...source })),
      { onConflict: "job_id,normalized_url", ignoreDuplicates: true }
    )
    .select("id");
  if (error) throw new Error(`Kaynak kaydı başarısız: ${error.message}`);
  return (data ?? []).length;
}

async function loadSourcesByStatus(
  runtime: JobRuntime,
  fetchStatus: string,
  limit: number
): Promise<FinderJobSourceRow[]> {
  const { data, error } = await runtime.db
    .from("service_finder_job_sources")
    .select(
      "id, job_id, source_url, normalized_url, source_domain, source_title, source_snippet, fetch_status, extracted_text"
    )
    .eq("job_id", runtime.job.id)
    .eq("fetch_status", fetchStatus)
    .order("created_at", { ascending: true })
    .limit(limit);
  if (error) throw new Error(`Kaynaklar okunamadı: ${error.message}`);
  return (data ?? []) as FinderJobSourceRow[];
}

async function updateSource(
  runtime: JobRuntime,
  sourceId: string,
  patch: Record<string, unknown>
): Promise<void> {
  await runtime.db.from("service_finder_job_sources").update(patch).eq("id", sourceId);
}

async function countCandidates(runtime: JobRuntime): Promise<number> {
  const { count } = await runtime.db
    .from("service_finder_candidates")
    .select("id", { count: "exact", head: true })
    .eq("job_id", runtime.job.id);
  return count ?? 0;
}

// LLM prompt'u resmi Almanca yazımı zorluyor; bu, kaçan yaygın İngilizce/kısaltılmış
// hallere karşı son güvenlik ağı (ör. sık şehir isimleri için).
const CITY_ALIASES: Record<string, string> = {
  cologne: "Köln",
  munich: "München",
  nuremberg: "Nürnberg",
  frankfurt: "Frankfurt am Main",
  hanover: "Hannover"
};

function normalizeCityName(city: string | null): string | null {
  if (!city) return city;
  const trimmed = city.trim();
  const alias = CITY_ALIASES[trimmed.toLowerCase()];
  return alias ?? trimmed;
}

/** street/house_number'dan görüntüleme amaçlı tek satır adres türetir (ham alanlar ayrı kalır). */
function deriveAddressLine(street: string | null, houseNumber: string | null): string | null {
  const parts = [street, houseNumber].filter((part): part is string => Boolean(part?.trim()));
  return parts.length > 0 ? parts.join(" ") : null;
}

async function upsertCandidate(
  runtime: JobRuntime,
  sourceId: string,
  parsed: CandidateResult,
  classifierModel: string,
  sourceUrl: string
): Promise<string | null> {
  const job = runtime.job;
  const normalizedCity = normalizeCityName(parsed.city ?? job.city);
  const normalizedParsed: CandidateResult = { ...parsed, city: normalizedCity };
  const row = {
    job_id: job.id,
    primary_source_id: sourceId,
    canonical_name: parsed.canonical_name ?? "İsimsiz kayıt",
    profession_label: parsed.profession_label,
    self_description: parsed.profession_label,
    organization_name: parsed.organization_name,
    role_key: parsed.role_key ?? job.role_key,
    item_type: parsed.item_type ?? job.item_type,
    // category_slug artık LLM'den gelmiyor — job template'inin kategorisi tek doğru kaynak.
    category_slug: job.category_slug,
    country_code: parsed.country_code ?? job.country_code,
    region: job.region,
    city: normalizedCity,
    street: parsed.street,
    house_number: parsed.house_number,
    postal_code: parsed.postal_code,
    address_line: deriveAddressLine(parsed.street, parsed.house_number),
    languages: parsed.languages,
    services: parsed.services,
    services_raw: parsed.services.map((label) => ({ label, source_url: sourceUrl })),
    contacts: parsed.contacts,
    website_url: parsed.website_url,
    appointment_url: parsed.appointment_url,
    source_urls: [sourceUrl],
    evidence: parsed.evidence_quotes.map((quote) => ({ quote, source_url: sourceUrl })),
    self_statements: parsed.self_statements.map((statement) => ({
      quote: statement.quote,
      source_url: statement.source_url ?? sourceUrl
    })),
    normalized_payload: normalizedParsed,
    duplicate_key: makeDuplicateKey(normalizedParsed),
    confidence_score: parsed.confidence_score,
    classifier_model: classifierModel,
    scraped_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  const { data, error } = await runtime.db
    .from("service_finder_candidates")
    .upsert(row, { onConflict: "job_id,duplicate_key", ignoreDuplicates: true })
    .select("id")
    .maybeSingle();
  if (error) throw new Error(`Aday kaydı başarısız: ${error.message}`);
  return (data?.id as string | undefined) ?? null;
}

// ─── Aşama 1: Arama ──────────────────────────────────────────────────────────

async function loadTemplate(
  runtime: JobRuntime
): Promise<FinderTemplateRow | null> {
  if (!runtime.job.template_id) return null;
  const { data, error } = await runtime.db
    .from("service_finder_profession_templates")
    .select("*")
    .eq("id", runtime.job.template_id)
    .maybeSingle();
  if (error) throw new Error(`Şablon okunamadı: ${error.message}`);
  return (data as FinderTemplateRow | null) ?? null;
}

async function runSearchStage(runtime: JobRuntime): Promise<void> {
  const { job } = runtime;
  const template = await loadTemplate(runtime);
  const queries = buildQueries(job, template);

  const searchConfig =
    providerById(runtime, job.search_provider_id) ?? providerByKey(runtime, "tavily");
  if (!searchConfig || !searchConfig.is_enabled) {
    throw new AuthOrConfigError("Etkin arama sağlayıcısı yok");
  }

  let provider: SearchProvider;
  if (searchConfig.provider_key === "serpapi") {
    provider = createSerpApiSearchProvider(
      resolveSecret(searchConfig.secret_ref),
      searchConfig.request_defaults
    );
  } else {
    provider = createTavilySearchProvider(resolveSecret(searchConfig.secret_ref));
  }

  // SerpAPI fallback — az sonuçta geo hassasiyeti için (soft cap'te kapalı).
  const serpapiConfig = providerByKey(runtime, "serpapi");
  const fallbackEnabled =
    serpapiConfig?.is_enabled === true && searchConfig.provider_key !== "serpapi";

  let discoveredTotal = 0;
  let queryIndex = 0;

  for (const queryText of queries) {
    queryIndex += 1;
    await updateProgress(runtime, { stage: "search", query: queryIndex, of: queries.length });

    const requestDefaults = searchConfig.request_defaults ?? {};
    const baseDepth =
      typeof requestDefaults["search_depth"] === "string"
        ? (requestDefaults["search_depth"] as "basic" | "advanced")
        : "basic";
    const depth: "basic" | "advanced" = runtime.softCapHit ? "basic" : baseDepth;
    const maxResults = runtime.softCapHit
      ? Math.min(5, Number(requestDefaults["max_results"] ?? 8))
      : Number(requestDefaults["max_results"] ?? 8);

    let searchOutput;
    let usedProvider = provider;
    try {
      searchOutput = await usedProvider.search({
        query: queryText,
        locationLabel: job.location_label,
        countryCode: job.country_code ?? undefined,
        languageCode: job.language_code,
        maxResults,
        searchDepth: depth
      });
    } catch (error: unknown) {
      await insertQuery(runtime, {
        stage: "seed",
        provider_key: usedProvider.key,
        query_text: queryText,
        usage_units: 0,
        estimated_cost_usd: 0,
        result_count: 0,
        status: "failed"
      });
      if (error instanceof AuthOrConfigError || error instanceof BudgetExceededError) {
        throw error;
      }
      await appendEvent(runtime, "search_failed", errorMessage(error), { level: "warn" });
      continue;
    }

    const queryId = await insertQuery(runtime, {
      stage: "seed",
      provider_key: usedProvider.key,
      query_text: queryText,
      external_request_id: searchOutput.requestId ?? null,
      usage_units: searchOutput.usage.units,
      estimated_cost_usd: searchOutput.usage.estimatedCostUsd,
      result_count: searchOutput.results.length,
      status: "succeeded"
    });

    await recordCost(runtime, {
      provider_key: usedProvider.key,
      provider_config_id: searchConfig.id,
      event_type: "search",
      billing_unit: searchOutput.usage.billingUnit,
      quantity: searchOutput.usage.units,
      unit_cost_usd:
        searchOutput.usage.units > 0
          ? searchOutput.usage.estimatedCostUsd / searchOutput.usage.units
          : 0,
      amount_usd: searchOutput.usage.estimatedCostUsd,
      query_id: queryId,
      request_meta: { query: queryText, depth }
    });

    if (fallbackEnabled && !runtime.softCapHit && searchOutput.results.length < 3 && serpapiConfig) {
      try {
        const serpProvider = createSerpApiSearchProvider(
          resolveSecret(serpapiConfig.secret_ref),
          serpapiConfig.request_defaults
        );
        const serpOutput = await serpProvider.search({
          query: queryText,
          locationLabel: job.location_label,
          languageCode: job.language_code,
          maxResults
        });
        const serpQueryId = await insertQuery(runtime, {
          stage: "expansion",
          provider_key: "serpapi",
          query_text: queryText,
          external_request_id: serpOutput.requestId ?? null,
          usage_units: serpOutput.usage.units,
          estimated_cost_usd: serpOutput.usage.estimatedCostUsd,
          result_count: serpOutput.results.length,
          status: "succeeded"
        });
        await recordCost(runtime, {
          provider_key: "serpapi",
          provider_config_id: serpapiConfig.id,
          event_type: "search",
          billing_unit: serpOutput.usage.billingUnit,
          quantity: serpOutput.usage.units,
          unit_cost_usd: serpOutput.usage.estimatedCostUsd,
          amount_usd: serpOutput.usage.estimatedCostUsd,
          query_id: serpQueryId,
          request_meta: { query: queryText, fallback: true }
        });
        searchOutput.results.push(...serpOutput.results);
        usedProvider = serpProvider;
      } catch (error: unknown) {
        if (error instanceof BudgetExceededError) throw error;
        await appendEvent(runtime, "serpapi_fallback_failed", errorMessage(error), {
          level: "warn"
        });
      }
    }

    // Keşfedilen URL'leri normalize edip persist et (job başına tekil).
    const remainingBudget = job.max_source_urls - discoveredTotal;
    if (remainingBudget <= 0) break;
    const sources = searchOutput.results
      .filter((result) => /^https?:\/\//i.test(result.url))
      .slice(0, remainingBudget)
      .map((result) => ({
        discovery_query_id: queryId,
        provider_key: usedProvider.key,
        source_url: result.url,
        normalized_url: normalizeUrl(result.url),
        source_domain: result.domain || extractDomain(result.url),
        source_title: result.title ?? null,
        source_snippet: result.snippet ?? null
      }));
    discoveredTotal += await insertDiscoveredSources(runtime, sources);
  }

  await appendEvent(
    runtime,
    "search_stage_done",
    `${queryIndex} sorgu çalıştı, ${discoveredTotal} kaynak keşfedildi.`
  );

  // Seed URL'leri arama aşamasından bağımsız olarak doğrudan kaynak kuyruğuna ekle.
  if (job.seed_urls?.length) {
    const validSeedUrls = job.seed_urls.filter((url) => /^https?:\/\//i.test(url));
    if (validSeedUrls.length > 0) {
      await insertDiscoveredSources(
        runtime,
        validSeedUrls.map((url) => ({
          discovery_query_id: null,
          provider_key: "manual",
          source_url: url,
          normalized_url: normalizeUrl(url),
          source_domain: extractDomain(url),
          source_title: null,
          source_snippet: null
        }))
      );
      await appendEvent(
        runtime,
        "seed_urls_injected",
        `${validSeedUrls.length} ön adres ekstraksiyon kuyruğuna eklendi.`
      );
    }
  }
}

// ─── Aşama 2: Ekstraksiyon (robots kontrolü zorunlu) ─────────────────────────

async function runExtractStage(runtime: JobRuntime): Promise<void> {
  const { job } = runtime;
  const extractConfig =
    providerById(runtime, job.extract_provider_id) ?? providerByKey(runtime, "tavily");
  if (!extractConfig || !extractConfig.is_enabled) {
    throw new AuthOrConfigError("Etkin ekstraksiyon sağlayıcısı yok");
  }
  const extractProvider = createTavilyExtractProvider(resolveSecret(extractConfig.secret_ref));

  const requestDefaults = extractConfig.request_defaults ?? {};
  const baseDepth =
    typeof requestDefaults["extract_depth"] === "string"
      ? (requestDefaults["extract_depth"] as "basic" | "advanced")
      : "basic";

  const sources = await loadSourcesByStatus(runtime, "discovered", job.max_extract_urls);
  let fetchedCount = 0;

  // Önce robots değerlendirmesi — engellenenler hiç sağlayıcıya gitmez.
  const allowed: typeof sources = [];
  for (const source of sources) {
    const robotsAllowed = await isRobotsAllowed(source.source_url);
    await updateSource(runtime, source.id, {
      crawl_allowed: robotsAllowed,
      robots_evaluated_at: new Date().toISOString(),
      ...(robotsAllowed ? { fetch_status: "queued" } : { fetch_status: "blocked_robots" })
    });
    if (robotsAllowed) allowed.push(source);
  }
  if (sources.length > allowed.length) {
    await appendEvent(
      runtime,
      "robots_blocked",
      `${sources.length - allowed.length} kaynak robots.txt nedeniyle atlandı.`
    );
  }

  for (let offset = 0; offset < allowed.length; offset += EXTRACT_BATCH_SIZE) {
    await updateProgress(runtime, {
      stage: "extract",
      fetched: fetchedCount,
      of: allowed.length
    });
    const depth: "basic" | "advanced" = runtime.softCapHit ? "basic" : baseDepth;
    const batch = allowed.slice(offset, offset + EXTRACT_BATCH_SIZE);

    let output;
    try {
      output = await extractProvider.extract({
        urls: batch.map((source) => source.source_url),
        query: job.freeform_topic ?? job.title,
        depth
      });
    } catch (error: unknown) {
      if (error instanceof AuthOrConfigError || error instanceof BudgetExceededError) {
        throw error;
      }
      for (const source of batch) {
        await updateSource(runtime, source.id, { fetch_status: "failed" });
      }
      await appendEvent(runtime, "extract_failed", errorMessage(error), { level: "warn" });
      continue;
    }

    const docsByUrl = new Map(output.docs.map((doc) => [normalizeUrl(doc.url), doc]));
    for (const source of batch) {
      const doc =
        docsByUrl.get(source.normalized_url) ?? docsByUrl.get(normalizeUrl(source.source_url));
      if (doc?.text) {
        await updateSource(runtime, source.id, {
          fetch_status: "fetched",
          extracted_text: doc.text.slice(0, 60_000),
          fetched_at: new Date().toISOString()
        });
        fetchedCount += 1;
      } else {
        await updateSource(runtime, source.id, { fetch_status: "failed" });
      }
    }

    if (output.usage.estimatedCostUsd > 0) {
      await recordCost(runtime, {
        provider_key: "tavily",
        provider_config_id: extractConfig.id,
        event_type: "extract",
        billing_unit: output.usage.billingUnit,
        quantity: output.usage.units,
        unit_cost_usd:
          output.usage.units > 0 ? output.usage.estimatedCostUsd / output.usage.units : 0,
        amount_usd: output.usage.estimatedCostUsd,
        request_meta: { urls: batch.length, depth }
      });
    }
  }

  await appendEvent(runtime, "extract_stage_done", `${fetchedCount} kaynak içeriği alındı.`);
}

// ─── Aşama 3: Sınıflandırma ──────────────────────────────────────────────────

const CLASSIFY_REQUEST_DELAY_MS = 4_000;
const CLASSIFY_RATE_LIMIT_RETRIES = 3;
const CLASSIFY_RATE_LIMIT_BACKOFF_MS = 15_000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function classifyWithRetry(
  classifier: ReturnType<typeof createGeminiClassifier>,
  input: Parameters<ReturnType<typeof createGeminiClassifier>["classify"]>[0]
): Promise<{ parsed: unknown; usage: ClassifyUsage }> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await classifier.classify(input);
    } catch (error: unknown) {
      const isLastAttempt = attempt >= CLASSIFY_RATE_LIMIT_RETRIES;
      if (!(error instanceof ProviderRateLimitError) || isLastAttempt) {
        throw error;
      }
      await sleep(CLASSIFY_RATE_LIMIT_BACKOFF_MS * (attempt + 1));
    }
  }
}

async function runClassifyStage(runtime: JobRuntime): Promise<void> {
  const { job } = runtime;
  const classifierConfig =
    providerById(runtime, job.classifier_provider_id) ?? providerByKey(runtime, "gemini");
  if (!classifierConfig || !classifierConfig.is_enabled) {
    throw new AuthOrConfigError("Etkin sınıflandırıcı yok");
  }
  const classifier = createGeminiClassifier(resolveSecret(classifierConfig.secret_ref));
  const baseModel = classifierConfig.default_model ?? SOFT_DEGRADE_MODEL;

  const sources = await loadSourcesByStatus(runtime, "fetched", job.max_extract_urls);
  let candidateCount = await countCandidates(runtime);
  let classified = 0;

  for (const source of sources) {
    if (candidateCount >= job.max_candidates) break;
    await updateProgress(runtime, { stage: "classify", classified, of: sources.length });

    if (classified > 0) {
      await sleep(CLASSIFY_REQUEST_DELAY_MS);
    }

    const model = runtime.softCapHit ? SOFT_DEGRADE_MODEL : baseModel;
    let classification;
    try {
      classification = await classifyWithRetry(classifier, {
        systemPrompt: CLASSIFIER_SYSTEM_PROMPT,
        userPrompt: buildClassifierUserPrompt(job, source),
        model
      });
    } catch (error: unknown) {
      if (error instanceof AuthOrConfigError || error instanceof BudgetExceededError) {
        throw error;
      }
      await updateSource(runtime, source.id, { fetch_status: "failed" });
      await appendEvent(runtime, "classify_failed", errorMessage(error), { level: "warn" });
      continue;
    }

    await recordCost(runtime, {
      provider_key: "gemini",
      provider_config_id: classifierConfig.id,
      event_type: "classify",
      billing_unit: "tokens",
      quantity: classification.usage.inputTokens + classification.usage.outputTokens,
      unit_cost_usd: 0,
      amount_usd: classification.usage.estimatedCostUsd,
      source_id: source.id,
      model_name: classification.usage.model,
      request_meta: {
        input_tokens: classification.usage.inputTokens,
        output_tokens: classification.usage.outputTokens
      }
    });

    const validation = parseCandidateResult(classification.parsed);
    if (!validation.result) {
      await updateSource(runtime, source.id, { fetch_status: "failed" });
      await appendEvent(
        runtime,
        "classifier_validation_failed",
        validation.errorMessage ?? "Doğrulama başarısız",
        { level: "warn", payload: { source_id: source.id } }
      );
      continue;
    }

    const parsed = validation.result;
    classified += 1;

    if (
      !parsed.is_match ||
      !parsed.canonical_name ||
      parsed.confidence_score < MIN_CONFIDENCE_TO_KEEP
    ) {
      await updateSource(runtime, source.id, { fetch_status: "irrelevant" });
      continue;
    }

    const candidateId = await upsertCandidate(
      runtime,
      source.id,
      parsed,
      classification.usage.model,
      source.source_url
    );
    if (candidateId) {
      candidateCount += 1;
    } else {
      await updateSource(runtime, source.id, { fetch_status: "duplicate" });
    }
  }

  await appendEvent(
    runtime,
    "classify_stage_done",
    `${classified} kaynak sınıflandırıldı; toplam ${candidateCount} aday.`
  );
}

// ─── İş yürütücü ─────────────────────────────────────────────────────────────

export interface RunJobSummary {
  status: "review" | "budget_stopped" | "failed";
  candidates: number;
  errorMessage?: string;
}

/**
 * Kuyruktaki işi claim edip üç aşamayı senkron çalıştırır. İş kuyrukta değilse
 * JobNotClaimableError fırlatır; diğer tüm hatalar işi failed/budget_stopped'a
 * çekip özetle döner (action katmanı exception görmek zorunda kalmaz).
 */
export async function executeFinderJob(
  db: SupabaseClient,
  jobId: string
): Promise<RunJobSummary> {
  // Tek atımlık kilit: yalnızca queued → running geçişi bu isteğe aittir.
  const { data: claimed, error: claimError } = await db
    .from("service_finder_jobs")
    .update({
      status: "running",
      locked_by: LOCKED_BY,
      started_at: new Date().toISOString(),
      last_error_code: null,
      last_error_message: null
    })
    .eq("id", jobId)
    .eq("status", "queued")
    .select("*")
    .maybeSingle();
  if (claimError) throw new Error(`İş claim edilemedi: ${claimError.message}`);
  if (!claimed) throw new JobNotClaimableError();

  const job = claimed as FinderJobRow;
  await db
    .from("service_finder_jobs")
    .update({ attempts: job.attempts + 1 })
    .eq("id", jobId);

  const { data: providerRows, error: providerError } = await db
    .from("service_finder_provider_configs")
    .select("*");
  if (providerError) throw new Error(`Sağlayıcılar okunamadı: ${providerError.message}`);
  const providers = (providerRows ?? []) as FinderProviderConfigRow[];

  const runtime: JobRuntime = {
    db,
    job,
    providers: new Map(providers.map((config) => [config.provider_key, config])),
    softCapHit: Number(job.cost_total_usd) >= Number(job.soft_cap_usd),
    costTotalUsd: Number(job.cost_total_usd)
  };

  try {
    await appendEvent(runtime, "job_started", `İş alındı (deneme ${job.attempts + 1}).`);
    await runSearchStage(runtime);
    await runExtractStage(runtime);
    await runClassifyStage(runtime);

    const candidates = await countCandidates(runtime);
    await db
      .from("service_finder_jobs")
      .update({
        status: "review",
        finished_at: new Date().toISOString(),
        locked_by: null,
        result_summary: { candidates },
        progress: {}
      })
      .eq("id", jobId);
    await appendEvent(runtime, "job_review_ready", `İş incelemeye hazır: ${candidates} aday.`);
    return { status: "review", candidates };
  } catch (error: unknown) {
    if (error instanceof BudgetExceededError) {
      const candidates = await countCandidates(runtime);
      await db
        .from("service_finder_jobs")
        .update({
          status: "budget_stopped",
          finished_at: new Date().toISOString(),
          locked_by: null,
          result_summary: { candidates, reason: error.message }
        })
        .eq("id", jobId);
      await appendEvent(runtime, "budget_stopped", error.message, { level: "warn" });
      return { status: "budget_stopped", candidates, errorMessage: error.message };
    }

    const code = errorCode(error);
    const message = errorMessage(error);
    await db
      .from("service_finder_jobs")
      .update({
        status: "failed",
        finished_at: new Date().toISOString(),
        locked_by: null,
        last_error_code: code,
        last_error_message: message.slice(0, 1000)
      })
      .eq("id", jobId);
    await appendEvent(runtime, "job_failed", message, { level: "error" });
    return { status: "failed", candidates: 0, errorMessage: message };
  }
}
