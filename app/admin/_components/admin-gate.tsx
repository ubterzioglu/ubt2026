import { adminSignInAction } from "@/app/admin/_actions";

type AdminGateVariant = "light" | "dark";

interface AdminGateProps {
  /** Admin path to reload after a successful sign-in (e.g. "/admin/slots"). */
  redirectTo: string;
  /** Heading shown above the access-key field. */
  title?: string;
  /** Submit button label. */
  submitLabel?: string;
  /**
   * Override the sign-in server action. Defaults to the shared appointment-
   * admin gate; pass a self-contained action (e.g. the task board's) to use a
   * different key/cookie. Such an action handles its own redirect.
   */
  signInAction?: (formData: FormData) => void | Promise<void>;
  /**
   * Visual treatment. `light` (default) keeps the editorial look used by the
   * appointment / CV gates. `dark` renders the premium DesireMap dashboard
   * entrance used by the task board.
   */
  variant?: AdminGateVariant;
  /** Small label above the title (kicker). */
  eyebrow?: string;
  /** Brand name shown in the dark variant's header. */
  brand?: string;
  /** Supporting copy under the title. */
  description?: string;
}

const DEFAULT_DESCRIPTION =
  "This lightweight gate protects the appointment and CV review admin pages until a fuller authentication flow is added.";

/**
 * Lightweight admin access gate. Posts the access key to a server action that
 * stores it in an HttpOnly cookie — the key never appears in the URL.
 */
