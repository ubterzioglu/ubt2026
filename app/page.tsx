import type { ReactNode } from "react";
import type { Metadata } from "next";
import type { Route } from "next";
import { revalidatePath } from "next/cache";
import Image from "next/image";
import { redirect } from "next/navigation";

import { JsonLd } from "@/components/json-ld";
import { AboutAccordion } from "@/components/about-accordion";
import { BookingForm } from "@/components/appointment/booking-form";
import { CvReviewForm } from "@/components/cv-review-form";
import { CvReviewQueueSection } from "@/components/cv-review-queue-section";
import { BookmarksList } from "@/components/bookmarks-list";
import { FeaturedGrid } from "@/components/featured-grid";
import { HeroSection } from "@/components/hero-section";
import { NewsUpdatesCarousel } from "@/components/news-updates-carousel";
import { ScrollToTop } from "@/components/scroll-to-top";
import { buildMetadata } from "@/lib/seo";
import { buildBreadcrumbSchema, buildFaqSchema } from "@/lib/structured-data";

export const metadata: Metadata = buildMetadata({
  title: "Umut Barış Terzioğlu — Senior QA Engineer in Dortmund, Germany",
  description:
    "Portfolio of Umut Barış Terzioğlu — Senior Software QA Engineer with 15+ years in test strategy, automation, enterprise delivery, and quality leadership.",
  keywords: [
    "QA Engineer Germany",
    "Senior QA Engineer Dortmund",
    "Test Automation Expert",
    "Software Quality Assurance",
    "Selenium WebDriver",
    "Ranorex Automation",
    "CI/CD Testing",
    "Test Manager Germany",
    "Agile QA Engineer",
    "Umut Barış Terzioğlu"
  ],
  canonical: "/"
});
import { SiteHeader } from "@/components/site-header";
import { ExperienceSection } from "@/components/experience-section";
import { TechStack } from "@/components/tech-stack";
import { fallbackArticles, fallbackBookmarks, fallbackTools } from "@/content/featured";
import { fallbackNewsUpdates } from "@/content/news-updates";
import {
  achievementBullets,
  achievementMetrics,
  aboutParagraphs,
  contactItems,
  corporateProjects,
  cvLinks,
  experienceItems,
  privateProjects,
  stackGroups
} from "@/content/profile";
import {
  buildAppointmentSectionUrl,
  readAppointmentFeedbackTone,
  readSearchParam,
  type SearchParamsRecord
} from "@/lib/appointment-url";
import { createAppointment, getAvailableAppointmentSlots } from "@/lib/appointments";
import {
  buildCvReviewSectionUrl,
  buildCvReviewWhatsappLink,
  readCvReviewFeedbackTone
} from "@/lib/cv-review-url";
import { createCvReviewRequest, getCvReviewRequestById, getPublicCvReviewQueue } from "@/lib/cv-reviews";
import { sendNewBookingNotification } from "@/lib/email";
import { getFeaturedCollections } from "@/lib/featured-items";
import { getNewsUpdates } from "@/lib/news-updates";
import type { CvLink, FeaturedItem, NewsUpdateItem } from "@/types/site";

