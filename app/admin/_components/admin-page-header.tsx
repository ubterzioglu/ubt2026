import type { ReactNode } from "react";

import { AdminIcon } from "@/app/admin/_components/admin-icon";
import { adminSecondaryButtonClass } from "@/app/admin/_components/form-classes";

interface AdminPageHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
  refreshHref?: string;
  children?: ReactNode;
}

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  refreshHref,
  children
}: Readonly<AdminPageHeaderProps>) {
  return (
    <header className="flex flex-col gap-4 border-b border-line/70 pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">{eyebrow}</p>
        <h1 className="mt-1 font-body text-2xl font-semibold tracking-[-0.02em] text-ink sm:text-[1.75rem]">
          {title}
        </h1>
        {description ? <p className="mt-1 text-sm text-ink/60">{description}</p> : null}
      </div>
      <div className="flex flex-wrap gap-2">
        {refreshHref ? (
          <a href={refreshHref} className={adminSecondaryButtonClass}>
            <AdminIcon name="refresh" size={16} />
            Refresh
          </a>
        ) : null}
        {children}
      </div>
    </header>
  );
}
