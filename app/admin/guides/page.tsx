import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getGuideStats } from "@/lib/guide-events";
import { AdminGate } from "@/app/admin/_components/admin-gate";
import { AdminPageHeader } from "@/app/admin/_components/admin-page-header";
import { AdminBadge } from "@/app/admin/_components/admin-panels";
import type { BadgeTone } from "@/app/admin/_components/admin-panels";
import { adminPanelClass } from "@/app/admin/_components/form-classes";
import { guides } from "@/content/guides";
import type { GuideEventType, GuideStats } from "@/types/guides";

const EVENT_LABEL: Record<GuideEventType, string> = {
  view: "Page view",
  switch: "Language switch",
  open: "PDF open"
};

const EVENT_TONE: Record<GuideEventType, BadgeTone> = {
  view: "info",
  switch: "neutral",
  open: "success"
};

const dateTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Europe/Berlin"
});

const dayLabelFormatter = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short" });

function percent(part: number, whole: number): string {
  return whole > 0 ? `${Math.round((part / whole) * 100)}%` : "–";
}

function guideTitle(guideId: string | null): string {
  if (!guideId) return "–";
  return guides.find((guide) => guide.id === guideId)?.title.tr ?? guideId;
}

function StatTile({ label, value, hint }: Readonly<{ label: string; value: string; hint?: string }>) {
  return (
    <div className={`${adminPanelClass} px-5 py-4`}>
      <p className="text-xs font-semibold text-ink/60">{label}</p>
      <p className="mt-1 text-3xl font-semibold text-ink">{value}</p>
      {hint ? <p className="mt-1 text-xs text-ink/55">{hint}</p> : null}
    </div>
  );
}

