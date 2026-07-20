// Geçici toplu koşu — en kalabalık 10 Almanya şehri x 4 kategori şablonu için
// service-finder işlerini sırayla oluşturur ve çalıştırır. Kullanım sonrası silinir.
// Kullanım: npx tsx scripts/dev-finder-bulk-run.ts

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

import { executeFinderJob } from "../lib/finder/run-job";

function envValue(raw: string, name: string): string {
  const match = raw.match(new RegExp(`^${name}=(.+)$`, "m"));
  return match ? match[1].trim() : "";
}

const CITIES = [
  "Berlin",
  "Hamburg",
  "München",
  "Köln",
  "Frankfurt",
  "Stuttgart",
  "Düsseldorf",
  "Leipzig",
  "Dortmund",
  "Essen"
];

const TEMPLATE_KEYS = ["venue-fkk-club", "venue-bordell", "venue-studio", "provider-privat"];

async function main() {
  const raw = readFileSync(".env.local", "utf8");
  for (const name of ["TAVILY_API_KEY", "SERPAPI_API_KEY", "GEMINI_API_KEY"]) {
    const value = envValue(raw, name);
    if (value) process.env[name] = value;
  }

  const supabase = createClient(
    envValue(raw, "NEXT_PUBLIC_SUPABASE_URL"),
    envValue(raw, "SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { persistSession: false, autoRefreshToken: false } }
  );

  const { data: templates, error: templateError } = await supabase
    .from("service_finder_profession_templates")
    .select("id, template_key, label, role_key, item_type, category_slug")
    .in("template_key", TEMPLATE_KEYS);
  if (templateError) throw templateError;

  const templateByKey = new Map((templates ?? []).map((t) => [t.template_key, t]));

  const results: Array<{
    city: string;
    template_key: string;
    status: string;
    candidates: number;
    cost: number;
    error?: string;
  }> = [];

  for (const city of CITIES) {
    for (const templateKey of TEMPLATE_KEYS) {
      const template = templateByKey.get(templateKey);
      if (!template) {
        console.error(`Şablon bulunamadı: ${templateKey}`);
        continue;
      }

      const { data: job, error: jobError } = await supabase
        .from("service_finder_jobs")
        .insert({
          title: `${template.label} — ${city}`,
          template_id: template.id,
          role_key: template.role_key,
          item_type: template.item_type,
          category_slug: template.category_slug,
          location_label: city,
          city,
          country_code: "DE",
          language_code: "de"
        })
        .select("id")
        .single();
      if (jobError) {
        console.error(`İş oluşturulamadı (${city}/${templateKey}): ${jobError.message}`);
        continue;
      }

      process.stdout.write(`[${city} / ${template.label}] çalışıyor... `);
      const summary = await executeFinderJob(supabase, job.id as string);

      const { data: jobRow } = await supabase
        .from("service_finder_jobs")
        .select("cost_total_usd")
        .eq("id", job.id)
        .single();

      console.log(
        `${summary.status} — ${summary.candidates} aday — $${jobRow?.cost_total_usd ?? "?"}`
      );

      results.push({
        city,
        template_key: templateKey,
        status: summary.status,
        candidates: summary.candidates,
        cost: Number(jobRow?.cost_total_usd ?? 0),
        error: summary.errorMessage
      });
    }
  }

  console.log("\n=== ÖZET ===");
  let totalCost = 0;
  let totalCandidates = 0;
  for (const r of results) {
    totalCost += r.cost;
    totalCandidates += r.candidates;
    console.log(
      `${r.status.padEnd(14)} ${r.candidates.toString().padStart(3)} aday  $${r.cost.toFixed(4).padStart(8)}  ${r.city} / ${r.template_key}${r.error ? "  ! " + r.error : ""}`
    );
  }
  console.log(`\nToplam: ${totalCandidates} aday, $${totalCost.toFixed(4)} (${results.length} iş)`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
