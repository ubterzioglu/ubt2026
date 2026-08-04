interface OtherRoute {
  href: string;
  label: string;
  /**
   * Whether the page sits behind its own password gate. Gated pages open
   * without a prompt for anyone holding an admin session (see isSuperAdmin in
   * lib/admin-auth.ts); the badge says so, so the row also documents which
   * pages are public.
   */
  gated: boolean;
}

const OTHER_ROUTES: OtherRoute[] = [
  { href: "/bakcakanat", label: "Bakçakanat", gated: true },
  { href: "/batubt", label: "Batu UBT", gated: true },
  { href: "/buyorbye", label: "Buy or Bye", gated: false },
  { href: "/buyorbyetr", label: "Buy or Bye (TR)", gated: false },
  { href: "/detrbridge", label: "detrbridge", gated: true },
  { href: "/dm", label: "DM board", gated: true },
  { href: "/elif", label: "Elif", gated: true },
  { href: "/holiday", label: "Holiday", gated: false },
  { href: "/sandbox", label: "Sandbox", gated: false },
  { href: "/skillubt", label: "Skill UBT", gated: false },
  { href: "/smellable", label: "Smellable", gated: false },
  { href: "/ubtsa", label: "UBT SA", gated: true },
  { href: "/zats", label: "Zats", gated: false },
  { href: "/zpath", label: "Zpath", gated: false }
];

/**
 * Every non-admin page, one per row. Rows beat the previous chip cloud here:
 * the list is scanned top-to-bottom, and each row has space for the path and
 * its gate status alongside the label.
 */
export function RouteList() {
  return (
    <section className="section-panel px-6 py-6 sm:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sunrise">
        Other routes
      </p>
      <h2 className="mt-2 font-body text-2xl font-semibold text-ink">
        All pages
      </h2>
      <ul className="mt-5 divide-y divide-line/70 border-t border-line/70">
        {OTHER_ROUTES.map((route) => (
          <li key={route.href}>
            <a
              href={route.href}
              className="group flex min-h-[56px] items-center justify-between gap-4 px-1 py-3 transition hover:text-accent"
            >
              <span className="min-w-0">
                <span className="block truncate text-base font-semibold text-ink transition group-hover:text-accent">
                  {route.label}
                </span>
                <span className="mt-0.5 block truncate font-mono text-xs text-ink/55">
                  {route.href}
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-3">
                <span
                  className={
                    route.gated
                      ? "rounded-full bg-accent/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-accent"
                      : "rounded-full bg-paper px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/60"
                  }
                >
                  {route.gated ? "Super admin" : "Public"}
                </span>
                <svg
                  aria-hidden
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-ink/30 transition group-hover:translate-x-0.5 group-hover:text-accent"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
