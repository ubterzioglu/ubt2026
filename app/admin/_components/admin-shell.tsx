import type { ReactNode } from "react";

import { adminSignOutAction } from "@/app/admin/_actions";
import { AdminIcon } from "@/app/admin/_components/admin-icon";
import { AdminMobileMenu, AdminNav } from "@/app/admin/_components/admin-nav";
import { BOARD_ACCESS_LABEL, BOARD_ROUTES } from "@/app/admin/_components/admin-routes";

function Brand() {
  return (
    <a href="/admin" className="flex items-center gap-2.5">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink text-xs font-bold tracking-wide text-white">
        UBT
      </span>
      <span className="leading-tight">
        <span className="block text-sm font-semibold text-ink">UBT Admin</span>
        <span className="block text-[11px] text-ink/50">Requests &amp; content</span>
      </span>
    </a>
  );
}

function BoardsGroup() {
  return (
    <details className="group/boards">
      <summary className="flex min-h-[40px] cursor-pointer list-none items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-ink/70 transition hover:bg-paper hover:text-ink [&::-webkit-details-marker]:hidden">
        <AdminIcon name="boards" className="text-ink/45" />
        <span className="flex-1">Boards</span>
        <span className="rounded-md bg-paper px-1.5 py-0.5 text-[11px] font-semibold text-ink/55">
          {BOARD_ROUTES.length}
        </span>
        <AdminIcon
          name="chevron"
          size={16}
          className="text-ink/40 transition-transform group-open/boards:rotate-180"
        />
      </summary>
      <ul className="mt-1 space-y-0.5 border-l border-line/70 pl-3 ml-5">
        {BOARD_ROUTES.map((route) => (
          <li key={route.href}>
            <a
              href={route.href}
              className="flex min-h-[34px] items-center justify-between gap-2 rounded-md px-2 py-1 text-[13px] text-ink/70 transition hover:bg-paper hover:text-accent"
            >
              <span className="truncate">{route.label}</span>
              <span
                className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] ${
                  route.access === "public" ? "bg-paper text-ink/50" : "bg-accent/10 text-accent"
                }`}
              >
                {BOARD_ACCESS_LABEL[route.access]}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </details>
  );
}

function SignOutButton() {
  return (
    <form action={adminSignOutAction}>
      <button
        type="submit"
        className="flex min-h-[40px] w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-ink/70 transition hover:bg-rose-50 hover:text-rose-700"
      >
        <AdminIcon name="logout" className="text-ink/45" />
        Sign out
      </button>
    </form>
  );
}

function NavigationBody() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/40">
          Workspace
        </p>
        <AdminNav />
      </div>
      <div>
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/40">
          Other pages
        </p>
        <BoardsGroup />
      </div>
    </div>
  );
}

interface AdminShellProps {
  children: ReactNode;
}

export function AdminShell({ children }: Readonly<AdminShellProps>) {
  return (
    <div className="min-h-screen bg-paper/50 lg:grid lg:grid-cols-[15.5rem_minmax(0,1fr)]">
      <aside className="hidden border-r border-line/80 bg-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">
        <div className="border-b border-line/70 px-5 py-4">
          <Brand />
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-5">
          <NavigationBody />
        </div>
        <div className="border-t border-line/70 px-3 py-3">
          <SignOutButton />
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-line/80 bg-white/95 px-4 py-2.5 backdrop-blur lg:hidden">
        <Brand />
        <AdminMobileMenu>
          <NavigationBody />
          <div className="mt-4 border-t border-line/70 pt-3">
            <SignOutButton />
          </div>
        </AdminMobileMenu>
      </header>

      <main id="main-content" className="min-w-0 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-6">{children}</div>
      </main>
    </div>
  );
}
