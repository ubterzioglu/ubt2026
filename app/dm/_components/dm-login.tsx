import Image from "next/image";

import {
  DM_AMBIENT_BACKGROUND,
  DM_BRAND_GRADIENT,
  DM_GRID_TEXTURE
} from "@/app/dm/_components/theme";

interface DmLoginGuideSection {
  heading: string;
  text: string;
}

/** Content for the optional collapsed how-to accordion above the login card. */
export interface DmLoginGuide {
  title: string;
  intro: string;
  sections: DmLoginGuideSection[];
}

interface DmLoginProps {
  /** Sign-in server action (handles its own redirect). */
  signIn: (formData: FormData) => void | Promise<void>;
  eyebrow: string;
  title: string;
  description: string;
  submitLabel: string;
  brand?: string;
  subtitle?: string;
  footerCaption?: string;
  /** When set, renders a collapsed usage-guide accordion above the card. */
  guide?: DmLoginGuide;
}

/**
 * ULTRA-PREMIUM DesireMap login. Self-contained dark, neon entrance scoped to
 * the `/dm` route: a split layout pairing the `loginhero.jpeg` photo (electric
 * blue ↔ neon red) with a glass auth card built on the logo's three brand
 * colors (magenta · violet · cyan). All treatment is inline so it never touches
 * the global site theme nor the shared admin gate used elsewhere.
 */
