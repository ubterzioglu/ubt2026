import type { Metadata } from "next";
import Script from "next/script";

import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "ZPATH – Career Decision Check (Yes / No)",
  description:
    "A quick yes/no flow that checks whether your career decision is driven more by logic or emotion. No signup. No data stored. Runs in your browser.",
  canonical: "/zpath",
  ogType: "website"
});

/**
 * Original standalone tool from ubterzioglu.de/zpath — vanilla HTML/CSS/JS,
 * ported as-is. Markup mirrors the original body 1:1 so zpath.js (loaded
 * unmodified from /tools/zpath/zpath.js) can bind to the same element IDs.
 * CSS is scoped under .tool-zpath (see public/tools/zpath/zpath.css) so its
 * generic class names (.card, .wrap, .title...) can't leak into the rest of
 * the site, which resets those same elements via Tailwind preflight.
 */
export default function ZpathPage() {
  return (
    <div className="tool-zpath">
      <link rel="stylesheet" href="/tools/zpath/zpath.css" />
      <div className="wrap">
        <div className="card">
          <header className="topbar">
            <div>
              <h1 className="title">ZPATH (Yes / No)</h1>
              <p className="subtitle">
                15 quick questions to check if your career decision is driven more by logic or
                emotion. No signup. No storage. ~90 seconds.
              </p>
            </div>

            <div className="topbar-right">
              <div className="pill" id="counter">
                Question 1 / 15
              </div>
              <div className="bar">
                <div id="progress" />
              </div>
            </div>
          </header>

          <main className="content">
            <p className="q" id="qText">
              Loading…
            </p>
            <p className="hint" id="qHint" />

            <div className="btnrow">
              <button id="yesBtn" type="button">
                Yes
              </button>
              <button id="noBtn" type="button">
                No
              </button>
              <button className="ghost" id="backBtn" type="button">
                Back
              </button>
              <button className="ghost" id="restartBtn" type="button">
                Restart
              </button>
            </div>

            <div className="sep" />

            <div className="results" id="results">
              <div className="tool" id="top1" />
              <div className="tool" id="top2" />
            </div>

            <div className="ai-cta">
              <p>Feel free to like, comment, or share to help spread it.</p>
              <p>Your feedback keeps this alive and pushes me to build more.</p>
              <p>
                Looking for more tools?{" "}
                <a href="/#tools-developed-by-ubt">Click!</a>
              </p>
              <p>
                Thanks. <strong>UBT</strong>.
              </p>
            </div>

            <div className="corner-widget">
              <a href="/">
                <img src="/img/logoubt.png" alt="UBT" className="widget-avatar" />
              </a>
              <a href="/">
                <img src="/img/picprofile.png" alt="Profile" className="widget-avatar logo" />
              </a>
            </div>
          </main>
        </div>
      </div>

      <Script src="/tools/zpath/zpath.js" strategy="afterInteractive" />
    </div>
  );
}
