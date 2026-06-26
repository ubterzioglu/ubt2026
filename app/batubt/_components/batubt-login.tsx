import Image from "next/image";

import {
  BATUBT_AMBIENT_BACKGROUND,
  BATUBT_BRAND_GRADIENT,
  BATUBT_GRID_TEXTURE
} from "@/app/batubt/_components/theme";

interface BatubtLoginProps {
  /** Sign-in server action (handles its own redirect). */
  signIn: (formData: FormData) => void | Promise<void>;
  eyebrow: string;
  title: string;
  description: string;
  submitLabel: string;
  brand?: string;
  subtitle?: string;
  footerCaption?: string;
}

/**
 * ULTRA-PREMIUM BatuBT login. Self-contained dark entrance scoped to the
 * `/batubt` route: a two-column split pairing the `loginsol.png` mascot artwork
 * (left showcase) with a glass auth card (right) built on the brand's
 * gold · orange · violet palette. All treatment is inline so it never touches
 * the global site theme nor the shared admin gate used elsewhere.
 */
export function BatubtLogin({
  signIn,
  eyebrow,
  title,
  description,
  submitLabel,
  brand = "BatuBT",
  subtitle = "Footer Yönetimi",
  footerCaption = "ubterzioglu.de · internal"
}: BatubtLoginProps) {
  return (
    <main
      className="relative isolate flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 sm:px-6"
      style={{ background: BATUBT_AMBIENT_BACKGROUND }}
    >
      {/* Grid texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.4]"
        style={BATUBT_GRID_TEXTURE}
      />
      {/* Floating brand orbs */}
      <div
        aria-hidden
        className="animate-float pointer-events-none absolute -left-24 top-16 -z-10 h-72 w-72 rounded-full blur-[130px]"
        style={{ background: "rgba(245,197,24,0.30)" }}
      />
      <div
        aria-hidden
        className="animate-drift pointer-events-none absolute -right-24 bottom-8 -z-10 h-80 w-80 rounded-full blur-[140px]"
        style={{ background: "rgba(168,85,247,0.30)" }}
      />
      <div
        aria-hidden
        className="animate-float pointer-events-none absolute left-1/2 top-1/2 -z-10 h-64 w-64 -translate-x-1/2 rounded-full blur-[150px]"
        style={{ background: "rgba(251,146,60,0.20)" }}
      />

      {/* Card shell with tri-color gradient border */}
      <div
        className="animate-reveal w-full max-w-5xl rounded-[2rem] p-[1.5px] shadow-[0_50px_140px_-30px_rgba(0,0,0,0.9)]"
        style={{ backgroundImage: BATUBT_BRAND_GRADIENT }}
      >
        <div className="grid overflow-hidden rounded-[1.92rem] bg-[#08080b]/90 backdrop-blur-2xl lg:grid-cols-[1fr_1fr]">
          {/* Left showcase — mascot artwork */}
          <div className="relative hidden min-h-[560px] overflow-hidden lg:block">
            <Image
              src="/batubt/loginsol.png"
              alt="BatuBT"
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 0px"
              className="object-cover"
            />
            {/* Brand color wash to fuse the artwork with the dark card */}
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(115deg, rgba(245,197,24,0.12) 0%, rgba(251,146,60,0.06) 45%, rgba(168,85,247,0.20) 100%)," +
                  "linear-gradient(180deg, rgba(8,8,11,0.05) 0%, rgba(8,8,11,0.45) 80%, rgba(8,8,11,0.88) 100%)"
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
                  style={{ backgroundImage: BATUBT_BRAND_GRADIENT }}
                >
                  <span className="font-body text-lg font-extrabold tracking-tight text-black drop-shadow">
                    B
                  </span>
                </span>
                <div className="leading-tight">
                  <p
                    className="font-body text-2xl font-extrabold tracking-tight text-transparent"
                    style={{
                      backgroundImage:
                        "linear-gradient(100deg, #F5C518, #FB923C 55%, #A855F7)",
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
                Müşteri footer kodlarının iç yönetim panosu. Erişim anahtarınla
                devam et.
              </p>
            </div>
          </div>

          {/* Right side — form + info */}
          <div className="relative px-7 py-9 sm:px-10 sm:py-11">
            {/* Top sheen */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-px"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.40), transparent)"
              }}
            />

            {/* Mobile brand (left showcase hidden on small screens) */}
            <div className="mb-8 flex items-center justify-between lg:mb-9">
              <div className="flex items-center gap-3 lg:hidden">
                <span
                  className="relative flex h-10 w-10 items-center justify-center rounded-xl ring-1 ring-white/20"
                  style={{ backgroundImage: BATUBT_BRAND_GRADIENT }}
                >
                  <span className="font-body text-base font-extrabold tracking-tight text-black">
                    B
                  </span>
                </span>
                <div className="leading-tight">
                  <p className="font-body text-sm font-bold tracking-tight text-white">
                    {brand}
                  </p>
                  <p className="text-[11px] font-medium text-white/45">
                    {subtitle}
                  </p>
                </div>
              </div>
              <span
                className="ml-auto inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]"
                style={{
                  borderColor: "rgba(245,197,24,0.35)",
                  background: "rgba(245,197,24,0.10)",
                  color: "#F5C518"
                }}
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span
                    className="absolute inline-flex h-full w-full animate-ping rounded-full"
                    style={{ background: "rgba(245,197,24,0.7)" }}
                  />
                  <span
                    className="relative inline-flex h-1.5 w-1.5 rounded-full"
                    style={{ background: "#F5C518" }}
                  />
                </span>
                Secure
              </span>
            </div>

            {/* Headline */}
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.34em]"
              style={{ color: "#d8b4fe" }}
            >
              {eyebrow}
            </p>
            <h1 className="mt-3 font-body text-[clamp(1.9rem,5vw,2.5rem)] font-bold leading-[1.05] tracking-[-0.035em] text-white">
              {title}
            </h1>
            <p className="mt-3.5 text-sm leading-7 text-white/55">
              {description}
            </p>

            {/* Form */}
            <form action={signIn} className="mt-8 space-y-5">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-white/50">
                  Access key
                </span>
                <div className="group relative">
                  <span
                    aria-hidden
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/30 transition group-focus-within:text-[#F5C518]"
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
                    className="w-full rounded-[1.05rem] border border-white/10 bg-white/[0.04] py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] outline-none transition focus:border-[#F5C518]/60 focus:bg-white/[0.06] focus:ring-4 focus:ring-[#F5C518]/15"
                  />
                </div>
              </label>
              <button
                type="submit"
                className="group relative inline-flex min-h-[52px] w-full items-center justify-center gap-2 overflow-hidden rounded-[1.05rem] px-6 py-3.5 text-sm font-bold tracking-tight text-black shadow-[0_16px_50px_-12px_rgba(245,197,24,0.6)] ring-1 ring-inset ring-white/20 transition duration-300 hover:shadow-[0_20px_60px_-12px_rgba(168,85,247,0.7)] focus:outline-none focus:ring-2 focus:ring-[#F5C518]/60"
                style={{ backgroundImage: BATUBT_BRAND_GRADIENT }}
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full"
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
