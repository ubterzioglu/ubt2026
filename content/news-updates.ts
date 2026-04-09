import type { NewsUpdateItem } from "@/types/site";

export const fallbackNewsUpdates: NewsUpdateItem[] = [
  {
    id: "news-update-1",
    title: "Portfolio refresh in progress",
    summary:
      "The homepage is being refined section by section with stronger mobile behavior and cleaner storytelling.",
    imageUrl: "/news/portfolio-refresh.svg",
    detailHref: null,
    sortOrder: 10,
    isPublished: true,
    createdAt: new Date("2026-04-09").toISOString()
  },
  {
    id: "news-update-2",
    title: "Booking flow now lives on the homepage",
    summary:
      "Appointment requests have moved into the homepage experience while keeping the same submit and feedback flow.",
    imageUrl: "/news/booking-live.svg",
    detailHref: "/#book-appointment",
    sortOrder: 20,
    isPublished: true,
    createdAt: new Date("2026-04-09").toISOString()
  },
  {
    id: "news-update-3",
    title: "QA content and tools continue to grow",
    summary:
      "More practical testing notes, small tools, and community-facing updates are being prepared for upcoming releases.",
    imageUrl: "/news/qa-notes.svg",
    detailHref: "/#articles",
    sortOrder: 30,
    isPublished: true,
    createdAt: new Date("2026-04-09").toISOString()
  }
];
