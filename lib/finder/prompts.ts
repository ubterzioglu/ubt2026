// Sınıflandırıcı promptu ve Gemini response şeması — corteqsmvp portu,
// desiremap.de için retarget: Türk diaspora hizmet keşfi yerine Almanya'daki
// yasal yetişkin-eğlence mekanları/sağlayıcıları (FKK/Bordell/Studio/Privat).
// Şema değişirse validate.ts içindeki elle doğrulama da güncellenmelidir
// (ayna sözleşme).

import type { FinderJobRow, FinderJobSourceRow } from "@/lib/finder/types";

export const CLASSIFIER_SYSTEM_PROMPT = `You are a high-precision directory normalizer for legal adult-entertainment venues and service providers in Germany (FKK/sauna clubs, brothels/Laufhaus/Eroscenter, erotic studios, independent providers advertising commercially).
Return JSON only. Do not include markdown, prose, or explanations.
Only classify pages that are a venue's or provider's own profile, official website, or a commercial listing/advertisement published by the business itself. News articles, forum threads, blog posts, review aggregators without owner data, and job ads are NOT a match.
If the page is not a real venue/provider profile or listing, return:
{
  "is_match": false,
  "match_reason": "...",
  "confidence_score": 0,
  "canonical_name": null,
  "organization_name": null,
  "profession_label": null,
  "role_key": null,
  "item_type": null,
  "category_slug": null,
  "city": null,
  "country_code": null,
  "address_line": null,
  "languages": [],
  "services": [],
  "contacts": [],
  "website_url": null,
  "appointment_url": null,
  "evidence_quotes": []
}`;

const MAX_EXTRACTED_CHARS = 16_000;

export function buildClassifierUserPrompt(
  job: FinderJobRow,
  source: FinderJobSourceRow
): string {
  const extracted = (source.extracted_text ?? "").slice(0, MAX_EXTRACTED_CHARS);
  return `Job context:
- role_key: ${job.role_key}
- item_type: ${job.item_type}
- category_slug: ${job.category_slug ?? ""}
- target location: ${job.location_label}
- include terms: ${JSON.stringify(job.must_include_terms)}
- exclude terms: ${JSON.stringify(job.must_exclude_terms)}

Page metadata:
- url: ${source.source_url}
- title: ${source.source_title ?? ""}
- snippet: ${source.source_snippet ?? ""}

Extracted content:
${extracted}

Rules:
- Prefer explicit evidence over inference.
- Do not invent phone, email, address, opening hours, or prices.
- category_slug must be one of: fkk, bordell, studio, privat (or null if unclear).
- The venue/provider must be located in or clearly serve the target location; otherwise lower confidence below 50.
- For languages, use ISO-like short codes where possible: de, en, tr.
- services: short offering/feature labels found on the page (e.g. "Sauna", "Wellness", "Bar"), max 10.
- address_line: street address as printed on the page, or null.
- Contacts must be typed objects.
- Evidence quotes must be short verbatim excerpts from the page.
- If multiple venues/providers appear on one page (directory index), return the best matching single candidate only, or is_match false when it is a pure listing index.`;
}

/** Gemini structured output şeması (responseMimeType: application/json ile). */
export const CLASSIFIER_RESPONSE_SCHEMA = {
  type: "object",
  required: [
    "is_match",
    "match_reason",
    "confidence_score",
    "canonical_name",
    "organization_name",
    "profession_label",
    "role_key",
    "item_type",
    "category_slug",
    "city",
    "country_code",
    "address_line",
    "languages",
    "services",
    "contacts",
    "website_url",
    "appointment_url",
    "evidence_quotes"
  ],
  properties: {
    is_match: { type: "boolean" },
    match_reason: { type: "string" },
    confidence_score: { type: "number" },
    canonical_name: { type: "string", nullable: true },
    organization_name: { type: "string", nullable: true },
    profession_label: { type: "string", nullable: true },
    role_key: { type: "string", nullable: true },
    item_type: { type: "string", nullable: true },
    category_slug: { type: "string", nullable: true },
    city: { type: "string", nullable: true },
    country_code: { type: "string", nullable: true },
    address_line: { type: "string", nullable: true },
    languages: { type: "array", items: { type: "string" } },
    services: { type: "array", items: { type: "string" } },
    contacts: {
      type: "array",
      items: {
        type: "object",
        required: ["type", "value"],
        properties: {
          type: {
            type: "string",
            enum: ["phone", "email", "website", "appointment_url"]
          },
          value: { type: "string" },
          label: { type: "string", nullable: true },
          is_primary: { type: "boolean", nullable: true }
        }
      }
    },
    website_url: { type: "string", nullable: true },
    appointment_url: { type: "string", nullable: true },
    evidence_quotes: { type: "array", items: { type: "string" } }
  }
} as const;
