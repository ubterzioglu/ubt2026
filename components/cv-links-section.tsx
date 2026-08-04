import type { ReactNode } from "react";

import type { CvLink } from "@/types/site";

interface CvLinksSectionProps {
  links: readonly CvLink[];
}

function renderCvFlag(flagCode: CvLink["flagCode"]): ReactNode {
  if (flagCode === "de") {
    return (
      <svg viewBox="0 0 64 48" aria-hidden="true" className="h-12 w-[4.5rem] drop-shadow-[0_10px_18px_rgba(20,31,39,0.18)]">
        <defs>
          <clipPath id="flag-de-rounded">
            <rect x="0" y="0" width="64" height="48" rx="10" ry="10" />
          </clipPath>
        </defs>
        <g clipPath="url(#flag-de-rounded)">
          <rect width="64" height="16" y="0" fill="#111827" />
          <rect width="64" height="16" y="16" fill="#d62828" />
          <rect width="64" height="16" y="32" fill="#f4b400" />
        </g>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 64 48" aria-hidden="true" className="h-12 w-[4.5rem] drop-shadow-[0_10px_18px_rgba(20,31,39,0.18)]">
      <defs>
        <clipPath id="flag-uk-rounded">
          <rect x="0" y="0" width="64" height="48" rx="10" ry="10" />
        </clipPath>
      </defs>
      <g clipPath="url(#flag-uk-rounded)">
        <rect width="64" height="48" fill="#1f4aa8" />
        <path d="M0 6 6 0l58 42-6 6Z" fill="#fff" />
        <path d="M58 0 64 6 6 48 0 42Z" fill="#fff" />
        <path d="M0 9.5 9.5 0 64 38.5 54.5 48Z" fill="#cf142b" />
        <path d="M54.5 0 64 9.5 9.5 48 0 38.5Z" fill="#cf142b" />
        <rect x="26" width="12" height="48" fill="#fff" />
        <rect y="18" width="64" height="12" fill="#fff" />
        <rect x="28.5" width="7" height="48" fill="#cf142b" />
        <rect y="20.5" width="64" height="7" fill="#cf142b" />
      </g>
    </svg>
  );
}

export function CvLinksSection({ links }: CvLinksSectionProps) {
  return (
    <section id="my-cv" className="scroll-mt-24 px-4 py-4 sm:scroll-mt-28 sm:px-6 sm:py-5 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="section-panel overflow-hidden px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
          <h2 className="font-body text-[clamp(1.75rem,6vw,2.25rem)] font-semibold tracking-[-0.02em] text-ink">What Does UBT&apos;s CV Include?</h2>
          <div className="mt-6 h-px w-full bg-gradient-to-r from-accent/60 via-accent/30 to-transparent" />
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between gap-4 rounded-[1.35rem] border border-line/80 bg-gradient-to-br from-white to-mist/80 p-5 shadow-sm transition hover:-translate-y-1 hover:border-accent/45 hover:shadow-glow sm:rounded-[1.6rem] sm:p-6"
              >
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">PDF</p>
                  <h3 className="mt-3 font-body text-[clamp(1.4rem,5vw,1.875rem)] font-semibold text-ink">{link.label}</h3>
                </div>
                <span className="flex flex-none items-center justify-center">
                  {renderCvFlag(link.flagCode)}
                </span>
              </a>
            ))}
          </div>
          <details className="group mt-6 rounded-[1.35rem] border border-line/80 bg-paper/70 px-5 py-5">
            <summary className="flex cursor-pointer list-none select-none items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent/80">Drafts for you</p>
                <p className="mt-1 text-sm text-ink/55">2 CV template files available</p>
              </div>
              <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full border border-line/80 bg-paper text-ink/60 transition group-open:rotate-180">
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                  <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                </svg>
              </span>
            </summary>
            <div className="mt-4">
              <p className="mb-4 text-sm leading-6 text-ink/70">
                Download one of the CV draft templates to get started before submitting your review request.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://docs.google.com/document/d/15HZsBLxiA3hiSBkb-stllK__2PS74el8/export?format=docx"
                  className="inline-flex min-h-[40px] items-center gap-2 rounded-full border border-line/80 bg-white px-4 py-2 text-sm font-semibold text-ink shadow-sm transition hover:-translate-y-0.5 hover:border-accent/40 hover:text-accent"
                >
                  CV Draft (Deutsch) .docx
                </a>
                <a
                  href="https://docs.google.com/document/d/1545TJQCrahRcWanWjSKCv63UjxqDcKso/export?format=docx"
                  className="inline-flex min-h-[40px] items-center gap-2 rounded-full border border-line/80 bg-white px-4 py-2 text-sm font-semibold text-ink shadow-sm transition hover:-translate-y-0.5 hover:border-accent/40 hover:text-accent"
                >
                  CV Draft (English) .docx
                </a>
              </div>
            </div>
          </details>
        </div>
      </div>
    </section>
  );
}
