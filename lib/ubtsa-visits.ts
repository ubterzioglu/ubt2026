import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type SourceState = "remote" | "env-missing" | "empty" | "error";

/** Bir başarılı giriş kaydı. */
export interface UbtsaVisit {
  id: string;
  name: string;
  signedInAt: string;
}

export interface UbtsaVisitsResult {
  source: SourceState;
  errorMessage?: string;
  /** Yeniden eskiye sıralı giriş kayıtları. */
  items: UbtsaVisit[];
}

interface SupabaseVisitRow {
  id: string;
  name: string;
  signed_in_at: string;
}

const VISIT_COLUMNS = "id, name, signed_in_at";

/** Panoda gösterilen en fazla kayıt — iki kullanıcı için fazlasıyla yeterli. */
const VISIT_LIMIT = 200;

function createServiceClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) return null;
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

/**
 * Başarılı bir girişi loglar.
 *
 * Sessizce başarısız olur: log yazılamadı diye kimsenin girişi engellenmemeli
 * — kayıt tutmak erişimden daha az önemli.
 */
export async function recordUbtsaSignIn(name: string): Promise<void> {
  const supabase = createServiceClient();
  if (!supabase) return;
  try {
    await supabase.from("ubtsa_visits").insert({ name: name.trim() });
  } catch {
    // Giriş akışını bozmamak için yutuluyor.
  }
}

/** Giriş kayıtlarını yeniden eskiye döner. */
export async function getUbtsaVisits(): Promise<UbtsaVisitsResult> {
  const supabase = createServiceClient();
  if (!supabase) return { source: "env-missing", items: [] };
  try {
    const { data, error } = await supabase
      .from("ubtsa_visits")
      .select(VISIT_COLUMNS)
      .order("signed_in_at", { ascending: false })
      .limit(VISIT_LIMIT);
    if (error) throw error;

    const items = ((data ?? []) as SupabaseVisitRow[]).map((row) => ({
      id: row.id,
      name: row.name,
      signedInAt: row.signed_in_at
    }));
    return { source: items.length > 0 ? "remote" : "empty", items };
  } catch (error) {
    return {
      source: "error",
      errorMessage: error instanceof Error ? error.message : "Unknown error",
      items: []
    };
  }
}
