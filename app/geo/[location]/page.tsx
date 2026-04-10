import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/json-ld";
import { geoLocations } from "@/content/geo";
import { buildMetadata, BASE_URL } from "@/lib/seo";
import {
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildLocalServiceSchema,
  buildPersonSchema,
  buildWebSiteSchema
} from "@/lib/structured-data";

export function generateStaticParams() {
  return geoLocations.map((loc) => ({ location: loc.slug }));
}

interface Props {
  params: Promise<{ location: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { location } = await params;
  const loc = geoLocations.find((l) => l.slug === location);

  if (!loc) {
    return buildMetadata({ noIndex: true });
  }

  return buildMetadata({
    title: loc.title,
    description: loc.description,
    keywords: loc.keywords,
    canonical: `/geo/${loc.slug}`
  });
}

export default async function GeoPage({ params }: Props) {
  const { location } = await params;
  const loc = geoLocations.find((l) => l.slug === location);

  if (!loc) notFound();

  const pageUrl = `${BASE_URL}/geo/${loc.slug}`;

  const schemas = [
    buildPersonSchema(),
    buildWebSiteSchema(),
    buildBreadcrumbSchema([
      { name: "Home", href: "/" },
      { name: "Locations", href: "/geo" },
      { name: loc.city, href: `/geo/${loc.slug}` }
    ]),
    buildLocalServiceSchema({
      city: loc.city,
      region: loc.region,
      countryCode: loc.countryCode,
      countryName: loc.country,
      latitude: loc.latitude,
      longitude: loc.longitude,
      pageUrl,
      description: loc.description
    }),
    buildFaqSchema(loc.faq)
  ];

  return (
    <>
      <JsonLd schema={schemas} id={`json-ld-geo-${loc.slug}`} />

      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex flex-wrap items-center gap-2 text-sm text-ink/50">
            <li>
              <a href="/" className="transition hover:text-accent">
                Home
              </a>
            </li>
            <li aria-hidden="true">/</li>
            <li className="font-semibold text-ink">
              {loc.city}, {loc.country}
            </li>
          </ol>
        </nav>

        <header className="mb-12">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            {loc.country} · {loc.region}
          </p>
          <h1 className="mb-5 text-3xl font-extrabold leading-tight text-ink sm:text-4xl">
            QA Engineering in {loc.city}
          </h1>
          <p className="text-base leading-7 text-ink/70">{loc.description}</p>
        </header>

        <section className="mb-12 rounded-[1.35rem] border border-line/60 bg-white/80 px-6 py-6">
          <h2 className="mb-3 text-lg font-bold text-ink">About This Location</h2>
          <p className="text-sm leading-7 text-ink/70">{loc.highlight}</p>
        </section>

        <section className="mb-12">
          <h2 className="mb-5 text-xl font-extrabold text-ink">Services Available</h2>
          <ul className="flex flex-col gap-3">
            {loc.services.map((service) => (
              <li
                key={service}
                className="flex items-start gap-3 rounded-[1rem] border border-line/60 bg-white/80 px-5 py-3 text-sm text-ink"
              >
                <span className="mt-0.5 text-accent" aria-hidden="true">
                  ✓
                </span>
                {service}
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="mb-5 text-xl font-extrabold text-ink">Frequently Asked Questions</h2>
          <dl className="flex flex-col gap-4">
            {loc.faq.map((item) => (
              <div
                key={item.question}
                className="rounded-[1.35rem] border border-line/60 bg-white/80 px-5 py-5"
              >
                <dt className="mb-2 text-sm font-bold text-ink">{item.question}</dt>
                <dd className="text-sm leading-7 text-ink/70">{item.answer}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="rounded-[1.35rem] border border-accent/20 bg-accent/5 px-6 py-6">
          <h2 className="mb-2 text-lg font-bold text-ink">Work Together</h2>
          <p className="mb-5 text-sm leading-7 text-ink/70">
            Available for test strategy reviews, automation consulting, and QA advisory in{" "}
            {loc.city}. Book a free appointment or send a message.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="/#book-appointment"
              className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Book Appointment
            </a>
            <a
              href="/#contact"
              className="rounded-full border border-line/60 bg-white/80 px-5 py-2.5 text-sm font-semibold text-ink transition hover:-translate-y-0.5"
            >
              Contact
            </a>
          </div>
        </section>
      </main>
    </>
  );
}
