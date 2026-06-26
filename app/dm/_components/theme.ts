/**
 * DesireMap neon palette — scoped to the `/dm` route only. Mirrors the three
 * brand colors in the DesireMap logo (magenta · violet · cyan) plus the
 * electric blue / neon red of the login hero photo. Kept here as plain
 * constants so the login gate and the task list share one source of truth
 * without touching the global (teal/orange) site theme.
 */

export const DM_COLORS = {
  magenta: "#ff2d95",
  violet: "#a855f7",
  cyan: "#22d3ee",
  blue: "#3b82f6",
  red: "#ff2247"
} as const;

/** Tri-color brand gradient: magenta → violet → cyan. */
export const DM_BRAND_GRADIENT =
  "linear-gradient(110deg, #ff2d95 0%, #a855f7 50%, #22d3ee 100%)";

/** Full-bleed ambient background for the dark `/dm` surfaces. */
export const DM_AMBIENT_BACKGROUND =
  "radial-gradient(55% 50% at 12% 8%, rgba(255,45,149,0.28), transparent 60%)," +
  "radial-gradient(50% 50% at 88% 6%, rgba(34,211,238,0.22), transparent 58%)," +
  "radial-gradient(60% 60% at 50% 118%, rgba(168,85,247,0.22), transparent 62%)," +
  "linear-gradient(180deg, #0a0712 0%, #08060f 55%, #050409 100%)";

/** Fine grid texture shared by login + list, masked toward the top. */
export const DM_GRID_TEXTURE = {
  backgroundImage:
    "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)," +
    "linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
  backgroundSize: "64px 64px",
  maskImage: "radial-gradient(120% 80% at 50% 10%, black, transparent 76%)",
  WebkitMaskImage: "radial-gradient(120% 80% at 50% 10%, black, transparent 76%)"
} as const;
