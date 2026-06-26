/**
 * BatuBT brand theme tokens. Palette priority: black (1) · yellow (2) ·
 * violet (3), with white text. Yellow is the Almanya-101 mustard / Google
 * yellow (#FBBC05). Scoped to the `/batubt` route so it never touches the
 * global site theme or the shared admin gate.
 */

/** Core accent hexes (kept as named constants so JSX can reference them). */
export const BATUBT_YELLOW = "#FBBC05"; // Google / hardal sarısı (Almanya 101)
export const BATUBT_VIOLET = "#A855F7";

/**
 * Tri-color brand gradient used for borders, the logo tile and the CTA.
 * Yellow-led (per palette priority) resolving into violet.
 */
export const BATUBT_BRAND_GRADIENT =
  "linear-gradient(115deg, #FBBC05 0%, #FFD34E 38%, #A855F7 100%)";

/** Full-page ambient background: yellow glow top-left, violet bottom-right. */
export const BATUBT_AMBIENT_BACKGROUND =
  "radial-gradient(55% 50% at 16% 10%, rgba(251,188,5,0.20), transparent 60%)," +
  "radial-gradient(48% 48% at 88% 6%, rgba(251,188,5,0.10), transparent 58%)," +
  "radial-gradient(70% 75% at 52% 120%, rgba(168,85,247,0.22), transparent 60%)," +
  "linear-gradient(180deg, #0a0a0d 0%, #07070a 55%, #050507 100%)";

/** Subtle grid texture, masked toward the top so it fades into the glow. */
export const BATUBT_GRID_TEXTURE = {
  backgroundImage:
    "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)," +
    "linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
  backgroundSize: "64px 64px",
  maskImage: "radial-gradient(120% 90% at 50% 18%, black, transparent 75%)",
  WebkitMaskImage: "radial-gradient(120% 90% at 50% 18%, black, transparent 75%)"
} as const;
