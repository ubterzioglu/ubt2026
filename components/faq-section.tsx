interface FaqItem {
  question: string;
  answer: string;
}

interface FaqSectionProps {
  items: readonly FaqItem[];
}

export function FaqSection({ items }: FaqSectionProps) {
  return (
    <section id="faq" className="scroll-mt-24 px-4 py-4 sm:scroll-mt-28 sm:px-6 sm:py-5 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="section-panel overflow-hidden px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
          <h2 className="font-body text-[clamp(1.75rem,6vw,2.25rem)] font-semibold tracking-[-0.02em] text-ink">Frequently Asked Questions</h2>
          <div className="mt-6 h-px w-full bg-gradient-to-r from-accent/60 via-accent/30 to-transparent" />
          <dl className="mt-8 space-y-4">
            {items.map((item, index) => (
              <details
                key={item.question}
                open={index === 0}
                className="group rounded-[1.35rem] border border-line/80 bg-paper/70"
              >
                <summary className="flex cursor-pointer list-none select-none items-center justify-between gap-4 px-5 py-5">
                  <dt className="font-body text-[clamp(1rem,3vw,1.2rem)] font-semibold text-ink">
                    {item.question}
                  </dt>
                  <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full border border-line/80 bg-paper text-ink/60 transition group-open:rotate-180">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                      <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                    </svg>
                  </span>
                </summary>
                <dd className="border-t border-line/60 px-5 py-4 text-sm leading-7 text-ink/68">
                  {item.answer}
                </dd>
              </details>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
