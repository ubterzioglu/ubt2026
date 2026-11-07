import { SplitLoginShell } from "@/components/split-login-shell";
import type { SplitLoginTheme } from "@/components/split-login-shell";
import {
  BAKCAKANAT_AMBIENT_BACKGROUND,
  BAKCAKANAT_BRAND_GRADIENT,
  BAKCAKANAT_EMERALD,
  BAKCAKANAT_GRID_TEXTURE
} from "@/app/bakcakanat/_components/theme";

interface BakcakanatLoginProps {
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

const BAKCAKANAT_LOGIN_THEME = {
  ambientBackground: BAKCAKANAT_AMBIENT_BACKGROUND,
  brandGradient: BAKCAKANAT_BRAND_GRADIENT,
  gridTexture: BAKCAKANAT_GRID_TEXTURE,
  orbColors: [
    "rgba(52,211,153,0.28)",
    "rgba(56,189,248,0.28)",
    "rgba(45,212,191,0.16)"
  ],
  panelBackgroundClass: "bg-[#060908]/90",
  logoLetter: "A",
  accentHex: BAKCAKANAT_EMERALD,
  accentRgb: "52,211,153",
  eyebrowColor: "#7dd3fc",
  passwordLabel: "Şifre",
  footerNote: "Şifre HttpOnly bir çerezde saklanır — URL'de asla görünmez.",
  iconFocusClass: "group-focus-within:text-[#34D399]",
  inputFocusBorderClass: "focus:border-[#34D399]/60",
  inputFocusRingClass: "focus:ring-[#34D399]/15",
  buttonShadowClass: "shadow-[0_16px_50px_-12px_rgba(52,211,153,0.6)]",
  buttonHoverShadowClass: "hover:shadow-[0_20px_60px_-12px_rgba(56,189,248,0.7)]",
  buttonFocusRingClass: "focus:ring-[#34D399]/60"
} as const satisfies SplitLoginTheme;

/**
 * Premium Akçakanat login, mirroring the BatuBT entrance layout: a two-column
 * split pairing a typographic showcase panel (left) with a glass auth card
 * (right), built on the board's black · emerald · sky palette. All treatment
 * is inline so it never touches the global site theme nor the shared admin
 * gate used elsewhere.
 */
export function BakcakanatLogin({
  signIn,
  eyebrow,
  title,
  description,
  submitLabel,
  brand = "Akçakanat",
  subtitle = "Domain Yönetimi",
  footerCaption = "ubterzioglu.de · internal"
}: BakcakanatLoginProps) {
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
      theme={BAKCAKANAT_LOGIN_THEME}
      showcase={
        <>
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(70% 60% at 30% 25%, rgba(52,211,153,0.20), transparent 65%)," +
                "radial-gradient(60% 55% at 80% 85%, rgba(56,189,248,0.22), transparent 60%)," +
                "linear-gradient(180deg, #081210 0%, #060d0c 60%, #050a09 100%)"
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.35]"
            style={BAKCAKANAT_GRID_TEXTURE}
          />
          <div className="relative flex h-full flex-col justify-between p-10">
            <div className="flex items-center gap-3">
              <span
                className="relative flex h-11 w-11 items-center justify-center rounded-xl ring-1 ring-white/20"
                style={{ backgroundImage: BAKCAKANAT_BRAND_GRADIENT }}
              >
                <span className="font-body text-lg font-extrabold tracking-tight text-black">
                  A
                </span>
              </span>
              <div className="leading-tight">
                <p className="font-body text-sm font-bold tracking-tight text-white">
                  {brand}
                </p>
                <p className="text-[11px] font-medium text-white/45">
                  {subtitle}
                </p>
              </div>
            </div>

            <div>
              <p className="font-body text-[clamp(2.4rem,5vw,3.4rem)] font-bold leading-[1.02] tracking-[-0.04em] text-white">
                Domain
                <br />
                <span
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: BAKCAKANAT_BRAND_GRADIENT }}
                >
                  portföyü
                </span>
              </p>
              <p className="mt-4 max-w-xs text-[13px] leading-6 text-white/50">
                Tüm alan adları, hosting ve e-posta kayıtları tek panoda —
                düzenlenebilir ve güncel.
              </p>
            </div>

            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-white/25">
              {footerCaption}
            </p>
          </div>
        </>
      }
    />
  );
}
