/**
 * detrbridge board theme tokens. Palette: navy (1) · gold (2), with white
 * text — deliberately distinct from every other board (DETR orange/rose, DM
 * magenta/cyan, BatuBT yellow/violet, Akçakanat emerald/sky). Scoped to the
 * `/detrbridge` route so it never touches the global site theme.
 */

/** Core accent hexes (kept as named constants so JSX can reference them). */
export const DETRBRIDGE_NAVY = "#1E3A8A";
export const DETRBRIDGE_GOLD = "#F5B700";

/**
 * Brand gradient used for borders, the logo tile and the CTA.
 * Navy-led, resolving into gold.
 */
export const DETRBRIDGE_BRAND_GRADIENT =
  "linear-gradient(115deg, #1E3A8A 0%, #3B5FC4 50%, #F5B700 100%)";

/** Full-page ambient background: navy glow top-left, gold bottom-right. */
export const DETRBRIDGE_AMBIENT_BACKGROUND =
  "radial-gradient(55% 50% at 16% 10%, rgba(30,58,138,0.22), transparent 60%)," +
  "radial-gradient(48% 48% at 88% 6%, rgba(245,183,0,0.14), transparent 58%)," +
  "radial-gradient(70% 75% at 52% 120%, rgba(59,95,196,0.12), transparent 60%)," +
  "linear-gradient(180deg, #0a0c12 0%, #07080d 55%, #050609 100%)";

/** Subtle grid texture, masked toward the top so it fades into the glow. */
export const DETRBRIDGE_GRID_TEXTURE = {
  backgroundImage:
    "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)," +
    "linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
  backgroundSize: "64px 64px",
  maskImage: "radial-gradient(120% 90% at 50% 18%, black, transparent 75%)",
  WebkitMaskImage: "radial-gradient(120% 90% at 50% 18%, black, transparent 75%)"
} as const;
