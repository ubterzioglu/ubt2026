import { readFile } from "node:fs/promises";
import path from "node:path";

import { isProjectairAuthenticated } from "@/lib/admin-auth";

const DOCUMENT_PATH = path.join(process.cwd(), "app", "projectair", "_content", "projectair.html");

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  if (!(await isProjectairAuthenticated())) {
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
