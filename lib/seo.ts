import "server-only";

import type { Metadata } from "next";

export const BASE_URL = "https://ubterzioglu.de";
export const SITE_NAME = "Umut Barış Terzioğlu";
export const BRAND_SUFFIX = "Senior QA Engineer";
export const DEFAULT_OG_IMAGE = `${BASE_URL}/og-default.png`;

export const defaultKeywords = [
  "QA Engineer Germany",
  "Software Testing Dortmund",
  "Test Automation Expert",
  "Senior QA Engineer",
  "Software Quality Assurance",
  "Test Strategy",
  "Selenium Automation",
  "Ranorex Automation",
  "CI/CD Testing",
  "Agile QA",
  "SCRUM Testing",
  "Test Management",
  "QA Consultant Germany",
  "Umut Barış Terzioğlu",
  "UBT Testing"
];

interface PageSeoInput {
  title?: string;
  description?: string;
  keywords?: string[];
  canonical?: string;
  noIndex?: boolean;
  ogImage?: string;
  ogType?: "website" | "article" | "profile";
}

export function buildMetadata(input: PageSeoInput = {}): Metadata {
  const title = input.title ?? `${SITE_NAME} — Senior QA Engineer in Dortmund, Germany`;
  const description =
    input.description ??
    "Portfolio of Umut Barış Terzioğlu — Senior Software Quality Assurance Engineer with 15+ years in test strategy, automation, and enterprise delivery.";
  const canonical = input.canonical
    ? `${BASE_URL}${input.canonical}`
    : BASE_URL;
  const ogImage = input.ogImage ?? DEFAULT_OG_IMAGE;
  const ogType = input.ogType ?? "website";

  return {
    title: {
      default: title,
      template: `%s | ${SITE_NAME}`
    },
    description,
    keywords: input.keywords ?? defaultKeywords,
    authors: [{ name: SITE_NAME, url: BASE_URL }],
    creator: SITE_NAME,
    metadataBase: new URL(BASE_URL),
    alternates: {
      canonical
    },
    robots: input.noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-snippet": -1,
            "max-image-preview": "large",
            "max-video-preview": -1
          }
        },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      type: ogType,
      locale: "en_US",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage]
    }
  };
}
