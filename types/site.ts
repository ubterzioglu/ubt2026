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
  "cv-review",
  "book-appointment",
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
  imageUrl?: string | null;
  href: string | null;
  badge: string | null;
  sortOrder: number;
  isPublished: boolean;
  createdAt: string;
}

export interface NewsUpdateItem {
  id: string;
  title: string;
  summary: string;
  imageUrl: string | null;
  detailHref: string | null;
  sortOrder: number;
  isPublished: boolean;
  createdAt: string;
}

export interface BlogPostItem {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  coverImageUrl: string | null;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ProjectTaskStatus = "todo" | "in_progress" | "done" | "blocked";
export type ProjectTaskPriority = "low" | "normal" | "high" | "top5";

export interface ProjectTaskItem {
  id: string;
  title: string;
  owner: string;
  category: string;
  status: ProjectTaskStatus;
  priority: ProjectTaskPriority;
  dueTarget: string;
  notes: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export type TestFindingStatus =
  | "open"
  | "investigating"
  | "resolved"
  | "wontfix";
export type TestFindingSeverity = "low" | "normal" | "high" | "critical";

export interface TestFindingItem {
  id: string;
  title: string;
  area: string;
  owner: string;
  status: TestFindingStatus;
  severity: TestFindingSeverity;
  /** Signed URL for the screenshot, or null when none is attached. */
  screenshotUrl: string | null;
  commentCount: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface FindingComment {
  id: string;
  findingId: string;
  body: string;
  author: string;
  createdAt: string;
}

/** Social platforms a content post can be marked as shared on. */
export type SocialPlatform = "instagram" | "facebook" | "x" | "tiktok";

export const SOCIAL_PLATFORMS: readonly SocialPlatform[] = [
  "instagram",
  "facebook",
  "x",
  "tiktok"
];

/**
 * A DesireMap content post (Instagram caption + Canva prompt) shown on the
 * `/dm` "İçerik" board. `shared` tracks, per platform, whether it has been
 * posted — the icon turns green once toggled on.
 */
export interface SocialPostItem {
  id: string;
  postNumber: number;
  category: string;
  title: string;
  summary: string;
  canvaPrompt: string;
  instagramCaption: string;
  shared: Record<SocialPlatform, boolean>;
  createdAt: string;
  updatedAt: string;
}

export type FooterClientStatus = "pending" | "added" | "verified";

export interface FooterClientItem {
  id: string;
  clientName: string;
  domain: string;
  owner: string;
  responsible: string;
  footerCode: string;
  status: FooterClientStatus;
  notes: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CtaLink {
  label: string;
  href: string;
  variant?: "primary" | "secondary" | "ghost";
}

export interface CvLink {
  label: string;
  href: string;
  note: string;
  flagCode: "uk" | "de";
}

export interface AchievementMetric {
  value: string;
  label: string;
}

export interface AchievementBullet {
  text: string;
}

export interface StackItem {
  name: string;
  logo?: string;
}

export interface StackGroup {
  title: string;
  items: StackItem[];
}

export interface ExperienceItem {
  company: string;
  role: string;
  period: string;
  location: string;
  summary: string;
  highlights: string[];
  logo?: string;
}

export interface ArticleItem {
  category: "articles";
  title: string;
  summary: string;
  imageUrl?: string | null;
  href: string | null;
  badge?: string;
}

export interface BookmarkItem {
  category: "bookmarks";
  title: string;
  summary: string;
  imageUrl?: string | null;
  href: string | null;
  badge?: string;
}

export interface AppToolItem {
  category: "apps" | "tools";
  title: string;
  summary: string;
  imageUrl?: string | null;
  href: string | null;
  badge?: string;
}

export interface ProjectItem {
  title: string;
  label: string;
  summary: string;
  image?: string;
}

export interface ContactItem {
  label: string;
  value: string;
  href: string;
}

export interface AboutSection {
  title: string;
  items: string[];
}
