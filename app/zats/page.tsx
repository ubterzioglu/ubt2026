import type { Metadata } from "next";
import Script from "next/script";

import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "ZATS – ATS Readability Score",
  description:
    "Upload a text-based CV PDF or paste CV text and estimate ATS readability in your browser. Optional job description keyword match. No data is uploaded.",
  canonical: "/zats",
  ogType: "website"
});

/**
 * Original standalone tool from ubterzioglu.de/zats — vanilla HTML/CSS/JS,
 * ported as-is. Markup mirrors the original body 1:1 so zats-tool.js (loaded
 * unmodified from /tools/zats/js/zats-tool.js) can bind to the same element
 * IDs (pdfUpload, btnExtract, btnScore, btnClear, result, hint, insights,
 * issuesList, fixesList, cvText, jdText, previewText, counter, progress).
 * CSS is scoped under .tool-zats (see public/tools/zats/zats.css).
 * PDF.js is loaded first so pdfjsLib is available when zats-tool.js runs.
 */
export default function ZatsPage() {
  return (
    <div className="tool-zats">
      <link rel="stylesheet" href="/tools/zats/zats.css" />
      <div className="wrap">
        <div className="card">
          <header className="topbar">
            <div className="topbar-left">
              <h1 className="title">ZATS – ATS Readability Score</h1>
              <p className="subtitle">
                Your CV is never uploaded. Analysis is performed entirely in your browser.
                (Client-side • No upload • Not affiliated with any ATS)
              </p>
            </div>

            <div className="topbar-right">
              <div className="pill" id="counter">Ready</div>
              <div className="bar" aria-label="Progress">
                <div id="progress"></div>
              </div>
            </div>
          </header>

          <main className="content">
            <div className="grid">
              {/* INPUT + RESULT */}
              <section className="panel">
                <h2 className="panel-title">Upload CV PDF or paste text</h2>

                <div className="fileRow">
                  <input type="file" id="pdfUpload" accept="application/pdf" />
                </div>

                <div className="btnRow">
                  <button id="btnExtract" type="button">Extract text from PDF</button>
                  <button id="btnScore" type="button">Calculate score</button>
                  <button id="btnClear" type="button">Clear</button>
                </div>

                <div id="result" className="status">Ready.</div>
                <p id="hint" className="hint">
                  Tip: Text-based PDFs work best. If your PDF is scanned (image-only), paste text instead.
                </p>

                {/* INSIGHTS (shown after scoring) */}
                <div id="insights" className="panel insights-panel" style={{ display: "none" }}>
                  <h2 className="panel-title">Quick Improvements</h2>

                  <div className="insights-grid">
                    <div className="insight-block issues">
                      <strong>Top Issues</strong>
                      <ul id="issuesList"></ul>
                    </div>

                    <div className="insight-block fixes">
                      <strong>Top Fixes</strong>
                      <ul id="fixesList"></ul>
                    </div>
                  </div>
                </div>
                {/* /INSIGHTS */}

                <div className="sep"></div>

                <div>
                  <h2 className="panel-title">CV Text</h2>
                  <textarea
                    id="cvText"
                    placeholder="Paste CV text here (or extract from PDF)..."
                    rows={8}
                  ></textarea>

                  <div style={{ height: "12px" }}></div>

                  <h2 className="panel-title">Job Description (optional)</h2>
                  <textarea
                    id="jdText"
                    placeholder="Paste job description to get keyword match-based scoring..."
                    rows={6}
                  ></textarea>

                  <div className="tiny">
                    This tool estimates ATS-readiness (parseability + structure + keyword + evidence).
                    It does not guarantee interview outcomes.
                  </div>
                </div>

                <div className="sep"></div>

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
              </section>

              {/* PREVIEW */}
              <section className="panel preview-panel">
                <h2 className="panel-title">Preview (extracted text)</h2>
                <div id="previewText" className="previewBox">Nothing extracted yet.</div>

                <p className="hint small">
                  Tip: If the preview looks messy (multi-column), export a single-column PDF for better ATS parsing.
                </p>
              </section>
            </div>

            {/* Corner Widget */}
            <div className="corner-widget">
              <a href="/" aria-label="Go to Home">
                <img src="/img/picprofile.png" alt="Profile" className="widget-avatar" />
              </a>
              <a href="/" aria-label="Go to Home">
                <img src="/img/logoubt.png" alt="Logo" className="widget-avatar logo" />
              </a>
            </div>
            {/* /Corner Widget */}
          </main>
        </div>
      </div>

      {/* PDF.js must load before zats-tool.js since it depends on pdfjsLib */}
      <Script src="/tools/zats/vendor/pdfjs/pdf.min.js" strategy="afterInteractive" />
      <Script src="/tools/zats/js/zats-tool.js" strategy="afterInteractive" />

      {/* OPTIONAL UI SYNC — mirrors the inline script from the original body */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
(function(){
  var counterEl = document.getElementById("counter");
  var barEl = document.getElementById("progress");
  var resultEl = document.getElementById("result");

  function setUI(label, pct){
    if(counterEl) counterEl.textContent = label;
    if(barEl) barEl.style.width = (pct || 0) + "%";
  }

  setUI("Ready", 20);

  if(resultEl){
    var obs = new MutationObserver(function(){
      var t = (resultEl.textContent || "").toLowerCase();
      if(t.indexOf("extracting") !== -1) setUI("Extracting…", 55);
      else if(t.indexOf("scoring") !== -1) setUI("Scoring…", 80);
      else if(t.indexOf("/100") !== -1) setUI("Done", 100);
      else if(t.indexOf("error") !== -1 || t.indexOf("failed") !== -1) setUI("Error", 35);
      else setUI("Ready", 20);
    });
    obs.observe(resultEl, { childList:true, characterData:true, subtree:true });
  }
})();
`
        }}
      />
    </div>
  );
}
