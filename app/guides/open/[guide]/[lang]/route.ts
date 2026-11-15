import type { NextRequest } from "next/server";

import { GUIDE_LANGUAGES, guides } from "@/content/guides";
import { isBotUserAgent, recordGuideOpen } from "@/lib/guide-events";
import { GUIDES_VISITOR_COOKIE } from "@/lib/session-constants";

const VISITOR_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365 * 5;

interface GuideOpenContext {
  params: Promise<{ guide: string; lang: string }>;
}

export async function GET(request: NextRequest, { params }: GuideOpenContext) {
  const { guide: guideId, lang } = await params;
  const guide = guides.find((entry) => entry.id === guideId);
  const language = GUIDE_LANGUAGES.find((entry) => entry === lang);

  if (!guide || !language) {
    return new Response(null, { status: 302, headers: { Location: "/guides" } });
  }

  const existing = request.cookies.get(GUIDES_VISITOR_COOKIE)?.value;
  const visitorId = existing ?? crypto.randomUUID();

  if (!isBotUserAgent(request.headers.get("user-agent"))) {
    recordGuideOpen({ guideId: guide.id, language, visitorId, isNewVisitor: !existing });
  }

  const responseHeaders = new Headers({
    Location: guide.files[language].href,
    "Cache-Control": "no-store"
  });
  if (!existing) {
    const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
    responseHeaders.append(
      "Set-Cookie",
      `${GUIDES_VISITOR_COOKIE}=${visitorId}; Path=/guides; Max-Age=${VISITOR_COOKIE_MAX_AGE_SECONDS}; HttpOnly; SameSite=Lax${secure}`
    );
  }
  return new Response(null, { status: 302, headers: responseHeaders });
}
