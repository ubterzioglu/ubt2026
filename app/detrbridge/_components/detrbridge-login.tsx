import {
  DETRBRIDGE_AMBIENT_BACKGROUND,
  DETRBRIDGE_BRAND_GRADIENT,
  DETRBRIDGE_GRID_TEXTURE,
  DETRBRIDGE_GOLD
} from "@/app/detrbridge/_components/theme";

interface DetrbridgeLoginProps {
  /** Sign-in server action (handles its own redirect). */
  signIn: (formData: FormData) => void | Promise<void>;
}

/**
 * detrbridge gate: a single glass auth card on the board's navy · gold
 * palette. All treatment is inline so it never touches the global site theme
 * nor the shared admin gates used elsewhere.
 */
export function DetrbridgeLogin({ signIn }: DetrbridgeLoginProps) {
  return (
    <main
      className="relative isolate flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 sm:px-6"
      style={{ background: DETRBRIDGE_AMBIENT_BACKGROUND }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.4]"
        style={DETRBRIDGE_GRID_TEXTURE}
      />
      <div
        aria-hidden
        className="animate-float pointer-events-none absolute -left-24 top-16 -z-10 h-72 w-72 rounded-full blur-[130px]"
        style={{ background: "rgba(30,58,138,0.35)" }}
      />
      <div
        aria-hidden
        className="animate-drift pointer-events-none absolute -right-24 bottom-8 -z-10 h-80 w-80 rounded-full blur-[140px]"
        style={{ background: "rgba(245,183,0,0.22)" }}
      />

      <div
        className="animate-reveal w-full max-w-md rounded-[2rem] p-[1.5px] shadow-[0_50px_140px_-30px_rgba(0,0,0,0.9)]"
        style={{ backgroundImage: DETRBRIDGE_BRAND_GRADIENT }}
      >
        <div className="overflow-hidden rounded-[1.92rem] bg-[#07080d]/90 px-7 py-9 backdrop-blur-2xl sm:px-10 sm:py-11">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span
                className="relative flex h-10 w-10 items-center justify-center rounded-xl ring-1 ring-white/20"
                style={{ backgroundImage: DETRBRIDGE_BRAND_GRADIENT }}
              >
                <span className="font-body text-base font-extrabold tracking-tight text-black">
                  B
                </span>
              </span>
              <div className="leading-tight">
                <p className="font-body text-sm font-bold tracking-tight text-white">
                  detrbridge
                </p>
                <p className="text-[11px] font-medium text-white/45">
                  Logo Seçimi
                </p>
              </div>
            </div>
            <span
              className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]"
              style={{
                borderColor: "rgba(245,183,0,0.35)",
                background: "rgba(245,183,0,0.10)",
                color: DETRBRIDGE_GOLD
              }}
            >
              <span className="relative flex h-1.5 w-1.5">
                <span
                  className="absolute inline-flex h-full w-full animate-ping rounded-full"
                  style={{ background: "rgba(245,183,0,0.7)" }}
                />
                <span
                  className="relative inline-flex h-1.5 w-1.5 rounded-full"
                  style={{ background: DETRBRIDGE_GOLD }}
                />
              </span>
              Secure
            </span>
          </div>

          <p
            className="text-[11px] font-semibold uppercase tracking-[0.34em]"
            style={{ color: "#93c5fd" }}
          >
            Yönetim erişimi
          </p>
          <h1 className="mt-3 font-body text-[clamp(1.55rem,4vw,2rem)] font-bold leading-[1.08] tracking-[-0.035em] text-white">
            detrbridge paneli
          </h1>
          <p className="mt-3 text-[13px] leading-6 text-white/55">
            Logo adaylarını yükle, puanla ve seç. Devam etmek için şifreyi
            gir.
          </p>

          <form action={signIn} className="mt-8 space-y-5">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-white/50">
                Şifre
              </span>
              <div className="group relative">
                <span
                  aria-hidden
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/30 transition group-focus-within:text-[#F5B700]"
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
                  className="w-full rounded-[1.05rem] border border-white/10 bg-white/[0.04] py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] outline-none transition focus:border-[#F5B700]/60 focus:bg-white/[0.06] focus:ring-4 focus:ring-[#F5B700]/15"
                />
              </div>
            </label>
            <button
              type="submit"
              className="group relative inline-flex min-h-[52px] w-full items-center justify-center gap-2 overflow-hidden rounded-[1.05rem] px-6 py-3.5 text-sm font-bold tracking-tight text-black shadow-[0_16px_50px_-12px_rgba(30,58,138,0.6)] ring-1 ring-inset ring-white/20 transition duration-300 hover:shadow-[0_20px_60px_-12px_rgba(245,183,0,0.6)] focus:outline-none focus:ring-2 focus:ring-[#F5B700]/60"
              style={{ backgroundImage: DETRBRIDGE_BRAND_GRADIENT }}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full"
              />
              Panoyu aç
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
            Şifre HttpOnly bir çerezde saklanır — URL&apos;de asla görünmez.
          </p>
          <p className="mt-5 text-center text-[11px] font-medium uppercase tracking-[0.28em] text-white/25">
            ubterzioglu.de · internal
          </p>
        </div>
      </div>
    </main>
  );
}
