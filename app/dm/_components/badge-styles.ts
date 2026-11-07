import type {
  ProjectTaskPriority,
  ProjectTaskStatus,
  TestFindingSeverity,
  TestFindingStatus
} from "@/types/site";

const TONE_MUTED =
  "border border-white/10 bg-gradient-to-b from-white/[0.06] to-transparent text-white/50";

const TONE_NEUTRAL =
  "border border-white/[0.14] bg-gradient-to-b from-white/[0.10] to-white/[0.02] text-white/75 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]";

const TONE_VIOLET =
  "border border-violet-400/40 bg-gradient-to-b from-violet-400/[0.20] to-violet-400/[0.05] text-violet-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_2px_10px_-2px_rgba(168,85,247,0.5)]";

const TONE_MAGENTA =
  "border border-[#ff2d95]/50 bg-gradient-to-b from-[#ff2d95]/[0.28] to-[#ff2d95]/[0.06] text-[#ffd0e6] shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_3px_14px_-3px_rgba(255,45,149,0.6)]";

const TONE_EMERALD =
  "border border-emerald-400/35 bg-gradient-to-b from-emerald-400/[0.16] to-emerald-400/[0.04] text-emerald-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_2px_10px_-2px_rgba(16,185,129,0.4)]";

const TONE_RED =
  "border border-[#ff2247]/40 bg-gradient-to-b from-[#ff2247]/[0.20] to-[#ff2247]/[0.04] text-[#ff9fb0] shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_2px_10px_-2px_rgba(255,34,71,0.45)]";

export const STATUS_BADGE: Record<ProjectTaskStatus, string> = {
  todo: TONE_NEUTRAL,
  in_progress:
    "border border-cyan-400/35 bg-gradient-to-b from-cyan-400/[0.18] to-cyan-400/[0.04] text-cyan-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_2px_10px_-2px_rgba(34,211,238,0.45)]",
  done: TONE_EMERALD,
  blocked: TONE_RED
};

export const PRIORITY_BADGE: Record<ProjectTaskPriority, string> = {
  low: TONE_MUTED,
  normal: TONE_NEUTRAL,
  high: TONE_VIOLET,
  top5: TONE_MAGENTA
};

export const FINDING_STATUS_BADGE: Record<TestFindingStatus, string> = {
  open: TONE_RED,
  investigating:
    "border border-amber-400/40 bg-gradient-to-b from-amber-400/[0.20] to-amber-400/[0.04] text-amber-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_2px_10px_-2px_rgba(251,191,36,0.5)]",
  resolved: TONE_EMERALD,
  wontfix:
    "border border-white/[0.14] bg-gradient-to-b from-white/[0.10] to-white/[0.02] text-white/65 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]"
};

export const FINDING_SEVERITY_BADGE: Record<TestFindingSeverity, string> = {
  low: TONE_MUTED,
  normal: TONE_NEUTRAL,
  high: TONE_VIOLET,
  critical: TONE_MAGENTA
};
