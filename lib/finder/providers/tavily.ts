// Tavily Search + Extract sağlayıcısı — corteqsmvp portu.

import {
  estimateTavilyExtractCost,
  estimateTavilySearchCost
} from "@/lib/finder/costs";
import { extractDomain } from "@/lib/finder/dedupe";
import {
  AuthOrConfigError,
  ProviderRateLimitError,
  ProviderTemporaryError
} from "@/lib/finder/errors";
import type {
  ExtractOutput,
  ExtractProvider,
  SearchInput,
  SearchOutput,
  SearchProvider
} from "@/lib/finder/providers/types";

const TAVILY_BASE_URL = "https://api.tavily.com";
const REQUEST_TIMEOUT_MS = 30_000;
const MAX_CONCURRENT_REQUESTS_PER_KEY = 2;
const MAX_RATE_LIMIT_RETRIES = 3;
const DEFAULT_RETRY_AFTER_SECONDS = 60;
const activeRequests = new Map<string, number>();
const requestWaiters = new Map<string, Array<() => void>>();

interface TavilySearchResponse {
  results?: Array<{ url: string; title?: string; content?: string }>;
  request_id?: string;
}

interface TavilyExtractResponse {
  results?: Array<{ url: string; raw_content?: string; title?: string }>;
  failed_results?: Array<{ url: string; error?: string }>;
}

async function acquireRequestSlot(apiKey: string): Promise<void> {
  const active = activeRequests.get(apiKey) ?? 0;
  if (active < MAX_CONCURRENT_REQUESTS_PER_KEY) {
    activeRequests.set(apiKey, active + 1);
    return;
  }
  await new Promise<void>((resolve) => {
    const waiters = requestWaiters.get(apiKey) ?? [];
    waiters.push(resolve);
    requestWaiters.set(apiKey, waiters);
  });
  activeRequests.set(apiKey, (activeRequests.get(apiKey) ?? 0) + 1);
}

function releaseRequestSlot(apiKey: string): void {
  activeRequests.set(apiKey, Math.max(0, (activeRequests.get(apiKey) ?? 1) - 1));
  const waiters = requestWaiters.get(apiKey);
  const next = waiters?.shift();
  if (waiters?.length === 0) requestWaiters.delete(apiKey);
  next?.();
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function tavilyPost<T>(
  apiKey: string,
  path: string,
  body: Record<string, unknown>
): Promise<T> {
  for (let attempt = 0; ; attempt += 1) {
    await acquireRequestSlot(apiKey);
    let response: Response;
    try {
      response = await fetch(`${TAVILY_BASE_URL}${path}`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
      });
    } catch (error: unknown) {
      throw new ProviderTemporaryError(
        "tavily",
        error instanceof Error ? error.message : "network error"
      );
    } finally {
      releaseRequestSlot(apiKey);
    }

    if (response.status === 401 || response.status === 403) {
      throw new AuthOrConfigError("Tavily API anahtarı geçersiz veya yetkisiz");
    }
    if (response.status === 432) {
      throw new ProviderRateLimitError("tavily");
    }
    if (response.status === 429) {
      if (attempt >= MAX_RATE_LIMIT_RETRIES) {
        throw new ProviderRateLimitError("tavily");
      }
      const retryAfterSeconds = Number(
        response.headers.get("retry-after") ?? DEFAULT_RETRY_AFTER_SECONDS
      );
      const safeRetryAfterSeconds = Number.isFinite(retryAfterSeconds)
        ? Math.max(1, Math.min(60, retryAfterSeconds))
        : DEFAULT_RETRY_AFTER_SECONDS;
      await sleep(safeRetryAfterSeconds * 1_000);
      continue;
    }
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new ProviderTemporaryError(
        "tavily",
        `HTTP ${response.status}: ${detail.slice(0, 300)}`
      );
    }
    return (await response.json()) as T;
  }
}

export function createTavilySearchProvider(apiKey: string): SearchProvider {
  return {
    key: "tavily",
    async search(input: SearchInput): Promise<SearchOutput> {
      const depth = input.searchDepth ?? "basic";
      const payload = await tavilyPost<TavilySearchResponse>(apiKey, "/search", {
        query: input.query,
        search_depth: depth,
        max_results: input.maxResults,
        ...input.options
      });
      const usage = estimateTavilySearchCost(depth);
      return {
        requestId: payload.request_id,
        results: (payload.results ?? []).map((result) => ({
          url: result.url,
          title: result.title,
          snippet: result.content,
          domain: extractDomain(result.url)
        })),
        usage: {
          units: usage.units,
          estimatedCostUsd: usage.amountUsd,
          billingUnit: "tavily_credit"
        }
      };
    }
  };
}

export function createTavilyExtractProvider(apiKey: string): ExtractProvider {
  return {
    key: "tavily",
    async extract(input): Promise<ExtractOutput> {
      const payload = await tavilyPost<TavilyExtractResponse>(apiKey, "/extract", {
        urls: input.urls,
        extract_depth: input.depth,
        ...input.options
      });
      const docs = (payload.results ?? []).map((result) => ({
        url: result.url,
        title: result.title,
        text: result.raw_content
      }));
      const usage = estimateTavilyExtractCost(docs.length, input.depth);
      return {
        docs,
        failedUrls: (payload.failed_results ?? []).map((failed) => failed.url),
        usage: {
          units: usage.units,
          estimatedCostUsd: usage.amountUsd,
          billingUnit: "tavily_credit"
        }
      };
    }
  };
}
