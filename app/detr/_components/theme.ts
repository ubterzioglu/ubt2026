/**
 * DETR todo-board theme tokens. Palette: black (1) · orange (2) · rose (3),
 * with white text — deliberately distinct from the BatuBT (yellow/violet),
 * DesireMap (magenta/cyan) and Akçakanat (emerald/sky) boards. Scoped to the
 * `/detr` route so it never touches the global site theme.
 */

/** Core accent hexes (kept as named constants so JSX can reference them). */
export const DETR_ORANGE = "#FB923C";
export const DETR_ROSE = "#FB7185";

/**
 * Brand gradient used for borders, the logo tile and the CTA.
 * Orange-led, resolving into rose.
 */
export const DETR_BRAND_GRADIENT =
  "linear-gradient(115deg, #FB923C 0%, #F97362 50%, #FB7185 100%)";

/** Full-page ambient background: orange glow top-left, rose bottom-right. */
export const DETR_AMBIENT_BACKGROUND =
  "radial-gradient(55% 50% at 16% 10%, rgba(251,146,60,0.16), transparent 60%)," +
  "radial-gradient(48% 48% at 88% 6%, rgba(251,113,133,0.14), transparent 58%)," +
  "radial-gradient(70% 75% at 52% 120%, rgba(249,115,98,0.12), transparent 60%)," +
  "linear-gradient(180deg, #0b0908 0%, #090706 55%, #060404 100%)";

/** Subtle grid texture, masked toward the top so it fades into the glow. */
export const DETR_GRID_TEXTURE = {
  backgroundImage:
    "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)," +
    "linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
  backgroundSize: "64px 64px",
  maskImage: "radial-gradient(120% 90% at 50% 18%, black, transparent 75%)",
  WebkitMaskImage: "radial-gradient(120% 90% at 50% 18%, black, transparent 75%)"
} as const;
