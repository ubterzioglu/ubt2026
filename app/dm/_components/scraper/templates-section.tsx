// Şablonlar bölümü: kategori şablonlarını listeler; sorgu kalıpları ve
// dışlama terimleri düzenlenebilir, şablon aç/kapat yapılabilir.
// "Aranacak şeyler" burada yönetilir (desiremap.de kategorileri seed'lidir).

import {
  DM_ACTION_BUTTON,
  DM_BRAND_GRADIENT,
  DM_CARD_CLASS,
  DM_CARD_INNER_CLASS,
  DM_INPUT_CLASS,
  DM_LABEL_CLASS
} from "@/app/dm/_components/theme";
import type { FinderTemplateItem } from "@/lib/service-finder";

interface TemplatesSectionProps {
  templates: FinderTemplateItem[];
  editId: string;
  toggleAction: (formData: FormData) => void | Promise<void>;
  updateAction: (formData: FormData) => void | Promise<void>;
}

export function TemplatesSection({
  templates,
  editId,
  toggleAction,
  updateAction
}: TemplatesSectionProps) {
  return (
    <section className={DM_CARD_CLASS}>
      <div className={`${DM_CARD_INNER_CLASS} px-4 py-4 sm:px-5`}>
        <h2 className="font-body text-sm font-semibold text-white">Kategori şablonları</h2>
        <p className="mt-1 text-xs leading-5 text-white/50">
          Her şablon bir desiremap.de kategorisini tarar. Sorgu kalıplarında{" "}
          <code className="rounded bg-white/[0.06] px-1 text-[10px]">{"{{city}}"}</code> yer
          tutucusu iş oluştururken girilen şehirle doldurulur.
        </p>

        <div className="mt-3 space-y-2">
          {templates.length === 0 ? (
            <p className="rounded-[1rem] border border-dashed border-white/15 px-4 py-8 text-center text-xs text-white/45">
              Şablon yok — migration seed&apos;i uygulanmamış olabilir.
            </p>
          ) : (
            templates.map((template) => {
              const isEditing = editId === template.id;
              return (
                <article
                  key={template.id}
                  className="rounded-[1rem] border border-white/[0.08] bg-white/[0.02] px-3.5 py-3"
                >
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    <span
                      className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] ${
                        template.isActive
                          ? "border border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                          : "border border-white/10 bg-white/[0.04] text-white/40"
                      }`}
                    >
                      {template.isActive ? "Aktif" : "Kapalı"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-body text-[13px] font-semibold text-white">
                        {template.label}
                        <span className="ml-2 text-[10px] font-normal uppercase tracking-[0.12em] text-white/35">
                          {template.categorySlug || template.roleKey} · {template.itemType}
                        </span>
                      </p>
                      {!isEditing ? (
                        <p className="mt-0.5 truncate text-[11px] text-white/40">
                          {template.queryTemplates.join(" · ")}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <a
                        href={
                          isEditing
                            ? "/dm?tab=scraper&sec=sablonlar"
                            : `/dm?tab=scraper&sec=sablonlar&edit=${template.id}`
                        }
                        className={`${DM_ACTION_BUTTON} border-white/10 bg-white/[0.05] text-white/60 hover:border-[#67e8f9]/40 hover:text-[#67e8f9]`}
                      >
                        {isEditing ? "Vazgeç" : "Düzenle"}
                      </a>
                      <form action={toggleAction}>
                        <input type="hidden" name="id" value={template.id} />
                        <input
                          type="hidden"
                          name="active"
                          value={template.isActive ? "0" : "1"}
                        />
                        <button
                          type="submit"
                          className={`${DM_ACTION_BUTTON} border-white/10 bg-white/[0.05] text-white/60 hover:text-white`}
                        >
                          {template.isActive ? "Kapat" : "Aç"}
                        </button>
                      </form>
                    </div>
                  </div>

                  {isEditing ? (
                    <form
                      action={updateAction}
                      className="mt-3 space-y-3 border-t border-white/[0.06] pt-3"
                    >
                      <input type="hidden" name="id" value={template.id} />
                      <label className="block">
                        <span className={DM_LABEL_CLASS}>
                          Etiket
                        </span>
                        <input
                          type="text"
                          name="label"
                          defaultValue={template.label}
                          minLength={2}
                          maxLength={80}
                          className={DM_INPUT_CLASS}
                        />
                      </label>
                      <label className="block">
                        <span className={DM_LABEL_CLASS}>
                          Sorgu kalıpları (her satıra bir tane)
                        </span>
                        <textarea
                          name="queryTemplates"
                          rows={5}
                          defaultValue={template.queryTemplates.join("\n")}
                          className={DM_INPUT_CLASS}
                        />
                      </label>
                      <label className="block">
                        <span className={DM_LABEL_CLASS}>
                          Dışlama terimleri (virgülle)
                        </span>
                        <input
                          type="text"
                          name="mustExcludeTerms"
                          defaultValue={template.mustExcludeTerms.join(", ")}
                          className={DM_INPUT_CLASS}
                        />
                      </label>
                      <button
                        type="submit"
                        className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-[0.85rem] px-5 py-2.5 text-xs font-bold tracking-tight text-white shadow-[0_14px_44px_-10px_rgba(255,45,149,0.65)] ring-1 ring-inset ring-white/15 transition duration-300"
                        style={{ backgroundImage: DM_BRAND_GRADIENT }}
                      >
                        Şablonu kaydet
                      </button>
                    </form>
                  ) : null}
                </article>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
