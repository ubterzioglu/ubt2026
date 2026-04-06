import Image from "next/image";

import { heroActions, siteMeta } from "@/content/site";

export function HeroSection() {
  return (
    <section id="top" className="relative overflow-hidden px-4 pb-6 pt-8 sm:px-6 lg:px-8 lg:pb-8 lg:pt-10">
      <div className="accent-dot left-[-8rem] top-10 h-56 w-56 animate-drift bg-accent/16" />
      <div className="accent-dot right-[-6rem] top-16 h-52 w-52 animate-float bg-sunrise/16" />

<div className="mx-auto max-w-7xl">
        <div className="section-panel relative overflow-hidden px-6 py-6 sm:px-8 lg:min-h-[22rem] lg:px-12 lg:py-8">
          <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" />
          <div className="absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-accentSoft/55 via-transparent to-transparent sm:w-48 lg:w-56" />
          <Image
            src="/yeni.png"
            alt=""
            aria-hidden="true"
            width={607}
            height={745}
            className="pointer-events-none absolute bottom-0 left-2 z-0 h-auto w-40 select-none drop-shadow-2xl sm:left-4 sm:w-56 lg:left-6 lg:w-88 xl:w-96"
            priority
          />

          <div className="relative z-10 flex flex-col items-center justify-center lg:pl-40 lg:pb-0 xl:pl-44">
            <p className="animate-reveal text-[11px] font-semibold uppercase tracking-[0.32em] text-accent sm:text-xs">
              Personal Information Architecture
            </p>
            <h1 className="mt-4 max-w-4xl animate-reveal font-body text-4xl font-semibold leading-[0.96] tracking-[-0.03em] text-ink sm:text-5xl lg:text-6xl xl:text-[4.5rem] text-center">
              {siteMeta.fullName}
            </h1>
            <p className="mt-3 max-w-3xl animate-reveal text-base font-semibold text-ink/76 sm:text-lg lg:text-[1.1rem] text-center">
              {siteMeta.role}
            </p>
            <p className="mt-4 max-w-3xl animate-reveal text-sm leading-6 text-ink/68 sm:text-base text-center">
              {siteMeta.intro}
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
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
                    className={`inline-flex items-center rounded-full border border-line/70 px-4 py-2.5 text-sm font-semibold shadow-sm transition hover:-translate-y-0.5 ${className}`}
                  >
                    {action.label}
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
