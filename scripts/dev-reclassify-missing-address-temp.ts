// Geçici migrasyon — adres eksik 156 adayı, hâlâ DB'de duran extracted_text ile
// yeni prompt formatı (adres parçalama + self_description) kullanarak yeniden
// classify eder ve service_finder_candidates satırını günceller. Tavily extract
// tekrar yapılmaz (extracted_text zaten var) — yalnızca Gemini classify maliyeti.
// Kullanım: npx tsx scripts/dev-reclassify-missing-address-temp.ts
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

import { CLASSIFIER_SYSTEM_PROMPT, buildClassifierUserPrompt } from "../lib/finder/prompts";
import { createGeminiClassifier } from "../lib/finder/providers/gemini";
import { parseCandidateResult } from "../lib/finder/validate";
import { makeDuplicateKey } from "../lib/finder/dedupe";
import { ProviderRateLimitError } from "../lib/finder/errors";
import type { FinderJobRow, FinderJobSourceRow } from "../lib/finder/types";

function envValue(raw: string, name: string): string {
  const match = raw.match(new RegExp(`^${name}=(.+)$`, "m"));
  return match ? match[1].trim() : "";
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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

function deriveAddressLine(street: string | null, houseNumber: string | null): string | null {
  const parts = [street, houseNumber].filter((p): p is string => Boolean(p?.trim()));
  return parts.length > 0 ? parts.join(" ") : null;
}

async function main() {
  const raw = readFileSync(".env.local", "utf8");
  for (const name of ["GEMINI_API_KEY", "GEMINI_API_KEY_2"]) {
    const value = envValue(raw, name);
    if (value) process.env[name] = value;
  }
  const geminiKey = process.env.GEMINI_API_KEY;
  const geminiKey2 = process.env.GEMINI_API_KEY_2;
  if (!geminiKey) throw new Error("GEMINI_API_KEY .env.local içinde bulunamadı");

  const supabase = createClient(
    envValue(raw, "NEXT_PUBLIC_SUPABASE_URL"),
    envValue(raw, "SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { persistSession: false, autoRefreshToken: false } }
  );

  const { data: candidates, error } = await supabase
    .from("service_finder_candidates")
    .select("id, job_id, city, primary_source_id, source_urls, canonical_name")
    .is("address_line", null);
  if (error) throw new Error(`Aday sorgu hatası: ${error.message}`);
  const limitArg = process.argv.find((a) => a.startsWith("--limit="));
  const limit = limitArg ? Number(limitArg.split("=")[1]) : undefined;
  const rows = limit ? (candidates ?? []).slice(0, limit) : candidates ?? [];
  console.log(`İşlenecek aday sayısı: ${rows.length}`);

  let classifier = createGeminiClassifier(geminiKey);
  let usingSecondaryKey = false;
  const jobCache = new Map<string, FinderJobRow>();

  let updated = 0;
  let skippedNoMatch = 0;
  let failed = 0;

  for (let i = 0; i < rows.length; i++) {
    const cand = rows[i];
    console.log(`[${i + 1}/${rows.length}] ${cand.canonical_name} (${cand.city})`);

    if (!cand.primary_source_id) {
      console.log("  -> primary_source_id yok, atlanıyor");
      failed++;
      continue;
    }

    const { data: source, error: srcErr } = await supabase
      .from("service_finder_job_sources")
      .select("*")
      .eq("id", cand.primary_source_id)
      .maybeSingle();
    if (srcErr || !source || !source.extracted_text) {
      console.log("  -> kaynak metni yok, atlanıyor");
      failed++;
      continue;
    }

    let job = jobCache.get(cand.job_id);
    if (!job) {
      const { data: jobRow, error: jobErr } = await supabase
        .from("service_finder_jobs")
        .select("*")
        .eq("id", cand.job_id)
        .maybeSingle();
      if (jobErr || !jobRow) {
        console.log("  -> job bulunamadı, atlanıyor");
        failed++;
        continue;
      }
      job = jobRow as FinderJobRow;
      jobCache.set(cand.job_id, job);
    }

    if (i > 0) await sleep(6_000); // Gemini rate limit

    let parsed: unknown;
    try {
      try {
        const response = await classifier.classify({
          systemPrompt: CLASSIFIER_SYSTEM_PROMPT,
          userPrompt: buildClassifierUserPrompt(job, source as FinderJobSourceRow),
          model: "gemini-2.5-flash"
        });
        parsed = response.parsed;
      } catch (err: unknown) {
        // Birincil anahtar kota/rate-limit hatası verirse ikinci anahtara kalıcı geç.
        if (err instanceof ProviderRateLimitError && !usingSecondaryKey && geminiKey2) {
          usingSecondaryKey = true;
          classifier = createGeminiClassifier(geminiKey2);
          console.log("  -> birincil Gemini anahtarı rate limit, GEMINI_API_KEY_2'ye geçiliyor");
          const response = await classifier.classify({
            systemPrompt: CLASSIFIER_SYSTEM_PROMPT,
            userPrompt: buildClassifierUserPrompt(job, source as FinderJobSourceRow),
            model: "gemini-2.5-flash"
          });
          parsed = response.parsed;
        } else {
          throw err;
        }
      }

      const validation = parseCandidateResult(parsed);
      if (!validation.result) {
        console.log(`  -> doğrulama başarısız: ${validation.errorMessage}`);
        failed++;
        continue;
      }
      const result = validation.result;

      if (!result.is_match || !result.canonical_name) {
        console.log("  -> artık eşleşme değil, atlanıyor (silinmedi)");
        skippedNoMatch++;
        continue;
      }

      const normalizedCity = normalizeCityName(result.city ?? job.city);
      const addressLine = deriveAddressLine(result.street, result.house_number);

      const { error: updateErr } = await supabase
        .from("service_finder_candidates")
        .update({
          city: normalizedCity,
          street: result.street,
          house_number: result.house_number,
          postal_code: result.postal_code,
          address_line: addressLine,
          self_description: result.profession_label,
          services_raw: result.services.map((label) => ({
            label,
            source_url: source.source_url
          })),
          self_statements: result.self_statements.map((s) => ({
            quote: s.quote,
            source_url: s.source_url ?? source.source_url
          })),
          duplicate_key: makeDuplicateKey({ ...result, city: normalizedCity }),
          confidence_score: result.confidence_score,
          scraped_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq("id", cand.id);

      if (updateErr) {
        console.log(`  -> güncelleme hatası: ${updateErr.message}`);
        failed++;
        continue;
      }

      console.log(`  -> güncellendi: ${addressLine ?? "(adres yok)"} / ${normalizedCity}`);
      updated++;
    } catch (err: unknown) {
      console.log(`  -> hata: ${err instanceof Error ? err.message : String(err)}`);
      failed++;
    }
  }

  console.log(`\n=== Özet ===`);
  console.log(`Güncellendi: ${updated}`);
  console.log(`Artık eşleşme değil (dokunulmadı): ${skippedNoMatch}`);
  console.log(`Başarısız/atlanan: ${failed}`);
}

main();
