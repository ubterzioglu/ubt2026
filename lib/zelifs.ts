import "server-only";

import { createClient } from "@supabase/supabase-js";

export interface ZelifsTrip {
  id: string;
  out: string;
  in: string;
}

export interface ZelifsNote {
  text: string;
  ts: number;
}

export interface ZelifsState {
  trips: ZelifsTrip[];
  plus: ZelifsNote[];
  minus: ZelifsNote[];
}

interface ZelifsStateRow {
  trips: ZelifsTrip[];
  plus_notes: ZelifsNote[];
  minus_notes: ZelifsNote[];
}

function createSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) return null;
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

const EMPTY_STATE: ZelifsState = { trips: [], plus: [], minus: [] };

export async function getZelifsState(): Promise<ZelifsState> {
  const client = createSupabaseClient();
  if (!client) return EMPTY_STATE;

  const { data } = await client
    .from("zelifs_state")
    .select("trips, plus_notes, minus_notes")
    .eq("id", "elif")
    .single<ZelifsStateRow>();

  if (!data) return EMPTY_STATE;

  return {
    trips: Array.isArray(data.trips) ? data.trips : [],
    plus: Array.isArray(data.plus_notes) ? data.plus_notes : [],
    minus: Array.isArray(data.minus_notes) ? data.minus_notes : []
  };
}

export async function saveZelifsState(state: ZelifsState): Promise<boolean> {
  const client = createSupabaseClient();
  if (!client) return false;

  const { error } = await client.from("zelifs_state").upsert({
    id: "elif",
    trips: state.trips,
    plus_notes: state.plus,
    minus_notes: state.minus,
    updated_at: new Date().toISOString()
  });

  return !error;
}
