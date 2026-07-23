import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "oparayaben – Satın Alma Karar Asistanı",
  description:
    "15 hızlı soruyu yanıtla, net bir AL / BEKLE / VAZGEÇ önerisi al.",
  canonical: "/buyorbyetr",
  ogType: "website"
});

/**
 * Original standalone tool from ubterzioglu.de/buyorbyetr — vanilla HTML/CSS/JS,
 * ported as-is. Markup mirrors the original body 1:1 so app.js (loaded
 * unmodified from /tools/buyorbyetr/app.js) can bind to the same element IDs.
 * CSS is scoped under .tool-buyorbyetr (see public/tools/buyorbyetr/style.css)
 * so its generic class names can't leak into the rest of the site.
 * Scripts are loaded via native defer tags to preserve data-tr.js → app.js order.
 */
export default function BuyOrByeTrPage() {
  return (
    <div className="tool-buyorbyetr">
      <link rel="stylesheet" href="/tools/buyorbyetr/style.css" />

      <div className="wrap">
        <div className="shell">

          <header className="hero">
            <div className="hero-left">
              <div className="brand-row">
                <img src="/img/logobuyorbye.png" alt="oparayaben logo" className="brand-logo" />
                <h1 className="title" id="pageTitle">oparayaben</h1>
              </div>

              <p className="subtitle" id="pageSubtitle">
                15 hızlı soruyu yanıtla, net bir AL / BEKLE / VAZGEÇ önerisi al.
              </p>
            </div>

            <div className="hero-right">
              <div className="hero-toprow" aria-label="Üst alan kontrolleri">
                <div className="mini-avatars" aria-label="UBT bağlantıları">
                  <a href="/" aria-label="UBT ana sayfa (logo)">
                    <img src="/img/logoubt.png" alt="UBT logo" className="mini-avatar" />
                  </a>
                  <a href="/" aria-label="UBT ana sayfa (profil)">
                    <img src="/img/picprofile.png" alt="UBT profil" className="mini-avatar" />
                  </a>
                </div>

                <div className="palette-dots" aria-label="Renk paleti">
                  <span className="dot dot-blue" title="#01A1F1"></span>
                  <span className="dot dot-green" title="#7CBB00"></span>
                  <span className="dot dot-orange" title="#F65314"></span>
                  <span className="dot dot-purple" title="#8F03B7"></span>
                  <span className="dot dot-yellow" title="#FFBB00"></span>
                </div>
              </div>

              <div className="pill" id="statusPill">Yükleniyor…</div>
            </div>
          </header>

          <main className="grid">
            <div id="appRoot"></div>
          </main>

        </div>
      </div>

      {/* data-tr.js must load before app.js — native defer preserves document order */}
      <script defer src="/tools/buyorbyetr/data-tr.js"></script>
      <script defer src="/tools/buyorbyetr/app.js"></script>

      <script
        dangerouslySetInnerHTML={{
          __html: `
window.addEventListener("DOMContentLoaded", function() {
  var statusPill = document.getElementById("statusPill");
  var appRoot = document.getElementById("appRoot");

  var t = window.BUYORBYE_DATA && window.BUYORBYE_DATA.ui && window.BUYORBYE_DATA.ui.heroTitle;
  var s = window.BUYORBYE_DATA && window.BUYORBYE_DATA.ui && window.BUYORBYE_DATA.ui.heroSubtitle;
  if (t) document.getElementById("pageTitle").textContent = t;
  if (s) document.getElementById("pageSubtitle").textContent = s;

  window.BUYORBYE_APP && window.BUYORBYE_APP.init({
    data: window.BUYORBYE_DATA,
    rootEl: appRoot,
    statusPill: statusPill
  });
});
`
        }}
      />
    </div>
  );
}
