import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { verifyEdgeSessionToken } from "@/lib/edge-session-token";

const DETRBRIDGE_VISITOR_COOKIE = "ubt_detrbridge_visitor";
const VISITOR_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365 * 5; // 5 years
const FIRST_VISIT_HEADER = "x-detrbridge-first-visit";
const VISITOR_TOKEN_HEADER = "x-detrbridge-visitor-token";

/**
 * Mints the /detrbridge visitor cookie here, since Server Components can't
 * call cookies().set() during a render (Next.js throws in production). The
 * page reads the two request headers below to decide whether to log a
 * first-visit row — no cookie mutation happens there.
 */
function withDetrbridgeVisitorCookie(request: NextRequest): NextResponse {
  const existing = request.cookies.get(DETRBRIDGE_VISITOR_COOKIE)?.value;
  const requestHeaders = new Headers(request.headers);

  if (existing) {
    requestHeaders.set(VISITOR_TOKEN_HEADER, existing);
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  const token = crypto.randomUUID();
  requestHeaders.set(FIRST_VISIT_HEADER, "1");
  requestHeaders.set(VISITOR_TOKEN_HEADER, token);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.cookies.set(DETRBRIDGE_VISITOR_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/detrbridge",
    maxAge: VISITOR_COOKIE_MAX_AGE_SECONDS
  });
  return response;
}

const UBTSA_VISITOR_COOKIE = "ubt_ubtsa_visitor";
const UBTSA_FIRST_VISIT_HEADER = "x-ubtsa-first-visit";

/**
 * Mints the /ubtsa visitor cookie, for the same reason as /detrbridge above:
 * a Server Component cannot call cookies().set() during a render. The page
 * reads the header below to decide whether to show its welcome card. No
 * visitor id is stored — the cookie only answers "have you been here before",
 * so a bare flag is enough.
 */
function withUbtsaVisitorCookie(request: NextRequest): NextResponse {
  const seen = request.cookies.get(UBTSA_VISITOR_COOKIE)?.value;
  if (seen) return NextResponse.next();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(UBTSA_FIRST_VISIT_HEADER, "1");

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.cookies.set(UBTSA_VISITOR_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/ubtsa",
    maxAge: VISITOR_COOKIE_MAX_AGE_SECONDS
  });
  return response;
}

const ELIF_SESSION_COOKIE = "elif_auth";
const ELIF_SESSION_LABEL = "elif";

const SUPER_ADMIN_COOKIE = "ubt_super_admin";
const SUPER_ADMIN_LABEL = "super";

/**
 * Edge-side twin of `isSuperAdmin()` in lib/admin-auth.ts. That module is
 * `server-only` and built on `node:crypto`, neither of which exists here, so
 * the same check is re-derived with the Web Crypto helper.
 *
 * Fails CLOSED: no APPOINTMENT_ADMIN_ACCESS_KEY configured -> no bypass.
 */
async function isEdgeSuperAdmin(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(SUPER_ADMIN_COOKIE)?.value ?? "";
  const accessKey = process.env.APPOINTMENT_ADMIN_ACCESS_KEY?.trim() ?? "";
  return verifyEdgeSessionToken(token, accessKey, SUPER_ADMIN_LABEL);
}

/**
 * Guards the static /zelifs assets. The `elif_auth` cookie holds an HMAC token
 * minted by /api/elif-auth (keyed by ZELIFS_PASSWORD), so it has to be verified
 * rather than compared against a literal. A super-admin session opens it too.
 */
async function isElifAuthed(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(ELIF_SESSION_COOKIE)?.value ?? "";
  const password = process.env.ZELIFS_PASSWORD?.trim() ?? "";
  if (await verifyEdgeSessionToken(token, password, ELIF_SESSION_LABEL)) {
    return true;
  }
  return isEdgeSuperAdmin(request);
}

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/detrbridge")) {
    return withDetrbridgeVisitorCookie(request);
  }

  if (request.nextUrl.pathname.startsWith("/ubtsa")) {
    return withUbtsaVisitorCookie(request);
  }

  if (!(await isElifAuthed(request))) {
    return NextResponse.redirect(new URL("/elif", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/zelifs/:path*", "/detrbridge/:path*", "/ubtsa/:path*"]
};
