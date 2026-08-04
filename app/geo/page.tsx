import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/json-ld";
import { geoLocations } from "@/content/geo";
import { BASE_URL, buildMetadata } from "@/lib/seo";
import {
  buildBreadcrumbSchema,
  buildCollectionPageSchema,
  buildPersonSchema,
  buildWebSiteSchema
} from "@/lib/structured-data";

export const metadata: Metadata = buildMetadata({
  title: "QA Engineering Locations — Umut Barış Terzioğlu",
  description:
    "Location-focused QA engineering and test automation consulting pages for Dortmund, Germany, Frankfurt, Berlin, Hamburg, and Istanbul.",
  keywords: [
    "QA Engineer Germany",
    "QA Engineer Dortmund",
    "QA Consultant Germany",
    "Test Automation Germany",
    "Software Testing Germany"
  ],
  canonical: "/geo"
});

export default function GeoIndexPage() {
  const pageUrl = `${BASE_URL}/geo`;
  const itemUrls = geoLocations.map((location) => `${BASE_URL}/geo/${location.slug}`);

  return (
    <>
      <JsonLd
        id="json-ld-geo-index"
        schema={[
          buildPersonSchema(),
          buildWebSiteSchema(),
          buildBreadcrumbSchema([
            { name: "Home", href: "/" },
            { name: "Locations", href: "/geo" }
          ]),
          buildCollectionPageSchema({
            name: "QA Engineering Locations",
            description:
              "Location-focused QA engineering, test automation, and quality strategy consulting pages by Umut Barış Terzioğlu.",
            url: pageUrl,
            itemUrls
          })
        ]}
      />

      <main className="page-shell min-h-screen px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex flex-wrap items-center gap-2 text-sm text-ink/50">
              <li>
                <Link href="/" className="transition hover:text-accent">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="font-semibold text-ink">Locations</li>
            </ol>
          </nav>

          <section className="section-panel px-6 py-8 sm:px-10">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
              Local QA consulting
            </p>
            <h1 className="mt-3 font-body text-[clamp(2.2rem,6vw,3.2rem)] font-semibold tracking-[-0.03em] text-ink">
              QA Engineering Locations
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-ink/72 sm:text-base">
              UBT provides senior QA engineering, test automation, and quality strategy support
              from Dortmund for Germany-wide and selected international teams. These location
              pages explain where the experience is most relevant and how each region maps to
              the work.
            </p>
          </section>

          <section className="mt-8 grid gap-5 sm:grid-cols-2">
            {geoLocations.map((location) => (
              <Link
                key={location.slug}
                href={`/geo/${location.slug}`}
                className="section-panel group flex flex-col px-6 py-6 transition hover:-translate-y-1 hover:shadow-glow"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                  {location.country} · {location.region}
                </p>
                <h2 className="mt-3 font-body text-2xl font-semibold tracking-[-0.02em] text-ink transition group-hover:text-accent">
                  {location.city}
                </h2>
                <p className="mt-3 flex-1 text-sm leading-7 text-ink/68">
                  {location.intro}
                </p>
                <span className="mt-5 text-sm font-semibold text-accent">
                  View location page →
                </span>
              </Link>
            ))}
          </section>
        </div>
      </main>
    </>
  );
}
