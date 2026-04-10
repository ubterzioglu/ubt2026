import type { NewsUpdateItem } from "@/types/site";

export const fallbackNewsUpdates: NewsUpdateItem[] = [
  {
    id: "news-update-1",
    title: "Portfolio refresh in progress",
    summary:
      "The homepage is being refined section by section with stronger mobile behavior and cleaner storytelling.",
    imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop&auto=format&q=80",
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
    imageUrl: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=600&h=400&fit=crop&auto=format&q=80",
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
    imageUrl: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop&auto=format&q=80",
    detailHref: "/#articles",
    sortOrder: 30,
    isPublished: true,
    createdAt: new Date("2026-04-09").toISOString()
  }
];
