// Sınıflandırıcı çıktısının elle doğrulanması — corteqsmvp'de Zod ile yapılan
// ikinci doğrulamanın bağımlılıksız karşılığı (projede zod yok). Gemini
// schema-mode kullanılsa bile sonuç persist edilmeden önce burada doğrulanır.
// prompts.ts içindeki CLASSIFIER_RESPONSE_SCHEMA ile ayna sözleşme.

import type { CandidateResult, FinderContact } from "@/lib/finder/types";

const CONTACT_TYPES: readonly FinderContact["type"][] = [
  "phone",
  "email",
  "website",
  "appointment_url"
];

function asNullableString(value: unknown): string | null {
  if (typeof value === "string" && value.trim().length > 0) return value.trim();
  return null;
}

function asStringArray(value: unknown, maxItems: number): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((entry): entry is string => typeof entry === "string" && entry.trim().length > 0)
    .slice(0, maxItems);
}

function parseContacts(value: unknown): FinderContact[] | null {
  if (!Array.isArray(value)) return [];
  const contacts: FinderContact[] = [];
  for (const entry of value) {
    if (typeof entry !== "object" || entry === null) return null;
    const record = entry as Record<string, unknown>;
    const type = record.type;
    const contactValue = record.value;
    if (
      typeof type !== "string" ||
      !(CONTACT_TYPES as readonly string[]).includes(type) ||
      typeof contactValue !== "string" ||
      contactValue.trim().length === 0
    ) {
      return null;
    }
    contacts.push({
      type: type as FinderContact["type"],
      value: contactValue.trim(),
      label: asNullableString(record.label),
      is_primary: typeof record.is_primary === "boolean" ? record.is_primary : null
    });
  }
  return contacts;
}

export interface ValidationOutcome {
  result: CandidateResult | null;
  errorMessage?: string;
}

/** Ham JSON'u CandidateResult'a doğrular; bozuksa null + kısa hata döner. */
export function parseCandidateResult(raw: unknown): ValidationOutcome {
  if (typeof raw !== "object" || raw === null) {
    return { result: null, errorMessage: "Yanıt bir JSON nesnesi değil" };
  }
  const record = raw as Record<string, unknown>;

  if (typeof record.is_match !== "boolean") {
    return { result: null, errorMessage: "is_match boolean değil" };
  }
  if (typeof record.match_reason !== "string") {
    return { result: null, errorMessage: "match_reason string değil" };
  }
  const confidence = Number(record.confidence_score);
  if (!Number.isFinite(confidence) || confidence < 0 || confidence > 100) {
    return { result: null, errorMessage: "confidence_score 0-100 aralığında değil" };
  }
  const contacts = parseContacts(record.contacts);
  if (contacts === null) {
    return { result: null, errorMessage: "contacts geçersiz yapıda" };
  }

  return {
    result: {
      is_match: record.is_match,
      match_reason: record.match_reason,
      confidence_score: confidence,
      canonical_name: asNullableString(record.canonical_name),
      organization_name: asNullableString(record.organization_name),
      profession_label: asNullableString(record.profession_label),
      role_key: asNullableString(record.role_key),
      item_type: asNullableString(record.item_type),
      category_slug: asNullableString(record.category_slug),
      city: asNullableString(record.city),
      country_code: asNullableString(record.country_code),
      address_line: asNullableString(record.address_line),
      languages: asStringArray(record.languages, 10),
      services: asStringArray(record.services, 10),
      contacts,
      website_url: asNullableString(record.website_url),
      appointment_url: asNullableString(record.appointment_url),
      evidence_quotes: asStringArray(record.evidence_quotes, 6)
    }
  };
}
