interface OtherRoute {
  href: string;
  label: string;
  /**
   * How the page is reached. "super-admin" pages sit behind their own password
   * but open without a prompt for anyone holding an admin session (see
   * isSuperAdmin in lib/admin-auth.ts); "password" pages ignore that session
   * and always ask; "public" pages are ungated. The badge says which, so the
   * row documents the gate as well as the path.
   */
  access: "super-admin" | "password" | "public";
}

const ACCESS_LABEL: Record<OtherRoute["access"], string> = {
  "super-admin": "Super admin",
  password: "Password",
  public: "Public"
};

const OTHER_ROUTES: OtherRoute[] = [
  { href: "/bakcakanat", label: "Bakçakanat", access: "super-admin" },
  { href: "/batubt", label: "Batu UBT", access: "super-admin" },
  { href: "/buyorbye", label: "Buy or Bye", access: "public" },
  { href: "/buyorbyetr", label: "Buy or Bye (TR)", access: "public" },
  { href: "/detrbridge", label: "detrbridge", access: "super-admin" },
  { href: "/dm", label: "DM board", access: "super-admin" },
  { href: "/elif", label: "Elif", access: "super-admin" },
  { href: "/holiday", label: "Holiday", access: "public" },
  { href: "/newdragoman", label: "New Dragoman", access: "password" },
  { href: "/sandbox", label: "Sandbox", access: "public" },
  { href: "/skillubt", label: "Skill UBT", access: "public" },
  { href: "/smellable", label: "Smellable", access: "public" },
  { href: "/ubtsa", label: "UBT SA", access: "super-admin" },
  { href: "/zats", label: "Zats", access: "public" },
  { href: "/zpath", label: "Zpath", access: "public" }
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
                    route.access === "public"
                      ? "rounded-full bg-paper px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/60"
                      : "rounded-full bg-accent/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-accent"
                  }
                >
                  {ACCESS_LABEL[route.access]}
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
