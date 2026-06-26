import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Red & white yin-yang inside a white ring border.
const RED = "#D7263D";
const WHITE = "#FFFFFF";

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
          background: "transparent"
        }}
      >
        <svg width="180" height="180" viewBox="0 0 100 100">
          {/* Red outer disc — gives the white ring something to read against */}
          <circle cx="50" cy="50" r="49" fill={RED} />
          {/* White ring border (visible gap between r=49 red disc and r=40 yin-yang) */}
          <circle cx="50" cy="50" r="40" fill={WHITE} />
          {/* Yin-yang body sits inside the white ring */}
          {/* White (right) half via the white disc above; red (left) half + S curve */}
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
