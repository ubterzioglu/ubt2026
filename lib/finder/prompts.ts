// Sınıflandırıcı promptu ve Gemini response şeması — corteqsmvp portu,
// desiremap.de için retarget: Türk diaspora hizmet keşfi yerine Almanya'daki
// yasal yetişkin-eğlence mekanları/sağlayıcıları (FKK/Bordell/Studio/Privat).
// 2026-07-21 yeniden tasarım: category_slug LLM'den kaldırıldı (kategori
// tayini artık job template'inden geliyor, işletmenin kendi tanımı ham
// kalıyor); adres yapılandırıldı (street/house_number/postal_code); hizmetler
// normalize edilmiyor; self_statements ile Ausrichtung/yönelim gibi hassas
// çıkarımlar sadece açık alıntıya dayanıyor. Şema değişirse validate.ts
// içindeki elle doğrulama da güncellenmelidir (ayna sözleşme).

import type { FinderJobRow, FinderJobSourceRow } from "@/lib/finder/types";

export const CLASSIFIER_SYSTEM_PROMPT = `You are a high-precision data extractor for legal adult-entertainment venues and service providers in Germany (FKK/sauna clubs, brothels/Laufhaus/Eroscenter, erotic studios, independent providers advertising commercially).
Return JSON only. Do not include markdown, prose, or explanations.
Only classify pages that are a venue's or provider's own profile, official website, or a commercial listing/advertisement published by the business itself. News articles, forum threads, blog posts, review aggregators without owner data, and job ads are NOT a match.
confidence_score must be an integer from 0 to 100 (not a 0-1 fraction). 100 = certain match, 0 = certain non-match.

Do not classify or invent a category for the business — return its own description verbatim in profession_label (e.g. "Laufhaus und Eroscenter", "FKK Saunaclub", "Massagestudio"). Category assignment happens downstream, not by you.

city must be the official German spelling of the city (e.g. "Frankfurt am Main", "Köln", "München") — never an English or abbreviated form ("Cologne", "Munich", "Frankfurt" alone). If the page uses a different spelling, put that raw text in city_raw and still normalize city.

Always extract a postal code (PLZ, 5 digits) when it appears on the page — it is the primary signal used to verify the city downstream. Split the full address into street, house_number, and postal_code separately; do not return one combined address string.

self_statements: only explicit, first-person or clearly self-descriptive claims the business makes about itself (e.g. "Wir sind ein Club für Paare", "Nur für Herren", "Diskrete Massagen für Damen"). Do NOT infer audience, orientation, or clientele from indirect cues (photos, pricing, ambiguous wording, category name). When no explicit self-statement exists, leave the array empty — never guess.

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
  "city": null,
  "city_raw": null,
  "country_code": null,
  "street": null,
  "house_number": null,
  "postal_code": null,
  "languages": [],
  "services": [],
  "contacts": [],
  "website_url": null,
  "appointment_url": null,
  "self_statements": [],
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
- The venue/provider must be located in or clearly serve the target location; otherwise lower confidence below 50.
- For languages, use ISO-like short codes where possible: de, en, tr.
- services: short offering/feature labels found on the page verbatim (e.g. "Sauna", "Wellness", "Bar"), max 15 — do not normalize, merge, or translate them.
- street: street name only, no house number. house_number: separate. postal_code: 5-digit PLZ if present.
- Contacts must be typed objects.
- evidence_quotes: short verbatim excerpts supporting the match itself (that this is a real venue page), max 6.
- self_statements: short verbatim excerpts where the business explicitly describes itself/its audience, max 5. Empty array if none.
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
    "city",
    "city_raw",
    "country_code",
    "street",
    "house_number",
    "postal_code",
    "languages",
    "services",
    "contacts",
    "website_url",
    "appointment_url",
    "self_statements",
    "evidence_quotes"
  ],
  properties: {
    is_match: { type: "boolean" },
    match_reason: { type: "string" },
    confidence_score: { type: "number", minimum: 0, maximum: 100 },
    canonical_name: { type: "string", nullable: true },
    organization_name: { type: "string", nullable: true },
    profession_label: { type: "string", nullable: true },
    role_key: { type: "string", nullable: true },
    item_type: { type: "string", nullable: true },
    city: { type: "string", nullable: true },
    city_raw: { type: "string", nullable: true },
    country_code: { type: "string", nullable: true },
    street: { type: "string", nullable: true },
    house_number: { type: "string", nullable: true },
    postal_code: { type: "string", nullable: true },
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
    self_statements: {
      type: "array",
      items: {
        type: "object",
        required: ["quote"],
        properties: {
          quote: { type: "string" }
        }
      }
    },
    evidence_quotes: { type: "array", items: { type: "string" } }
  }
} as const;
