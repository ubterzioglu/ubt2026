import { PasswordField } from "@/app/ubtsa/_components/password-field";
import {
  UBTSA_BRAND_GRADIENT,
  UBTSA_GATE_BACKGROUND,
  UBTSA_GRID_TEXTURE
} from "@/app/ubtsa/_components/theme";

interface UbtsaLoginProps {
  /** Sign-in server action (handles its own redirect). */
  signIn: (formData: FormData) => void | Promise<void>;
  /** Allowlisted names, rendered as a picker so nobody has to guess spelling. */
  names: readonly string[];
  /** Set when the previous attempt was rejected. */
  errorMessage?: string;
}

/**
 * /ubtsa gate: pick who you are, enter the shared password. The name is not a
 * secret — it only decides which of the two people a comment is stamped with;
 * the password is the actual credential. All treatment is inline so the gate
 * never touches the global site theme.
 */
export function UbtsaLogin({ signIn, names, errorMessage }: UbtsaLoginProps) {
  return (
    <main
      className="relative isolate flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 sm:px-6"
      style={{ background: UBTSA_GATE_BACKGROUND }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.4]"
        style={UBTSA_GRID_TEXTURE}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-16 -z-10 h-72 w-72 rounded-full blur-[130px]"
        style={{ background: "rgba(15,118,110,0.38)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 bottom-8 -z-10 h-80 w-80 rounded-full blur-[140px]"
        style={{ background: "rgba(21,94,117,0.28)" }}
      />

      <div
        className="w-full max-w-md overflow-hidden rounded-[1.75rem] p-[1.5px] shadow-[0_50px_140px_-30px_rgba(0,0,0,0.9)]"
        style={{ backgroundImage: UBTSA_BRAND_GRADIENT }}
      >
        <div className="rounded-[1.65rem] bg-[#04080b]/92 px-7 py-9 backdrop-blur-2xl sm:px-9 sm:py-10">
          <div className="mb-8 flex items-center gap-3">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-xl ring-1 ring-white/20"
              style={{ backgroundImage: UBTSA_BRAND_GRADIENT }}
            >
              <span className="text-base font-extrabold tracking-tight text-white">
                U
              </span>
            </span>
            <div className="leading-tight">
              <p className="text-sm font-bold tracking-tight text-white">ubtsa</p>
              <p className="text-[11px] font-medium text-white/45">
                Weiterbildung &amp; İş Birliği
              </p>
            </div>
          </div>

          <h1 className="text-[clamp(1.4rem,4vw,1.8rem)] font-bold leading-[1.1] tracking-[-0.03em] text-white">
            Konsept panosu
          </h1>
          <p className="mt-3 text-[13px] leading-6 text-white/55">
            Konsept madde madde açılmış durumda. Her maddenin altına yorum
            bırakabilirsin. Devam etmek için kim olduğunu seç ve şifreyi gir.
          </p>

          {errorMessage && (
            <p
              role="alert"
              className="mt-5 rounded-[0.9rem] border border-rose-400/25 bg-rose-400/10 px-4 py-2.5 text-[12.5px] font-medium text-rose-200"
            >
              {errorMessage}
            </p>
          )}

          <form action={signIn} className="mt-7 space-y-5">
            <fieldset>
              <legend className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-white/50">
                Kimsin
              </legend>
              <div className="grid grid-cols-2 gap-2.5">
                {names.map((name, index) => (
                  <label
                    key={name}
                    className="relative cursor-pointer rounded-[1.05rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-center text-sm font-semibold capitalize text-white/70 transition hover:border-teal-400/40 hover:text-white has-[:checked]:border-teal-400/70 has-[:checked]:bg-teal-400/15 has-[:checked]:text-white"
                  >
                    <input
                      type="radio"
                      name="name"
                      value={name}
                      defaultChecked={index === 0}
                      required
                      className="sr-only"
                    />
                    {name}
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-white/50">
                Şifre
              </span>
              <PasswordField />
            </label>

            <button
              type="submit"
              className="group relative inline-flex min-h-[52px] w-full items-center justify-center gap-2 overflow-hidden rounded-[1.05rem] px-6 py-3.5 text-sm font-bold tracking-tight text-white shadow-[0_16px_50px_-12px_rgba(15,118,110,0.6)] ring-1 ring-inset ring-white/20 transition duration-300 hover:shadow-[0_20px_60px_-12px_rgba(15,118,110,0.75)] focus:outline-none focus:ring-2 focus:ring-teal-300/60"
              style={{ backgroundImage: UBTSA_BRAND_GRADIENT }}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full"
              />
              Konsepti aç
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
