import type { Metadata } from "next";
import Script from "next/script";

import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "İyi tatiller! | TR 2026 Tatil Hesaplayıcı | UBT",
  description:
    "Türkiye 2026 tatillerine göre seçtiğin tarih aralığında toplam tatil gününü, izinden giden günleri, hafta sonunu ve iş gününe denk gelen resmî tatilleri hesapla.",
  canonical: "/holiday",
  ogType: "website"
});

/**
 * Original standalone tool from ubterzioglu.de/holiday — vanilla HTML/CSS/JS,
 * ported as-is. Markup mirrors the original body 1:1 so app.js (loaded
 * unmodified from /tools/holiday/app.js) can bind to the same element IDs.
 * CSS is scoped under .tool-holiday (see public/tools/holiday/style.css) so its
 * generic class names can't leak into the rest of the site.
 */
export default function HolidayPage() {
  return (
    <div className="tool-holiday">
      <link rel="stylesheet" href="/tools/holiday/style.css" />
      <main className="wrap">
        <section className="card card--blue">

          <header className="card__head">
            <div className="headRow">
              <div className="headLeft">
                <h1>Türkiye 2026 Tatil Hesaplayıcı</h1>
                <p className="muted">Tarih aralığını seç, sistem toplam tatili ve izinden giden günleri hesaplasın.</p>
              </div>

              <div className="headRight">
                <a href="/">
                  <img className="ubtLogo" src="/img/logoubt.png" alt="UBT logo" />
                </a>
                <a href="/">
                  <img className="ubtPic" src="/img/picprofile.png" alt="UBT profile" />
                </a>
              </div>
            </div>
          </header>

          <div className="stack">

            {/* INFO */}
            <div className="panel panel--yellow">
              <div className="panelTop">
                <h2 className="panel__title">Hesaplama / Bilgi</h2>
                <div className="stackBtns">
                  <button id="toggleInfo" className="btn btn--ghost">Bilgi aç</button>
                  <button id="toggleHolidayList" className="btn btn--ghost">2026 Tatiller aç</button>
                  <button id="toggleTips" className="btn btn--ghost">Tüyoları aç</button>
                </div>
              </div>

              <div id="infoBody" className="infobox hidden">
                <ul className="bullets">
                  <li>Hafta sonları ve resmî tatiller otomatik düşülür.</li>
                  <li>Arefeler yarım gün sayılır.</li>
                  <li>Bu sürüm sadece TR 2026 içindir.</li>
                </ul>
              </div>

              <div id="holidayList" className="holidaylist hidden"></div>

              {/* TİPS KARTI */}
              <div id="tipsCard" className="infobox hidden">
                🌟 UBT&apos;den Tüyolar! <br /><br />

                🌟 1 Ocak 2026 Perşembe resmî tatil; 2 Ocak Cuma izin alırsan Perşembe–Pazar 4 günlük tatil çıkar. <br /><br />

                🌟 Ramazan Bayramı 19–22 Mart aralığında; 16–18 Mart (Pazartesi–Çarşamba) izin alırsan 15–22 Mart arasında 9 güne kadar tatil yapabilirsin. <br /><br />

                🌟 23 Nisan 2026 Perşembe; 24 Nisan Cuma izin alırsan Perşembe–Pazar 4 günlük tatil olur. <br /><br />

                🌟 1 Mayıs 2026 Cuma; Cumartesi–Pazar ile birleşince 3 günlük tatil hazır. <br /><br />

                🌟 19 Mayıs 2026 Salı; 18 Mayıs Pazartesi izin alırsan 4 günlük mini tatil yaparsın. <br /><br />

                🌟 Kurban Bayramı 26–30 Mayıs döneminde; 25 Mayıs ve 1 Haziran Pazartesi izin alarak 9–10 gün tatil planlayabilirsin. <br /><br />

                🌟 15 Temmuz 2026 Çarşamba; 13–14 Temmuz izin alırsan 5 günlük tatil yakalarsın. <br /><br />

                🌟 30 Ağustos 2026 Pazar; 31 Ağustos Pazartesi izin eklersen Cumartesi–Pazartesi 3 günlük tatil olur. <br /><br />

                🌟 29 Ekim 2026 Perşembe; 30 Ekim Cuma izin alırsan Perşembe–Pazar 4 günlük tatil çıkar. <br /><br />

                🌟 Ramazan ve Kurban Bayramı civarında Kapadokya, Ege veya Akdeniz gibi rotalara kısa kaçamak planlayıp hafta içi ekstra izinle daha sakin tarihleri yakalayabilirsin.
              </div>
            </div>

            {/* DATE RANGE */}
            <div className="panel panel--blue">
              <h2 className="panel__title">Tatil Aralığı</h2>

              <div className="row2">
                <label className="field">
                  <span className="field__label">Başlangıç</span>
                  <input id="startDate" type="date" />
                </label>
                <label className="field">
                  <span className="field__label">Bitiş</span>
                  <input id="endDate" type="date" />
                </label>
              </div>

              <div id="pickedSummary" className="picked muted hidden"></div>

              <div className="actions">
                <button id="calcBtn" className="btn btn--primary">Hesapla</button>
                <button id="resetBtn" className="btn btn--danger">Sıfırla</button>
              </div>

              {/* sistem tüyosu */}
              <div id="tipsBox" className="tips hidden"></div>
            </div>

            {/* RESULTS */}
            <div className="panel panel--purple">
              <div className="resultsHead">
                <div>
                  <h2 className="panel__title">Sonuçlar</h2>
                  <div id="tripBadge" className="tripBadge hidden"></div>
                </div>

                <div className="effBox">
                  <div className="effLabel">İzin Verimliliği</div>
                  <div className="effBar">
                    <div id="effFill" className="effFill"></div>
                  </div>
                  <div id="effText" className="effText">—</div>
                </div>
              </div>

              <div className="kpis kpis--stack">
                <div className="kpi kpi--green">
                  <div className="kpi__label">Toplam tatil</div>
                  <div id="kpiTotal" className="kpi__value">—</div>
                  <div className="kpi__sub muted">Seçtiğin aralıktaki toplam gün</div>
                </div>

                <div className="kpi kpi--orange">
                  <div className="kpi__label">İzinden giden</div>
                  <div id="kpiLeaveHuman" className="kpi__value">—</div>
                  <div className="kpi__sub muted">Hafta içi ve tatil olmayan günler</div>
                </div>

                <div className="kpi kpi--purple">
                  <div className="kpi__label">Resmî tatil (iş gününe denk)</div>
                  <div id="kpiHolidaysHuman" className="kpi__value">—</div>
                  <div className="kpi__sub muted">Arefeler 0.5 sayılır</div>
                </div>

                <div className="kpi kpi--yellow">
                  <div className="kpi__label">Hafta sonu</div>
                  <div id="kpiWeekends" className="kpi__value">—</div>
                  <div className="kpi__sub muted">Cumartesi + Pazar</div>
                </div>
              </div>

              <div className="miniSection">
                <div className="miniTitle">Haftalık Ritim</div>
                <div id="rhythmRow" className="rhythmRow">—</div>
              </div>

              <div className="miniSection">
                <div className="miniTitle">Hafta Hafta Plan</div>
                <div id="weeklyPlan" className="weeklyPlan muted">
                  Tarih seçip hesaplayınca burada haftalık özet çıkacak.
                </div>
              </div>
            </div>

            <footer className="footer">
              Made with ☀️ by <strong>UBT</strong>
            </footer>

          </div>
        </section>
      </main>

      <Script src="/tools/holiday/app.js" strategy="afterInteractive" />
    </div>
  );
}
