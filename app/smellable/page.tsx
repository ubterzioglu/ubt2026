import type { Metadata } from "next";
import Script from "next/script";

import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Smellable — An app you can smell",
  description:
    "Smellable is an experimental app that triggers memories through images. Look, imagine, and ask yourself: can you smell it?",
  canonical: "/smellable",
  ogType: "website"
});

/**
 * Original standalone tool from ubterzioglu.de/smellable — vanilla HTML/CSS/JS,
 * ported as-is. Markup mirrors the original body 1:1 so app.js (loaded
 * unmodified from /tools/smellable/app.js) can bind to the same element IDs.
 * CSS is scoped under .tool-smellable (see public/tools/smellable/style.css) so
 * generic class names (.app, .main, .hint...) can't leak into the rest of the
 * site. Image paths in data.js are absolute (/tools/smellable/img/N.jpg).
 */
export default function SmellablePage() {
  return (
    <div className="tool-smellable">
      <link rel="stylesheet" href="/tools/smellable/style.css" />

      <div className="app">
        <header className="top-bar">
          <div className="logo">Smellable</div>
          <button className="menu-btn" type="button" aria-label="Menu">
            •••
          </button>
        </header>

        <main className="main">
          <section className="smell-card" aria-live="polite">
            <div className="smell-media">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img id="smell-image" alt="" />
              <div className="smell-overlay" />
            </div>

            <div className="smell-content">
              <div className="smell-info">
                <h1 id="smell-name">—</h1>
                <p id="smell-category" className="smell-category">
                  —
                </p>
              </div>

              <div className="actions">
                <div className="votes-block">
                  <p className="micro pre-smell-hint">
                    Close your eyes for 5 seconds.
                    <br />
                    Imagine this image.
                    <br />
                    Then answer.
                  </p>
                  <div className="votes-question">Can you smell it?</div>
                  <div className="votes">
                    <button
                      className="vote-btn"
                      id="vote-up"
                      type="button"
                      data-vote="up"
                      aria-label="Yes"
                    >
                      Yes! <span className="count" id="count-up">0</span>
                    </button>

                    <button
                      className="vote-btn"
                      id="vote-down"
                      type="button"
                      data-vote="down"
                      aria-label="No"
                    >
                      No! <span className="count" id="count-down">0</span>
                    </button>
                  </div>
                </div>

                <a
                  className="wa-btn"
                  id="share-whatsapp"
                  href="#"
                  target="_blank"
                  rel="noopener"
                  aria-label="Share via WhatsApp"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/tools/smellable/img/whatsappshare.jpg"
                    alt="Share via WhatsApp"
                    className="wa-ico"
                    loading="lazy"
                  />
                </a>
              </div>

              {/* Suggest (default closed) */}
              <details className="panel details" id="suggest-details">
                <summary className="panel-summary">Suggest a smell</summary>

                <div className="panel-inner">
                  <form
                    id="suggest-form"
                    className="suggest-form"
                    action="https://formsubmit.co/ubt@ubterzioglu.de"
                    method="POST"
                  >
                    <input
                      type="hidden"
                      name="_subject"
                      value="Smellable: New suggestion"
                    />
                    <input type="hidden" name="_captcha" value="false" />
                    <input type="hidden" name="_template" value="table" />

                    <input
                      type="hidden"
                      name="smell_id"
                      id="suggest-smell-id"
                      defaultValue=""
                    />
                    <input
                      type="hidden"
                      name="smell_name"
                      id="suggest-smell-name"
                      defaultValue=""
                    />
                    <input
                      type="hidden"
                      name="page_url"
                      id="suggest-page-url"
                      defaultValue=""
                    />

                    <label className="field">
                      <span>One sentence</span>
                      <input
                        id="suggest-text"
                        name="suggestion"
                        type="text"
                        maxLength={160}
                        placeholder="One-liner suggestion…"
                        required
                      />
                    </label>

                    <label className="field">
                      <span>Image URL (optional)</span>
                      <input
                        id="suggest-image"
                        name="image_url"
                        type="url"
                        placeholder="https://..."
                      />
                    </label>

                    <button className="primary" type="submit">
                      Send
                    </button>

                    <p className="micro">
                      Image upload yok. İstersen link ver.
                    </p>
                  </form>
                </div>
              </details>

              {/* Comments */}
              <section className="panel">
                <div className="panel-title">Comments</div>

                <form id="comment-form" className="comment-form">
                  <input
                    id="comment-input"
                    type="text"
                    maxLength={160}
                    placeholder="Write an anonymous comment (max 160, no links)"
                    required
                  />
                  <button className="primary" type="submit">
                    Post
                  </button>
                </form>

                <div id="comments-meta" className="micro" />
                <div id="comments-list" className="comments" />
              </section>

              <button className="next-btn" id="next-btn" type="button">
                Next smell →
              </button>

              <p className="micro hintline">Tap / swipe / right arrow for next</p>
            </div>
          </section>
        </main>

        <footer className="hint">
          <p>Did you smell it too?</p>
        </footer>
      </div>

      <Script src="/tools/smellable/data.js" strategy="afterInteractive" />
      <Script src="/tools/smellable/app.js" strategy="afterInteractive" />
    </div>
  );
}
