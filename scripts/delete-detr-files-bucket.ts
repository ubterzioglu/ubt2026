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

const BUCKET = "detr-files";

async function main(): Promise<void> {
  const { data: files, error: listError } = await supabase.storage
    .from(BUCKET)
    .list("todos", { limit: 1000 });
  if (listError) throw listError;

  // detr-files objects are stored as todos/<todoId>/<file> — list() is not
  // recursive, so walk one level of todo-id subfolders.
  const allPaths: string[] = [];
  for (const entry of files ?? []) {
    if (!entry.id) {
      // entry.id is null for "folders" in Supabase Storage's list() output.
      const { data: nested, error: nestedError } = await supabase.storage
        .from(BUCKET)
        .list(`todos/${entry.name}`, { limit: 1000 });
      if (nestedError) throw nestedError;
      for (const file of nested ?? []) {
        allPaths.push(`todos/${entry.name}/${file.name}`);
      }
    }
  }

  console.log(`Found ${allPaths.length} object(s) in ${BUCKET} to remove.`);
  if (allPaths.length > 0) {
    const { error: removeError } = await supabase.storage.from(BUCKET).remove(allPaths);
    if (removeError) throw removeError;
  }

  const { error: bucketDeleteError } = await supabase.storage.deleteBucket(BUCKET);
  if (bucketDeleteError) throw bucketDeleteError;

  console.log(`Bucket ${BUCKET} deleted.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
