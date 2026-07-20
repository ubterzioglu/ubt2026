import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { verifySessionToken } from "@/lib/secure-compare";
import { getZelifsState, saveZelifsState } from "@/lib/zelifs";

const SESSION_LABEL = "elif";

async function isAuthed(): Promise<boolean> {
  const password = process.env.ZELIFS_PASSWORD?.trim();
  // Fail closed: without a configured password no session can be valid.
  if (!password) return false;
  const cookieStore = await cookies();
  const token = cookieStore.get("elif_auth")?.value ?? "";
  return verifySessionToken(token, password, SESSION_LABEL);
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
