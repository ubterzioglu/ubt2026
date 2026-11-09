import type { ReactNode } from "react";

interface FlashBannerProps {
  tone: "success" | "error";
  children: ReactNode;
}

const toneClasses = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  error: "border-rose-200 bg-rose-50 text-rose-900"
} as const;

export function FlashBanner({ tone, children }: Readonly<FlashBannerProps>) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`rounded-lg border px-4 py-3 text-sm font-medium ${toneClasses[tone]}`}
    >
      {children}
    </div>
  );
}