export function AdminGate({
  redirectTo,
  title = "Enter the admin key",
  submitLabel = "Open admin panel",
  signInAction,
  variant = "light",
  eyebrow = "Admin access",
  brand = "DesireMap",
  description = DEFAULT_DESCRIPTION
}: AdminGateProps) {
  const signIn = signInAction ?? adminSignInAction.bind(null, redirectTo);

  if (variant === "dark") {
    return (
      <DarkAdminGate
        signIn={signIn}
        title={title}
        submitLabel={submitLabel}
        eyebrow={eyebrow}
        brand={brand}
        description={description}
      />
    );
  }

  return (
    <main className="page-shell min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <section className="section-panel px-6 py-8 sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
            {eyebrow}
          </p>
          <h1 className="mt-3 font-body text-[clamp(2rem,5vw,2.6rem)] font-semibold tracking-[-0.03em] text-ink">
            {title}
          </h1>
          <p className="mt-3 text-sm leading-7 text-ink/72 sm:text-base">
            {description}
          </p>
          <form action={signIn} className="mt-8 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-ink">Access key</span>
              <input
                type="password"
                name="access"
                autoComplete="current-password"
                className="w-full rounded-[1rem] border border-line/80 bg-white px-4 py-3 text-sm text-ink shadow-sm outline-none transition focus:border-accent/55 focus:ring-2 focus:ring-accent/15"
              />
            </label>
            <button
              type="submit"
              className="inline-flex min-h-[46px] items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent/95"
            >
              {submitLabel}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

interface DarkAdminGateProps {
  signIn: (formData: FormData) => void | Promise<void>;
  title: string;
  submitLabel: string;
  eyebrow: string;
  brand: string;
  description: string;
}

/**
 * Premium dark entrance for the DesireMap todo dashboard. Self-contained: all
 * visual treatment lives in inline classes / styles so it never depends on the
 * light-theme `page-shell` / `section-panel` component layer.
 */
function DarkAdminGate({
  signIn,
  title,
  submitLabel,
  eyebrow,
  brand,
  description
}: DarkAdminGateProps) {
  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-[#070b10] px-4 py-12 sm:px-6">
      {/* Ambient glow field */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 55% at 18% 12%, rgba(27,122,110,0.34), transparent 60%)," +
            "radial-gradient(48% 50% at 86% 8%, rgba(202,124,71,0.22), transparent 58%)," +
            "radial-gradient(70% 80% at 50% 120%, rgba(27,122,110,0.18), transparent 60%)," +
            "linear-gradient(180deg, #080c12 0%, #06090d 55%, #04060a 100%)"
        }}
      />
      {/* Fine grid texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px)," +
            "linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage:
            "radial-gradient(120% 90% at 50% 20%, black, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(120% 90% at 50% 20%, black, transparent 75%)"
        }}
      />
      {/* Floating accent orbs */}
      <div
        aria-hidden
        className="animate-float pointer-events-none absolute -left-24 top-24 -z-10 h-72 w-72 rounded-full bg-accent/25 blur-[120px]"
      />
      <div
        aria-hidden
        className="animate-drift pointer-events-none absolute -right-20 bottom-10 -z-10 h-80 w-80 rounded-full bg-sunrise/20 blur-[130px]"
      />

      <div className="animate-reveal w-full max-w-md">
        {/* Glass card with gradient border */}
        <div className="rounded-[1.9rem] bg-gradient-to-b from-white/15 via-white/5 to-transparent p-[1.5px] shadow-[0_40px_120px_-20px_rgba(0,0,0,0.85)]">
          <div className="relative overflow-hidden rounded-[1.8rem] bg-[#0b1118]/85 px-7 py-9 backdrop-blur-2xl sm:px-9 sm:py-10">
            {/* Top sheen */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"
            />

            {/* Brand + status row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-[#0f4f47] shadow-lg shadow-accent/30 ring-1 ring-white/15">
                  <span className="font-body text-base font-extrabold tracking-tight text-white">
                    D
                  </span>
                  <span className="absolute -inset-px rounded-2xl ring-1 ring-inset ring-white/10" />
                </span>
                <div className="leading-tight">
                  <p className="font-body text-sm font-bold tracking-tight text-white">
                    {brand}
                  </p>
                  <p className="text-[11px] font-medium text-white/45">
                    Todo Dashboard
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-300">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>
                Secure
              </span>
            </div>

            {/* Headline */}
            <div className="mt-9">
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-accent/90">
                {eyebrow}
              </p>
              <h1 className="mt-3 font-body text-[clamp(1.9rem,6vw,2.45rem)] font-bold leading-[1.05] tracking-[-0.035em] text-white">
                {title}
              </h1>
              <p className="mt-3.5 text-sm leading-7 text-white/55">
                {description}
              </p>
            </div>

            {/* Form */}
            <form action={signIn} className="mt-8 space-y-5">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-white/50">
                  Access key
                </span>
                <div className="group relative">
                  <span
                    aria-hidden
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/30 transition group-focus-within:text-accent"
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
                    className="w-full rounded-[1.05rem] border border-white/10 bg-white/[0.04] py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] outline-none transition focus:border-accent/60 focus:bg-white/[0.06] focus:ring-4 focus:ring-accent/15"
                  />
                </div>
              </label>
              <button
                type="submit"
                className="group relative inline-flex min-h-[52px] w-full items-center justify-center gap-2 overflow-hidden rounded-[1.05rem] bg-gradient-to-r from-accent to-[#15938420] px-6 py-3.5 text-sm font-bold tracking-tight text-white shadow-[0_12px_40px_-8px_rgba(27,122,110,0.7)] ring-1 ring-inset ring-white/15 transition duration-300 hover:shadow-[0_16px_50px_-8px_rgba(27,122,110,0.85)] focus:outline-none focus:ring-2 focus:ring-accent/60"
                style={{
                  backgroundImage:
                    "linear-gradient(110deg, rgb(27,122,110) 0%, rgb(34,150,135) 50%, rgb(27,122,110) 100%)"
                }}
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full"
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
          </div>
        </div>

        {/* Sub-card caption */}
        <p className="mt-6 text-center text-[11px] font-medium uppercase tracking-[0.28em] text-white/25">
          desiremap.de · internal
        </p>
      </div>
    </main>
  );
}
