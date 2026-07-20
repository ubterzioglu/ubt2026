import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo";
import { SkillReadmeLangToggle } from "./_components/skill-readme-lang-toggle";

export const metadata: Metadata = buildMetadata({
  title: "Requirements Interview — Skill Guide",
  description:
    "Requirements Interview — a free Claude Code skill that turns a one-line pitch into a written SPEC.md before any code exists.",
  canonical: "/skillubt",
  ogType: "website"
});

interface SkillDefinition {
  slug: string;
  name: string;
  tagline: string;
  downloadHref: string;
  downloadHint: string;
  readmePath: string;
}

const SKILLS: SkillDefinition[] = [
  {
    slug: "requirements-interview",
    name: "Requirements Interview",
    tagline: "Claude Code Skill · Free download",
    downloadHref: "/skillubt/requirements-interview-skill.zip",
    downloadHint: "skills/requirements-interview/ → ~/.claude/skills/requirements-interview/",
    readmePath: path.join(
      process.cwd(),
      "public",
      "skillubt",
      "requirements-interview-package",
      "README.html"
    )
  }
];

/**
 * The README's own inline <script> (the EN/TR toggle) never runs here: React
 * inserts `dangerouslySetInnerHTML` markup via the DOM, and browsers do not
 * execute <script> tags added that way. LangToggle (a client component)
 * re-attaches the click behavior after hydration. Until then — and for the
 * very first paint — the server must pick a default language itself, so it
 * flips the README's default from EN to TR by swapping which language's
 * `data-lang` blocks start `hidden` and which toggle button starts pressed.
 */
function defaultToTurkish(html: string): string {
  return html
    .replace(/data-lang="en"([^>]*)>/g, (match, rest: string) => {
      if (/\bhidden\b/.test(rest)) return match;
      return `data-lang="en"${rest} hidden>`;
    })
    .replace(/data-lang="tr" hidden/g, 'data-lang="tr"')
    .replace(
      'data-lang-btn="tr" aria-pressed="false"',
      'data-lang-btn="tr" aria-pressed="true"'
    );
}

/**
 * The README's inline <style> sets its palette on `:root` — fine as a
 * standalone file, but here that leaks into the whole page: it overwrites
 * this site's own `--accent` (and other) CSS variables globally, breaking
 * every `bg-accent`/`text-accent` etc. Tailwind class outside the panel too
 * (Tailwind's `rgb(var(--accent) / …)` gets a hex string instead of an
 * `R G B` triple and silently produces an invalid, invisible color).
 * Scope those rules to the panel's own id instead of the document root.
 */
function scopeRootVariables(html: string, scopeSelector: string): string {
  return html.replace(/:root(?![\w-])/g, scopeSelector);
}

/**
 * The README is a standalone file meant to be opened directly in a browser,
 * so it auto-switches to a dark palette on `prefers-color-scheme: dark`.
 * Embedded inside this site (which has no dark mode at all), that rule would
 * fight the page's always-light theme — strip it so the embedded copy always
 * renders light, matching the rest of the site.
 */
function stripDarkModeQuery(html: string): string {
  const marker = "@media (prefers-color-scheme: dark) {";
  const start = html.indexOf(marker);
  if (start === -1) return html;

  let depth = 0;
  let end = start + marker.length;
  for (; end < html.length; end += 1) {
    if (html[end] === "{") depth += 1;
    else if (html[end] === "}") {
      if (depth === 0) {
        end += 1;
        break;
      }
      depth -= 1;
    }
  }

  return html.slice(0, start) + html.slice(end);
}

function panelIdFor(slug: string): string {
  return `skill-readme-panel-${slug}`;
}

async function loadSkillHtml(skill: SkillDefinition): Promise<string> {
  const rawHtml = await readFile(skill.readmePath, "utf8");
  return defaultToTurkish(
    scopeRootVariables(stripDarkModeQuery(rawHtml), `#${panelIdFor(skill.slug)}`)
  );
}

interface SkillCardProps {
  skill: SkillDefinition;
  html: string;
}

function SkillCard({ skill, html }: SkillCardProps) {
  const panelId = panelIdFor(skill.slug);

  return (
    <div className="flex flex-col gap-6">
      <a
        href={skill.downloadHref}
        download
        className="group relative flex cursor-pointer flex-col items-center gap-3 rounded-[2rem] border-2 border-accent/40 bg-accentSoft/40 px-6 py-10 text-center shadow-panel backdrop-blur-sm transition hover:-translate-y-1 hover:border-accent hover:bg-accentSoft/70 hover:shadow-glow sm:px-10 sm:py-12"
      >
        <span className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-accent text-white shadow-lg transition group-hover:scale-110">
          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-none stroke-current stroke-[2.5]" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3v12" />
            <path d="m7 10 5 5 5-5" />
            <path d="M5 21h14" />
          </svg>
        </span>
        <span className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
          {skill.tagline}
        </span>
        <span className="font-body text-[clamp(1.6rem,5vw,2.2rem)] font-semibold tracking-[-0.02em] text-ink">
          {skill.name}
        </span>
        <span className="inline-flex min-h-[56px] items-center justify-center gap-2 rounded-full bg-accent px-8 py-4 text-base font-bold text-white shadow-lg shadow-accent/30 transition group-hover:-translate-y-0.5 group-hover:shadow-xl group-hover:shadow-accent/40">
          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-none stroke-current stroke-[2]" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3v12" />
            <path d="m7 10 5 5 5-5" />
            <path d="M5 21h14" />
          </svg>
          Download .zip
        </span>
        <span className="text-xs text-ink/50">{skill.downloadHint}</span>
      </a>

      <div
        id={panelId}
        data-theme="light"
        className="section-panel relative overflow-hidden px-6 py-2 sm:px-10"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <SkillReadmeLangToggle containerId={panelId} />
    </div>
  );
}

export default async function SkillUbtPage() {
  const skillHtml = await Promise.all(
    SKILLS.map(async (skill) => [skill, await loadSkillHtml(skill)] as const)
  );

  return (
    <>
      <main className="page-shell min-h-screen px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-5xl flex-col gap-12">
          {skillHtml.map(([skill, html]) => (
            <SkillCard key={skill.slug} skill={skill} html={html} />
          ))}
        </div>
      </main>
    </>
  );
}
