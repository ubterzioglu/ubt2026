import type { Metadata } from "next";
import Link from "next/link";

import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Skills",
  description:
    "Claude Code skills by Umut Barış Terzioğlu — download ready-to-install skill packages for agentic coding workflows.",
  canonical: "/skillubt",
  ogType: "website"
});

interface SkillPackage {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  installPath: string;
  guideHref: string;
  downloadHref: string;
}

const skillPackages: SkillPackage[] = [
  {
    slug: "requirements-interview",
    name: "Requirements Interview",
    tagline: "Turn a one-line pitch into a written spec before any code exists",
    description:
      "Interviews you with a batch of questions scaled to your project, then compiles the answers into a SPEC.md that becomes the primary context for the whole build.",
    installPath: "skills/requirements-interview/ → ~/.claude/skills/requirements-interview/",
    guideHref: "/skillubt/requirements-interview-package/README.html",
    downloadHref: "/skillubt/requirements-interview-skill.zip"
  }
];

export default function SkillUbtPage() {
  return (
    <main className="page-shell min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <section className="section-panel px-6 py-8 sm:px-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
                Claude Code
              </p>
              <h1 className="mt-2 font-body text-[clamp(2.2rem,6vw,3.2rem)] font-semibold tracking-[-0.03em] text-ink">
                Skills
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-ink/72 sm:text-base">
                Ready-to-install skill packages for agentic coding workflows. Download a
                package, drop it into your <code className="rounded bg-mist/80 px-1.5 py-0.5 text-[0.85em]">~/.claude/skills/</code>{" "}
                directory, and it fires automatically when the trigger conditions match.
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-full border border-line/80 bg-white px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-accent/40 hover:text-accent"
            >
              Back to home
            </Link>
          </div>
        </section>

        {skillPackages.length > 0 ? (
          <section className="grid gap-6 sm:grid-cols-2">
            {skillPackages.map((skill) => (
              <article
                key={skill.slug}
                className="section-panel flex flex-col overflow-hidden px-6 py-6 sm:px-8"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/45">
                  Skill package
                </p>
                <h2 className="mt-2 font-body text-xl font-semibold tracking-[-0.01em] text-ink">
                  {skill.name}
                </h2>
                <p className="mt-2 text-sm font-medium leading-6 text-accent">
                  {skill.tagline}
                </p>
                <p className="mt-3 flex-1 text-sm leading-6 text-ink/68">
                  {skill.description}
                </p>

                <div className="mt-5 overflow-x-auto whitespace-nowrap rounded-[0.9rem] border border-line/80 bg-mist/60 px-4 py-2.5 font-mono text-[12px] text-ink/70">
                  {skill.installPath}
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <a
                    href={skill.downloadHref}
                    download
                    className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-glow"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-none stroke-current stroke-[1.8]" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 3v12" />
                      <path d="m7 10 5 5 5-5" />
                      <path d="M5 21h14" />
                    </svg>
                    Download .zip
                  </a>
                  <a
                    href={skill.guideHref}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-line/80 bg-white px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-accent/40 hover:text-accent"
                  >
                    View guide
                  </a>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <p className="rounded-[1.35rem] border border-dashed border-line/80 px-6 py-10 text-center text-sm text-ink/68">
            No skill packages have been published yet. Check back soon.
          </p>
        )}
      </div>
    </main>
  );
}
