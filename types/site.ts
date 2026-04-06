export const SECTION_IDS = [
  "tools-developed-by-ubt",
  "my-cv",
  "about-me",
  "key-achievements",
  "tech-stack",
  "experience",
  "corporate-projects",
  "private-projects",
  "articles",
  "my-bookmarks",
  "useful-apps",
  "contact"
] as const;

export type SectionId = (typeof SECTION_IDS)[number];

export type FeaturedCategory =
  | "tools"
  | "articles"
  | "bookmarks"
  | "apps"
  | "private-projects";

export interface FeaturedItem {
  id: string;
  slug: string;
  category: FeaturedCategory;
  title: string;
  summary: string;
  href: string | null;
  badge: string | null;
  sortOrder: number;
  isPublished: boolean;
  createdAt: string;
}

export interface CtaLink {
  label: string;
  href: string;
  variant?: "primary" | "secondary" | "ghost";
}

export interface AchievementItem {
  value: string;
  label: string;
  detail: string;
}

export interface StackGroup {
  title: string;
  items: string[];
}

export interface ExperienceItem {
  company: string;
  role: string;
  period: string;
  location: string;
  summary: string;
  highlights: string[];
}

export interface ProjectItem {
  title: string;
  label: string;
  summary: string;
}

export interface ArticleItem {
  category: "articles";
  title: string;
  summary: string;
  href: string | null;
  badge?: string;
}

export interface BookmarkItem {
  category: "bookmarks";
  title: string;
  summary: string;
  href: string | null;
  badge?: string;
}

export interface AppToolItem {
  category: "apps" | "tools";
  title: string;
  summary: string;
  href: string | null;
  badge?: string;
}

export interface ContactItem {
  label: string;
  value: string;
  href: string;
}
