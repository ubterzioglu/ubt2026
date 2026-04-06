import type { SectionId } from "@/types/site";

interface SectionShellProps {
  id: SectionId;
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}

export function SectionShell({ id, eyebrow, title, description, children }: SectionShellProps) {
  return (
    <section id={id} className="scroll-mt-28 px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="section-panel min-h-[30rem] overflow-hidden px-6 py-8 sm:min-h-[32rem] sm:px-8 lg:min-h-[34rem] lg:px-10 lg:py-10">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-accent">{eyebrow}</p>
              <h2 className="mt-4 font-display text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl">
                {title}
              </h2>
              <p className="mt-4 max-w-sm text-sm leading-6 text-ink/68 sm:text-base">{description}</p>
            </div>
            <div>{children}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
