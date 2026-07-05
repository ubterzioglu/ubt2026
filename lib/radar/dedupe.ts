// Two-level duplicate check (canonical URL hash, content hash) — ported
// from corteqsmvp.

import type { SupabaseClient } from "@supabase/supabase-js";

import type { NormalizedNewsItem } from "@/lib/radar/types";

export type DupeCheckResult =
  | { isDupe: true; level: "url" | "content"; existingId: string }
  | { isDupe: false };

export async function checkDuplicate(
  supabase: SupabaseClient,
  item: NormalizedNewsItem
): Promise<DupeCheckResult> {
  // Seviye 1: canonical URL hash
  const { data: byUrl } = await supabase
    .from("radar_news_candidates")
    .select("id")
    .eq("canonical_url_hash", item.canonicalUrlHash)
    .maybeSingle();

  if (byUrl) return { isDupe: true, level: "url", existingId: byUrl.id };

  // Seviye 2: content hash
  const { data: byContent } = await supabase
    .from("radar_news_candidates")
    .select("id")
    .eq("content_hash", item.contentHash)
    .maybeSingle();

  if (byContent) {
    return { isDupe: true, level: "content", existingId: byContent.id };
  }

  return { isDupe: false };
}
