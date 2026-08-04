import type { ReactNode } from "react";
import type { Route } from "next";
import Link from "next/link";

import type { ContactItem } from "@/types/site";

interface GeoLinkItem {
  label: string;
  href: string;
}

interface ContactSectionProps {
  contactItems: readonly ContactItem[];
  geoLinks: readonly GeoLinkItem[];
}

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
type CommunicationItem = ContactItem & { label: CommunicationLabel };

function hasContactIcon(label: string): label is CommunicationLabel {
  return label in contactIconMap;
}

export function ContactSection({ contactItems, geoLinks }: ContactSectionProps) {
  const communicationItems = contactItems.filter(
    (item): item is CommunicationItem => hasContactIcon(item.label)
  );

  return (
    <section id="contact" className="scroll-mt-24 px-4 py-4 sm:scroll-mt-28 sm:px-6 sm:py-5 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="section-panel overflow-hidden px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
          <h2 className="font-body text-[clamp(1.75rem,6vw,2.25rem)] font-semibold tracking-[-0.02em] text-ink">How Can You Reach UBT?</h2>
          <div className="mt-6 h-px w-full bg-gradient-to-r from-accent/60 via-accent/30 to-transparent" />
          <p className="mt-6 max-w-3xl text-sm leading-7 text-ink/68">
            Available for QA consulting, test strategy reviews, and automation advisory in{" "}
            {geoLinks.map((loc, i) => (
              <span key={loc.href}>
                <Link href={loc.href as Route} className="font-medium text-accent underline decoration-accent/30 transition hover:decoration-accent">{loc.label}</Link>
                {i < geoLinks.length - 2 ? ", " : i === geoLinks.length - 2 ? ", and " : ""}
              </span>
            ))}
            . All appointments and CV reviews are free of charge.
          </p>
          <div className="mt-8 flex min-h-[5rem] items-center justify-center px-4 py-5 sm:px-8 sm:py-6">
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
                  {contactIconMap[item.label]}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
