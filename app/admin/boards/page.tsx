import { isAdminAuthenticated } from "@/lib/admin-auth";
import { AdminGate } from "@/app/admin/_components/admin-gate";
import { AdminIcon } from "@/app/admin/_components/admin-icon";
import { AdminPageHeader } from "@/app/admin/_components/admin-page-header";
import { AdminBadge } from "@/app/admin/_components/admin-panels";
import {
  BOARD_ACCESS_HINT,
  BOARD_ACCESS_LABEL,
  BOARD_ROUTES,
  BOARDS_OVERVIEW_HREF
} from "@/app/admin/_components/admin-routes";
import type { BoardAccess } from "@/app/admin/_components/admin-routes";
import { adminPanelClass } from "@/app/admin/_components/form-classes";

const ACCESS_ORDER: readonly BoardAccess[] = ["super-admin", "password", "public"];

export default async function AdminBoardsPage() {
  if (!(await isAdminAuthenticated())) {
    return <AdminGate redirectTo={BOARDS_OVERVIEW_HREF} />;
  }

  const counts = ACCESS_ORDER.map((access) => ({
    access,
    count: BOARD_ROUTES.filter((route) => route.access === access).length
  }));

  return (
    <>
      <AdminPageHeader
        eyebrow="Other pages"
        title="Boards"
        description={`${BOARD_ROUTES.length} standalone boards. Links open in a new tab.`}
      />

      <section className="grid gap-4 sm:grid-cols-3">
        {counts.map(({ access, count }) => (
          <div key={access} className={`${adminPanelClass} px-5 py-4`}>
            <p className="text-xs font-semibold text-ink/60">{BOARD_ACCESS_LABEL[access]}</p>
            <p className="mt-1 text-3xl font-semibold text-ink">{count}</p>
            <p className="mt-1 text-xs text-ink/55">{BOARD_ACCESS_HINT[access]}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {BOARD_ROUTES.map((route) => (
          <a
            key={route.href}
            href={route.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`${adminPanelClass} group flex flex-col gap-3 px-5 py-4 transition hover:border-accent/40`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="truncate text-sm font-semibold text-ink group-hover:text-accent">
                  {route.label}
                </h2>
                <p className="mt-0.5 font-mono text-xs text-ink/50">{route.href}</p>
              </div>
              <AdminIcon
                name="external"
                size={16}
                className="shrink-0 text-ink/35 group-hover:text-accent"
              />
            </div>
            <p className="text-sm text-ink/70">{route.description}</p>
            <div className="mt-auto flex items-center gap-2">
              <AdminBadge tone={route.access === "public" ? "neutral" : "accent"}>
                {BOARD_ACCESS_LABEL[route.access]}
              </AdminBadge>
              <span className="text-xs text-ink/50">{BOARD_ACCESS_HINT[route.access]}</span>
            </div>
          </a>
        ))}
      </section>
    </>
  );
}
