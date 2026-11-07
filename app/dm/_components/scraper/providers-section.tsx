// Sağlayıcılar bölümü: Tavily / SerpAPI / Gemini yapılandırma durumu ve
// aç/kapat. Anahtarlar env'de tutulur — burada yalnızca "tanımlı mı" görünür.

import type { FinderProviderItem } from "@/lib/service-finder";
import {
  DM_ACTION_BUTTON,
  DM_CARD_CLASS,
  DM_CARD_INNER_CLASS
} from "@/app/dm/_components/theme";

interface ProvidersSectionProps {
  providers: FinderProviderItem[];
  toggleAction: (formData: FormData) => void | Promise<void>;
}

const KIND_LABEL: Record<string, string> = {
  search: "Arama",
  extract: "Ekstraksiyon",
  classify: "Sınıflandırma"
};

export function ProvidersSection({
  providers,
  toggleAction
}: ProvidersSectionProps) {
  return (
    <section className={DM_CARD_CLASS}>
      <div className={`${DM_CARD_INNER_CLASS} px-4 py-4 sm:px-5`}>
        <h2 className="font-body text-sm font-semibold text-white">Sağlayıcılar</h2>
        <p className="mt-1 text-xs leading-5 text-white/50">
          API anahtarları yalnızca sunucu ortam değişkenlerinde tutulur (secret_ref =
          env adı). Anahtar tanımlı değilse ilgili aşama çalışmaz.
        </p>

        <div className="mt-3 space-y-1.5">
          {providers.length === 0 ? (
            <p className="rounded-[1rem] border border-dashed border-white/15 px-4 py-8 text-center text-xs text-white/45">
              Sağlayıcı yok — migration seed&apos;i uygulanmamış olabilir.
            </p>
          ) : (
            providers.map((provider) => (
              <div
                key={provider.id}
                className="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-[0.9rem] border border-white/[0.06] bg-white/[0.02] px-3.5 py-2"
              >
                <span
                  className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] ${
                    provider.isEnabled
                      ? "border border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                      : "border border-white/10 bg-white/[0.04] text-white/40"
                  }`}
                >
                  {provider.isEnabled ? "Aktif" : "Kapalı"}
                </span>
                <span className="min-w-0 flex-1 truncate text-[12px] font-semibold text-white/85">
                  {provider.displayName}
                </span>
                <span className="shrink-0 text-[10px] uppercase tracking-[0.12em] text-white/35">
                  {KIND_LABEL[provider.providerKind] ?? provider.providerKind}
                  {provider.defaultModel ? ` · ${provider.defaultModel}` : ""}
                </span>
                <span
                  className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] ${
                    provider.secretConfigured
                      ? "border border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                      : "border border-[#ff2247]/40 bg-[#ff2247]/10 text-[#ff9fb0]"
                  }`}
                  title={`env: ${provider.secretRef}`}
                >
                  {provider.secretConfigured ? "Anahtar tanımlı" : `${provider.secretRef} eksik`}
                </span>
                <form action={toggleAction}>
                  <input type="hidden" name="id" value={provider.id} />
                  <input
                    type="hidden"
                    name="enabled"
                    value={provider.isEnabled ? "0" : "1"}
                  />
                  <button
                    type="submit"
                    className={`${DM_ACTION_BUTTON} border-white/10 bg-white/[0.05] text-white/60 hover:border-[#67e8f9]/40 hover:text-[#67e8f9]`}
                  >
                    {provider.isEnabled ? "Kapat" : "Aç"}
                  </button>
                </form>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
