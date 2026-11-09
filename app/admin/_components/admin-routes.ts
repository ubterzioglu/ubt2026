import type { Route } from "next";

import type { AdminIconName } from "@/app/admin/_components/admin-icon";

export interface AdminSection {
  href: Route;
  label: string;
  icon: AdminIconName;
}

export const ADMIN_SECTIONS: readonly AdminSection[] = [
  { href: "/admin", label: "Overview", icon: "overview" },
  { href: "/admin/appointments", label: "Appointments", icon: "inbox" },
  { href: "/admin/slots", label: "Slots", icon: "calendar" },
  { href: "/admin/news", label: "News", icon: "news" },
  { href: "/admin/blog", label: "Blog", icon: "pen" },
  { href: "/admin/bookmarks", label: "Bookmarks", icon: "bookmark" }
];

/**
 * "super-admin" pages sit behind their own password but open without a prompt
 * for anyone holding an admin session (see isSuperAdmin in lib/admin-auth.ts);
 * "password" pages ignore that session and always ask; "public" pages are ungated.
 */
export type BoardAccess = "super-admin" | "password" | "public";

export interface BoardRoute {
  href: string;
  label: string;
  access: BoardAccess;
}

export const BOARD_ACCESS_LABEL: Record<BoardAccess, string> = {
  "super-admin": "Super",
  password: "Pass",
  public: "Public"
};

export const BOARD_ROUTES: readonly BoardRoute[] = [
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
