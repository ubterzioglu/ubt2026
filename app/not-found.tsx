import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "404 — Page not found | Umut Barış Terzioglu",
  robots: { index: false }
};

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-20">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[55%] select-none font-display text-[clamp(12rem,38vw,24rem)] font-bold leading-none text-ink/[0.035]"
      >
        404
      </span>

      <div className="relative z-10 flex flex-col items-center gap-6">
        <div
          className="relative"
          style={{ animation: "bubble-in 0.55s cubic-bezier(0.34,1.56,0.64,1) both" }}
        >
          <div className="relative max-w-[280px] rounded-2xl border border-line/90 bg-paper px-7 py-5 shadow-[0_8px_32px_-4px_rgba(20,31,39,0.10)]">
            <p className="font-body text-[0.95rem] font-semibold leading-snug text-ink">
              Hmm, nothing here yet —
            </p>
            <p className="mt-1 font-body text-[0.95rem] leading-snug text-ink/70">
              content will be ready{" "}
              <span className="font-semibold text-accent">as soon as possible!</span>
            </p>

            <div
              aria-hidden="true"
              className="absolute -bottom-[8px] left-1/2 h-3.5 w-3.5 -translate-x-1/2 rotate-45 border-b border-r border-line/90 bg-paper"
            />
          </div>
        </div>

        <div style={{ animation: "float 5s ease-in-out infinite" }}>
          <Image
            src="/1yeni.png"
            alt="Umut Barış Terzioglu"
            width={240}
            height={240}
            priority
            className="drop-shadow-xl"
          />
        </div>

        <div
          className="flex flex-col items-center gap-4 text-center"
          style={{ animation: "fade-up 0.6s 0.3s ease-out both" }}
        >
          <p className="font-body text-xs uppercase tracking-[0.18em] text-ink/40">
            This page doesn&apos;t exist
          </p>
          <Link
            href="/"
            className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-accent px-7 py-2.5 font-body text-sm font-semibold text-white transition hover:bg-accent/90"
          >
            Back to homepage
          </Link>
        </div>
      </div>
    </main>
  );
}