const contactIconMap = {
  WhatsApp: (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current sm:h-9 sm:w-9">
      <path d="M19.05 4.94A9.77 9.77 0 0 0 12.08 2C6.65 2 2.2 6.42 2.2 11.87c0 1.74.46 3.44 1.33 4.95L2 22l5.34-1.4a9.82 9.82 0 0 0 4.74 1.21h.01c5.43 0 9.91-4.42 9.91-9.88a9.8 9.8 0 0 0-2.95-6.99ZM12.09 20.1h-.01a8.11 8.11 0 0 1-4.12-1.13l-.3-.18-3.17.83.85-3.09-.2-.32a8.06 8.06 0 0 1-1.25-4.33c0-4.5 3.68-8.17 8.2-8.17 2.19 0 4.25.85 5.8 2.4a8.1 8.1 0 0 1 2.41 5.79c0 4.5-3.69 8.18-8.21 8.18Zm4.49-6.11c-.25-.12-1.47-.73-1.7-.81-.23-.08-.39-.12-.55.12-.16.23-.63.81-.77.97-.14.15-.29.17-.54.06-.25-.12-1.06-.39-2.01-1.25-.74-.66-1.24-1.48-1.39-1.73-.14-.23-.01-.36.11-.48.11-.11.25-.29.37-.43.12-.14.16-.24.24-.4.08-.15.04-.29-.02-.4-.06-.12-.55-1.33-.75-1.82-.2-.48-.4-.41-.55-.42h-.47c-.16 0-.41.06-.62.29-.22.23-.83.81-.83 1.97 0 1.16.85 2.29.96 2.45.12.15 1.68 2.56 4.08 3.59.57.25 1.02.4 1.37.51.57.18 1.09.15 1.5.09.46-.07 1.47-.6 1.67-1.18.2-.58.2-1.08.14-1.18-.05-.09-.2-.14-.44-.26Z" />
    </svg>
  ),
  LinkedIn: (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current sm:h-9 sm:w-9">
      <path d="M6.94 8.5H3.56V20h3.38V8.5ZM5.25 3C4.17 3 3.3 3.9 3.3 5.01c0 1.1.87 2 1.95 2 1.08 0 1.95-.9 1.95-2A1.98 1.98 0 0 0 5.25 3ZM20.7 12.98c0-3.2-1.7-4.68-3.97-4.68-1.83 0-2.65 1.02-3.1 1.73V8.5h-3.38V20h3.38v-6.18c0-1.63.31-3.2 2.29-3.2 1.95 0 1.98 1.84 1.98 3.3V20H21v-7.02h-.3Z" />
    </svg>
  ),
  Instagram: (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current sm:h-9 sm:w-9">
      <path d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9a5.5 5.5 0 0 1-5.5 5.5h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm0 1.8A3.7 3.7 0 0 0 3.8 7.5v9a3.7 3.7 0 0 0 3.7 3.7h9a3.7 3.7 0 0 0 3.7-3.7v-9a3.7 3.7 0 0 0-3.7-3.7h-9Zm9.65 1.35a1.05 1.05 0 1 1 0 2.1 1.05 1.05 0 0 1 0-2.1ZM12 6.85A5.15 5.15 0 1 1 6.85 12 5.15 5.15 0 0 1 12 6.85Zm0 1.8A3.35 3.35 0 1 0 15.35 12 3.35 3.35 0 0 0 12 8.65Z" />
    </svg>
  ),
  Email: (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-none stroke-current stroke-[1.6] sm:h-9 sm:w-9" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M22 7l-10 6L2 7" />
    </svg>
  ),
  Phone: (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-none stroke-current stroke-[1.6] sm:h-9 sm:w-9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  )
} as const satisfies Record<string, ReactNode>;

type CommunicationLabel = keyof typeof contactIconMap;

function hasContactIcon(label: string): label is CommunicationLabel {
  return label in contactIconMap;
}

