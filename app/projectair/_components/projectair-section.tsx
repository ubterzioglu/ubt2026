import type { ProjectairSection as ProjectairSectionData } from "@/types/projectair";

interface ProjectairSectionProps {
  section: ProjectairSectionData;
}

export function ProjectairSection({ section }: Readonly<ProjectairSectionProps>) {
  const headingId = `${section.id}-baslik`;

  return (
    <section
      id={section.id}
      aria-labelledby={headingId}
      className="scroll-mt-6 border-b border-[#d1d8cf] py-8 first:pt-0"
    >
      <p className="font-mono text-xs font-semibold uppercase tracking-[0.09em] text-[#205649]">
        {section.number} / {section.kicker}
      </p>
      <h2
        id={headingId}
        className="mt-2 font-display text-[clamp(1.9rem,4.4vw,3rem)] leading-[1.08] tracking-[-0.03em] text-[#182724]"
      >
        {section.title}
      </h2>

      {section.intro?.map((paragraph) => (
        <p key={paragraph} className="mt-4 leading-7">
          {paragraph}
        </p>
      ))}

      {section.facts ? (
        <dl className="mt-4">
          {section.facts.map((fact) => (
            <div
              key={fact.term}
              className="grid gap-1 border-b border-[#d1d8cf] py-3 last:border-b-0 sm:grid-cols-[minmax(125px,27%)_1fr] sm:gap-4"
            >
              <dt className="font-bold text-[#182724]">{fact.term}</dt>
              <dd className="leading-7">{fact.description}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {section.tiles ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {section.tiles.map((tile) => (
            <article
              key={tile.title}
              className="rounded-sm border border-t-[3px] border-[#d1d8cf] border-t-[#205649] bg-[#fffefa] px-4 py-4"
            >
              {tile.status ? (
                <span className="mb-2 inline-block rounded-sm bg-[#f7e8d0] px-2 py-0.5 text-xs font-bold text-[#7b4818]">
                  {tile.status}
                </span>
              ) : null}
              <h3 className="text-[1.05rem] font-bold leading-snug text-[#182724]">{tile.title}</h3>
              {tile.body ? <p className="mt-1.5 leading-7 text-[#52615b]">{tile.body}</p> : null}
              {tile.items ? (
                <ul className="mt-2 list-disc space-y-1 pl-5 text-[#52615b]">
                  {tile.items.map((item) => (
                    <li key={item} className="leading-6">
                      {item}
                    </li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))}
        </div>
      ) : null}

      {section.flow ? (
        <ol aria-label="Akış" className="mt-5 grid grid-cols-2 gap-2.5 md:grid-cols-4">
          {section.flow.map((step, index) => (
            <li key={step} className="border border-[#d1d8cf] bg-[#e7eee4] px-3.5 py-3 leading-snug">
              <span className="block font-mono text-xs font-bold text-[#205649]">
                {String(index + 1).padStart(2, "0")}
              </span>
              {step}
            </li>
          ))}
        </ol>
      ) : null}

      {section.outro?.map((paragraph) => (
        <p key={paragraph} className="mt-4 leading-7">
          {paragraph}
        </p>
      ))}

      {section.note ? (
        <div
          className={`mt-4 border-l-[3px] px-4 py-3 ${
            section.note.tone === "pending"
              ? "border-[#7b4818] bg-[#f7e8d0]"
              : "border-[#205649] bg-[#e7eee4]"
          }`}
        >
          <p className="leading-7">
            <strong className={section.note.tone === "pending" ? "text-[#7b4818]" : "text-[#182724]"}>
              {section.note.title}
            </strong>{" "}
            {section.note.body}
            {section.note.links?.map((link, index) => (
              <span key={link.href}>
                {" "}
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#205649] underline underline-offset-4"
                >
                  {link.label}
                </a>
                {index < (section.note?.links?.length ?? 0) - 1 ? "," : "."}
              </span>
            ))}
          </p>
        </div>
      ) : null}
    </section>
  );
}
