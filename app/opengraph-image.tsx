import { ImageResponse } from "next/og";

// Inlined (not imported from lib/seo, which is "server-only") so this metadata
// route stays outside the server-only module graph during static generation.
const SITE_NAME = "Umut Barış Terzioğlu";
const BRAND_SUFFIX = "Senior QA Engineer";

export const alt = `${SITE_NAME} — ${BRAND_SUFFIX} in Dortmund, Germany`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Brand colors mirror app/globals.css custom properties.
const INK = "#141F27";
const PAPER = "#FAF7F0";
const ACCENT = "#1B7A6E";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: PAPER,
          padding: "80px",
          fontFamily: "sans-serif"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "84px",
              height: "84px",
              borderRadius: "20px",
              background: ACCENT,
              color: PAPER,
              fontSize: "40px",
              fontWeight: 800,
              letterSpacing: "-0.04em"
            }}
          >
            UBT
          </div>
          <span style={{ fontSize: "28px", fontWeight: 600, color: ACCENT, letterSpacing: "0.04em" }}>
            ubterzioglu.de
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div
            style={{
              display: "flex",
              fontSize: "76px",
              fontWeight: 800,
              color: INK,
              letterSpacing: "-0.03em",
              lineHeight: 1.05
            }}
          >
            {SITE_NAME}
          </div>
          <div style={{ display: "flex", fontSize: "40px", fontWeight: 600, color: INK, opacity: 0.72 }}>
            {`${BRAND_SUFFIX} · Dortmund, Germany`}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "16px",
            fontSize: "26px",
            fontWeight: 600,
            color: INK,
            opacity: 0.66
          }}
        >
          <span>Test Strategy</span>
          <span style={{ color: ACCENT }}>·</span>
          <span>Automation</span>
          <span style={{ color: ACCENT }}>·</span>
          <span>Quality Leadership</span>
        </div>
      </div>
    ),
    size
  );
}
