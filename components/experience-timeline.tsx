import type { ExperienceItem } from "@/types/site";

interface ExperienceTimelineProps {
  items: ExperienceItem[];
}

export function ExperienceTimeline({ items }: ExperienceTimelineProps) {
  return (
    <div className="relative">
      <div className="absolute left-[1.125rem] top-0 hidden h-full w-px bg-gradient-to-b from-accent/60 via-accent/40 to-transparent sm:block md:left-[1.5rem]" />
      
      <div className="space-y-8">
        {items.map((item, index) => (
          <article key={`${item.company}-${item.role}`} className="relative pl-10 sm:pl-14 md:pl-16">
            <div className="absolute left-0 top-1.5 hidden h-[2.25rem] w-[2.25rem] items-center justify-center rounded-full border-2 border-accent/50 bg-paper shadow-sm sm:flex md:h-12 md:w-12">
              <span className="text-xs font-bold text-accent md:text-sm">
                {item.period.split(" - ")[0]}
              </span>
            </div>
            
            <div className="group relative rounded-[1.5rem] border border-line/80 bg-white/82 p-5 shadow-sm transition-all duration-300 hover:border-accent/40 hover:shadow-md md:p-6">
              <div className="absolute -left-1.5 top-6 hidden h-3 w-3 rotate-45 border-b border-l border-line/80 bg-white/82 sm:block" />
              
              <div className="flex flex-col gap-1 md:flex-row md:items-start md:justify-between md:gap-4">
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">{item.company}</p>
                  <h3 className="mt-1 font-body text-xl font-semibold text-ink md:text-2xl">{item.role}</h3>
                </div>
                <div className="flex flex-col items-start gap-0.5 text-sm text-ink/60 md:items-end">
                  <span className="font-medium">{item.period}</span>
                  <span className="text-xs uppercase tracking-wider">{item.location}</span>
                </div>
              </div>
              
              <p className="mt-4 text-sm leading-7 text-ink/70">{item.summary}</p>
              
              <ul className="mt-4 space-y-2">
                {item.highlights.map((highlight) => (
                  <li key={highlight} className="flex items-start gap-2.5 text-sm leading-6 text-ink/74">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent/60" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
              
              {index === 0 && (
                <div className="absolute -right-2 -top-2 rounded-full bg-accent px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                  Current
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
