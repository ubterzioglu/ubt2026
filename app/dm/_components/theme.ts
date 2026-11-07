/**
 * DesireMap neon palette — scoped to the `/dm` route only. Mirrors the three
 * brand colors in the DesireMap logo (magenta · violet · cyan) plus the
 * electric blue / neon red of the login hero photo. Kept here as plain
 * constants so the login gate and the task list share one source of truth
 * without touching the global (teal/orange) site theme.
 */

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

export const DM_CARD_CLASS =
  "rounded-[1.6rem] bg-gradient-to-b from-white/12 via-white/[0.04] to-transparent p-[1.3px] shadow-[0_30px_90px_-30px_rgba(0,0,0,0.85)]";

export const DM_CARD_INNER_CLASS =
  "rounded-[1.55rem] bg-[#0a0712]/85 backdrop-blur-2xl";

export const DM_INPUT_CLASS =
  "w-full rounded-[0.85rem] border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white placeholder:text-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] outline-none transition focus:border-[#ff2d95]/60 focus:bg-white/[0.06] focus:ring-4 focus:ring-[#ff2d95]/15";

export const DM_LABEL_CLASS =
  "mb-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50";

export const DM_CHIP_BASE =
  "rounded-full px-3 py-1 text-[11px] font-semibold transition";

export const DM_CHIP_IDLE =
  "border border-white/10 bg-white/[0.04] text-white/60 hover:bg-white/[0.07] hover:text-white";

export const DM_ACTION_BUTTON =
  "inline-flex min-h-[28px] items-center justify-center rounded-full border px-2.5 py-1 text-[11px] font-semibold transition";

export function confidenceBadgeClass(score: number): string {
  if (score >= 70) return "border border-emerald-400/40 bg-emerald-400/12 text-emerald-200";
  if (score >= 50) return "border border-violet-400/40 bg-violet-400/12 text-violet-100";
  return "border border-white/[0.14] bg-white/[0.06] text-white/60";
}
