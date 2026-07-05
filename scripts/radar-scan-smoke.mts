// Lokal smoke test: gerçek bir radar taraması çalıştırır (npx tsx ile).
//   npx tsx scripts/radar-scan-smoke.mts
// .env.local'dan service-role ile bağlanır; sonuç özeti stdout'a yazılır.
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

import { runRadarScan } from "../lib/radar/scan";

function loadEnv(path: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;
    out[match[1]] = match[2].trim();
  }
  return out;
}

const env = loadEnv(".env.local");
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false }
});

console.log("Radar taraması başlıyor (kaynaklar arası 6 sn bekleme var)...");
const summary = await runRadarScan(supabase, { triggerType: "manual" });
console.log(JSON.stringify(summary, null, 2));
