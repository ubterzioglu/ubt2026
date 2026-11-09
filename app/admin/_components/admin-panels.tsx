import type { ReactNode } from "react";

import { AdminIcon } from "@/app/admin/_components/admin-icon";
import { adminPanelClass } from "@/app/admin/_components/form-classes";

interface AdminDisclosureProps {
  id?: string;
  title: string;
  description?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

/**
 * Collapsible form panel built on native details so pages stay server
 * components. Used for "create" forms that would otherwise push the list
 * below the fold.
 */
export function AdminDisclosure({
  id,
  title,
  description,
  defaultOpen = false,
  children
}: Readonly<AdminDisclosureProps>) {
  return (
    <details id={id} open={defaultOpen} className={`${adminPanelClass} group scroll-mt-20`}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent">
            <AdminIcon name="plus" size={16} />
          </span>
          <span>
            <span className="block text-sm font-semibold text-ink">{title}</span>
            {description ? <span className="block text-xs text-ink/55">{description}</span> : null}
          </span>
        </span>
        <AdminIcon
          name="chevron"
          className="shrink-0 text-ink/40 transition-transform group-open:rotate-180"
        />
      </summary>
      <div className="border-t border-line/70 px-5 py-5">{children}</div>
    </details>
  );
}

interface AdminListPanelProps {
  title: string;
  count: number;
  actions?: ReactNode;
  toolbar?: ReactNode;
  columns?: ReactNode;
  emptyMessage: string;
  children: ReactNode;
}

export function AdminListPanel({
  title,
  count,
  actions,
  toolbar,
  columns,
  emptyMessage,
  children
}: Readonly<AdminListPanelProps>) {
  return (
    <section className={adminPanelClass}>
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
          {title}
          <span className="rounded-md bg-paper px-1.5 py-0.5 text-xs font-semibold text-ink/55">
            {count}
          </span>
        </h2>
        {actions}
      </div>
      {toolbar ? <div className="border-t border-line/70 px-5 py-3">{toolbar}</div> : null}
      {count > 0 ? (
        <>
          {columns ? (
            <div className="hidden border-y border-line/70 bg-paper/60 px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink/50 md:block">
              {columns}
            </div>
          ) : null}
          <ul className={`divide-y divide-line/70 ${columns ? "" : "border-t border-line/70"}`}>
            {children}
          </ul>
        </>
      ) : (
        <p className="border-t border-line/70 px-5 py-10 text-center text-sm text-ink/55">
          {emptyMessage}
        </p>
      )}
    </section>
  );
}

export type BadgeTone = "neutral" | "accent" | "success" | "warning" | "info" | "danger";

const badgeToneClasses: Record<BadgeTone, string> = {
  neutral: "bg-paper text-ink/60 ring-line/80",
  accent: "bg-accent/10 text-accent ring-accent/20",
  success: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  warning: "bg-amber-50 text-amber-800 ring-amber-200",
  info: "bg-sky-50 text-sky-800 ring-sky-200",
  danger: "bg-rose-50 text-rose-800 ring-rose-200"
};

interface AdminBadgeProps {
  tone?: BadgeTone;
  children: ReactNode;
}

export function AdminBadge({ tone = "neutral", children }: Readonly<AdminBadgeProps>) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold capitalize ring-1 ring-inset ${badgeToneClasses[tone]}`}
    >
      {children}
    </span>
  );
}
