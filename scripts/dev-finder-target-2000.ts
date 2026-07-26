import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

import { executeFinderJob } from "../lib/finder/run-job";

function envValue(raw: string, name: string): string {
  const match = raw.match(new RegExp(`^${name}=(.+)$`, "m"));
  return match ? match[1].trim() : "";
}

const first25Cities = [
  "Mannheim",
  "Karlsruhe",
  "Augsburg",
  "Wiesbaden",
  "Mönchengladbach",
  "Gelsenkirchen",
  "Aachen",
  "Braunschweig",
  "Kiel",
  "Chemnitz",
  "Halle (Saale)",
  "Magdeburg",
  "Freiburg im Breisgau",
  "Krefeld",
  "Mainz",
  "Lübeck",
  "Erfurt",
  "Oberhausen",
  "Rostock",
  "Kassel",
  "Hagen",
  "Potsdam",
  "Saarbrücken",
  "Hamm",
  "Ludwigshafen am Rhein"
] as const;

const expansionCities = [
  "Oldenburg",
  "Leverkusen",
  "Osnabrück",
  "Solingen",
  "Heidelberg",
  "Herne",
  "Neuss",
  "Darmstadt",
  "Paderborn",
  "Regensburg",
  "Ingolstadt",
  "Würzburg",
  "Fürth",
  "Wolfsburg",
  "Offenbach am Main",
  "Ulm",
  "Heilbronn",
  "Pforzheim",
  "Göttingen",
  "Bottrop",
  "Trier",
  "Recklinghausen",
  "Reutlingen",
  "Bremerhaven",
  "Koblenz",
  "Bergisch Gladbach",
  "Jena",
  "Remscheid",
  "Erlangen",
  "Moers",
  "Siegen",
  "Hildesheim",
  "Salzgitter",
  "Cottbus",
  "Gütersloh",
  "Kaiserslautern",
  "Schwerin",
  "Witten",
  "Gera",
  "Iserlohn",
  "Ludwigsburg",
  "Tübingen",
  "Flensburg",
  "Villingen-Schwenningen",
  "Konstanz"
] as const;

const cities: readonly string[] = [...first25Cities, ...expansionCities];
const targetCandidates = 2_000;

const templateKeys = [
  "venue-fkk-club",
  "venue-bordell",
  "venue-studio",
  "provider-privat"
] as const;

const queryPatterns: Record<(typeof templateKeys)[number], string[]> = {
  "venue-fkk-club": [
    "FKK Club {{city}}",
    "Saunaclub {{city}}",
    "FKK Sauna {{city}}",
    "FKK Wellnessclub {{city}}",
    "Erotik Saunaclub {{city}}",
    "FKK Nachtclub {{city}}",
    "FKK Club Adresse {{city}}",
    "Saunaclub Öffnungszeiten {{city}}"
  ],
  "venue-bordell": [
    "Bordell {{city}}",
    "Laufhaus {{city}}",
    "Eroscenter {{city}}",
    "Freudenhaus {{city}}",
    "Rotlicht Adresse {{city}}",
    "Bordell Öffnungszeiten {{city}}",
    "Laufhaus Adresse {{city}}",
    "Eros Center {{city}}"
  ],
  "venue-studio": [
    "Erotikstudio {{city}}",
    "Erotik Massage Studio {{city}}",
    "Tantra Studio {{city}}",
    "Massagestudio Erotik {{city}}",
    "Dominastudio {{city}}",
    "Bizarrstudio {{city}}",
    "Erotikstudio Adresse {{city}}",
    "Tantramassage Studio {{city}}"
  ],
  "provider-privat": [
    "Privat Escort {{city}}",
    "Escort Service {{city}}",
    "Begleitservice {{city}}",
    "Terminwohnung {{city}}",
    "Wohnungsbordell {{city}}",
    "Privat Anbieterin {{city}}",
    "Escort Profil {{city}}",
    "Privat Anzeige {{city}}"
  ]
};

interface RunResult {
  city: string;
  templateKey: string;
  status: string;
  candidates: number;
  cost: number;
  error?: string;
}

