import { ScrollToTop } from "@/components/scroll-to-top";
import { projectairDocument } from "@/content/projectair";
import { PROJECTAIR_PLAN_MARKDOWN } from "@/content/projectair-plan";
import { ProjectairPlan } from "@/app/projectair/_components/projectair-plan";
import { ProjectairSection } from "@/app/projectair/_components/projectair-section";

interface ProjectairDocumentProps {
  signOut: () => void | Promise<void>;
}

const NAV_ITEMS = [
  ...projectairDocument.sections.map((section) => ({ id: section.id, label: section.title })),
  { id: "tam-plan", label: "Ana planın tamamı" },
  { id: "dosyalar", label: "Proje dosyaları" }
];

export function ProjectairDocument({ signOut }: Readonly<ProjectairDocumentProps>) {
  const doc = projectairDocument;

  return (
    <div className="min-h-screen scroll-smooth bg-[#f5f3ed] font-body text-[#182724]">
      <header className="border-b-[5px] border-[#deefa5] bg-[#102e28] pb-12 pt-10 text-[#f9f9ef]">
        <div className="mx-auto w-[min(1136px,calc(100%-32px))] sm:w-[min(1136px,calc(100%-64px))]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs font-semibold uppercase tracking-[0.09em] text-[#deefa5]">
              <span>{doc.eyebrow}</span>
              <span>{doc.version}</span>
            </p>
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-full border border-[#deefa5]/40 px-3.5 py-1.5 text-xs font-semibold text-[#deefa5] transition hover:bg-[#deefa5] hover:text-[#102e28]"
              >
                Çıkış
              </button>
            </form>
          </div>
          <h1 className="mt-6 max-w-[870px] font-display text-[clamp(2.6rem,6.6vw,5.4rem)] leading-[1.05] tracking-[-0.035em]">
            {doc.title}
          </h1>
          <p className="mt-4 max-w-[680px] text-lg text-[#d4e4da]">{doc.summary}</p>
          <ol aria-label="Uygulama sırası" className="mt-7 flex flex-wrap gap-x-4 gap-y-2 font-semibold text-[#deefa5]">
            {doc.phases.map((phase, index) => (
              <li key={phase} className="flex items-center gap-4">
                {index > 0 ? <span aria-hidden className="text-[#a6bcab]">→</span> : null}
                {phase}
              </li>
            ))}
          </ol>
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 font-semibold">
            <a href="#tam-plan" className="text-[#deefa5] underline underline-offset-4">
              Ana planın tamamına geç
            </a>
            <a href="#dosyalar" className="text-[#deefa5] underline underline-offset-4">
              Proje dosyaları
            </a>
          </div>
        </div>
      </header>

      <div className="mx-auto w-[min(1136px,calc(100%-32px))] py-7 sm:w-[min(1136px,calc(100%-64px))] lg:grid lg:grid-cols-[210px_minmax(0,1fr)] lg:items-start lg:gap-x-12 lg:py-11">
        <nav
          aria-label="İçindekiler"
          className="mb-8 border-b border-[#d1d8cf] pb-4 lg:sticky lg:top-7 lg:mb-0"
        >
          <p className="mb-3 font-mono text-xs font-semibold uppercase tracking-[0.09em] text-[#52615b]">
            İçindekiler
          </p>
          <ol className="grid grid-cols-2 lg:grid-cols-1">
            {NAV_ITEMS.map((item, index) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className="flex gap-2.5 rounded px-2 py-1.5 text-sm font-semibold text-[#205649] hover:bg-[#e3eae0] hover:underline"
                >
                  <span className="font-mono text-xs leading-5 text-[#52615b]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {item.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <main id="main-content" className="min-w-0">
          {doc.sections.map((section) => (
            <ProjectairSection key={section.id} section={section} />
          ))}

          <section id="tam-plan" className="scroll-mt-6 border-b border-[#d1d8cf] py-8">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.09em] text-[#205649]">
              Ana plan
            </p>
            <ProjectairPlan markdown={PROJECTAIR_PLAN_MARKDOWN} />
          </section>

          <section id="dosyalar" className="scroll-mt-6 py-8">
            <h2 className="font-display text-[clamp(1.9rem,4.4vw,3rem)] leading-[1.08] tracking-[-0.03em]">
              Proje dosyaları
            </h2>
            <p className="mt-4">
              Yeni yüklemeler için{" "}
              <a
                href={doc.filesFolder.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#205649] underline underline-offset-4"
              >
                {doc.filesFolder.label}
              </a>
              .
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-6">
              {doc.files.map((file) => (
                <li key={file.href}>
                  <a
                    href={file.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all text-[#205649] underline underline-offset-4"
                  >
                    {file.label}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </main>
      </div>

      <footer className="border-t border-[#d1d8cf] py-6 text-sm text-[#52615b]">
        <p className="mx-auto w-[min(1136px,calc(100%-32px))] sm:w-[min(1136px,calc(100%-64px))]">
          {doc.footer}
        </p>
      </footer>

      <ScrollToTop />
    </div>
  );
}