export function DmLogin({
  signIn,
  eyebrow,
  title,
  description,
  submitLabel,
  brand = "DesireMap",
  subtitle = "Görev panosu",
  footerCaption = "desiremap.de · internal",
  guide
}: DmLoginProps) {
  return (
    <main
      className="relative isolate flex min-h-screen flex-col items-center justify-center gap-4 overflow-hidden px-4 py-10 sm:px-6"
      style={{ background: DM_AMBIENT_BACKGROUND }}
    >
      {/* Grid texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.4]"
        style={DM_GRID_TEXTURE}
      />
      {/* Floating neon orbs */}
      <div
        aria-hidden
        className="animate-float pointer-events-none absolute -left-24 top-16 -z-10 h-72 w-72 rounded-full blur-[130px]"
        style={{ background: "rgba(255,45,149,0.35)" }}
      />
      <div
        aria-hidden
        className="animate-drift pointer-events-none absolute -right-24 bottom-8 -z-10 h-80 w-80 rounded-full blur-[140px]"
        style={{ background: "rgba(34,211,238,0.28)" }}
      />
      <div
        aria-hidden
        className="animate-float pointer-events-none absolute left-1/2 top-1/2 -z-10 h-64 w-64 -translate-x-1/2 rounded-full blur-[150px]"
        style={{ background: "rgba(168,85,247,0.22)" }}
      />

      {/* Optional collapsed usage guide, rendered above the login card */}
      {guide ? (
        <details className="group/guide animate-reveal w-full max-w-5xl overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#0a0712]/85 backdrop-blur-2xl">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-4 [&::-webkit-details-marker]:hidden">
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
          <div className="border-t border-white/[0.06] px-6 pb-5 pt-4">
            <p className="text-[13px] leading-6 text-white/60">{guide.intro}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {guide.sections.map((section) => (
                <div
                  key={section.heading}
                  className="rounded-[0.9rem] border border-white/[0.08] bg-white/[0.03] px-4 py-3"
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
                </div>
              ))}
            </div>
          </div>
        </details>
      ) : null}

      {/* Card shell with tri-color gradient border */}
      <div
        className="animate-reveal w-full max-w-5xl rounded-[2rem] p-[1.5px] shadow-[0_50px_140px_-30px_rgba(0,0,0,0.9)]"
        style={{ backgroundImage: DM_BRAND_GRADIENT }}
      >
        <div className="grid overflow-hidden rounded-[1.92rem] bg-[#0a0712]/85 backdrop-blur-2xl lg:grid-cols-[1.05fr_1fr]">
          {/* Hero photo side */}
          <div className="relative hidden min-h-[560px] overflow-hidden lg:block">
            <Image
              src="/dm/loginhero.jpeg"
              alt="DesireMap"
              fill
              priority
              sizes="(min-width: 1024px) 52vw, 0px"
              className="object-cover"
            />
            {/* Neon color wash to fuse the photo with the brand palette */}
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(115deg, rgba(255,45,149,0.30) 0%, rgba(168,85,247,0.10) 45%, rgba(34,211,238,0.28) 100%)," +
                  "linear-gradient(180deg, rgba(10,7,18,0.10) 0%, rgba(10,7,18,0.55) 78%, rgba(10,7,18,0.92) 100%)"
              }}
            />
            {/* Inner edge sheen */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10"
            />
            {/* Overlaid brand lockup */}
            <div className="absolute inset-x-0 bottom-0 p-8">
              <div className="flex items-center gap-3">
                <span
                  className="relative flex h-12 w-12 items-center justify-center rounded-2xl ring-1 ring-white/20"
                  style={{ backgroundImage: DM_BRAND_GRADIENT }}
                >
                  <span className="font-body text-lg font-extrabold tracking-tight text-white drop-shadow">
                    D
                  </span>
                </span>
                <div className="leading-tight">
                  <p
                    className="font-body text-2xl font-extrabold tracking-tight text-transparent"
                    style={{
                      backgroundImage:
                        "linear-gradient(100deg, #ff2d95, #c084fc 55%, #67e8f9)",
                      WebkitBackgroundClip: "text",
                      backgroundClip: "text"
                    }}
                  >
                    {brand}
                  </p>
                  <p className="text-[12px] font-medium uppercase tracking-[0.26em] text-white/55">
                    {subtitle}
                  </p>
                </div>
              </div>
              <p className="mt-4 max-w-sm text-sm leading-6 text-white/70">
                Premium iç görev panosu. Erişim anahtarınla devam et.
              </p>
            </div>
          </div>

          {/* Form side */}
          <div className="relative px-7 py-9 sm:px-10 sm:py-11">
            {/* Top sheen */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-px"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent)"
              }}
            />

            {/* Mobile brand (hero hidden on small screens) */}
            <div className="mb-8 flex items-center justify-between lg:mb-9">
              <div className="flex items-center gap-3 lg:hidden">
                <span
                  className="relative flex h-10 w-10 items-center justify-center rounded-xl ring-1 ring-white/20"
                  style={{ backgroundImage: DM_BRAND_GRADIENT }}
                >
                  <span className="font-body text-base font-extrabold tracking-tight text-white">
                    D
                  </span>
                </span>
                <div className="leading-tight">
                  <p className="font-body text-sm font-bold tracking-tight text-white">
                    {brand}
                  </p>
                  <p className="text-[11px] font-medium text-white/45">{subtitle}</p>
                </div>
              </div>
              <span
                className="ml-auto inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]"
                style={{
                  borderColor: "rgba(34,211,238,0.35)",
                  background: "rgba(34,211,238,0.10)",
                  color: "#67e8f9"
                }}
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span
                    className="absolute inline-flex h-full w-full animate-ping rounded-full"
                    style={{ background: "rgba(34,211,238,0.7)" }}
                  />
                  <span
                    className="relative inline-flex h-1.5 w-1.5 rounded-full"
                    style={{ background: "#22d3ee" }}
                  />
                </span>
                Secure
              </span>
            </div>

            {/* Headline */}
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.34em]"
              style={{ color: "#f0abfc" }}
            >
              {eyebrow}
            </p>
            <h1 className="mt-3 font-body text-[clamp(1.9rem,5vw,2.5rem)] font-bold leading-[1.05] tracking-[-0.035em] text-white">
              {title}
            </h1>
            <p className="mt-3.5 text-sm leading-7 text-white/55">{description}</p>

            {/* Form */}
            <form action={signIn} className="mt-8 space-y-5">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-white/50">
                  Access key
                </span>
                <div className="group relative">
                  <span
                    aria-hidden
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/30 transition group-focus-within:text-[#ff2d95]"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                  <input
                    type="password"
                    name="access"
                    autoComplete="current-password"
                    placeholder="••••••••••••"
                    className="w-full rounded-[1.05rem] border border-white/10 bg-white/[0.04] py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] outline-none transition focus:border-[#ff2d95]/60 focus:bg-white/[0.06] focus:ring-4 focus:ring-[#ff2d95]/15"
                  />
                </div>
              </label>
              <button
                type="submit"
                className="group relative inline-flex min-h-[52px] w-full items-center justify-center gap-2 overflow-hidden rounded-[1.05rem] px-6 py-3.5 text-sm font-bold tracking-tight text-white shadow-[0_16px_50px_-12px_rgba(255,45,149,0.7)] ring-1 ring-inset ring-white/15 transition duration-300 hover:shadow-[0_20px_60px_-12px_rgba(168,85,247,0.85)] focus:outline-none focus:ring-2 focus:ring-[#ff2d95]/60"
                style={{ backgroundImage: DM_BRAND_GRADIENT }}
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full"
                />
                {submitLabel}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-transform duration-300 group-hover:translate-x-0.5"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </button>
            </form>

            {/* Footer note */}
            <p className="mt-7 flex items-center justify-center gap-2 text-center text-[11px] text-white/35">
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Key is stored in an HttpOnly cookie — never exposed in the URL.
            </p>
            <p className="mt-5 text-center text-[11px] font-medium uppercase tracking-[0.28em] text-white/25">
              {footerCaption}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
