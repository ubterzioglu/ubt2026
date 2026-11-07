import type { CSSProperties, ReactNode } from "react";

export interface SplitLoginTheme {
  ambientBackground: string;
  brandGradient: string;
  gridTexture: CSSProperties;
  orbColors: readonly [string, string, string];
  panelBackgroundClass: string;
  logoLetter: string;
  accentHex: string;
  accentRgb: string;
  eyebrowColor: string;
  passwordLabel: string;
  footerNote: string;
  iconFocusClass: string;
  inputFocusBorderClass: string;
  inputFocusRingClass: string;
  buttonShadowClass: string;
  buttonHoverShadowClass: string;
  buttonFocusRingClass: string;
}

interface SplitLoginShellProps {
  signIn: (formData: FormData) => void | Promise<void>;
  eyebrow: string;
  title: string;
  description: string;
  submitLabel: string;
  brand: string;
  subtitle: string;
  footerCaption: string;
  showcase: ReactNode;
  theme: Readonly<SplitLoginTheme>;
}

export function SplitLoginShell({
  signIn,
  eyebrow,
  title,
  description,
  submitLabel,
  brand,
  subtitle,
  footerCaption,
  showcase,
  theme
}: SplitLoginShellProps) {
  return (
    <main
      className="relative isolate flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 sm:px-6"
      style={{ background: theme.ambientBackground }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.4]"
        style={theme.gridTexture}
      />
      <div
        aria-hidden
        className="animate-float pointer-events-none absolute -left-24 top-16 -z-10 h-72 w-72 rounded-full blur-[130px]"
        style={{ background: theme.orbColors[0] }}
      />
      <div
        aria-hidden
        className="animate-drift pointer-events-none absolute -right-24 bottom-8 -z-10 h-80 w-80 rounded-full blur-[140px]"
        style={{ background: theme.orbColors[1] }}
      />
      <div
        aria-hidden
        className="animate-float pointer-events-none absolute left-1/2 top-1/2 -z-10 h-64 w-64 -translate-x-1/2 rounded-full blur-[150px]"
        style={{ background: theme.orbColors[2] }}
      />

      <div
        className="animate-reveal w-full max-w-5xl rounded-[2rem] p-[1.5px] shadow-[0_50px_140px_-30px_rgba(0,0,0,0.9)]"
        style={{ backgroundImage: theme.brandGradient }}
      >
        <div
          className={`grid overflow-hidden rounded-[1.92rem] ${theme.panelBackgroundClass} backdrop-blur-2xl lg:grid-cols-[1fr_1fr]`}
        >
          <div className="relative hidden min-h-[560px] overflow-hidden lg:block">
            {showcase}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10"
            />
          </div>

          <div className="relative px-7 py-9 sm:px-10 sm:py-11">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-px"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.40), transparent)"
              }}
            />

            <div className="mb-8 flex items-center justify-between lg:mb-9">
              <div className="flex items-center gap-3 lg:hidden">
                <span
                  className="relative flex h-10 w-10 items-center justify-center rounded-xl ring-1 ring-white/20"
                  style={{ backgroundImage: theme.brandGradient }}
                >
                  <span className="font-body text-base font-extrabold tracking-tight text-black">
                    {theme.logoLetter}
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
                  borderColor: `rgba(${theme.accentRgb},0.35)`,
                  background: `rgba(${theme.accentRgb},0.10)`,
                  color: theme.accentHex
                }}
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span
                    className="absolute inline-flex h-full w-full animate-ping rounded-full"
                    style={{ background: `rgba(${theme.accentRgb},0.7)` }}
                  />
                  <span
                    className="relative inline-flex h-1.5 w-1.5 rounded-full"
                    style={{ background: theme.accentHex }}
                  />
                </span>
                Secure
              </span>
            </div>

            <p
              className="text-[11px] font-semibold uppercase tracking-[0.34em]"
              style={{ color: theme.eyebrowColor }}
            >
              {eyebrow}
            </p>
            <h1 className="mt-3 font-body text-[clamp(1.55rem,4vw,2rem)] font-bold leading-[1.08] tracking-[-0.035em] text-white">
              {title}
            </h1>
            <p className="mt-3 text-[13px] leading-6 text-white/55">
              {description}
            </p>

            <form action={signIn} className="mt-8 space-y-5">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-white/50">
                  {theme.passwordLabel}
                </span>
                <div className="group relative">
                  <span
                    aria-hidden
                    className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/30 transition ${theme.iconFocusClass}`}
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
                    className={`w-full rounded-[1.05rem] border border-white/10 bg-white/[0.04] py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] outline-none transition ${theme.inputFocusBorderClass} focus:bg-white/[0.06] focus:ring-4 ${theme.inputFocusRingClass}`}
                  />
                </div>
              </label>
              <button
                type="submit"
                className={`group relative inline-flex min-h-[52px] w-full items-center justify-center gap-2 overflow-hidden rounded-[1.05rem] px-6 py-3.5 text-sm font-bold tracking-tight text-black ${theme.buttonShadowClass} ring-1 ring-inset ring-white/20 transition duration-300 ${theme.buttonHoverShadowClass} focus:outline-none focus:ring-2 ${theme.buttonFocusRingClass}`}
                style={{ backgroundImage: theme.brandGradient }}
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
              {theme.footerNote}
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
