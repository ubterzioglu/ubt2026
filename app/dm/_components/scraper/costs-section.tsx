// Maliyet bölümü: sağlayıcı × olay tipi bazında toplamlar (son 30 gün + tümü).

import type { FinderCostSummaryRow } from "@/lib/service-finder";
import { formatUsd } from "@/app/dm/_components/scraper/format";

interface CostsSectionProps {
  last30Days: FinderCostSummaryRow[];
  allTime: FinderCostSummaryRow[];
  cardClass: string;
  cardInnerClass: string;
}

const EVENT_LABEL: Record<string, string> = {
  search: "Arama",
  extract: "Ekstraksiyon",
  classify: "Sınıflandırma",
  grounding: "Grounding",
  manual_adjustment: "Manuel düzeltme"
};

function CostTable({ rows, title }: { rows: FinderCostSummaryRow[]; title: string }) {
  const total = rows.reduce((sum, row) => sum + row.totalAmountUsd, 0);
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f0abfc]/90">
          {title}
        </h3>
        <span className="font-body text-sm font-bold text-white">{formatUsd(total)}</span>
      </div>
      <div className="mt-2 space-y-1.5">
        {rows.length === 0 ? (
          <p className="text-xs text-white/45">Henüz maliyet kaydı yok.</p>
        ) : (
          rows.map((row) => (
            <div
              key={`${row.providerKey}:${row.eventType}`}
              className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-[0.9rem] border border-white/[0.06] bg-white/[0.02] px-3.5 py-2"
            >
              <span className="inline-flex shrink-0 items-center rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-white/50">
                {row.providerKey}
              </span>
              <span className="min-w-0 flex-1 text-[12px] text-white/70">
                {EVENT_LABEL[row.eventType] ?? row.eventType}
              </span>
              <span className="shrink-0 text-[10px] text-white/35">
                {row.callCount} çağrı
              </span>
              <span className="shrink-0 font-body text-[12px] font-semibold text-white">
                {formatUsd(row.totalAmountUsd)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function CostsSection({
  last30Days,
  allTime,
  cardClass,
  cardInnerClass
}: CostsSectionProps) {
  return (
    <section className={cardClass}>
      <div className={`${cardInnerClass} space-y-5 px-4 py-4 sm:px-5`}>
        <h2 className="font-body text-sm font-semibold text-white">Maliyetler</h2>
        <CostTable rows={last30Days} title="Son 30 gün" />
        <CostTable rows={allTime} title="Tüm zamanlar" />
      </div>
    </section>
  );
}
