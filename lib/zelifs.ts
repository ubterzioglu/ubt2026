import "server-only";

import { createServiceClient } from "@/lib/supabase-server";

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

const EMPTY_STATE: ZelifsState = { trips: [], plus: [], minus: [] };

export async function getZelifsState(): Promise<ZelifsState> {
  const client = createServiceClient();
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
  const client = createServiceClient();
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
