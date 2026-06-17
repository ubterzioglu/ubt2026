import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// Brand accent mirrors app/globals.css --accent.
const PAPER = "#FAF7F0";
const ACCENT = "#1B7A6E";

export default function Icon() {
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
          fontSize: "20px",
          fontWeight: 800,
          letterSpacing: "-0.04em",
          fontFamily: "sans-serif",
          borderRadius: "6px"
        }}
      >
        U
      </div>
    ),
    size
  );
}
