import type { CtaLink } from "@/types/site";

export const siteMeta = {
  name: "UBT",
  fullName: "Umut Barış Terzioğlu",
  role: "Senior Software Quality Assurance Engineer",
  location: "Dortmund, Germany",
  headline:
    "Editorial one-page portfolio for quality leadership, automation strategy, enterprise delivery, and practical engineering thinking."
};

export const heroKeywords = [
  "Quality Leadership",
  "Test Strategy",
  "Automation",
  "Release Discipline",
  "Team Mentoring"
] as const;

export const navigationItems = [
  { id: "my-cv", label: "My CV" },
  { id: "about-me", label: "About me" },
  { id: "key-achievements", label: "Key Achievements" },
  { id: "tech-stack", label: "Tech Stack" },
  { id: "experience", label: "Experience" },
  { id: "corporate-projects", label: "Project" },
  { id: "articles", label: "Articles" },
  { id: "cv-review", label: "CV Review" },
  { id: "book-appointment", label: "Book Appointment" },
  { id: "contact", label: "Contact" }
] as const;

export const heroActions: CtaLink[] = [
  { label: "View My CV", href: "#my-cv", variant: "primary" },
  { label: "Contact", href: "#contact", variant: "secondary" },
  { label: "Appointment", href: "#book-appointment", variant: "ghost" },
  { label: "Key Achievements", href: "#key-achievements", variant: "ghost" }
];
