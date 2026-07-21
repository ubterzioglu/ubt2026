import type { Metadata } from "next";

import { isTasksAdminAuthenticated } from "@/lib/admin-auth";
import { tasksSignInAction, tasksSignOutAction } from "@/app/dm/_actions";
import { DmLogin } from "@/app/dm/_components/dm-login";
import { DmNav } from "@/app/dm/_components/dm-nav";
import {
  DM_AMBIENT_BACKGROUND,
  DM_BRAND_GRADIENT,
  DM_GRID_TEXTURE
} from "@/app/dm/_components/theme";
import { getAllFinderCandidatesAdmin } from "@/lib/service-finder";

export const metadata: Metadata = {
  robots: { index: false, follow: false }
};

const CATEGORY_LABELS: Record<string, string> = {
  fkk: "FKK / Sauna Club",
  bordell: "Bordell / Laufhaus",
  studio: "Erotik Studio",
  privat: "Privat"
};

function confidenceBadgeClass(score: number): string {
  if (score >= 70) return "border border-emerald-400/40 bg-emerald-400/12 text-emerald-200";
  if (score >= 50) return "border border-violet-400/40 bg-violet-400/12 text-violet-100";
  return "border border-white/[0.14] bg-white/[0.06] text-white/60";
}

/**
 * `/dm/rapor` — bağımsız, tam genişlik scraper sonuç raporu. `/dm`'nin
 * auth gate'ini ve nav/tema kabuğunu paylaşır ama kendi route'unda yaşar
 * (query-param tab mekanizmasından ayrı) çünkü satır satır tam genişlik
 * liste, sidebar+içerik grid düzenine sığmıyor.
 */
