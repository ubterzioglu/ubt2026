import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/detrbridge")) {
    return withDetrbridgeVisitorCookie(request);
  }

  if (request.nextUrl.pathname.startsWith("/ubtsa")) {
    return withUbtsaVisitorCookie(request);
  }

  const isAuthed = request.cookies.get("elif_auth")?.value === "1";

  if (!isAuthed) {
    return NextResponse.redirect(new URL("/elif", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/zelifs/:path*", "/detrbridge/:path*", "/ubtsa/:path*"]
};
