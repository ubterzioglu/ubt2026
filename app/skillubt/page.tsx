import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Metadata } from "next";
import Script from "next/script";

import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Requirements Interview — Skill Guide",
  description:
    "Requirements Interview — a free Claude Code skill that turns a one-line pitch into a written SPEC.md before any code exists.",
  canonical: "/skillubt",
  ogType: "website"
});

const README_PATH = path.join(
  process.cwd(),
  "public",
  "skillubt",
  "requirements-interview-package",
  "README.html"
);

interface ParsedReadme {
  style: string;
  bodyHtml: string;
  script: string;
}

/**
 * The README is a standalone HTML fragment (own <style>/<script>, no
 * <html>/<body>) written for direct browser opening. This route renders it
 * inside the site's own <html>/<body>, so the fragment's <style> and
 * <script> tags are pulled out and re-injected explicitly — Next.js won't
 * execute a raw <script> handed to dangerouslySetInnerHTML.
 */
function parseReadme(html: string): ParsedReadme {
  const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/);
  const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
  const bodyHtml = html
    .replace(/<title>[\s\S]*?<\/title>/, "")
    .replace(/<style>[\s\S]*?<\/style>/, "")
    .replace(/<script>[\s\S]*?<\/script>/, "");

  return {
    style: styleMatch?.[1] ?? "",
    bodyHtml,
    script: scriptMatch?.[1] ?? ""
  };
}

export default async function SkillUbtPage() {
  const readmeHtml = await readFile(README_PATH, "utf8");
  const { style, bodyHtml, script } = parseReadme(readmeHtml);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: style }} />
      <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />
      <Script id="skillubt-lang-toggle" strategy="afterInteractive">
        {script}
      </Script>
    </>
  );
}