async function main() {
  const raw = readFileSync(".env.local", "utf8");
  for (const name of [
    "TAVILY_API_KEY",
    "TAVILY_API_KEY_2",
    "TAVILY_API_KEY_3",
    "SERPAPI_API_KEY",
    "GEMINI_API_KEY",
    "GEMINI_API_KEY_2"
  ]) {
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
    .in("template_key", [...templateKeys]);
  if (templateError) throw templateError;

  const templateByKey = new Map((templates ?? []).map((template) => [template.template_key, template]));
  const missingTemplates = templateKeys.filter((key) => !templateByKey.has(key));
  if (missingTemplates.length > 0) {
    throw new Error(`Şablon bulunamadı: ${missingTemplates.join(", ")}`);
  }

  const { data: providers, error: providerError } = await supabase
    .from("service_finder_provider_configs")
    .select("id, provider_key")
    .in("provider_key", ["tavily3", "serpapi", "gemini", "gemini2"]);
  if (providerError) throw providerError;
  const providerByKey = new Map((providers ?? []).map((provider) => [provider.provider_key, provider]));
  for (const key of ["tavily3", "serpapi", "gemini", "gemini2"]) {
    if (!providerByKey.has(key)) throw new Error(`Sağlayıcı bulunamadı: ${key}`);
  }

  const { data: existingJobs, error: existingJobsError } = await supabase
    .from("service_finder_jobs")
    .select("id, city, template_id, status, created_at")
    .in("city", [...cities])
    .order("created_at", { ascending: false });
  if (existingJobsError) throw existingJobsError;
  const campaignJobIds = new Set((existingJobs ?? []).map((job) => job.id as string));

  async function countCampaignCandidates(): Promise<number> {
    const ids = [...campaignJobIds];
    if (ids.length === 0) return 0;
    let total = 0;
    for (let offset = 0; offset < ids.length; offset += 100) {
      const { count, error } = await supabase
        .from("service_finder_candidates")
        .select("id", { count: "exact", head: true })
        .in("job_id", ids.slice(offset, offset + 100));
      if (error) throw error;
      total += count ?? 0;
    }
    return total;
  }

  const existingByPair = new Map<string, (typeof existingJobs)[number]>();
  for (const job of existingJobs ?? []) {
    if (!job.city || !job.template_id) continue;
    const key = `${job.city}\u0000${job.template_id}`;
    if (!existingByPair.has(key)) existingByPair.set(key, job);
  }

  const alreadyTouchedCities = new Set((existingJobs ?? []).flatMap((job) => (job.city ? [job.city] : [])));
  console.log(
    `Plan: önce ${first25Cities.length} yeni şehir, ardından ${targetCandidates} adaya kadar ` +
      `${expansionCities.length} yedek şehir. Daha önce başlanmış plan şehri: ` +
      `${alreadyTouchedCities.size}.`
  );

  const results: RunResult[] = [];
  let campaignCandidateCount = await countCampaignCandidates();
  let targetReached = campaignCandidateCount >= targetCandidates;

  const tasks = cities.flatMap((city) =>
    templateKeys.map((templateKey) => ({ city, templateKey }))
  );
  let nextTaskIndex = 0;

  async function runWorker(workerIndex: number): Promise<void> {
    const providerSuffix = workerIndex % 2 === 0 ? "" : "2";
    const classifierModel =
      Math.floor(workerIndex / 2) % 2 === 0
        ? "gemini-2.5-flash"
        : "gemini-2.5-flash-lite";
    const searchProvider = providerByKey.get("tavily3");
    const extractProvider = providerByKey.get("serpapi");
    const classifierProvider = providerByKey.get(`gemini${providerSuffix}`);
    if (!searchProvider || !extractProvider || !classifierProvider) return;

    for (;;) {
      if (targetReached) return;
      const taskIndex = nextTaskIndex;
      nextTaskIndex += 1;
      const task = tasks[taskIndex];
      if (!task) return;
      const { city, templateKey } = task;
      const template = templateByKey.get(templateKey);
      if (!template) continue;

      const pairKey = `${city}\u0000${template.id}`;
      const existing = existingByPair.get(pairKey);
      let jobId: string;

      if (existing?.status === "queued") {
        jobId = existing.id as string;
        const { error: resumeConfigError } = await supabase
          .from("service_finder_jobs")
          .update({
            search_provider_id: searchProvider.id,
            extract_provider_id: extractProvider.id,
            classifier_provider_id: classifierProvider.id,
            seed_queries: [queryPatterns[templateKey][0]],
            max_queries: 1,
            max_source_urls: 100,
            max_extract_urls: 100,
            max_candidates: 100,
            result_summary: { classifier_model: classifierModel }
          })
          .eq("id", jobId);
        if (resumeConfigError) throw resumeConfigError;
        process.stdout.write(`[${city} / ${template.label}] kuyruktan devam ediyor... `);
      } else if (existing) {
        console.log(`[${city} / ${template.label}] atlandı — mevcut durum: ${existing.status}`);
        continue;
      } else {
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
            language_code: "de",
            search_provider_id: searchProvider.id,
            extract_provider_id: extractProvider.id,
            classifier_provider_id: classifierProvider.id,
            seed_queries: [queryPatterns[templateKey][0]],
            max_queries: 1,
            max_source_urls: 100,
            max_extract_urls: 100,
            max_candidates: 100,
            soft_cap_usd: 3,
            hard_cap_usd: 6,
            result_summary: { classifier_model: classifierModel }
          })
          .select("id")
          .single();
        if (jobError) {
          console.error(`[${city} / ${template.label}] oluşturulamadı: ${jobError.message}`);
          results.push({
            city,
            templateKey,
            status: "insert_failed",
            candidates: 0,
            cost: 0,
            error: jobError.message
          });
          continue;
        }
        jobId = job.id as string;
        campaignJobIds.add(jobId);
        process.stdout.write(`[${city} / ${template.label}] çalışıyor... `);
      }

      const summary = await executeFinderJob(supabase, jobId);
      const { data: jobRow } = await supabase
        .from("service_finder_jobs")
        .select("cost_total_usd")
        .eq("id", jobId)
        .single();
      const cost = Number(jobRow?.cost_total_usd ?? 0);

      console.log(`${summary.status} — ${summary.candidates} aday — $${cost.toFixed(4)}`);
      results.push({
        city,
        templateKey,
        status: summary.status,
        candidates: summary.candidates,
        cost,
        error: summary.errorMessage
      });
      campaignCandidateCount = await countCampaignCandidates();
      console.log(`Hedef ilerlemesi: ${campaignCandidateCount}/${targetCandidates} aday`);
      if (campaignCandidateCount >= targetCandidates) {
        targetReached = true;
      }
    }
  }

  await Promise.all(Array.from({ length: 8 }, (_, index) => runWorker(index)));

  const totalCandidates = results.reduce((sum, result) => sum + result.candidates, 0);
  const totalCost = results.reduce((sum, result) => sum + result.cost, 0);
  const statusCounts = results.reduce<Record<string, number>>((counts, result) => {
    counts[result.status] = (counts[result.status] ?? 0) + 1;
    return counts;
  }, {});

  campaignCandidateCount = await countCampaignCandidates();
  console.log("\n=== 2.000 ADAY KOŞUSU ÖZETİ ===");
  console.log(`İşlenen iş: ${results.length}`);
  console.log(`Durumlar: ${JSON.stringify(statusCounts)}`);
  console.log(`Bu süreçte tamamlanan işlerin aday toplamı: ${totalCandidates}`);
  console.log(`Kampanya aday toplamı: ${campaignCandidateCount}`);
  console.log(`Toplam maliyet: $${totalCost.toFixed(4)}`);

  const failures = results.filter((result) => result.status !== "review");
  if (failures.length > 0) {
    console.log("\nTamamlanmayan işler:");
    for (const failure of failures) {
      console.log(
        `${failure.city} / ${failure.templateKey}: ${failure.status}` +
          (failure.error ? ` — ${failure.error}` : "")
      );
    }
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
