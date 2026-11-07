import type { ReactNode } from "react";

import { adminSignOutAction } from "@/app/admin/_actions";

interface AdminPageHeaderProps {
  eyebrow: string;
  title: string;
  refreshHref?: string;
  showBackLink?: boolean;
  children?: ReactNode;
}

export function AdminPageHeader({
  eyebrow,
  title,
  refreshHref,
  showBackLink = true,
  children
}: Readonly<AdminPageHeaderProps>) {
  return (
    <section className="section-panel px-6 py-6 sm:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
            {eyebrow}
          </p>
          <h1 className="mt-2 font-body text-[clamp(2rem,5vw,2.7rem)] font-semibold tracking-[-0.03em] text-ink">
            {title}
          </h1>
        </div>
        <div className="flex flex-wrap gap-3">
          {refreshHref ? (
            <a
              href={refreshHref}
              className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-line/80 bg-white px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-accent/40 hover:text-accent"
            >
              Refresh
            </a>
          ) : null}
          {showBackLink ? (
            <a
              href="/admin"
              className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-ink/92"
            >
              Back to dashboard
            </a>
          ) : null}
          {children}
          <form action={adminSignOutAction}>
            <button
              type="submit"
              className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-line/80 bg-white px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-rose-300 hover:text-rose-700"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
