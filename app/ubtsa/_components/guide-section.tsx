import {
  UBTSA_ITEM_COUNT,
  UBTSA_PERSONA,
  UBTSA_PERSONA_TITLE,
  UBTSA_QUESTIONS,
  UBTSA_QUESTIONS_TITLE,
  UBTSA_SECTIONS,
  UBTSA_SUMMARY,
  UBTSA_SUMMARY_TITLE
} from "@/content/ubtsa-konsept";

interface GuideSectionProps {
  sessionName: string;
}

interface Stop {
  anchor: string;
  label: string;
  what: string;
}

/**
 * "Nasıl Kullanılır" — a walkthrough of the board, written so the other
 * person (Serkan) can land here cold and know what each part is for.
 *
 * Deliberately has no comment threads: it is instructions, not a topic. Any
 * disagreement belongs on the item it is about.
 */
export function GuideSection({ sessionName }: GuideSectionProps) {
  const stops: Stop[] = [
    {
      anchor: "#konsept-ozeti",
      label: UBTSA_SUMMARY_TITLE,
      what: `Konseptin tamamı ${UBTSA_SUMMARY.length} maddede. Teklifin ne olduğunu hızlıca görmek için buradan başla.`
    },
    {
      anchor: "#ubt-sorulari",
      label: UBTSA_QUESTIONS_TITLE,
      what: `Karar vermeden önce cevaplanması istenen ${UBTSA_QUESTIONS.length} soru. Cevapları buraya yorum olarak yazabilirsin.`
    },
    {
      anchor: "#insan-modeli",
      label: UBTSA_PERSONA_TITLE,
      what: `Yönlendirilecek kişinin taşıması gereken ${UBTSA_PERSONA.length} özellik. Kimin uygun olduğunu burada konuşuyoruz.`
    },
    {
      anchor: "#bolum-1",
      label: "Tam Metin",
      what: `Konuşmanın kelimesi değiştirilmemiş hâli: ${UBTSA_SECTIONS.length} bölüm, ${UBTSA_ITEM_COUNT} madde. Bir cümlenin aslını merak edersen buraya bak.`
    },
    {
      anchor: "#giris-loglari",
      label: "Giriş Logları",
      what: "Panoya kimin ne zaman girdiği. İki kullanıcı var: ubt ve serkan."
    }
  ];

  return (
    <section
      id="nasil-kullanilir"
      className="scroll-mt-6 rounded-[1.15rem] border border-slate-200/80 bg-white px-4 py-5 shadow-[0_12px_30px_-18px_rgba(15,23,42,0.25)] sm:px-6 sm:py-6"
    >
      <header className="mb-4 border-b border-slate-100 pb-3.5">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1.5">
          <span className="inline-flex h-7 items-center justify-center rounded-lg bg-slate-700 px-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-white">
            Rehber
          </span>
          <h2 className="text-[1.15rem] font-bold leading-snug tracking-[-0.02em] text-slate-800">
            Nasıl Kullanılır
          </h2>
        </div>
        <p className="mt-3 max-w-[75ch] text-[13px] leading-6 text-slate-500">
          Bu pano, Weiterbildung ve iş birliği teklifini birlikte konuşmak için
          kuruldu. Soldaki menüdeki her başlık aşağıdaki bir bölüme denk gelir;
          başlığa basınca altı açılır.
        </p>
      </header>

      <ol className="space-y-2.5">
        {stops.map((stop, index) => (
          <li key={stop.anchor} className="flex items-start gap-3">
            <span
              aria-hidden
              className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[12px] font-bold tabular-nums text-slate-600"
            >
              {index + 1}
            </span>
            <p className="min-w-0 text-[13.5px] leading-6 text-slate-600">
              <a
                href={stop.anchor}
                className="font-semibold text-slate-800 underline decoration-slate-300 underline-offset-2 transition hover:text-teal-800 hover:decoration-teal-500"
              >
                {stop.label}
              </a>{" "}
              — {stop.what}
            </p>
          </li>
        ))}
      </ol>

      <div className="mt-5 rounded-[0.9rem] bg-slate-50 px-4 py-3.5">
        <p className="text-[12.5px] font-bold uppercase tracking-[0.12em] text-slate-500">
          Yorum nasıl yapılır
        </p>
        <ul className="mt-2 space-y-1.5 text-[13px] leading-6 text-slate-600">
          <li>
            Herhangi bir maddeye tıkla — altında yorum kutusu açılır. Yorumların{" "}
            <strong className="capitalize">{sessionName}</strong> adıyla
            kaydedilir, ayrıca isim yazmana gerek yok.
          </li>
          <li>
            Yorum sayıları hem soldaki menüde hem bölüm başlıklarında görünür;
            tartışmanın nerede olduğunu tek bakışta görürsün.
          </li>
          <li>
            Sadece kendi yorumunu silebilirsin. Karşı tarafınki dursun,
            cevabını altına yaz.
          </li>
        </ul>
      </div>
    </section>
  );
}
