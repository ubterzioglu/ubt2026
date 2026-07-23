import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "BuyOrBye – Purchase Decision Helper",
  description:
    "Answer 15 quick questions and get a clear BUY / WAIT / BYE recommendation.",
  canonical: "/buyorbye",
  ogType: "website"
});

/**
 * Original standalone tool from ubterzioglu.de/buyorbye — vanilla HTML/CSS/JS,
 * ported as-is. Markup mirrors the original body 1:1 so app.js (loaded
 * unmodified from /tools/buyorbye/app.js) can bind to the same element IDs.
 * CSS is scoped under .tool-buyorbye (see public/tools/buyorbye/style.css) so
 * its generic class names can't leak into the rest of the site.
 *
 * Script loading order is critical: data-en.js must finish before app.js runs
 * because app.js reads window.BUYORBYE_DATA. The original inline boot() script
 * is preserved verbatim (paths updated to /tools/buyorbye/) using a native
 * <script dangerouslySetInnerHTML> so the sequential onload chain is kept
 * intact without requiring a Client Component.
 */
export default function BuyOrByePage() {
  const bootScript = `
    var statusPill = document.getElementById("statusPill");
    var appRoot = document.getElementById("appRoot");

    function boot() {
      statusPill.textContent = "Loading…";

      var dataScript = document.createElement("script");
      dataScript.src = "/tools/buyorbye/data-en.js";
      dataScript.defer = true;

      dataScript.onload = function() {
        var appScript = document.createElement("script");
        appScript.src = "/tools/buyorbye/app.js";
        appScript.defer = true;

        appScript.onload = function() {
          var t = window.BUYORBYE_DATA && window.BUYORBYE_DATA.ui && window.BUYORBYE_DATA.ui.heroTitle;
          var s = window.BUYORBYE_DATA && window.BUYORBYE_DATA.ui && window.BUYORBYE_DATA.ui.heroSubtitle;
          if (t) document.getElementById("pageTitle").textContent = t;
          if (s) document.getElementById("pageSubtitle").textContent = s;

          if (window.BUYORBYE_APP && window.BUYORBYE_APP.init) {
            window.BUYORBYE_APP.init({
              data: window.BUYORBYE_DATA,
              rootEl: appRoot,
              statusPill: statusPill
            });
          }
        };

        document.body.appendChild(appScript);
      };

      document.body.appendChild(dataScript);
    }

    boot();
  `;

  return (
    <div className="tool-buyorbye">
      <link rel="stylesheet" href="/tools/buyorbye/style.css" />

      <div className="wrap">
        <div className="shell">

          <header className="hero">
            <div className="hero-left">
              <div className="brand-row">
                <img src="/img/logobuyorbye.png" alt="BuyOrBye logo" className="brand-logo" />
                <h1 className="title" id="pageTitle">BuyOrBye</h1>
              </div>

              <p className="subtitle" id="pageSubtitle">
                Answer 15 quick questions. Get a clear BUY / WAIT / BYE recommendation.
              </p>
            </div>

            <div className="hero-right">
              <div className="hero-toprow" aria-label="Header controls">
                <div className="mini-avatars" aria-label="UBT links">
                  <a href="/" aria-label="UBT home (logo)">
                    <img src="/img/logoubt.png" alt="UBT logo" className="mini-avatar" />
                  </a>
                  <a href="/" aria-label="UBT home (profile)">
                    <img src="/img/picprofile.png" alt="UBT profile" className="mini-avatar" />
                  </a>
                </div>

                <div className="palette-dots" aria-label="Color palette">
                  <span className="dot dot-blue" title="#01A1F1"></span>
                  <span className="dot dot-green" title="#7CBB00"></span>
                  <span className="dot dot-orange" title="#F65314"></span>
                  <span className="dot dot-purple" title="#8F03B7"></span>
                  <span className="dot dot-yellow" title="#FFBB00"></span>
                </div>
              </div>

              <div className="pill" id="statusPill">Loading…</div>
            </div>
          </header>

          <main className="grid">
            <div id="appRoot"></div>
          </main>

        </div>
      </div>

      {/* eslint-disable-next-line react/no-danger */}
      <script dangerouslySetInnerHTML={{ __html: bootScript }} />
    </div>
  );
}