function DailyChart({ stats }: Readonly<{ stats: GuideStats }>) {
  const max = Math.max(1, ...stats.daily.map((day) => Math.max(day.views, day.opens)));
  return (
    <section className={`${adminPanelClass} px-5 py-4`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-ink">Last 30 days</h2>
        <div className="flex gap-4 text-xs text-ink/60">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-accent/35" />
            Page views
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-accent" />
            PDF opens
          </span>
        </div>
      </div>
      <svg
        viewBox={`0 0 ${stats.daily.length * 10} 100`}
        preserveAspectRatio="none"
        role="img"
        aria-label="Daily page views and PDF opens"
        className="mt-4 h-40 w-full"
      >
        {stats.daily.map((day, index) => {
          const viewHeight = (day.views / max) * 100;
          const openHeight = (day.opens / max) * 100;
          return (
            <g key={day.date}>
              <title>{`${day.date}: ${day.views} views, ${day.opens} opens`}</title>
              <rect x={index * 10 + 1} y={100 - viewHeight} width={4} height={viewHeight} className="fill-accent/35" />
              <rect x={index * 10 + 5} y={100 - openHeight} width={4} height={openHeight} className="fill-accent" />
            </g>
          );
        })}
      </svg>
      <div className="mt-2 flex justify-between text-[11px] text-ink/45">
        <span>{dayLabelFormatter.format(new Date(stats.daily[0].date))}</span>
        <span>{dayLabelFormatter.format(new Date(stats.daily[stats.daily.length - 1].date))}</span>
      </div>
    </section>
  );
}

export default async function AdminGuidesPage() {
  if (!(await isAdminAuthenticated())) {
    return <AdminGate redirectTo="/admin/guides" submitLabel="Open guides stats" />;
  }

  const result = await getGuideStats();
  const stats = result.stats;

  return (
    <>
      <AdminPageHeader
        eyebrow="Analytics"
        title="Guides stats"
        description={
          stats?.firstEventAt
            ? `Counting since ${dateTimeFormatter.format(new Date(stats.firstEventAt))}. Bots are not counted.`
            : "Visits and PDF opens on /guides. Bots are not counted."
        }
        refreshHref="/admin/guides"
      >
        <a
          href="/guides"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[40px] items-center rounded-lg border border-line/80 bg-white px-4 py-2 text-sm font-semibold text-ink hover:border-accent/40 hover:text-accent"
        >
          Open /guides
        </a>
      </AdminPageHeader>

      {result.source === "env-missing" ? (
        <p className={`${adminPanelClass} px-5 py-4 text-sm text-ink/70`}>
          Supabase service credentials are missing, so nothing can be counted.
        </p>
      ) : null}

      {result.source === "error" ? (
        <p className={`${adminPanelClass} px-5 py-4 text-sm text-rose-700`}>
          Could not load stats: {result.errorMessage}. Make sure the guide_events table exists
          (supabase/migrations/20261115180000_create_guide_events.sql).
        </p>
      ) : null}

      {stats ? (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatTile
              label="Unique visitors"
              value={String(stats.uniqueVisitors)}
              hint={`${stats.views} page views in total`}
            />
            <StatTile
              label="PDF opens"
              value={String(stats.opens)}
              hint={`${stats.uniqueOpeners} different visitors`}
            />
            <StatTile
              label="Open rate"
              value={percent(stats.uniqueOpeners, stats.uniqueVisitors)}
              hint="Visitors who opened at least one PDF"
            />
            <StatTile
              label="Last 24 hours"
              value={String(stats.last24hViews)}
              hint={`views · ${stats.last24hOpens} PDF opens`}
            />
          </section>

          <DailyChart stats={stats} />

          <section className="grid gap-4 lg:grid-cols-3">
            <div className={`${adminPanelClass} lg:col-span-2`}>
              <h2 className="px-5 py-4 text-sm font-semibold text-ink">PDF opens by guide</h2>
              <table className="w-full border-t border-line/70 text-sm">
                <thead className="bg-paper/60 text-left text-[11px] uppercase tracking-[0.12em] text-ink/50">
                  <tr>
                    <th className="px-5 py-2 font-semibold">Guide</th>
                    <th className="px-3 py-2 text-right font-semibold">TR</th>
                    <th className="px-3 py-2 text-right font-semibold">EN</th>
                    <th className="px-5 py-2 text-right font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/70">
                  {stats.opensByGuide.map((guide) => (
                    <tr key={guide.id}>
                      <td className="px-5 py-2.5 text-ink">{guide.title}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums">{guide.tr}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums">{guide.en}</td>
                      <td className="px-5 py-2.5 text-right font-semibold tabular-nums text-ink">{guide.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-4">
              <div className={`${adminPanelClass} px-5 py-4`}>
                <h2 className="text-sm font-semibold text-ink">Page language</h2>
                <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-xs text-ink/55">TR</dt>
                    <dd className="text-xl font-semibold text-ink">
                      {stats.viewsByLanguage.tr}{" "}
                      <span className="text-xs font-normal text-ink/50">
                        {percent(stats.viewsByLanguage.tr, stats.views)}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-ink/55">EN</dt>
                    <dd className="text-xl font-semibold text-ink">
                      {stats.viewsByLanguage.en}{" "}
                      <span className="text-xs font-normal text-ink/50">
                        {percent(stats.viewsByLanguage.en, stats.views)}
                      </span>
                    </dd>
                  </div>
                </dl>
                <p className="mt-3 text-xs text-ink/55">{stats.switches} language switches on the page</p>
              </div>

              <div className={`${adminPanelClass} px-5 py-4`}>
                <h2 className="text-sm font-semibold text-ink">Where visitors came from</h2>
                {stats.referrers.length > 0 ? (
                  <ul className="mt-3 space-y-1.5 text-sm">
                    {stats.referrers.map((referrer) => (
                      <li key={referrer.host} className="flex justify-between gap-3">
                        <span className="truncate text-ink">{referrer.host}</span>
                        <span className="tabular-nums text-ink/60">{referrer.count}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm text-ink/55">No visits yet.</p>
                )}
              </div>
            </div>
          </section>

          <section className={adminPanelClass}>
            <h2 className="px-5 py-4 text-sm font-semibold text-ink">Latest activity</h2>
            {stats.recent.length > 0 ? (
              <ul className="divide-y divide-line/70 border-t border-line/70">
                {stats.recent.map((event) => (
                  <li key={event.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-2.5 text-sm">
                    <span className="w-36 shrink-0 text-xs text-ink/55">
                      {dateTimeFormatter.format(new Date(event.createdAt))}
                    </span>
                    <AdminBadge tone={EVENT_TONE[event.event]}>{EVENT_LABEL[event.event]}</AdminBadge>
                    <span className="font-mono text-xs uppercase text-ink/60">{event.language}</span>
                    {event.guideId ? <span className="text-ink">{guideTitle(event.guideId)}</span> : null}
                    {event.referrerHost ? <span className="text-xs text-ink/55">from {event.referrerHost}</span> : null}
                    {event.isNewVisitor ? <AdminBadge tone="accent">new</AdminBadge> : null}
                    <span className="ml-auto font-mono text-[11px] text-ink/40">{event.visitorId.slice(0, 8)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="border-t border-line/70 px-5 py-10 text-center text-sm text-ink/55">
                No activity yet. Visits to /guides will show up here.
              </p>
            )}
          </section>
        </>
      ) : null}
    </>
  );
}
