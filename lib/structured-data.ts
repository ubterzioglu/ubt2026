import { BASE_URL, SITE_NAME } from "@/lib/seo";

export function buildPersonSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${BASE_URL}/#person`,
    name: SITE_NAME,
    alternateName: ["UBT", "Baris Terzioglu", "Umut Terzioglu", "ubterzioglu"],
    url: BASE_URL,
    image: `${BASE_URL}/logoubt.png`,
    jobTitle: "Senior Software Quality Assurance Engineer",
    description:
      "Senior Software QA Engineer with 15+ years of experience in test strategy, automation, CI/CD, and enterprise delivery. Based in Dortmund, Germany.",
    worksFor: {
      "@type": "Organization",
      name: "Swisslog GmbH",
      url: "https://www.swisslog.com"
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Dortmund",
      addressRegion: "North Rhine-Westphalia",
      addressCountry: "DE"
    },
    sameAs: [
      "https://www.linkedin.com/in/ubterzioglu/",
      "https://www.instagram.com/ubterzioglu/"
    ],
    email: "ubterzioglu@gmail.com",
    telephone: "+491739569429",
    knowsAbout: [
      "Software Quality Assurance",
      "Test Automation",
      "Selenium WebDriver",
      "Ranorex",
      "CI/CD Pipelines",
      "Agile Testing",
      "SCRUM Methodology",
      "Test Management",
      "QA Strategy",
      "Enterprise Testing",
      "Java",
      "C#",
      "Python",
      "TypeScript",
      "Jenkins",
      "Docker",
      "Jira",
      "HP ALM",
      "Polarion"
    ],
    nationality: {
      "@type": "Country",
      name: "Turkey"
    },
    homeLocation: {
      "@type": "City",
      name: "Dortmund",
      containedInPlace: {
        "@type": "Country",
        name: "Germany"
      }
    }
  };
}

export function buildWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${BASE_URL}/#website`,
    url: BASE_URL,
    name: SITE_NAME,
    description:
      "Professional portfolio of Umut Barış Terzioğlu — Senior QA Engineer based in Dortmund, Germany.",
    inLanguage: "en",
    author: {
      "@id": `${BASE_URL}/#person`
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${BASE_URL}/?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };
}

export function buildProfilePageSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${BASE_URL}/#profilepage`,
    url: BASE_URL,
    name: `${SITE_NAME} — Senior QA Engineer Portfolio`,
    description:
      "Portfolio and professional profile of Umut Barış Terzioğlu — Senior Software QA Engineer with 15+ years in test strategy, automation, and enterprise delivery.",
    mainEntity: {
      "@id": `${BASE_URL}/#person`
    }
  };
}

interface BreadcrumbItem {
  name: string;
  href: string;
}

export function buildBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${BASE_URL}${item.href}`
    }))
  };
}

interface FaqEntry {
  question: string;
  answer: string;
}

export function buildFaqSchema(items: FaqEntry[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  };
}

export function buildSpeakableSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SpeakableSpecification",
    xpath: [
      "/html/head/title",
      "/html/body/main/section[@id='about-me']//p",
      "/html/body/main/section[@id='key-achievements']//p"
    ],
    cssSelector: [
      "#about-me p",
      "#key-achievements p"
    ]
  };
}

interface LocalServiceInput {
  city: string;
  region: string;
  countryCode: string;
  countryName: string;
  latitude: number;
  longitude: number;
  pageUrl: string;
  description: string;
}

export function buildLocalServiceSchema(input: LocalServiceInput) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${input.pageUrl}#service`,
    name: `QA Engineering Services — ${input.city}, ${input.countryName}`,
    description: input.description,
    url: input.pageUrl,
    image: `${BASE_URL}/logoubt.png`,
    telephone: "+491739569429",
    email: "ubterzioglu@gmail.com",
    address: {
      "@type": "PostalAddress",
      addressLocality: input.city,
      addressRegion: input.region,
      addressCountry: input.countryCode
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: input.latitude,
      longitude: input.longitude
    },
    areaServed: [
      {
        "@type": "City",
        name: input.city,
        containedInPlace: {
          "@type": "Country",
          name: input.countryName
        }
      }
    ],
    serviceType: [
      "Software Quality Assurance",
      "Test Automation",
      "QA Consulting",
      "Test Strategy"
    ],
    provider: {
      "@id": `${BASE_URL}/#person`
    },
    sameAs: [
      "https://www.linkedin.com/in/ubterzioglu/",
      BASE_URL
    ]
  };
}