function renderCvFlag(flagCode: CvLink["flagCode"]): ReactNode {
  if (flagCode === "de") {
    return (
      <svg viewBox="0 0 64 48" aria-hidden="true" className="h-12 w-[4.5rem] drop-shadow-[0_10px_18px_rgba(20,31,39,0.18)]">
        <defs>
          <clipPath id="flag-de-rounded">
            <rect x="0" y="0" width="64" height="48" rx="10" ry="10" />
          </clipPath>
        </defs>
        <g clipPath="url(#flag-de-rounded)">
          <rect width="64" height="16" y="0" fill="#111827" />
          <rect width="64" height="16" y="16" fill="#d62828" />
          <rect width="64" height="16" y="32" fill="#f4b400" />
        </g>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 64 48" aria-hidden="true" className="h-12 w-[4.5rem] drop-shadow-[0_10px_18px_rgba(20,31,39,0.18)]">
      <defs>
        <clipPath id="flag-uk-rounded">
          <rect x="0" y="0" width="64" height="48" rx="10" ry="10" />
        </clipPath>
      </defs>
      <g clipPath="url(#flag-uk-rounded)">
        <rect width="64" height="48" fill="#1f4aa8" />
        <path d="M0 6 6 0l58 42-6 6Z" fill="#fff" />
        <path d="M58 0 64 6 6 48 0 42Z" fill="#fff" />
        <path d="M0 9.5 9.5 0 64 38.5 54.5 48Z" fill="#cf142b" />
        <path d="M54.5 0 64 9.5 9.5 48 0 38.5Z" fill="#cf142b" />
        <rect x="26" width="12" height="48" fill="#fff" />
        <rect y="18" width="64" height="12" fill="#fff" />
        <rect x="28.5" width="7" height="48" fill="#cf142b" />
        <rect y="20.5" width="64" height="7" fill="#cf142b" />
      </g>
    </svg>
  );
}

function mapFallbackItems(items: Array<{
  category: FeaturedItem["category"];
  title: string;
  summary: string;
  imageUrl?: string | null;
  href: string | null;
  badge?: string;
}>): FeaturedItem[] {
  return items.map((item, index) => ({
    id: `${item.category}-${index + 1}`,
    slug: `${item.category}-${index + 1}`,
    category: item.category,
    title: item.title,
    summary: item.summary,
    imageUrl: item.imageUrl ?? null,
    href: item.href,
    badge: item.badge ?? null,
    sortOrder: index,
    isPublished: true,
    createdAt: new Date("2026-04-06").toISOString()
  }));
}

interface HomePageProps {
  searchParams?: Promise<SearchParamsRecord>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = searchParams ? await searchParams : {};
  const feedbackTone = readAppointmentFeedbackTone(params.status);
  const feedbackMessage = readSearchParam(params.message);
  const selectedSlotId = readSearchParam(params.slot);
  const cvFeedbackTone = readCvReviewFeedbackTone(params.cv_status);
  const cvFeedbackMessage = readSearchParam(params.cv_message);
  const cvRequestId = readSearchParam(params.cv_request);
  const [featuredCollections, slotsResult, newsUpdatesResult, cvReviewRequestResult, queueResult] =
    await Promise.all([
    getFeaturedCollections([
      "tools",
      "articles",
      "bookmarks",
      "private-projects"
    ]),
    getAvailableAppointmentSlots(),
    getNewsUpdates(),
    cvRequestId ? getCvReviewRequestById(cvRequestId) : Promise.resolve(null),
    getPublicCvReviewQueue()
  ]);

  async function submitBookingRequest(formData: FormData) {
    "use server";

    const slotId = String(formData.get("slotId") ?? "");
    const result = await createAppointment({
      slotId,
      fullName: String(formData.get("fullName") ?? ""),
      email: String(formData.get("email") ?? ""),
      company: String(formData.get("company") ?? ""),
      notes: String(formData.get("notes") ?? "")
    });

    if (!result.ok || !result.data) {
      redirect(
        buildAppointmentSectionUrl({
          status: "error",
          message: result.errorMessage ?? "Unable to submit the appointment request.",
          slotId
        }) as Route
      );
    }

    await sendNewBookingNotification(result.data);

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/slots");
    revalidatePath("/admin/appointments");

    redirect(
      buildAppointmentSectionUrl({
        status: "success",
        message: "Appointment request received. I will review it and follow up by email."
      }) as Route
    );
  }

  async function submitCvReviewRequest(formData: FormData) {
    "use server";

    const result = await createCvReviewRequest({
      fullName: String(formData.get("fullName") ?? ""),
      whatsappNumber: String(formData.get("whatsappNumber") ?? ""),
      linkedinUrl: String(formData.get("linkedinUrl") ?? "")
    });

    if (!result.ok || !result.data) {
      redirect(
        buildCvReviewSectionUrl({
          status: "error",
          message: result.errorMessage ?? "Unable to submit your CV review request."
        }) as Route
      );
    }

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/cv-reviews");

    redirect(
      buildCvReviewSectionUrl({
        status: "success",
        message: "Your CV review request is saved. Use WhatsApp below to send your CV file.",
        requestId: result.data.id
      }) as Route
    );
  }

  const tools = featuredCollections.itemsByCategory.tools.length
    ? featuredCollections.itemsByCategory.tools
    : mapFallbackItems(fallbackTools);
  const articles = featuredCollections.itemsByCategory.articles.length
    ? featuredCollections.itemsByCategory.articles
    : mapFallbackItems(fallbackArticles);
  const bookmarks = featuredCollections.itemsByCategory.bookmarks.length
    ? featuredCollections.itemsByCategory.bookmarks
    : mapFallbackItems(fallbackBookmarks);
  const newsUpdates: NewsUpdateItem[] =
    newsUpdatesResult.items.length > 0 ? newsUpdatesResult.items : fallbackNewsUpdates;
  const submittedCvReview = cvReviewRequestResult?.request ?? null;
  const cvWhatsappHref =
    cvFeedbackTone === "success" && submittedCvReview
      ? buildCvReviewWhatsappLink(submittedCvReview)
      : undefined;

  const fallbackSource =
    featuredCollections.source === "remote" ? undefined : featuredCollections.source;
  const communicationItems = contactItems.filter((item) => hasContactIcon(item.label));
  const fallbackFeedback =
    slotsResult.source === "env-missing"
      ? {
          tone: "error" as const,
          message:
            "Booking is temporarily unavailable because the Supabase service role key is not configured on the server."
        }
      : slotsResult.source === "error"
        ? {
            tone: "error" as const,
            message:
              slotsResult.errorMessage ??
              "Something went wrong while loading appointment slots."
          }
        : null;

  return (
    <main className="page-shell pb-16">
      <JsonLd
        id="json-ld-homepage"
        schema={[
          buildBreadcrumbSchema([{ name: "Home", href: "/" }]),
          buildFaqSchema([
            {
              question: "What does Umut Barış Terzioğlu do?",
              answer:
                "Umut Barış Terzioğlu is a Senior Software Quality Assurance Engineer with 15+ years of experience in test strategy, automation, enterprise delivery, and quality leadership."
            },
            {
              question: "Where is Umut Barış Terzioğlu based?",
              answer:
                "He is based in Dortmund, Germany and has been working in the German tech ecosystem since 2021."
            },
            {
              question: "What test automation tools does Umut Barış Terzioğlu use?",
              answer:
                "Selenium, Ranorex, TestNG, JUnit, Cucumber, Jenkins, Docker, Java, C#, Postman, and Jira/Xray among others."
            },
            {
              question: "Can I book an appointment with Umut Barış Terzioğlu?",
              answer:
                "Yes. You can book a free appointment directly through the booking section on this portfolio page."
            },
            {
              question: "Does Umut Barış Terzioğlu offer CV reviews?",
              answer:
                "Yes. He offers free CV reviews for software testers and QA professionals looking to improve their resumes for the German job market."
            }
          ])
        ]}
      />
      <SiteHeader />
      <HeroSection />
      <ScrollToTop />

      <section id="news-updates" className="scroll-mt-24 px-4 py-4 sm:scroll-mt-28 sm:px-6 sm:py-5 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="section-panel overflow-hidden px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
            <h2 className="font-body text-[clamp(1.75rem,6vw,2.25rem)] font-semibold tracking-[-0.02em] text-ink">
              News/Updates
            </h2>
            <div className="mt-6 h-px w-full bg-gradient-to-r from-accent/60 via-accent/30 to-transparent" />
            <div className="mt-8">
              <NewsUpdatesCarousel items={newsUpdates} />
            </div>
          </div>
        </div>
      </section>

      <section id="about-me" className="scroll-mt-24 px-4 py-4 sm:scroll-mt-28 sm:px-6 sm:py-5 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="section-panel overflow-hidden px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
            <h2 className="font-body text-[clamp(1.75rem,6vw,2.25rem)] font-semibold tracking-[-0.02em] text-ink">About me</h2>
            <div className="mt-6 h-px w-full bg-gradient-to-r from-accent/60 via-accent/30 to-transparent" />
            <div className="mt-8">
              <AboutAccordion sections={aboutParagraphs} />
            </div>
          </div>
        </div>
      </section>

      <section id="my-cv" className="scroll-mt-24 px-4 py-4 sm:scroll-mt-28 sm:px-6 sm:py-5 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="section-panel overflow-hidden px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
            <h2 className="font-body text-[clamp(1.75rem,6vw,2.25rem)] font-semibold tracking-[-0.02em] text-ink">My CV</h2>
            <div className="mt-6 h-px w-full bg-gradient-to-r from-accent/60 via-accent/30 to-transparent" />
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {cvLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between gap-4 rounded-[1.35rem] border border-line/80 bg-gradient-to-br from-white to-mist/80 p-5 shadow-sm transition hover:-translate-y-1 hover:border-accent/45 hover:shadow-glow sm:rounded-[1.6rem] sm:p-6"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">PDF</p>
                    <h3 className="mt-3 font-body text-[clamp(1.4rem,5vw,1.875rem)] font-semibold text-ink">{link.label}</h3>
                  </div>
                  <span className="flex flex-none items-center justify-center">
                    {renderCvFlag(link.flagCode)}
                  </span>
                </a>
              ))}
            </div>
            <details className="group mt-6 rounded-[1.35rem] border border-line/80 bg-paper/70 px-5 py-5">
              <summary className="flex cursor-pointer list-none select-none items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent/80">Drafts for you</p>
                  <p className="mt-1 text-sm text-ink/55">2 CV template files available</p>
                </div>
                <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full border border-line/80 bg-paper text-ink/60 transition group-open:rotate-180">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                    <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                  </svg>
                </span>
              </summary>
              <div className="mt-4">
                <p className="mb-4 text-sm leading-6 text-ink/70">
                  Download one of the CV draft templates to get started before submitting your review request.
                </p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href="https://docs.google.com/document/d/15HZsBLxiA3hiSBkb-stllK__2PS74el8/export?format=docx"
                    className="inline-flex min-h-[40px] items-center gap-2 rounded-full border border-line/80 bg-white px-4 py-2 text-sm font-semibold text-ink shadow-sm transition hover:-translate-y-0.5 hover:border-accent/40 hover:text-accent"
                  >
                    CV Draft (Deutsch) .docx
                  </a>
                  <a
                    href="https://docs.google.com/document/d/1545TJQCrahRcWanWjSKCv63UjxqDcKso/export?format=docx"
                    className="inline-flex min-h-[40px] items-center gap-2 rounded-full border border-line/80 bg-white px-4 py-2 text-sm font-semibold text-ink shadow-sm transition hover:-translate-y-0.5 hover:border-accent/40 hover:text-accent"
                  >
                    CV Draft (English) .docx
                  </a>
                </div>
              </div>
            </details>
          </div>
        </div>
      </section>

      <section id="key-achievements" className="scroll-mt-24 px-4 py-4 sm:scroll-mt-28 sm:px-6 sm:py-5 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="section-panel overflow-hidden px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
            <h2 className="font-body text-[clamp(1.75rem,6vw,2.25rem)] font-semibold tracking-[-0.02em] text-ink">Key Achievements</h2>
            <div className="mt-6 h-px w-full bg-gradient-to-r from-accent/60 via-accent/30 to-transparent" />
            <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-5">
              {achievementMetrics.map((metric) => (
                <article
                  key={metric.value}
                  className="flex aspect-square flex-col justify-center rounded-[1.35rem] border border-line/80 bg-gradient-to-br from-white via-paper to-mist/75 p-4 shadow-sm sm:rounded-[1.6rem] sm:p-5"
                >
                  <div>
                    <p className="font-body text-[clamp(1.8rem,6vw,2.7rem)] font-semibold leading-none tracking-[-0.04em] text-ink">
                      {metric.value}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-ink/72">
                      {metric.label}
                    </p>
                  </div>
                </article>
              ))}
            </div>
            <div className="mt-8 rounded-[1.55rem] border border-line/80 bg-white/82 px-5 py-5 sm:px-6 sm:py-6">
              <ul className="space-y-3 text-sm text-ink/74 sm:text-base">
                {achievementBullets.map((achievement) => (
                  <li
                    key={achievement.text}
                    className="flex items-start gap-3 leading-7 sm:leading-8"
                  >
                    <span className="mt-3 h-1.5 w-1.5 flex-none rounded-full bg-accent/75" />
                    <span>{achievement.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="tools-developed-by-ubt" className="scroll-mt-24 px-4 py-4 sm:scroll-mt-28 sm:px-6 sm:py-5 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="section-panel overflow-hidden px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
            <h2 className="font-body text-[clamp(1.75rem,6vw,2.25rem)] font-semibold tracking-[-0.02em] text-ink">Tools Developed by UBT (me)</h2>
            <div className="mt-6 h-px w-full bg-gradient-to-r from-accent/60 via-accent/30 to-transparent" />
            <div className="mt-8">
              <FeaturedGrid
                items={tools}
                sourceLabel={fallbackSource}
                emptyMessage="No tools are available yet."
                cardLayout="square"
              />
            </div>
          </div>
        </div>
      </section>

      <section id="tech-stack" className="scroll-mt-24 px-4 py-4 sm:scroll-mt-28 sm:px-6 sm:py-5 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="section-panel overflow-hidden px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
            <TechStack stackGroups={stackGroups} />
          </div>
        </div>
      </section>

      <ExperienceSection items={experienceItems} />

      <section id="corporate-projects" className="scroll-mt-24 px-4 py-4 sm:scroll-mt-28 sm:px-6 sm:py-5 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="section-panel overflow-hidden px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
            <h2 className="font-body text-[clamp(1.75rem,6vw,2.25rem)] font-semibold tracking-[-0.02em] text-ink">Corporate Projects</h2>
            <div className="mt-6 h-px w-full bg-gradient-to-r from-accent/60 via-accent/30 to-transparent" />
            <div className="mt-8 flex flex-col gap-4">
              {corporateProjects.map((project) => (
                <article key={project.title} className="flex flex-col gap-4 rounded-[1.35rem] border border-line/80 bg-white/82 p-5 sm:flex-row sm:items-center sm:justify-between sm:rounded-[1.55rem] sm:p-6">
                  <div className="flex-1 sm:pr-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">{project.label}</p>
                    <h3 className="mt-2 font-body text-[clamp(1.35rem,4.8vw,1.5rem)] font-semibold text-ink">{project.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-ink/68">{project.summary}</p>
                  </div>
                  {project.image && (
                    <div className="flex-shrink-0">
                      <Image 
                        src={`/corporate/${project.image}`} 
                        alt={project.title} 
                        width={120}
                        height={120}
                        className="h-24 w-24 rounded-full border border-line/50 object-cover shadow-sm sm:h-28 sm:w-28"
                      />
                    </div>
                  )}
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="private-projects" className="scroll-mt-24 px-4 py-4 sm:scroll-mt-28 sm:px-6 sm:py-5 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="section-panel overflow-hidden px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
            <h2 className="font-body text-[clamp(1.75rem,6vw,2.25rem)] font-semibold tracking-[-0.02em] text-ink">Private Projects</h2>
            <div className="mt-6 h-px w-full bg-gradient-to-r from-accent/60 via-accent/30 to-transparent" />
            <div className="mt-8 flex flex-col gap-4">
              {privateProjects.map((project) => (
                <article key={project.title} className="flex flex-col gap-4 rounded-[1.35rem] border border-line/80 bg-white/82 p-5 sm:flex-row sm:items-center sm:justify-between sm:rounded-[1.55rem] sm:p-6">
                  <div className="flex-1 sm:pr-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">{project.label}</p>
                    <h3 className="mt-2 font-body text-[clamp(1.35rem,4.8vw,1.5rem)] font-semibold text-ink">{project.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-ink/68">{project.summary}</p>
                  </div>
                  {project.image && (
                    <div className="flex-shrink-0">
                      <Image
                        src={`/private/${project.image}`}
                        alt={project.title}
                        width={120}
                        height={120}
                        className="h-24 w-24 rounded-full border border-line/50 object-cover shadow-sm sm:h-28 sm:w-28"
                      />
                    </div>
                  )}
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="articles" className="scroll-mt-24 px-4 py-4 sm:scroll-mt-28 sm:px-6 sm:py-5 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="section-panel overflow-hidden px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
            <h2 className="font-body text-[clamp(1.75rem,6vw,2.25rem)] font-semibold tracking-[-0.02em] text-ink">Articles</h2>
            <div className="mt-6 h-px w-full bg-gradient-to-r from-accent/60 via-accent/30 to-transparent" />
            <div className="mt-8">
              <FeaturedGrid
                items={articles}
                sourceLabel={fallbackSource}
                emptyMessage="No articles are available yet."
                cardLayout="square"
              />
            </div>
          </div>
        </div>
      </section>

      <section id="my-bookmarks" className="scroll-mt-24 px-4 py-4 sm:scroll-mt-28 sm:px-6 sm:py-5 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="section-panel overflow-hidden px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
            <h2 className="font-body text-[clamp(1.75rem,6vw,2.25rem)] font-semibold tracking-[-0.02em] text-ink">My Bookmarks</h2>
            <div className="mt-6 h-px w-full bg-gradient-to-r from-accent/60 via-accent/30 to-transparent" />
            <div className="mt-8">
              <BookmarksList
                items={bookmarks}
                sourceLabel={fallbackSource}
                emptyMessage="No bookmarks are available yet."
              />
            </div>
          </div>
        </div>
      </section>

      <section id="book-appointment" className="scroll-mt-24 px-4 py-4 sm:scroll-mt-28 sm:px-6 sm:py-5 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="section-panel overflow-hidden px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
            <h2 className="font-body text-[clamp(1.75rem,6vw,2.25rem)] font-semibold tracking-[-0.02em] text-ink">
              Book Appointment
            </h2>
            <div className="mt-6 h-px w-full bg-gradient-to-r from-accent/60 via-accent/30 to-transparent" />
            <div className="mt-8">
              <BookingForm
                action={submitBookingRequest}
                slots={slotsResult.slots}
                selectedSlotId={selectedSlotId}
                feedbackTone={feedbackTone || fallbackFeedback?.tone}
                feedbackMessage={feedbackMessage || fallbackFeedback?.message}
              />
            </div>
          </div>
        </div>
      </section>

      <section id="cv-review" className="scroll-mt-24 px-4 py-4 sm:scroll-mt-28 sm:px-6 sm:py-5 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="section-panel overflow-hidden px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
            <h2 className="font-body text-[clamp(1.75rem,6vw,2.25rem)] font-semibold tracking-[-0.02em] text-ink">
              CV Review
            </h2>
            <div className="mt-6 h-px w-full bg-gradient-to-r from-accent/60 via-accent/30 to-transparent" />
            <div className="mt-8">
              <CvReviewForm
                action={submitCvReviewRequest}
                feedbackTone={cvFeedbackTone}
                feedbackMessage={cvFeedbackMessage}
                whatsappHref={cvWhatsappHref}
                submittedRequest={submittedCvReview}
              />
              <CvReviewQueueSection result={queueResult} />
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="scroll-mt-24 px-4 py-4 sm:scroll-mt-28 sm:px-6 sm:py-5 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="section-panel flex min-h-[5rem] items-center justify-center overflow-hidden px-4 py-5 sm:min-h-[6rem] sm:px-8 sm:py-6">
            <div className="flex flex-nowrap items-center justify-center gap-2 sm:gap-5">
                {communicationItems.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target={item.href.startsWith("mailto:") || item.href.startsWith("tel:") ? undefined : "_blank"}
                    rel={item.href.startsWith("mailto:") || item.href.startsWith("tel:") ? undefined : "noreferrer"}
                    aria-label={item.label}
                    title={item.label}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line/80 bg-gradient-to-br from-white via-paper to-mist/75 text-ink shadow-[0_16px_30px_rgba(20,31,39,0.1)] transition hover:-translate-y-1 hover:border-accent/45 hover:bg-white hover:text-accent hover:shadow-glow active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35 sm:h-20 sm:w-20"
                  >
                    <span className="sr-only">{item.label}</span>
                    {contactIconMap[item.label as CommunicationLabel]}
                  </a>
                ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="px-4 pt-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl border-t border-line/70 py-8 text-center text-sm text-ink/55">
          | ©2026 | UBT | All rights reserved. | Without a test you cannot be the best! |
        </div>
      </footer>
    </main>
  );
}




