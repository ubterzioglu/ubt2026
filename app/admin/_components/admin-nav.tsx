"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { ReactNode } from "react";

import { AdminIcon } from "@/app/admin/_components/admin-icon";
import {
  ADMIN_SECTIONS,
  BOARD_ACCESS_LABEL,
  BOARD_ROUTES,
  BOARDS_OVERVIEW_HREF
} from "@/app/admin/_components/admin-routes";

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin") {
    return pathname === "/admin";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin sections">
      <ul className="space-y-0.5">
        {ADMIN_SECTIONS.map((section) => {
          const active = isActive(pathname, section.href);
          return (
            <li key={section.href}>
              <Link
                href={section.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-[40px] items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  active
                    ? "bg-accent/10 text-accent"
                    : "text-ink/70 hover:bg-paper hover:text-ink"
                }`}
              >
                <AdminIcon name={section.icon} className={active ? "text-accent" : "text-ink/45"} />
                {section.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/**
 * "Boards" opens the overview page on the right; the chevron alone toggles the
 * link list. Board links open in a new tab so the admin panel stays put.
 */
export function AdminBoardsGroup() {
  const pathname = usePathname();
  const active = isActive(pathname, BOARDS_OVERVIEW_HREF);
  const [open, setOpen] = useState(active);

  return (
    <div>
      <div
        className={`flex min-h-[40px] items-center rounded-lg transition ${
          active ? "bg-accent/10 text-accent" : "text-ink/70 hover:bg-paper hover:text-ink"
        }`}
      >
        <Link
          href={BOARDS_OVERVIEW_HREF}
          aria-current={active ? "page" : undefined}
          className="flex flex-1 items-center gap-3 py-2 pl-3 text-sm font-semibold"
        >
          <AdminIcon name="boards" className={active ? "text-accent" : "text-ink/45"} />
          <span className="flex-1">Boards</span>
          <span className="rounded-md bg-paper px-1.5 py-0.5 text-[11px] font-semibold text-ink/55">
            {BOARD_ROUTES.length}
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="admin-board-links"
          aria-label={open ? "Collapse board links" : "Expand board links"}
          className="flex h-10 w-9 shrink-0 items-center justify-center rounded-lg text-ink/40 hover:text-ink"
        >
          <AdminIcon
            name="chevron"
            size={16}
            className={`transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
      </div>
      {open ? (
        <ul id="admin-board-links" className="ml-5 mt-1 space-y-0.5 border-l border-line/70 pl-3">
          {BOARD_ROUTES.map((route) => (
            <li key={route.href}>
              <a
                href={route.href}
                target="_blank"
                rel="noopener noreferrer"
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
      ) : null}
    </div>
  );
}

interface AdminMobileMenuProps {
  children: ReactNode;
}

/**
 * Keyed on the pathname so the menu remounts closed after every navigation;
 * the admin layout persists across client navigations and would otherwise
 * leave it open.
 */
export function AdminMobileMenu({ children }: Readonly<AdminMobileMenuProps>) {
  const pathname = usePathname();

  return (
    <details key={pathname} className="group">
      <summary className="flex min-h-[44px] cursor-pointer list-none items-center gap-2 rounded-lg border border-line/80 bg-white px-3 text-sm font-semibold text-ink [&::-webkit-details-marker]:hidden">
        <AdminIcon name="menu" />
        Menu
      </summary>
      <div className="absolute inset-x-0 top-full max-h-[calc(100vh-4rem)] overflow-y-auto border-b border-line/80 bg-white px-4 pb-5 pt-3 shadow-panel">
        {children}
      </div>
    </details>
  );
}