export default async function DmRaporPage() {
  const hasAccess = await isTasksAdminAuthenticated();

  if (!hasAccess) {
    return (
      <DmLogin
        signIn={tasksSignInAction}
        eyebrow="Admin erişimi"
        title="DesireMap görev panosu"
        description="Bu özel pano DesireMap görev yönetimine erişimi korur. Devam etmek için admin anahtarını gir."
        submitLabel="Görev panosunu aç"
      />
    );
  }

  const candidates = await getAllFinderCandidatesAdmin();

  const byCategory = new Map<string, number>();
  const byCity = new Map<string, number>();
  for (const candidate of candidates) {
    const cat = candidate.categorySlug || "bilinmeyen";
    byCategory.set(cat, (byCategory.get(cat) ?? 0) + 1);
    const city = candidate.city || "bilinmeyen";
    byCity.set(city, (byCity.get(city) ?? 0) + 1);
  }
  const categoryStats = Array.from(byCategory.entries()).sort((a, b) => b[1] - a[1]);
  const cityCount = byCity.size;

  const cardClass =
    "rounded-[1.6rem] bg-gradient-to-b from-white/12 via-white/[0.04] to-transparent p-[1.3px] shadow-[0_30px_90px_-30px_rgba(0,0,0,0.85)]";
  const cardInnerClass = "rounded-[1.55rem] bg-[#0a0712]/85 backdrop-blur-2xl";

  return (
    <main
      className="relative isolate min-h-screen overflow-x-clip px-4 py-8 sm:px-6 lg:px-8"
      style={{ background: DM_AMBIENT_BACKGROUND }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.3]"
        style={DM_GRID_TEXTURE}
      />
      <div
        aria-hidden
        className="animate-float pointer-events-none absolute -left-28 top-32 -z-10 h-72 w-72 rounded-full blur-[120px]"
        style={{ background: "rgba(255,45,149,0.22)" }}
      />
      <div
        aria-hidden
        className="animate-drift pointer-events-none absolute -right-24 top-[40rem] -z-10 h-80 w-80 rounded-full blur-[130px]"
        style={{ background: "rgba(34,211,238,0.18)" }}
      />

      <div className="animate-reveal mx-auto w-full max-w-[88rem] lg:grid lg:grid-cols-[250px_minmax(0,1fr)] lg:items-start lg:gap-6">
        <DmNav
          activeTab="rapor"
          items={[
            { key: "tasks", label: "Görevler", href: "/dm" },
            { key: "findings", label: "Test bulguları", href: "/dm?tab=findings" },
            { key: "social", label: "İçerik", href: "/dm?tab=social" },
            { key: "info", label: "Önemli bilgiler", href: "/dm?tab=info" },
            { key: "scraper", label: "Scraper", href: "/dm?tab=scraper" },
            { key: "rapor", label: "Rapor", href: "/dm/rapor" }
          ]}
          cardClass={cardClass}
          cardInnerClass={cardInnerClass}
          signOutAction={tasksSignOutAction}
        />

        <div className="mt-5 flex min-w-0 flex-col gap-5 lg:mt-0">
          {/* Başlık */}
          <section className={cardClass}>
            <div className={`${cardInnerClass} px-5 py-4 sm:px-6`}>
              <p
                className="text-[9px] font-semibold uppercase tracking-[0.28em]"
                style={{ color: "#f0abfc" }}
              >
                DesireMap · iç panel
              </p>
              <h1 className="mt-1 font-body text-[clamp(1.15rem,2.6vw,1.5rem)] font-bold tracking-[-0.035em] text-white">
                Rapor
              </h1>
              <p className="mt-1 text-xs leading-5 text-white/50">
                Scraper taramasında bulunan tüm mekanların tam listesi —{" "}
                {candidates.length} kayıt, {cityCount} şehir.
              </p>
            </div>
          </section>

          {/* Özet istatistikler */}
          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Toplam kayıt", value: candidates.length },
              { label: "Şehir sayısı", value: cityCount },
              ...categoryStats.slice(0, 2).map(([slug, count]) => ({
                label: CATEGORY_LABELS[slug] ?? slug,
                value: count
              }))
            ].map((stat) => (
              <article
                key={stat.label}
                className={`${cardClass} transition duration-300 hover:-translate-y-0.5`}
              >
                <div className={`${cardInnerClass} px-4 py-3`}>
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

          {/* Tam genişlik satır satır liste */}
          <section className={cardClass}>
            <div className={`${cardInnerClass} px-4 py-4 sm:px-5`}>
              <h2 className="font-body text-sm font-semibold text-white">
                Tüm mekanlar <span className="text-white/40">({candidates.length})</span>
              </h2>

              <div className="mt-3 flex flex-col divide-y divide-white/[0.06]">
                {candidates.length === 0 ? (
                  <p className="rounded-[1rem] border border-dashed border-white/15 px-4 py-8 text-center text-xs text-white/45">
                    Henüz taranmış mekan yok.
                  </p>
                ) : (
                  candidates.map((candidate) => (
                    <div
                      key={candidate.id}
                      className="flex w-full flex-wrap items-start gap-x-3 gap-y-2 py-3 first:pt-1 last:pb-1"
                    >
                      <span
                        className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums ${confidenceBadgeClass(candidate.confidenceScore)}`}
                        title={`Güven skoru: ${candidate.confidenceScore}`}
                      >
                        {Math.round(candidate.confidenceScore)}
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          {candidate.websiteUrl ? (
                            <a
                              href={candidate.websiteUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-body text-[13px] font-semibold leading-snug text-white transition hover:text-[#67e8f9]"
                            >
                              {candidate.canonicalName}
                            </a>
                          ) : (
                            <span className="font-body text-[13px] font-semibold leading-snug text-white">
                              {candidate.canonicalName}
                            </span>
                          )}
                          {candidate.categorySlug ? (
                            <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/50">
                              {CATEGORY_LABELS[candidate.categorySlug] ?? candidate.categorySlug}
                            </span>
                          ) : null}
                        </div>

                        <p className="mt-0.5 text-[11px] text-white/40">
                          {[
                            [candidate.street, candidate.houseNumber].filter(Boolean).join(" ") ||
                              candidate.addressLine,
                            [candidate.postalCode, candidate.city].filter(Boolean).join(" "),
                            candidate.languages.join("/")
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>

                        {candidate.services.length > 0 ? (
                          <p className="mt-0.5 text-[11px] text-white/45">
                            {candidate.services.join(", ")}
                          </p>
                        ) : null}

                        {candidate.contacts.length > 0 ? (
                          <p className="mt-0.5 text-[11px] text-white/50">
                            {candidate.contacts
                              .map((contact) => `${contact.type}: ${contact.value}`)
                              .join(" · ")}
                          </p>
                        ) : null}

                        {candidate.selfStatements.length > 0 ? (
                          <details className="mt-1">
                            <summary className="cursor-pointer text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-200/60 hover:text-amber-200/90">
                              Öz-tanım ({candidate.selfStatements.length})
                            </summary>
                            <ul className="mt-1 space-y-1">
                              {candidate.selfStatements.map((entry, index) => (
                                <li
                                  key={index}
                                  className="rounded-[0.6rem] border border-amber-400/[0.12] bg-amber-400/[0.04] px-2.5 py-1.5 text-[11px] italic leading-4 text-amber-100/70"
                                >
                                  &ldquo;{entry.quote}&rdquo;
                                </li>
                              ))}
                            </ul>
                          </details>
                        ) : null}

                        {candidate.evidence.length > 0 ? (
                          <details className="mt-1">
                            <summary className="cursor-pointer text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35 hover:text-white/60">
                              Kanıt alıntıları ({candidate.evidence.length})
                            </summary>
                            <ul className="mt-1 space-y-1">
                              {candidate.evidence.map((entry, index) => (
                                <li
                                  key={index}
                                  className="rounded-[0.6rem] border border-white/[0.06] bg-white/[0.02] px-2.5 py-1.5 text-[11px] italic leading-4 text-white/55"
                                >
                                  &ldquo;{entry.quote}&rdquo;
                                </li>
                              ))}
                            </ul>
                          </details>
                        ) : null}

                        <p className="mt-1 text-[10px] text-white/30">
                          {candidate.jobTitle}
                          {candidate.sourceUrls.length > 0 ? (
                            <>
                              {" · "}
                              <a
                                href={candidate.sourceUrls[0]}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#67e8f9]/70 hover:text-[#67e8f9]"
                              >
                                {candidate.sourceUrls[0]}
                              </a>
                            </>
                          ) : null}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
