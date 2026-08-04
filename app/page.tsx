import type { Metadata } from "next";
import type { Route } from "next";
import { revalidatePath } from "next/cache";
import Image from "next/image";
import { redirect } from "next/navigation";

import { AboutAccordion } from "@/components/about-accordion";
import { BookmarksList } from "@/components/bookmarks-list";
import { BookingForm } from "@/components/appointment/booking-form";
import { ContactSection } from "@/components/contact-section";
import { CvLinksSection } from "@/components/cv-links-section";
import { CvReviewForm } from "@/components/cv-review-form";
import { CvReviewQueueSection } from "@/components/cv-review-queue-section";
import { ExperienceSection } from "@/components/experience-section";
import { FaqSection } from "@/components/faq-section";
import { FeaturedGrid } from "@/components/featured-grid";
import { HeroSection } from "@/components/hero-section";
import { JsonLd } from "@/components/json-ld";
import { NewsUpdatesCarousel } from "@/components/news-updates-carousel";
import { ScrollToTop } from "@/components/scroll-to-top";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { TechStack } from "@/components/tech-stack";

import { buildMetadata } from "@/lib/seo";
import { buildBreadcrumbSchema, buildFaqSchema, buildSpeakableSchema } from "@/lib/structured-data";
import { fallbackArticles, fallbackBookmarks, fallbackTools } from "@/content/featured";
import { fallbackNewsUpdates } from "@/content/news-updates";
import {
  achievementBullets,
  achievementMetrics,
  aboutParagraphs,
  aboutIntroParagraph,
  achievementsIntroParagraph,
  comparisonTableData,
  contactItems,
  corporateProjects,
  corporateProjectsIntroParagraph,
  cvLinks,
  experienceItems,
  faqItems,
  geoLinks,
  methodologyText,
  privateProjects,
  privateProjectsIntroParagraph,
  stackGroups,
  techStackIntroParagraph
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
import type { FeaturedItem, NewsUpdateItem } from "@/types/site";

export const metadata: Metadata = buildMetadata({
  title: "Umut Barış Terzioğlu — Senior QA Engineer, Germany",
  description:
    "Portfolio of Umut Barış Terzioğlu — Senior Software QA Engineer with 18+ years in test strategy, automation, enterprise delivery, and quality leadership.",
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
          buildFaqSchema(faqItems.map((item) => ({ question: item.question, answer: item.answer }))),
          buildSpeakableSchema()
        ]}
      />
      <SiteHeader />
      <HeroSection />
      <ScrollToTop />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-xs text-ink/40">
          Published <time dateTime="2026-04-06">April 6, 2026</time> · Last updated <time dateTime="2026-06-17">June 17, 2026</time>
        </p>
      </div>

      <section id="news-updates" className="scroll-mt-24 px-4 py-4 sm:scroll-mt-28 sm:px-6 sm:py-5 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="section-panel overflow-hidden px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
            <h2 className="font-body text-[clamp(1.75rem,6vw,2.25rem)] font-semibold tracking-[-0.02em] text-ink">
              What Is New?
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
            <h2 className="font-body text-[clamp(1.75rem,6vw,2.25rem)] font-semibold tracking-[-0.02em] text-ink">Who Is Umut Barış Terzioglu?</h2>
            <div className="mt-6 h-px w-full bg-gradient-to-r from-accent/60 via-accent/30 to-transparent" />
            <p className="mt-6 max-w-3xl text-sm leading-7 text-ink/68">{aboutIntroParagraph}</p>
            <div className="mt-8">
              <AboutAccordion sections={aboutParagraphs} />
            </div>
          </div>
        </div>
      </section>

      <CvLinksSection links={cvLinks} />

      <section id="key-achievements" className="scroll-mt-24 px-4 py-4 sm:scroll-mt-28 sm:px-6 sm:py-5 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="section-panel overflow-hidden px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
            <h2 className="font-body text-[clamp(1.75rem,6vw,2.25rem)] font-semibold tracking-[-0.02em] text-ink">What Are UBT&apos;s Key Achievements?</h2>
            <div className="mt-6 h-px w-full bg-gradient-to-r from-accent/60 via-accent/30 to-transparent" />
            <p className="mt-6 max-w-3xl text-sm leading-7 text-ink/68">{achievementsIntroParagraph}</p>
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
            <h2 className="font-body text-[clamp(1.75rem,6vw,2.25rem)] font-semibold tracking-[-0.02em] text-ink">Which Tools Has UBT Developed?</h2>
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
            <TechStack stackGroups={stackGroups} introParagraph={techStackIntroParagraph} />
            <div className="mt-8 overflow-x-auto">
              <table className="w-full text-sm text-ink/74">
                <caption className="mb-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                  {comparisonTableData.caption}
                </caption>
                <thead>
                  <tr className="border-b border-line/60">
                    {comparisonTableData.headers.map((header) => (
                      <th key={header} scope="col" className="px-3 py-3 text-left font-semibold text-ink">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparisonTableData.rows.map((row) => (
                    <tr key={row[0]} className="border-b border-line/30">
                      {row.map((cell, i) => (
                        <td key={`${row[0]}-${i}`} className={`px-3 py-2.5 ${i === 0 ? "font-medium text-ink" : ""}`}>
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <ExperienceSection items={experienceItems} />

      <section id="corporate-projects" className="scroll-mt-24 px-4 py-4 sm:scroll-mt-28 sm:px-6 sm:py-5 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="section-panel overflow-hidden px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
            <h2 className="font-body text-[clamp(1.75rem,6vw,2.25rem)] font-semibold tracking-[-0.02em] text-ink">Which Corporate Projects Has UBT Delivered?</h2>
            <div className="mt-6 h-px w-full bg-gradient-to-r from-accent/60 via-accent/30 to-transparent" />
            <p className="mt-6 max-w-3xl text-sm leading-7 text-ink/68">{corporateProjectsIntroParagraph}</p>
            <div className="mt-8 flex flex-col gap-4">
              {corporateProjects.map((project) => (
                <article key={project.title} className="flex flex-col gap-4 rounded-[1.35rem] border border-line/80 bg-white/82 p-5 sm:flex-row sm:items-center sm:justify-between sm:rounded-[1.55rem] sm:p-6">
                  <div className="flex-1 sm:pr-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">{project.label}</p>
                    <h3 className="mt-2 font-body text-[clamp(1.35rem,4.8vw,1.5rem)] font-semibold text-ink">{project.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-ink/68">{project.summary}</p>
                  </div>
                  {project.image && (
                    <figure className="flex-shrink-0 text-center">
                      <Image
                        src={`/corporate/${project.image}`}
                        alt={`${project.title} — ${project.label} project`}
                        width={120}
                        height={120}
                        className="mx-auto h-24 w-24 rounded-full border border-line/50 object-cover shadow-sm sm:h-28 sm:w-28"
                      />
                      <figcaption className="mt-2 text-[0.65rem] leading-4 text-ink/45">{project.title} — {project.label}</figcaption>
                    </figure>
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
            <h2 className="font-body text-[clamp(1.75rem,6vw,2.25rem)] font-semibold tracking-[-0.02em] text-ink">What Side Projects Does UBT Build?</h2>
            <div className="mt-6 h-px w-full bg-gradient-to-r from-accent/60 via-accent/30 to-transparent" />
            <p className="mt-6 max-w-3xl text-sm leading-7 text-ink/68">{privateProjectsIntroParagraph}</p>
            <div className="mt-8 flex flex-col gap-4">
              {privateProjects.map((project) => (
                <article key={project.title} className="flex flex-col gap-4 rounded-[1.35rem] border border-line/80 bg-white/82 p-5 sm:flex-row sm:items-center sm:justify-between sm:rounded-[1.55rem] sm:p-6">
                  <div className="flex-1 sm:pr-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">{project.label}</p>
                    <h3 className="mt-2 font-body text-[clamp(1.35rem,4.8vw,1.5rem)] font-semibold text-ink">{project.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-ink/68">{project.summary}</p>
                  </div>
                  {project.image && (
                    <figure className="flex-shrink-0 text-center">
                      <Image
                        src={`/private/${project.image}`}
                        alt={`${project.title} — ${project.label}`}
                        width={120}
                        height={120}
                        className="mx-auto h-24 w-24 rounded-full border border-line/50 object-cover shadow-sm sm:h-28 sm:w-28"
                      />
                      <figcaption className="mt-2 text-[0.65rem] leading-4 text-ink/45">{project.title} — {project.label}</figcaption>
                    </figure>
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
            <h2 className="font-body text-[clamp(1.75rem,6vw,2.25rem)] font-semibold tracking-[-0.02em] text-ink">What Articles Has UBT Published?</h2>
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
            <h2 className="font-body text-[clamp(1.75rem,6vw,2.25rem)] font-semibold tracking-[-0.02em] text-ink">What Bookmarks Does UBT Recommend?</h2>
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
              How Can You Book an Appointment?
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
              How Does the Free CV Review Work?
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

      <section id="qa-approach" className="scroll-mt-24 px-4 py-4 sm:scroll-mt-28 sm:px-6 sm:py-5 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="section-panel overflow-hidden px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
            <h2 className="font-body text-[clamp(1.75rem,6vw,2.25rem)] font-semibold tracking-[-0.02em] text-ink">How Does UBT Approach Quality Assurance?</h2>
            <div className="mt-6 h-px w-full bg-gradient-to-r from-accent/60 via-accent/30 to-transparent" />
            <p className="mt-6 max-w-3xl text-sm leading-7 text-ink/68">{methodologyText}</p>
            <h3 className="mt-8 font-body text-lg font-semibold text-ink">Common QA Challenges and How UBT Solves Them</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.35rem] border border-line/80 bg-white/82 p-5">
                <h4 className="text-sm font-semibold text-accent">Low Test Coverage</h4>
                <p className="mt-2 text-sm leading-6 text-ink/68">Systematic test design and risk-based prioritization raised Daimler Smaragd coverage from 50% to 90%, targeting the most critical paths first.</p>
              </div>
              <div className="rounded-[1.35rem] border border-line/80 bg-white/82 p-5">
                <h4 className="text-sm font-semibold text-accent">Slow Feedback Cycles</h4>
                <p className="mt-2 text-sm leading-6 text-ink/68">CI/CD pipeline integration with Jenkins and automated regression suites cut test execution time by 40%, delivering results in minutes instead of hours.</p>
              </div>
              <div className="rounded-[1.35rem] border border-line/80 bg-white/82 p-5">
                <h4 className="text-sm font-semibold text-accent">Tool Fragmentation</h4>
                <p className="mt-2 text-sm leading-6 text-ink/68">Led migration from HP ALM to Jira/Xray, consolidating test management into a single platform and reducing manual effort across teams.</p>
              </div>
              <div className="rounded-[1.35rem] border border-line/80 bg-white/82 p-5">
                <h4 className="text-sm font-semibold text-accent">Knowledge Silos</h4>
                <p className="mt-2 text-sm leading-6 text-ink/68">Mentored 30+ QA colleagues across Daimler and Swisslog, creating shared documentation, training materials, and onboarding guides.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FaqSection items={faqItems} />
      <ContactSection contactItems={contactItems} geoLinks={geoLinks} />
      <SiteFooter />
    </main>
  );
}




