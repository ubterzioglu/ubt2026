import { DM_CARD_CLASS, DM_CARD_INNER_CLASS } from "@/app/dm/_components/theme";

interface StatItem {
  label: string;
  value: number | string;
}

interface StatGridProps {
  stats: readonly StatItem[];
  lift?: boolean;
}

export function StatGrid({ stats, lift = false }: Readonly<StatGridProps>) {
  const articleClass = lift
    ? `${DM_CARD_CLASS} transition duration-300 hover:-translate-y-0.5`
    : DM_CARD_CLASS;

  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <article key={stat.label} className={articleClass}>
          <div className={`${DM_CARD_INNER_CLASS} px-4 py-3`}>
            <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#f0abfc]/90">
              {stat.label}
            </p>
            <p className="mt-1 font-body text-xl font-bold text-white">
              {stat.value}
            </p>
          </div>
        </article>
      ))}
    </section>
  );
}
