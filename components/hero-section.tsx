import { heroActions, heroQuickLinks, siteMeta } from "@/content/site";

export function HeroSection() {
  return (
    <section id="top" className="relative overflow-hidden px-4 pb-10 pt-10 sm:px-6 lg:px-8 lg:pb-16 lg:pt-14">
      <div className="accent-dot left-[-8rem] top-10 h-64 w-64 bg-accent/20 animate-drift" />
      <div className="accent-dot right-[-6rem] top-28 h-56 w-56 bg-sunrise/20 animate-float" />

      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
        <div className="section-panel relative overflow-hidden px-6 py-8 sm:px-8 lg:px-12 lg:py-12">
          <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" />
          <p className="animate-reveal text-xs font-semibold uppercase tracking-[0.32em] text-accent">
            Personal Information Architecture
          </p>
          <h1 className="mt-5 max-w-4xl animate-reveal font-display text-5xl font-semibold leading-[0.95] tracking-[-0.03em] text-ink sm:text-6xl lg:text-7xl">
            {siteMeta.fullName}
          </h1>
          <p className="mt-4 max-w-2xl animate-reveal text-lg font-semibold text-ink/76 sm:text-xl">
            {siteMeta.role}
          </p>
          <p className="mt-6 max-w-2xl animate-reveal text-base leading-7 text-ink/72 sm:text-lg">
            {siteMeta.intro}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {heroActions.map((action) => {
              const className =
                action.variant === "primary"
                  ? "bg-accent text-white"
                  : action.variant === "secondary"
                    ? "bg-ink text-white"
                    : "bg-white text-ink";

              return (
                <a
                  key={action.label}
                  href={action.href}
                  className={`inline-flex items-center rounded-full border border-line/70 px-5 py-3 text-sm font-semibold shadow-sm transition hover:-translate-y-0.5 ${className}`}
                >
                  {action.label}
                </a>
              );
            })}
          </div>

          <div className="mt-10 border-t border-line/80 pt-6">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-ink/45">Quick navigation</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {heroQuickLinks.map((link) => (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  className="inline-flex rounded-full border border-line/70 bg-mist/70 px-4 py-2 text-sm font-medium text-ink/78 transition hover:border-accent/40 hover:bg-white"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <aside className="grid gap-4">
          <div className="section-panel bg-gradient-to-br from-white/85 to-accentSoft/70 px-6 py-6">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">Positioning</p>
            <p className="mt-4 font-display text-3xl font-semibold leading-tight text-ink">
              Quality strategy with hands-on execution.
            </p>
            <p className="mt-4 text-sm leading-6 text-ink/72">
              Test leadership, automation guidance, release clarity, and cross-team collaboration for complex enterprise products.
            </p>
          </div>

          <div className="section-panel bg-ink px-6 py-6 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/60">Snapshot</p>
            <dl className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-[0.22em] text-white/55">Location</dt>
                <dd className="mt-2 text-lg font-semibold">{siteMeta.location}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.22em] text-white/55">Focus</dt>
                <dd className="mt-2 text-lg font-semibold">QA, automation, delivery</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.22em] text-white/55">Domain</dt>
                <dd className="mt-2 text-lg font-semibold">Enterprise systems</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.22em] text-white/55">Style</dt>
                <dd className="mt-2 text-lg font-semibold">Clear, practical, supportive</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </section>
  );
}
