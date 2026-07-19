interface BoardGuideSection {
  heading: string;
  /** Short summary shown above the steps (or standalone if steps is omitted). */
  text: string;
  /** Optional numbered how-to steps rendered below the summary. */
  steps?: string[];
}

/** Content for the collapsed how-to accordion shown atop a board. */
export interface BoardGuideContent {
  title: string;
  intro: string;
  sections: BoardGuideSection[];
}

interface BoardGuideProps {
  guide: BoardGuideContent;
  /** Outer gradient-border shell class shared by the board's cards. */
  cardClass: string;
  /** Inner glass surface class shared by the board's cards. */
  cardInnerClass: string;
}

/**
 * Collapsed-by-default usage guide card, rendered as the first card of a
 * board's content column (post-login). Styling mirrors the board's other
 * cards via the shared cardClass/cardInnerClass tokens.
 */
export function BoardGuide({ guide, cardClass, cardInnerClass }: BoardGuideProps) {
  return (
    <section className={cardClass}>
      <div className={cardInnerClass}>
        <details className="group/guide">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 sm:px-6 [&::-webkit-details-marker]:hidden">
            <span className="flex items-center gap-2.5 text-sm font-semibold text-white">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white/50"
              >
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
              </svg>
              {guide.title}
            </span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0 text-white/40 transition-transform duration-200 group-open/guide:rotate-180"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </summary>
          <div className="border-t border-white/[0.06] px-5 pb-5 pt-4 sm:px-6">
            <p className="text-[13px] leading-6 text-white/60">{guide.intro}</p>
            <div className="mt-4 space-y-3">
              {guide.sections.map((section) => (
                <div
                  key={section.heading}
                  className="rounded-[0.9rem] border border-white/[0.08] bg-white/[0.03] px-4 py-3.5"
                >
                  <p
                    className="text-[11px] font-semibold uppercase tracking-[0.16em]"
                    style={{ color: "#f0abfc" }}
                  >
                    {section.heading}
                  </p>
                  <p className="mt-1 text-[12px] leading-5 text-white/60">
                    {section.text}
                  </p>
                  {section.steps && section.steps.length > 0 ? (
                    <ol className="mt-3 space-y-2 border-t border-white/[0.06] pt-3">
                      {section.steps.map((step, index) => (
                        <li key={index} className="flex items-start gap-2.5">
                          <span
                            className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white/90"
                            style={{ backgroundColor: "rgba(240,171,252,0.18)" }}
                          >
                            {index + 1}
                          </span>
                          <span className="text-[12px] leading-5 text-white/70">
                            {step}
                          </span>
                        </li>
                      ))}
                    </ol>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </details>
      </div>
    </section>
  );
}
