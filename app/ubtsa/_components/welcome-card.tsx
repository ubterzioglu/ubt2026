import {
  UBTSA_ITEM_COUNT,
  UBTSA_QUESTIONS,
  UBTSA_QUESTIONS_TITLE,
  UBTSA_SECTIONS
} from "@/content/ubtsa-konsept";

interface WelcomeCardProps {
  /** Signed-in name, so the greeting addresses the right person. */
  sessionName: string;
  /** True only on the very first visit from this browser. */
  isFirstVisit: boolean;
}

/**
 * "Hoş geldin" card shown on the first visit from a browser.
 *
 * First-visit detection comes from a long-lived cookie minted in middleware
 * (Server Components cannot set cookies during a render), so this is purely a
 * presentational branch. On later visits the card disappears entirely rather
 * than shrinking to a banner — the board is a reading surface and a permanent
 * greeting would just push the content down.
 */
export function WelcomeCard({ sessionName, isFirstVisit }: WelcomeCardProps) {
  if (!isFirstVisit) return null;

  return (
    <section
      aria-labelledby="ubtsa-welcome-title"
      className="rounded-[1.15rem] border border-teal-200 bg-white px-5 py-5 shadow-[0_12px_30px_-18px_rgba(15,118,110,0.35)] sm:px-6"
    >
      <div className="flex items-start gap-3.5">
        <span
          aria-hidden
          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-600/10 text-lg"
        >
          👋
        </span>
        <div className="min-w-0">
          <h2
            id="ubtsa-welcome-title"
            className="text-[1.05rem] font-bold capitalize tracking-[-0.02em] text-teal-900"
          >
            Hoş geldin, {sessionName}
          </h2>
          <p className="mt-2 max-w-[75ch] text-[13.5px] leading-6 text-slate-600">
            Burası Weiterbildung ve iş birliği konseptinin çalışma panosu.
            Konsept {UBTSA_SECTIONS.length} bölüm, {UBTSA_ITEM_COUNT} madde
            halinde duruyor; üstünde de karar vermeden önce sorulması gereken{" "}
            {UBTSA_QUESTIONS.length} soru var.
          </p>

          <ul className="mt-3.5 space-y-1.5 text-[13px] leading-6 text-slate-600">
            <li className="flex gap-2">
              <span aria-hidden className="text-teal-600">
                •
              </span>
              <span>
                Herhangi bir maddeye <strong>tıkla</strong>, altında yorum kutusu
                açılır. Yorumların {sessionName} adıyla kaydedilir.
              </span>
            </li>
            <li className="flex gap-2">
              <span aria-hidden className="text-teal-600">
                •
              </span>
              <span>
                Soldaki menü iki başlıktan oluşuyor:{" "}
                <strong>{UBTSA_QUESTIONS_TITLE}</strong> ve{" "}
                <strong>İçindekiler</strong>. Başlığa basınca altı açılır.
              </span>
            </li>
            <li className="flex gap-2">
              <span aria-hidden className="text-teal-600">
                •
              </span>
              <span>
                Yorum sayıları hem menüde hem bölüm başlıklarında görünür, yani
                tartışmanın nerede olduğunu tek bakışta görürsün.
              </span>
            </li>
          </ul>

          <p className="mt-3.5 text-[12px] text-slate-400">
            Bu karşılama yalnızca ilk girişte görünür.
          </p>
        </div>
      </div>
    </section>
  );
}
