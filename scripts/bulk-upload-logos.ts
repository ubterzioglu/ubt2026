import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set (source .env.local first)."
  );
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

const SOURCE_DIR = join(process.cwd(), "docs", "logodetrbridge");
const BUCKET = "detrbridge-logos";
const UPLOADER_NAME = "Ortak";
const MAX_BYTES = 10 * 1024 * 1024;

function contentTypeFor(fileName: string): string {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".svg")) return "image/svg+xml";
  return "application/octet-stream";
}

async function main(): Promise<void> {
  const fileNames = readdirSync(SOURCE_DIR).filter((name) => {
    const full = join(SOURCE_DIR, name);
    return statSync(full).isFile();
  });

  console.log(`Found ${fileNames.length} file(s) in ${SOURCE_DIR}.`);

  let uploaded = 0;
  let failed = 0;

  for (const fileName of fileNames) {
    const fullPath = join(SOURCE_DIR, fileName);
    const stats = statSync(fullPath);
    if (stats.size > MAX_BYTES) {
      console.error(`SKIP (too large, >10MB): ${fileName}`);
      failed += 1;
      continue;
    }
    const bytes = readFileSync(fullPath);
    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80) || "logo";
    const storagePath = `logos/${Date.now()}-${uploaded}-${safeName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, bytes, {
          contentType: contentTypeFor(fileName),
          upsert: true
        });
      if (uploadError) throw uploadError;

      const { error: insertError } = await supabase.from("detrbridge_logos").insert({
        uploader_name: UPLOADER_NAME,
        storage_path: storagePath,
        file_name: fileName,
        size_bytes: stats.size
      });
      if (insertError) throw insertError;

      console.log(`OK: ${fileName} (${(stats.size / 1024).toFixed(0)} KB)`);
      uploaded += 1;
    } catch (error) {
      console.error(`FAILED: ${fileName} —`, error instanceof Error ? error.message : error);
      failed += 1;
    }
  }

  console.log(`Done. Uploaded: ${uploaded}, failed: ${failed}, total: ${fileNames.length}.`);
  if (failed > 0) {
    throw new Error(`${failed} file(s) failed to upload.`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
