import { NextResponse } from "next/server";

import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { deriveSessionToken, secureCompare } from "@/lib/secure-compare";

const SESSION_LABEL = "elif";

function getPassword(): string | null {
  const password = process.env.ZELIFS_PASSWORD?.trim();
  return password ? password : null;
}

export async function POST(request: Request) {
  const password = getPassword();

  // Fail closed: without a configured password no sign-in is possible.
  if (!password) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  if (!checkRateLimit(`elif-auth:${await getClientIp()}`)) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const pw = (body as Record<string, unknown>)?.password;
  if (typeof pw !== "string" || !secureCompare(pw, password)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const token = deriveSessionToken(password, SESSION_LABEL);
  const response = NextResponse.json({ ok: true });
  response.cookies.set("elif_auth", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/"
  });

  return response;
}
