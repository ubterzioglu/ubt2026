import Image from "next/image";

import { SplitLoginShell } from "@/components/split-login-shell";
import type { SplitLoginTheme } from "@/components/split-login-shell";
import {
  BATUBT_AMBIENT_BACKGROUND,
  BATUBT_BRAND_GRADIENT,
  BATUBT_GRID_TEXTURE,
  BATUBT_YELLOW
} from "@/app/batubt/_components/theme";

interface BatubtLoginProps {
  /** Sign-in server action (handles its own redirect). */
  signIn: (formData: FormData) => void | Promise<void>;
  eyebrow: string;
  title: string;
  description: string;
  submitLabel: string;
  brand?: string;
  subtitle?: string;
  footerCaption?: string;
}

const BATUBT_LOGIN_THEME = {
  ambientBackground: BATUBT_AMBIENT_BACKGROUND,
  brandGradient: BATUBT_BRAND_GRADIENT,
  gridTexture: BATUBT_GRID_TEXTURE,
  orbColors: [
    "rgba(251,188,5,0.30)",
    "rgba(168,85,247,0.30)",
    "rgba(168,85,247,0.18)"
  ],
  panelBackgroundClass: "bg-[#08080b]/90",
  logoLetter: "B",
  accentHex: BATUBT_YELLOW,
  accentRgb: "251,188,5",
  eyebrowColor: "#d8b4fe",
  passwordLabel: "Access key",
  footerNote: "Key is stored in an HttpOnly cookie — never exposed in the URL.",
  iconFocusClass: "group-focus-within:text-[#FBBC05]",
  inputFocusBorderClass: "focus:border-[#FBBC05]/60",
  inputFocusRingClass: "focus:ring-[#FBBC05]/15",
  buttonShadowClass: "shadow-[0_16px_50px_-12px_rgba(251,188,5,0.6)]",
  buttonHoverShadowClass: "hover:shadow-[0_20px_60px_-12px_rgba(168,85,247,0.7)]",
  buttonFocusRingClass: "focus:ring-[#FBBC05]/60"
} as const satisfies SplitLoginTheme;

/**
 * ULTRA-PREMIUM BatuBT login. Self-contained dark entrance scoped to the
 * `/batubt` route: a two-column split pairing the `loginsol.png` mascot artwork
 * (left showcase) with a glass auth card (right) built on the brand's
 * black · yellow · violet palette. All treatment is inline so it never touches
 * the global site theme nor the shared admin gate used elsewhere.
 */
export function BatubtLogin({
  signIn,
  eyebrow,
  title,
  description,
  submitLabel,
  brand = "BatuBT",
  subtitle = "Footer Yönetimi",
  footerCaption = "ubterzioglu.de · internal"
}: BatubtLoginProps) {
  return (
    <SplitLoginShell
      signIn={signIn}
      eyebrow={eyebrow}
      title={title}
      description={description}
      submitLabel={submitLabel}
      brand={brand}
      subtitle={subtitle}
      footerCaption={footerCaption}
      theme={BATUBT_LOGIN_THEME}
      showcase={
        <>
          <Image
            src="/batubt/loginsol.png"
            alt="BatuBT"
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 0px"
            className="object-cover"
          />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(115deg, rgba(251,188,5,0.12) 0%, rgba(255,211,78,0.06) 45%, rgba(168,85,247,0.20) 100%)," +
                "linear-gradient(180deg, rgba(8,8,11,0.05) 0%, rgba(8,8,11,0.45) 80%, rgba(8,8,11,0.88) 100%)"
            }}
          />
        </>
      }
    />
  );
}
