import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// Red & white yin-yang inside a white ring border.
const RED = "#D7263D";
const WHITE = "#FFFFFF";

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
          background: WHITE
        }}
      >
        <svg width="32" height="32" viewBox="0 0 100 100">
          {/* Thin red outer boundary so the icon edge reads on white surfaces */}
          <circle cx="50" cy="50" r="49" fill={WHITE} stroke={RED} strokeWidth="2" />
          {/* White ring border: the gap between r=49 and the r=38 yin-yang */}
          {/* Yin-yang body (radius 38, centered) */}
          {/* Right half stays white via the white disc */}
          <circle cx="50" cy="50" r="38" fill={WHITE} />
          {/* Left (red) half + the interlocking S curve */}
          <path
            d="M50 12 A38 38 0 0 0 50 88 A19 19 0 0 1 50 50 A19 19 0 0 0 50 12 Z"
            fill={RED}
          />
          {/* Eyes: white dot on the red lobe, red dot on the white lobe */}
          <circle cx="50" cy="31" r="6" fill={WHITE} />
          <circle cx="50" cy="69" r="6" fill={RED} />
        </svg>
      </div>
    ),
    size
  );
}
