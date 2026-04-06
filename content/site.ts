import type { CtaLink, SectionId } from "@/types/site";

export const siteMeta = {
  name: "UBT",
  fullName: "Umut Baris Terzioglu",
  role: "Senior Software QA & Test Automation Engineer",
  location: "Dortmund, Germany",
  headline:
    "Editorial one-page portfolio for quality leadership, automation strategy, enterprise delivery, and practical engineering thinking.",
  intro:
    "I help teams build confidence in complex software through test strategy, automation, release discipline, and hands-on delivery support."
};

export const navigationItems: Array<{ id: SectionId; label: string }> = [
  { id: "tools-developed-by-ubt", label: "Tools Developed by UBT (me)" },
  { id: "my-cv", label: "My CV" },
  { id: "about-me", label: "About me" },
  { id: "key-achievements", label: "Key Achievements" },
  { id: "tech-stack", label: "Tech Stack" },
  { id: "experience", label: "Experience" },
  { id: "corporate-projects", label: "Corporate Projects" },
  { id: "private-projects", label: "Private Projects" },
  { id: "articles", label: "Articles" },
  { id: "my-bookmarks", label: "My Bookmarks" },
  { id: "useful-apps", label: "Useful Apps" },
  { id: "contact", label: "Contact" }
];

export const heroActions: CtaLink[] = [
  { label: "View My CV", href: "#my-cv", variant: "primary" },
  { label: "Explore Tools", href: "#tools-developed-by-ubt", variant: "secondary" },
  { label: "Contact Me", href: "#contact", variant: "ghost" }
];

export const heroQuickLinks: Array<{ id: SectionId; label: string }> = [
  { id: "about-me", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "articles", label: "Articles" },
  { id: "my-bookmarks", label: "Bookmarks" },
  { id: "useful-apps", label: "Useful Apps" }
];
