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

const SOURCE_BUCKET = "detr-files";
const TARGET_BUCKET = "detrbridge-files";

interface AttachmentRow {
  storage_path: string;
}

async function main(): Promise<void> {
  const { data, error } = await supabase
    .from("detrbridge_todo_attachments")
    .select("storage_path");
  if (error) throw error;

  const paths = (data as AttachmentRow[]).map((row) => row.storage_path);
  console.log(`Found ${paths.length} attachment row(s) to copy.`);

  let copied = 0;
  let skipped = 0;
  let failed = 0;

  for (const path of paths) {
    const { data: file, error: downloadError } = await supabase.storage
      .from(SOURCE_BUCKET)
      .download(path);
    if (downloadError || !file) {
      console.error(`FAILED to download ${path}:`, downloadError?.message);
      failed += 1;
      continue;
    }

    const { error: uploadError } = await supabase.storage
      .from(TARGET_BUCKET)
      .upload(path, file, { upsert: true, contentType: file.type });
    if (uploadError) {
      console.error(`FAILED to upload ${path}:`, uploadError.message);
      failed += 1;
      continue;
    }

    copied += 1;
  }

  console.log(
    `Done. Copied: ${copied}, skipped: ${skipped}, failed: ${failed}, total expected: ${paths.length}.`
  );
  if (failed > 0) {
    throw new Error(`${failed} object(s) failed to copy — do not proceed to cleanup.`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
