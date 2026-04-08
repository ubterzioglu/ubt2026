import type { CtaLink } from "@/types/site";

export const siteMeta = {
  name: "UBT",
  fullName: "Umut Barış Terzioğlu",
  role: "Senior Software Quality Assurance Engineer",
  location: "Dortmund, Germany",
  headline:
    "Editorial one-page portfolio for quality leadership, automation strategy, enterprise delivery, and practical engineering thinking.",
  intro:
    "I help teams build confidence in complex software\nthrough test strategy, automation, release discipline, and hands-on delivery support."
};

export const navigationItems = [
  { id: "my-cv", label: "My CV" },
  { id: "about-me", label: "About me" },
  { id: "key-achievements", label: "Key Achievements" },
  { id: "tech-stack", label: "Tech Stack" },
  { id: "experience", label: "Experience" },
  { id: "corporate-projects", label: "Corporate Projects" },
  { id: "private-projects", label: "Private Projects" },
  { id: "articles", label: "Articles" },
  { id: "my-bookmarks", label: "My Bookmarks" },
  { id: "book-appointment", label: "Book Appointment" },
  { id: "contact", label: "Contact" }
] as const;

export const heroActions: CtaLink[] = [
  { label: "View My CV", href: "#my-cv", variant: "primary" },
  { label: "Explore Tools", href: "#tools-developed-by-ubt", variant: "secondary" },
  { label: "Contact Me", href: "#contact", variant: "ghost" }
];
