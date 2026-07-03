/**
 * Akçakanat domain-board theme tokens. Palette: black (1) · emerald (2) ·
 * sky blue (3), with white text — deliberately distinct from the BatuBT
 * (yellow/violet) and DesireMap (magenta/cyan) boards. Scoped to the
 * `/bakcakanat` route so it never touches the global site theme.
 */

/** Core accent hexes (kept as named constants so JSX can reference them). */
export const BAKCAKANAT_EMERALD = "#34D399";
export const BAKCAKANAT_SKY = "#38BDF8";

/**
 * Tri-color brand gradient used for borders, the logo tile and the CTA.
 * Emerald-led, resolving into sky blue.
 */
export const BAKCAKANAT_BRAND_GRADIENT =
  "linear-gradient(115deg, #34D399 0%, #2DD4BF 45%, #38BDF8 100%)";

/** Full-page ambient background: emerald glow top-left, sky bottom-right. */
export const BAKCAKANAT_AMBIENT_BACKGROUND =
  "radial-gradient(55% 50% at 16% 10%, rgba(52,211,153,0.18), transparent 60%)," +
  "radial-gradient(48% 48% at 88% 6%, rgba(56,189,248,0.14), transparent 58%)," +
  "radial-gradient(70% 75% at 52% 120%, rgba(45,212,191,0.16), transparent 60%)," +
  "linear-gradient(180deg, #070b0a 0%, #060908 55%, #040606 100%)";

/** Subtle grid texture, masked toward the top so it fades into the glow. */
export const BAKCAKANAT_GRID_TEXTURE = {
  backgroundImage:
    "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)," +
    "linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
  backgroundSize: "64px 64px",
  maskImage: "radial-gradient(120% 90% at 50% 18%, black, transparent 75%)",
  WebkitMaskImage: "radial-gradient(120% 90% at 50% 18%, black, transparent 75%)"
} as const;
