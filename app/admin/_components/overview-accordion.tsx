import type { ReactNode } from "react";

interface OverviewAccordionProps {
  /** Small uppercase label above the title. */
  eyebrow: string;
  /** Heading shown in the summary row. */
  title: string;
  /** Item count, surfaced in the summary so a collapsed panel still informs. */
  count: number;
  /** Full listing page this panel summarises. */
  viewAllHref: string;
  /** Label for the link to {@link viewAllHref}. */
  viewAllLabel?: string;
  children: ReactNode;
}

/**
 * One collapsible overview panel on the admin dashboard.
 *
 * Built on native <details> so the dashboard stays a Server Component with no
 * client JS. The shared `name` makes the panels an exclusive accordion — opening
 * one closes the others — which browsers without that support degrade to plain
 * independent accordions, so the content is reachable either way.
 */
export function OverviewAccordion({
  eyebrow,
  title,
  count,
  viewAllHref,
  viewAllLabel = "View all",
  children
}: OverviewAccordionProps) {
  return (
    <details name="admin-overview" className="section-panel group px-6 py-5 sm:px-8">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 [&::-webkit-details-marker]:hidden">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sunrise">
            {eyebrow}
          </p>
          <h2 className="mt-1.5 font-body text-2xl font-semibold text-ink">{title}</h2>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span className="rounded-full bg-paper px-3 py-1 text-xs font-semibold text-ink/72">
            {count}
          </span>
          <svg
            aria-hidden
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-ink/40 transition-transform duration-200 group-open:rotate-180"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </summary>

      <div className="mt-5 space-y-3">{children}</div>

      {/* Kept out of <summary>: a link there would toggle the panel on click. */}
      <a
        href={viewAllHref}
        className="mt-5 inline-flex text-sm font-semibold text-accent hover:text-accent/80"
      >
        {viewAllLabel}
      </a>
    </details>
  );
}
