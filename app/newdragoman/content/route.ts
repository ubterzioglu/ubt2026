import { readFile } from "node:fs/promises";
import path from "node:path";

import { isNewdragomanAuthenticated } from "@/lib/admin-auth";

/**
 * Serves the raw proposal document that /newdragoman frames.
 *
 * The HTML lives in `app/newdragoman/_content/` rather than `public/` on
 * purpose: anything under `public/` is served by the static handler without
 * ever reaching this gate, which would make the document world-readable. Next
 * does not trace this read automatically, so `outputFileTracingIncludes` in
 * next.config.ts copies the file into the standalone bundle.
 */
const DOCUMENT_PATH = path.join(
  process.cwd(),
  "app",
  "newdragoman",
  "_content",
  "newdragoman.html"
);

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  if (!(await isNewdragomanAuthenticated())) {
    // 404 rather than 401: an unauthenticated caller learns nothing about
    // whether this path holds anything at all.
    return new Response("Not found", { status: 404 });
  }

  try {
    const html = await readFile(DOCUMENT_PATH, "utf8");
    return new Response(html, {
      status: 200,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "private, no-store"
      }
    });
  } catch {
    return new Response("Doküman bulunamadı.", {
      status: 500,
      headers: { "content-type": "text/plain; charset=utf-8" }
    });
  }
}
