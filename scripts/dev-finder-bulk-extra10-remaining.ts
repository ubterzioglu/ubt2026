// Geçici devam script'i — ek 10 şehir taramasının kalanını tamamlar
// (Duisburg'un kalan 2 kategorisi + Bochum, Wuppertal, Bielefeld, Bonn, Münster).
// Kullanım sonrası silinir.
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

import { executeFinderJob } from "../lib/finder/run-job";

function envValue(raw: string, name: string): string {
  const match = raw.match(new RegExp(`^${name}=(.+)$`, "m"));
  return match ? match[1].trim() : "";
}

const REMAINING: Array<{ city: string; templateKey: string }> = [
  { city: "Duisburg", templateKey: "venue-studio" },
  { city: "Duisburg", templateKey: "provider-privat" },
  { city: "Bochum", templateKey: "venue-fkk-club" },
  { city: "Bochum", templateKey: "venue-bordell" },
  { city: "Bochum", templateKey: "venue-studio" },
  { city: "Bochum", templateKey: "provider-privat" },
  { city: "Wuppertal", templateKey: "venue-fkk-club" },
  { city: "Wuppertal", templateKey: "venue-bordell" },
  { city: "Wuppertal", templateKey: "venue-studio" },
  { city: "Wuppertal", templateKey: "provider-privat" },
  { city: "Bielefeld", templateKey: "venue-fkk-club" },
  { city: "Bielefeld", templateKey: "venue-bordell" },
  { city: "Bielefeld", templateKey: "venue-studio" },
  { city: "Bielefeld", templateKey: "provider-privat" },
  { city: "Bonn", templateKey: "venue-fkk-club" },
  { city: "Bonn", templateKey: "venue-bordell" },
  { city: "Bonn", templateKey: "venue-studio" },
  { city: "Bonn", templateKey: "provider-privat" },
  { city: "Münster", templateKey: "venue-fkk-club" },
  { city: "Münster", templateKey: "venue-bordell" },
  { city: "Münster", templateKey: "venue-studio" },
  { city: "Münster", templateKey: "provider-privat" }
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

  const results: Array<{ label: string; status: string; candidates: number; cost: number }> = [];

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
    const summary = await withRetry(() => executeFinderJob(supabase, job.id as string), label);

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

  console.log("\n=== KALAN 22 İŞ ÖZET ===");
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
