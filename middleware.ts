import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const isAuthed = request.cookies.get("elif_auth")?.value === "1";

  if (!isAuthed) {
    return NextResponse.redirect(new URL("/elif", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/zelifs/:path*"]
};
