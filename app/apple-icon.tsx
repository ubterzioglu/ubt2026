import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Brand colors mirror app/globals.css custom properties.
const PAPER = "#FAF7F0";
const ACCENT = "#1B7A6E";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: ACCENT,
          color: PAPER,
          fontSize: "92px",
          fontWeight: 800,
          letterSpacing: "-0.05em",
          fontFamily: "sans-serif"
        }}
      >
        UBT
      </div>
    ),
    size
  );
}
