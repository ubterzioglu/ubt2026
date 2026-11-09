"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { AdminIcon } from "@/app/admin/_components/admin-icon";
import { ADMIN_SECTIONS } from "@/app/admin/_components/admin-routes";

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
