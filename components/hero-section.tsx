import Image from "next/image";

import { heroActions, siteMeta } from "@/content/site";

export function HeroSection() {
  return (
    <section
      id="top"
      className="relative overflow-hidden px-4 pb-12 pt-6 sm:px-6 sm:pb-16 sm:pt-8 lg:px-8 lg:pb-6 lg:pt-10"
    >
      <div className="accent-dot left-[-7rem] top-8 h-44 w-44 animate-drift bg-accent/16 sm:h-52 sm:w-52 lg:left-[-8rem] lg:top-10 lg:h-56 lg:w-56" />
      <div className="accent-dot right-[-5.5rem] top-14 h-40 w-40 animate-float bg-sunrise/16 sm:h-48 sm:w-48 lg:right-[-6rem] lg:top-16 lg:h-52 lg:w-52" />

      <div className="mx-auto max-w-7xl">
        <div className="section-panel relative overflow-hidden px-5 py-12 sm:px-8 sm:py-10 lg:min-h-[22rem] lg:px-12 lg:pb-0 lg:pt-8">
          <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent sm:inset-x-8" />
          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-accentSoft/45 via-transparent to-transparent sm:w-36 lg:w-56" />

          <div className="relative z-10 flex flex-col items-center gap-8 lg:flex-row lg:items-end lg:gap-10 xl:gap-12">
            <div className="flex flex-1 flex-col items-center text-center lg:max-w-[36rem] lg:items-start lg:pb-8 lg:text-left">
              <h1 className="max-w-4xl animate-reveal font-body text-[clamp(1.75rem,7vw,3.2rem)] font-semibold leading-[0.96] tracking-[-0.03em] text-ink">
                {siteMeta.fullName}
              </h1>
              <p className="mt-3 max-w-3xl animate-reveal text-[clamp(0.875rem,2.8vw,1rem)] font-semibold text-ink/76">
                {siteMeta.role}
              </p>
              <p className="mt-4 max-w-[31rem] animate-reveal whitespace-pre-wrap text-sm leading-6 text-ink/68 sm:text-base">
                {siteMeta.intro}
              </p>

              <div className="mt-6 flex flex-wrap justify-center gap-3 lg:justify-start">
                {heroActions
                  .filter((action) => action.variant === "primary" || action.label === "Contact Me")
                  .map((action) => {
                    const className =
                      action.variant === "primary"
                        ? "bg-accent text-white"
                        : "bg-white text-ink";

                    return (
                      <a
                        key={action.label}
                        href={action.href}
                        className={`inline-flex min-h-[44px] items-center rounded-full border border-line/70 px-4 py-2.5 text-sm font-semibold shadow-sm transition hover:-translate-y-0.5 active:scale-95 ${className}`}
                      >
                        {action.label}
                      </a>
                    );
                  })}
              </div>
            </div>

            <div className="order-first mx-auto flex w-full max-w-[16rem] items-end sm:max-w-[18rem] md:max-w-[20rem] lg:order-last lg:mx-0 lg:w-80 lg:max-w-none xl:w-96">
              <Image
                src="/yeni.png"
                alt=""
                aria-hidden="true"
                width={607}
                height={745}
                className="pointer-events-none relative z-10 h-auto w-full self-end select-none object-bottom drop-shadow-2xl"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
