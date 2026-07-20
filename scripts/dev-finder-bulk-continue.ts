// Geçici devam script'i — kesintiye uğrayan toplu koşuyu kalan şehir/kategori
// kombinasyonları için tamamlar. Kullanım sonrası silinir.
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

import { executeFinderJob } from "../lib/finder/run-job";

function envValue(raw: string, name: string): string {
  const match = raw.match(new RegExp(`^${name}=(.+)$`, "m"));
  return match ? match[1].trim() : "";
}

const REMAINING: Array<{ city: string; templateKey: string }> = [
  { city: "Hamburg", templateKey: "provider-privat" },
  { city: "München", templateKey: "venue-fkk-club" },
  { city: "München", templateKey: "venue-bordell" },
  { city: "München", templateKey: "venue-studio" },
  { city: "München", templateKey: "provider-privat" },
  { city: "Köln", templateKey: "venue-fkk-club" },
  { city: "Köln", templateKey: "venue-bordell" },
  { city: "Köln", templateKey: "venue-studio" },
  { city: "Köln", templateKey: "provider-privat" },
  { city: "Frankfurt", templateKey: "venue-fkk-club" },
  { city: "Frankfurt", templateKey: "venue-bordell" },
  { city: "Frankfurt", templateKey: "venue-studio" },
  { city: "Frankfurt", templateKey: "provider-privat" },
  { city: "Stuttgart", templateKey: "venue-fkk-club" },
  { city: "Stuttgart", templateKey: "venue-bordell" },
  { city: "Stuttgart", templateKey: "venue-studio" },
  { city: "Stuttgart", templateKey: "provider-privat" },
  { city: "Düsseldorf", templateKey: "venue-fkk-club" },
  { city: "Düsseldorf", templateKey: "venue-bordell" },
  { city: "Düsseldorf", templateKey: "venue-studio" },
  { city: "Düsseldorf", templateKey: "provider-privat" },
  { city: "Leipzig", templateKey: "venue-fkk-club" },
  { city: "Leipzig", templateKey: "venue-bordell" },
  { city: "Leipzig", templateKey: "venue-studio" },
  { city: "Leipzig", templateKey: "provider-privat" },
  { city: "Dortmund", templateKey: "venue-fkk-club" },
  { city: "Dortmund", templateKey: "venue-bordell" },
  { city: "Dortmund", templateKey: "venue-studio" },
  { city: "Dortmund", templateKey: "provider-privat" },
  { city: "Essen", templateKey: "venue-fkk-club" },
  { city: "Essen", templateKey: "venue-bordell" },
  { city: "Essen", templateKey: "venue-studio" },
  { city: "Essen", templateKey: "provider-privat" }
];

async function withRetry<T>(fn: () => Promise<T>, label: string, attempts = 3): Promise<T> {
  for (let i = 0; ; i++) {
    try {
      return await fn();
    } catch (error: unknown) {
      if (i >= attempts - 1) throw error;
      console.error(`  ! ${label} başarısız (deneme ${i + 1}), tekrar deneniyor: ${(error as Error).message}`);
      await new Promise((r) => setTimeout(r, 5000 * (i + 1)));
    }
  }
}

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
    .in("template_key", ["venue-fkk-club", "venue-bordell", "venue-studio", "provider-privat"]);
  if (templateError) throw templateError;
  const templateByKey = new Map((templates ?? []).map((t) => [t.template_key, t]));

  // Zaten queued'a alınmış takılı iş (Hamburg/Erotik Studio) varsa onu da işlem sırasına ekle.
  const { data: stuckJob } = await supabase
    .from("service_finder_jobs")
    .select("id, title")
    .eq("title", "Erotik Studio — Hamburg")
    .eq("status", "queued")
    .maybeSingle();

  const results: Array<{ label: string; status: string; candidates: number; cost: number }> = [];

  if (stuckJob) {
    process.stdout.write(`[${stuckJob.title}] devam ediyor... `);
    const summary = await withRetry(
      () => executeFinderJob(supabase, stuckJob.id as string),
      stuckJob.title
    );
    const { data: jobRow } = await supabase
      .from("service_finder_jobs")
      .select("cost_total_usd")
      .eq("id", stuckJob.id)
      .single();
    console.log(`${summary.status} — ${summary.candidates} aday — $${jobRow?.cost_total_usd ?? "?"}`);
    results.push({
      label: stuckJob.title,
      status: summary.status,
      candidates: summary.candidates,
      cost: Number(jobRow?.cost_total_usd ?? 0)
    });
  }

  for (const { city, templateKey } of REMAINING) {
    const template = templateByKey.get(templateKey);
    if (!template) {
      console.error(`Şablon bulunamadı: ${templateKey}`);
      continue;
    }

    const label = `${template.label} — ${city}`;
    const job = await withRetry(async () => {
      const { data, error } = await supabase
        .from("service_finder_jobs")
        .insert({
          title: label,
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
      if (error) throw error;
      return data;
    }, `insert ${label}`);

    process.stdout.write(`[${label}] çalışıyor... `);
    const summary = await withRetry(
      () => executeFinderJob(supabase, job.id as string),
      label
    );

    const { data: jobRow } = await supabase
      .from("service_finder_jobs")
      .select("cost_total_usd")
      .eq("id", job.id)
      .single();

    console.log(`${summary.status} — ${summary.candidates} aday — $${jobRow?.cost_total_usd ?? "?"}`);

    results.push({
      label,
      status: summary.status,
      candidates: summary.candidates,
      cost: Number(jobRow?.cost_total_usd ?? 0)
    });
  }

  console.log("\n=== DEVAM ÖZET ===");
  let totalCost = 0;
  let totalCandidates = 0;
  for (const r of results) {
    totalCost += r.cost;
    totalCandidates += r.candidates;
    console.log(`${r.status.padEnd(14)} ${r.candidates.toString().padStart(3)} aday  $${r.cost.toFixed(4).padStart(8)}  ${r.label}`);
  }
  console.log(`\nToplam (bu koşu): ${totalCandidates} aday, $${totalCost.toFixed(4)} (${results.length} iş)`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
