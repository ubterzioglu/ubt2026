import { NextResponse } from "next/server";

const PASSWORD = process.env.ZELIFS_PASSWORD ?? "elif123";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const pw = (body as Record<string, unknown>)?.password;
  if (typeof pw !== "string" || pw !== PASSWORD) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set("elif_auth", "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/"
  });

  return response;
}
