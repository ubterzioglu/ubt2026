import type { BridgeNavItem } from "@/app/detrbridge/_components/bridge-nav";
import { WelcomeCard } from "@/app/detrbridge/_components/welcome-card";
import {
  DETRBRIDGE_BRAND_GRADIENT,
  DETRBRIDGE_GOLD
} from "@/app/detrbridge/_components/theme";

interface WelcomeTabProps {
  sessionName: string;
  isFirstVisit: boolean;
  hoursAfterShare: number;
  /** Kısayol kartları — "welcome" hariç bütün sekmeler. */
  items: BridgeNavItem[];
}

/** Sekme başına tek cümlelik açıklama; kısayol kartında alt satır olur. */
const TAB_BLURB: Record<string, string> = {
  todos2: "Toplantıda konuşulacak başlıklar, sorumlusu ve yorumlarıyla.",
  "meeting-brief": "31 Temmuz oturumlarının madde madde özeti — her maddeye yorum.",
  visits: "Panele kim, ne zaman giriş yapmış.",
  todos: "Ekip görevleri: sorumlu, teslim tarihi, dosya ve yorum.",
  logos: "1. tur logo adayları ve puanlama.",
  "logos-round2": "İlk turdan çıkan 5 aday, ikinci tur oylaması.",
  domains: "Alan adı önerileri, yıllık fiyat ve puanları."
};

/**
 * "Hoş Geldiniz" sekmesi: panele girenin ilk gördüğü sayfa. Tarih kartı,
 * isme özel selamlama, panonun ne olduğu ve bütün sekmelere kısayol.
 * Navigasyondaki ilk sekme ve ?tab= verilmediğinde açılan varsayılan.
 */
export function WelcomeTab({
  sessionName,
  isFirstVisit,
  hoursAfterShare,
  items
}: WelcomeTabProps) {
  const displayName = sessionName
    ? sessionName.charAt(0).toLocaleUpperCase("tr-TR") + sessionName.slice(1)
    : "";

  return (
    <div className="space-y-4">
      <WelcomeCard isFirstVisit={isFirstVisit} hoursAfterShare={hoursAfterShare} />

      <section className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.03] px-6 py-6 backdrop-blur-xl sm:px-8 sm:py-7">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: DETRBRIDGE_GOLD, boxShadow: `0 0 12px ${DETRBRIDGE_GOLD}` }}
          />
          detrbridge · ortak pano
        </span>

        <h2 className="mt-4 font-body text-3xl font-bold leading-[1.05] tracking-[-0.04em] text-white sm:text-4xl">
          {displayName ? `Hoş geldin, ${displayName}.` : "Hoş geldin."}{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: DETRBRIDGE_BRAND_GRADIENT }}
          >
            Her şey burada.
          </span>
        </h2>

        <p className="mt-3 max-w-2xl text-[13px] leading-relaxed text-white/55">
          Bu pano ekibin ortak çalışma alanı: toplantı konuları, görevler, toplantı
          özeti ve marka kararları (logo, alan adı) tek yerde. Yazdığın her şey
          anında herkeste görünür — ayrıca kaydetmen gerekmez.
        </p>

        <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
          {[
            "Görev ve konu başlıkları silinmez, arşivlenir — kimse yanlışlıkla veri kaybettiremez.",
            "Her maddenin altına yorum bırakabilir, dosya ekleyebilirsin.",
            "Panele her giriş “Giriş Logları” sekmesine kaydedilir."
          ].map((line) => (
            <li
              key={line}
              className="flex items-start gap-2.5 rounded-[1rem] border border-white/[0.07] bg-white/[0.02] px-4 py-3 text-[12.5px] leading-relaxed text-white/60"
            >
              <span className="mt-[3px] shrink-0" style={{ color: DETRBRIDGE_GOLD }}>
                ✦
              </span>
              {line}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h3 className="px-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white/40">
          Sekmeler
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <a
              key={item.key}
              href={`/detrbridge?tab=${item.key}`}
              className="group flex items-start justify-between gap-4 rounded-[1.3rem] border border-white/10 bg-white/[0.03] px-5 py-4 backdrop-blur-xl transition hover:border-[#F5B700]/35 hover:bg-white/[0.05]"
            >
              <span className="min-w-0">
                <span className="block font-body text-[15px] font-semibold tracking-tight text-white">
                  {item.label}
                </span>
                <span className="mt-1 block text-[12px] leading-relaxed text-white/45">
                  {TAB_BLURB[item.key] ?? ""}
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-2">
                {item.count !== undefined ? (
                  <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[11px] font-bold tabular-nums text-white/60">
                    {item.count}
                  </span>
                ) : null}
                <span className="text-white/25 transition group-hover:translate-x-0.5 group-hover:text-[#F5B700]">
                  →
                </span>
              </span>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
