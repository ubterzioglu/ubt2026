import type { Metadata } from "next";
import Link from "next/link";

import { buildMetadata, SITE_LAST_UPDATED } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Privacy Policy",
  description:
    "Privacy policy for ubterzioglu.de — what personal data is collected through appointments, CV reviews, and analytics, how it is processed, and your GDPR rights.",
  canonical: "/privacy",
  ogType: "website"
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[1.35rem] border border-line/60 bg-white/80 px-6 py-6">
      <h2 className="mb-3 text-lg font-bold text-ink">{title}</h2>
      <div className="flex flex-col gap-3 text-sm leading-7 text-ink/70">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <main id="main-content" className="page-shell min-h-screen px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Legal</p>
          <h1 className="mt-3 font-body text-[clamp(2.2rem,6vw,3rem)] font-semibold tracking-[-0.03em] text-ink">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm text-ink/55">
            Last updated: <time dateTime={SITE_LAST_UPDATED}>{SITE_LAST_UPDATED}</time>
          </p>
        </header>

        <Section title="Responsible party">
          <p>
            Umut Barış Terzioğlu, Dortmund, Germany. Email:{" "}
            <a className="font-semibold text-accent" href="mailto:ubterzioglu@gmail.com">
              ubterzioglu@gmail.com
            </a>
            . This policy covers the website ubterzioglu.de.
          </p>
        </Section>

        <Section title="Data we process">
          <p>
            <strong>Appointment requests:</strong> when you use the booking form, we store your
            name, email address, optional company, your selected time slot, and your message.
            This data is processed solely to arrange and follow up on the appointment
            (Art. 6(1)(b) GDPR) and is stored in a Supabase database hosted in the EU.
          </p>
          <p>
            <strong>CV review requests:</strong> we store your name, WhatsApp number, and
            LinkedIn profile URL to run the free CV review service you asked for
            (Art. 6(1)(b) GDPR). Only your initials and process status are shown publicly in
            the queue overview; contact details are never displayed.
          </p>
          <p>
            <strong>Email notifications:</strong> booking alerts are sent via Resend. Your
            email address is transmitted to Resend for this purpose only.
          </p>
        </Section>

        <Section title="Analytics">
          <p>
            This site uses <strong>GoatCounter</strong>, a privacy-friendly analytics service
            that does not use cookies and does not collect personal identifiers, and{" "}
            <strong>Microsoft Clarity</strong> for aggregate usage analysis. Clarity may set
            cookies and process usage data; you can prevent this by blocking cookies in your
            browser settings or via a privacy filter.
          </p>
        </Section>

        <Section title="Cookies">
          <p>
            Only strictly necessary and analytics cookies described above are used. Some
            internal tool pages set a long-lived visitor cookie that merely records whether
            you have visited before; it contains no personal data.
          </p>
        </Section>

        <Section title="Data retention">
          <p>
            Appointment and CV review data is kept until the purpose is fulfilled and legal
            retention periods no longer apply, then deleted on request or during routine
            cleanup.
          </p>
        </Section>

        <Section title="Your rights">
          <p>
            You have the right to access, rectification, erasure, restriction, data
            portability, and to object to processing of your personal data, as well as the
            right to lodge a complaint with a supervisory authority (Art. 15–21, 77 GDPR).
            Contact:{" "}
            <a className="font-semibold text-accent" href="mailto:ubterzioglu@gmail.com">
              ubterzioglu@gmail.com
            </a>
            .
          </p>
        </Section>

        <Section title="Security">
          <p>
            To report a security vulnerability, see{" "}
            <a
              className="font-semibold text-accent"
              href="/.well-known/security.txt"
            >
              security.txt
            </a>
            .
          </p>
        </Section>

        <p className="text-sm text-ink/55">
          <Link href="/" className="font-semibold text-accent transition hover:opacity-80">
            ← Back to portfolio
          </Link>
        </p>
      </div>
    </main>
  );
}
