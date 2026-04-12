import Image from "next/image";

import { heroActions, heroKeywords, siteMeta } from "@/content/site";
import { heroSummary } from "@/content/profile";

export function HeroSection() {
  return (
    <section
      id="top"
      className="relative overflow-hidden px-4 pb-12 pt-2 sm:px-6 sm:pb-16 sm:pt-3 lg:px-8 lg:pb-6 lg:pt-4"
    >
      <div className="accent-dot left-[-7rem] top-8 h-44 w-44 animate-drift bg-accent/16 sm:h-52 sm:w-52 lg:left-[-8rem] lg:top-10 lg:h-56 lg:w-56" />
      <div className="accent-dot right-[-5.5rem] top-14 h-40 w-40 animate-float bg-sunrise/16 sm:h-48 sm:w-48 lg:right-[-6rem] lg:top-16 lg:h-52 lg:w-52" />

      <div className="mx-auto max-w-7xl">
        <div className="section-panel relative overflow-hidden px-5 pb-0 pt-6 sm:px-8 sm:pb-0 sm:pt-6 lg:min-h-[19.75rem] lg:px-12 lg:pb-0 lg:pt-5">
          <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent sm:inset-x-8" />
          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-accentSoft/45 via-transparent to-transparent sm:w-36 lg:w-56" />

          <div className="relative z-10 flex flex-col items-center gap-8 lg:flex-row lg:items-center lg:gap-12 xl:gap-16">
            <div className="order-last mx-auto flex w-full max-w-[16rem] items-end self-end sm:max-w-[18rem] md:max-w-[20rem] lg:order-first lg:mx-0 lg:w-[25rem] lg:max-w-none lg:self-center xl:w-[30rem]">
              <Image
                src="/1yeni.png"
                alt="Umut Barış Terzioğlu — Senior QA Engineer"
                aria-hidden="false"
                width={607}
                height={745}
                className="pointer-events-none relative z-10 h-auto w-full translate-y-px self-end select-none object-bottom drop-shadow-2xl lg:self-center"
                priority
              />
            </div>

            <div className="flex flex-1 flex-col items-center pb-8 text-center lg:-ml-2 lg:max-w-[36rem] lg:items-start lg:pb-0 lg:text-left">
              <h1 className="max-w-4xl animate-reveal font-body text-[clamp(1.75rem,7vw,3.2rem)] font-semibold leading-[0.96] tracking-[-0.03em] text-ink">
                {siteMeta.fullName}
              </h1>
              <p className="mt-3 max-w-3xl animate-reveal text-[clamp(0.875rem,2.8vw,1rem)] font-semibold text-ink/76">
                {siteMeta.role}
              </p>
              <p className="mt-4 max-w-3xl animate-reveal text-[clamp(0.8rem,2.2vw,0.92rem)] leading-7 text-ink/64">
                {heroSummary}
              </p>
              <div className="mt-5 w-full max-w-[37rem]">
                <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:justify-start sm:gap-1.5 lg:gap-2">
                  {heroKeywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="inline-flex items-center justify-center rounded-full border border-accent/12 bg-accent/8 px-2.5 py-1 text-[0.68rem] font-medium tracking-[0.01em] text-accent/80 sm:justify-start"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex w-full flex-col justify-center gap-3 sm:flex-row sm:flex-wrap lg:justify-start">
                {heroActions.map((action) => (
                  <a
                    key={action.label}
                    href={action.href}
                    className="inline-flex min-h-[44px] w-full items-center justify-center rounded-full border border-line/70 bg-white px-3 py-2.5 text-sm font-semibold text-ink shadow-sm transition hover:-translate-y-0.5 active:scale-95 sm:w-[12.5rem]"
                  >
                    {action.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
