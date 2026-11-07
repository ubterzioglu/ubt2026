import type { ReactNode } from "react";

interface FlashBannerProps {
  tone: "success" | "error";
  variant?: "compact" | "panel";
  children: ReactNode;
}

const compactToneClasses = {
  success:
    "rounded-[1.35rem] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-800",
  error:
    "rounded-[1.35rem] border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-900"
} as const;

const panelToneClasses = {
  success:
    "rounded-[1.5rem] border px-5 py-4 text-sm leading-6 border-emerald-200 bg-emerald-50/95 text-emerald-900",
  error:
    "rounded-[1.5rem] border px-5 py-4 text-sm leading-6 border-rose-200 bg-rose-50/95 text-rose-900"
} as const;

export function FlashBanner({
  tone,
  variant = "compact",
  children
}: Readonly<FlashBannerProps>) {
  if (variant === "panel") {
    return <section className={panelToneClasses[tone]}>{children}</section>;
  }

  return <div className={compactToneClasses[tone]}>{children}</div>;
}
