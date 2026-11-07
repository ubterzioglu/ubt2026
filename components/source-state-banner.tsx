import type { SourceState } from "@/types/source-state";

interface SourceStateBannerProps {
  source: SourceState;
  errorMessage?: string;
  subject: string;
  unavailableText?: string;
  variant?: "dark" | "light";
}

const VARIANTS = {
  dark: {
    Tag: "div",
    missing:
      "rounded-[1.1rem] border border-amber-400/25 bg-amber-400/10 px-5 py-3 text-[13px] font-medium text-amber-200",
    error:
      "rounded-[1.1rem] border border-rose-400/25 bg-rose-400/10 px-5 py-3 text-[13px] font-medium text-rose-200"
  },
  light: {
    Tag: "p",
    missing:
      "rounded-[1rem] border border-amber-300/60 bg-amber-50 px-5 py-3 text-[13px] font-medium text-amber-800",
    error:
      "rounded-[1rem] border border-rose-300/60 bg-rose-50 px-5 py-3 text-[13px] font-medium text-rose-700"
  }
} as const;

export function SourceStateBanner({
  source,
  errorMessage,
  subject,
  unavailableText = `${subject} yüklenemiyor.`,
  variant = "dark"
}: Readonly<SourceStateBannerProps>) {
  const { Tag, missing, error } = VARIANTS[variant];

  if (source === "env-missing") {
    return (
      <Tag className={missing}>
        {`Supabase bağlantısı yapılandırılmamış (SUPABASE_SERVICE_ROLE_KEY eksik). ${unavailableText}`}
      </Tag>
    );
  }

  if (source === "error") {
    return (
      <Tag className={error}>
        {`${subject} yüklenirken hata oluştu: `}
        {errorMessage}
      </Tag>
    );
  }

  return null;
}
