import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getZelifsState, saveZelifsState } from "@/lib/zelifs";

async function isAuthed(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get("elif_auth")?.value === "1";
}

export async function GET() {
  if (!(await isAuthed())) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const state = await getZelifsState();
  return NextResponse.json({ ok: true, data: state });
}

export async function POST(request: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  await saveZelifsState({
    trips: Array.isArray(b.trips) ? b.trips : [],
    plus: Array.isArray(b.plus) ? b.plus : [],
    minus: Array.isArray(b.minus) ? b.minus : []
  });

  return NextResponse.json({ ok: true });
}
