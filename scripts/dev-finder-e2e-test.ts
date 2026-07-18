// Tek seferlik e2e doğrulama: TAVILY_API_KEY eklendikten sonra service-finder
// hattının (arama → robots+extract → Gemini classify) gerçek koşusu.
// Kullanım: npx tsx scripts/dev-finder-e2e-test.ts — doğrulama sonrası silinir.

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

import { executeFinderJob } from "../lib/finder/run-job";

function envValue(raw: string, name: string): string {
  const match = raw.match(new RegExp(`^${name}=(.+)$`, "m"));
  return match ? match[1].trim() : "";
}

async function main() {
  const raw = readFileSync(".env.local", "utf8");
  // Motorun resolveSecret'i process.env okur — anahtarları oraya taşı.
  for (const name of ["TAVILY_API_KEY", "SERPAPI_API_KEY", "GEMINI_API_KEY"]) {
    const value = envValue(raw, name);
    if (value) process.env[name] = value;
  }

  const supabase = createClient(
    envValue(raw, "NEXT_PUBLIC_SUPABASE_URL"),
    envValue(raw, "SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { persistSession: false, autoRefreshToken: false } }
  );

  const { data: template, error: templateError } = await supabase
    .from("service_finder_profession_templates")
    .select("id, label, role_key, item_type, category_slug")
    .eq("template_key", "venue-fkk-club")
    .single();
  if (templateError) throw templateError;

  const { data: job, error: jobError } = await supabase
    .from("service_finder_jobs")
    .insert({
      title: "E2E test — FKK Köln (sıkı bütçe)",
      template_id: template.id,
      role_key: template.role_key,
      item_type: template.item_type,
      category_slug: template.category_slug,
      location_label: "Köln",
      city: "Köln",
      country_code: "DE",
      language_code: "de",
      max_queries: 3,
      max_source_urls: 10,
      max_extract_urls: 6,
      max_candidates: 10,
      soft_cap_usd: 0.25,
      hard_cap_usd: 0.5
    })
    .select("id")
    .single();
  if (jobError) throw jobError;
  console.log(`İş oluşturuldu: ${job.id}`);

  const summary = await executeFinderJob(supabase, job.id as string);
  console.log("Özet:", JSON.stringify(summary));

  const { data: jobRow } = await supabase
    .from("service_finder_jobs")
    .select("status, cost_total_usd, last_error_message")
    .eq("id", job.id)
    .single();
  console.log("İş durumu:", JSON.stringify(jobRow));

  const { data: candidates } = await supabase
    .from("service_finder_candidates")
    .select("canonical_name, city, category_slug, confidence_score, website_url")
    .eq("job_id", job.id)
    .order("confidence_score", { ascending: false });
  console.log(`--- adaylar (${(candidates ?? []).length}) ---`);
  for (const row of candidates ?? []) {
    console.log(
      `${String(row.confidence_score).padStart(5)}  [${row.category_slug}] ${row.canonical_name} (${row.city}) ${row.website_url ?? ""}`
    );
  }

  const { data: events } = await supabase
    .from("service_finder_job_events")
    .select("event_type, event_level, message")
    .eq("job_id", job.id)
    .order("created_at", { ascending: true });
  console.log("--- olaylar ---");
  for (const row of events ?? []) {
    console.log(`[${row.event_level}] ${row.event_type}: ${row.message}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
