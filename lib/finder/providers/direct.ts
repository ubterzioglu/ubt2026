import type { ExtractOutput, ExtractProvider } from "@/lib/finder/providers/types";

const REQUEST_TIMEOUT_MS = 15_000;
const MAX_RESPONSE_CHARS = 250_000;
const USER_AGENT = "UBT-ServiceFinder/1.0 (+https://ubterzioglu.de)";

const namedEntities: Record<string, string> = {
  amp: "&",
  apos: "'",
  gt: ">",
  lt: "<",
  nbsp: " ",
  quot: "\""
};

export function htmlToText(value: string): string {
  return value
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(script|style|noscript|svg)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/(p|div|li|h[1-6]|section|article|tr)>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (entity, code: string) => {
      if (code.startsWith("#x")) {
        return String.fromCodePoint(Number.parseInt(code.slice(2), 16));
      }
      if (code.startsWith("#")) {
        return String.fromCodePoint(Number.parseInt(code.slice(1), 10));
      }
      return namedEntities[code.toLowerCase()] ?? entity;
    })
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchDocument(url: string): Promise<{ url: string; text?: string }> {
  const response = await fetch(url, {
    headers: {
      accept: "text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.1",
      "user-agent": USER_AGENT
    },
    redirect: "follow",
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
  });
  if (!response.ok) return { url };

  const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
  if (
    !contentType.includes("text/html") &&
    !contentType.includes("application/xhtml+xml") &&
    !contentType.includes("text/plain")
  ) {
    return { url };
  }

  const raw = (await response.text()).slice(0, MAX_RESPONSE_CHARS);
  const text = contentType.includes("text/plain") ? htmlToText(raw) : htmlToText(raw);
  return text ? { url, text } : { url };
}

export function createDirectExtractProvider(): ExtractProvider {
  return {
    key: "direct",
    async extract(input): Promise<ExtractOutput> {
      const settled = await Promise.allSettled(input.urls.map((url) => fetchDocument(url)));
      const docs: ExtractOutput["docs"] = [];
      const failedUrls: string[] = [];

      settled.forEach((result, index) => {
        const url = input.urls[index];
        if (!url) return;
        if (result.status === "fulfilled" && result.value.text) {
          docs.push(result.value);
        } else {
          failedUrls.push(url);
        }
      });

      return {
        docs,
        failedUrls,
        usage: {
          units: 0,
          estimatedCostUsd: 0,
          billingUnit: "direct_fetch"
        }
      };
    }
  };
}
