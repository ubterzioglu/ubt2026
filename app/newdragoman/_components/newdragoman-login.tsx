import {
  DRAGOMAN_AMBIENT_BACKGROUND,
  DRAGOMAN_BUOY,
  DRAGOMAN_DEEP,
  DRAGOMAN_FOAM
} from "@/app/newdragoman/_components/theme";

interface NewdragomanLoginProps {
  /** Sign-in server action (handles its own redirect). */
  signIn: (formData: FormData) => void | Promise<void>;
}

/**
 * Single-password gate in front of the Dragoman redesign proposal. Styled in
 * the document's own teal/buoy palette and kept inline so it never touches the
 * global site theme.
 */
export function NewdragomanLogin({ signIn }: NewdragomanLoginProps) {
  return (
    <main
      className="relative isolate flex min-h-screen items-center justify-center overflow-hidden px-4 py-12"
      style={{ background: DRAGOMAN_AMBIENT_BACKGROUND }}
    >
      <div className="w-full max-w-md rounded-[1.75rem] border border-white/10 bg-white/[0.05] p-8 backdrop-blur-xl shadow-[0_40px_120px_-30px_rgba(0,0,0,0.8)] sm:p-10">
        <p
          className="text-[11px] font-semibold uppercase tracking-[0.3em]"
          style={{ color: DRAGOMAN_BUOY }}
        >
          dragoman-turkey.com
        </p>
        <h1
          className="mt-3 font-body text-[clamp(1.5rem,4vw,1.95rem)] font-bold leading-[1.1] tracking-[-0.03em]"
          style={{ color: DRAGOMAN_FOAM }}
        >
          Yenileme önerisi
        </h1>
        <p className="mt-3 text-[13px] leading-6 text-white/55">
          Doküman paylaşıma kapalı. Devam etmek için şifreyi girin.
        </p>

        <form action={signIn} className="mt-8 space-y-5">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-white/50">
              Şifre
            </span>
            <input
              type="password"
              name="access"
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full rounded-[1rem] border border-white/10 bg-white/[0.04] px-4 py-3.5 text-sm text-white placeholder:text-white/25 outline-none transition focus:border-white/40 focus:bg-white/[0.07] focus:ring-4 focus:ring-white/10"
            />
          </label>
          <button
            type="submit"
            className="inline-flex min-h-[52px] w-full items-center justify-center rounded-[1rem] px-6 text-sm font-bold tracking-tight ring-1 ring-inset ring-white/25 transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-white/60"
            style={{ background: DRAGOMAN_BUOY, color: DRAGOMAN_DEEP }}
          >
            Dokümanı aç
          </button>
        </form>

        <p className="mt-7 text-center text-[11px] text-white/35">
          Şifre HttpOnly bir çerezde saklanır — URL&apos;de asla görünmez.
        </p>
        <p className="mt-4 text-center text-[11px] font-medium uppercase tracking-[0.28em] text-white/25">
          ubterzioglu.de · internal
        </p>
      </div>
    </main>
  );
}
