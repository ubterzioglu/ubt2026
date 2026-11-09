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

export const BOARDS_OVERVIEW_HREF = "/admin/boards" as Route;

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
  description: string;
}

export const BOARD_ACCESS_HINT: Record<BoardAccess, string> = {
  "super-admin": "Opens directly with your admin session.",
  password: "Always asks for its own password.",
  public: "Open to everyone, no gate."
};

export const BOARD_ACCESS_LABEL: Record<BoardAccess, string> = {
  "super-admin": "Super",
  password: "Pass",
  public: "Public"
};

export const BOARD_ROUTES: readonly BoardRoute[] = [
  { href: "/bakcakanat", label: "Bakçakanat", access: "super-admin", description: "Akçakanat domain yönetimi" },
  { href: "/batubt", label: "Batu UBT", access: "super-admin", description: "BatuBT footer yönetimi" },
  { href: "/buyorbye", label: "Buy or Bye", access: "public", description: "Purchase decision helper" },
  { href: "/buyorbyetr", label: "Buy or Bye (TR)", access: "public", description: "Satın alma karar asistanı (TR)" },
  { href: "/detrbridge", label: "detrbridge", access: "super-admin", description: "Logo seçimi" },
  { href: "/dm", label: "DM board", access: "super-admin", description: "Görevler ve kullanım rehberi" },
  { href: "/elif", label: "Elif", access: "super-admin", description: "ZELIFS" },
  { href: "/holiday", label: "Holiday", access: "public", description: "TR 2026 tatil hesaplayıcı" },
  { href: "/newdragoman", label: "New Dragoman", access: "password", description: "dragoman-turkey.com yenileme önerisi" },
  { href: "/sandbox", label: "Sandbox", access: "public", description: "Standalone HTML notes, handouts and resources" },
  { href: "/skillubt", label: "Skill UBT", access: "public", description: "Requirements interview skill guide" },
  { href: "/smellable", label: "Smellable", access: "public", description: "An app you can smell" },
  { href: "/ubtsa", label: "UBT SA", access: "super-admin", description: "Weiterbildung ve iş birliği konsepti" },
  { href: "/zats", label: "Zats", access: "public", description: "ATS readability score" },
  { href: "/zpath", label: "Zpath", access: "public", description: "Career decision check (yes / no)" }
];
