/**
 * /ubtsa board theme tokens. Palette: teal (#0f766e) · cyan (#155e75) —
 * carried over from the original document the konsept was first written in,
 * so the board still reads as "that document, now with comments".
 *
 * Unlike the other boards here (detrbridge navy/gold, DM magenta/cyan, BatuBT
 * yellow/violet) this one is deliberately LIGHT: it is a ~130-madde reading
 * document, and long-form Turkish prose is far easier to read on paper-white
 * than on glass-over-black. Scoped to the `/ubtsa` route — nothing here
 * touches the global site theme.
 */

/** Core accent hexes (named so JSX can reference them inline). */
export const UBTSA_TEAL = "#0f766e";
export const UBTSA_DEEP = "#155e75";
export const UBTSA_SOFT = "#ccfbf1";

/** Brand gradient used by the hero, the gate card border and the CTA. */
export const UBTSA_BRAND_GRADIENT =
  "linear-gradient(135deg, #0f766e 0%, #0e7490 55%, #155e75 100%)";

/** Page background: the source document's cool off-white, subtly warmed. */
export const UBTSA_PAGE_BACKGROUND =
  "radial-gradient(60% 45% at 12% 0%, rgba(15,118,110,0.07), transparent 60%)," +
  "radial-gradient(50% 40% at 92% 4%, rgba(21,94,117,0.06), transparent 58%)," +
  "linear-gradient(180deg, #f5f7fb 0%, #f7f9fc 60%, #f2f5fa 100%)";

/** Gate background: the one dark surface on this route, so the door reads as a door. */
export const UBTSA_GATE_BACKGROUND =
  "radial-gradient(55% 50% at 18% 8%, rgba(15,118,110,0.35), transparent 62%)," +
  "radial-gradient(48% 48% at 86% 8%, rgba(21,94,117,0.28), transparent 60%)," +
  "linear-gradient(180deg, #06110f 0%, #050c11 55%, #04080b 100%)";

/** Subtle grid texture for the gate, masked so it fades toward the edges. */
export const UBTSA_GRID_TEXTURE = {
  backgroundImage:
    "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)," +
    "linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
  backgroundSize: "64px 64px",
  maskImage: "radial-gradient(120% 90% at 50% 18%, black, transparent 75%)",
  WebkitMaskImage: "radial-gradient(120% 90% at 50% 18%, black, transparent 75%)"
} as const;

/** Shared card treatment for sections and the sticky table of contents. */
export const UBTSA_CARD_CLASS =
  "rounded-[1.15rem] border border-slate-200/80 bg-white shadow-[0_12px_30px_-18px_rgba(15,23,42,0.25)]";
