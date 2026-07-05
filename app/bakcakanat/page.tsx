import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isBakcakanatAuthenticated } from "@/lib/admin-auth";
import { BakcakanatLogin } from "@/app/bakcakanat/_components/bakcakanat-login";
import {
  bakcakanatSignInAction,
  bakcakanatSignOutAction
} from "@/app/bakcakanat/_actions";
import {
  BAKCAKANAT_BRAND_GRADIENT,
  BAKCAKANAT_EMERALD
} from "@/app/bakcakanat/_components/theme";
import {
  getAllAkcakanatDomainsAdmin,
  getAkcakanatDomainByIdAdmin,
  createAkcakanatDomain,
  updateAkcakanatDomain,
  deleteAkcakanatDomain,
  clampAkcakanatPriority
} from "@/lib/akcakanat-domains";
import type { AkcakanatDomainItem } from "@/lib/akcakanat-domains";

export const metadata = {
  title: "Akçakanat · Domain Yönetimi",
  robots: { index: false, follow: false }
};

interface BakcakanatPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

function readParam(value: string | string[] | undefined): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value[0] ?? "";
  return "";
}

function normalizeSiteHref(site: string): string | null {
  const trimmed = site.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

// Shared dark input styling so every cell reads as one premium glass surface.
const darkInput =
  "w-full rounded-[0.7rem] border border-white/10 bg-white/[0.04] px-3 py-2 text-[13px] text-white placeholder:text-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] outline-none transition focus:border-[#34D399]/55 focus:bg-white/[0.06] focus:ring-4 focus:ring-[#34D399]/12";
const formLabel =
  "mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-white/50";

// Filter chip styling (mirrors the /batubt board).
const chipBase = "rounded-full px-3 py-1 text-[11px] font-semibold transition";
const chipActive =
  "bg-[#34D399] text-black shadow-[0_8px_24px_-8px_rgba(52,211,153,0.6)]";
const chipIdle =
  "border border-white/10 bg-white/[0.04] text-white/70 hover:border-[#34D399]/40 hover:text-white";

// Importance rank options: 1 = most important, 10 = least important.
const PRIORITY_OPTIONS = Array.from({ length: 10 }, (_, index) => {
  const value = index + 1;
  const label =
    value === 1 ? "1 · en önemli" : value === 10 ? "10 · en önemsiz" : `${value}`;
  return { value, label };
});

function parsePriority(value: string): number {
  return clampAkcakanatPriority(Number.parseInt(value, 10));
}

type FilterKey = "priority" | "email" | "redirect" | "hosting" | "payment";

export default async function BakcakanatPage({
  searchParams
}: BakcakanatPageProps) {
  const params = searchParams ? await searchParams : {};
  const hasAccess = await isBakcakanatAuthenticated();

  if (!hasAccess) {
    return (
      <BakcakanatLogin
        brand="Akçakanat"
        subtitle="Domain Yönetimi"
        footerCaption="ubterzioglu.de · internal"
        eyebrow="Yönetim erişimi"
        title="Domain portföy panosu"
        description="Akçakanat domainlerinin hosting, e-posta ve not kayıtlarını bu özel pano üzerinden yönetiyoruz. Devam etmek için şifreyi gir."
        submitLabel="Panoyu aç"
        signIn={bakcakanatSignInAction}
      />
    );
  }

  const result = await getAllAkcakanatDomainsAdmin();
  const createdParam = readParam(params.created);
  const updatedParam = readParam(params.updated);
  const deletedParam = readParam(params.deleted);
  const errorParam = readParam(params.error);
  const editId = readParam(params.edit);
  const editing = editId ? await getAkcakanatDomainByIdAdmin(editId) : null;

  const filters: Record<FilterKey, string> = {
    priority: readParam(params.priority),
    email: readParam(params.email),
    redirect: readParam(params.redirect),
    hosting: readParam(params.hosting),
    payment: readParam(params.payment)
  };

  async function createAction(formData: FormData) {
    "use server";
    if (!(await isBakcakanatAuthenticated())) {
      redirect("/bakcakanat" as Parameters<typeof redirect>[0]);
    }
    const outcome = await createAkcakanatDomain({
      site: (formData.get("site") as string | null) ?? "",
      domainInfo: (formData.get("domainInfo") as string | null) ?? "",
      hosting: (formData.get("hosting") as string | null) ?? "",
      email: (formData.get("email") as string | null) ?? "",
      hasEmail: ((formData.get("hasEmail") as string | null) ?? "0") === "1",
      redirectTo: (formData.get("redirectTo") as string | null) ?? "",
      paymentDays: (formData.get("paymentDays") as string | null) ?? "",
      paymentMethod: (formData.get("paymentMethod") as string | null) ?? "",
      comment: (formData.get("comment") as string | null) ?? "",
      priority: parsePriority((formData.get("priority") as string | null) ?? "5"),
      sortOrder: Number.parseInt(
        (formData.get("sortOrder") as string | null) ?? "0",
        10
      )
    });

    revalidatePath("/bakcakanat");
    redirect(
      (outcome.ok
        ? "/bakcakanat?created=1"
        : `/bakcakanat?error=${encodeURIComponent(outcome.errorMessage ?? "Kayıt eklenemedi.")}`) as Parameters<
        typeof redirect
      >[0]
    );
  }

  async function updateAction(formData: FormData) {
    "use server";
    if (!(await isBakcakanatAuthenticated())) {
      redirect("/bakcakanat" as Parameters<typeof redirect>[0]);
    }
    const id = (formData.get("id") as string | null) ?? "";
    if (!id) {
      redirect("/bakcakanat" as Parameters<typeof redirect>[0]);
    }
    const outcome = await updateAkcakanatDomain(id, {
      site: (formData.get("site") as string | null) ?? "",
      domainInfo: (formData.get("domainInfo") as string | null) ?? "",
      hosting: (formData.get("hosting") as string | null) ?? "",
      email: (formData.get("email") as string | null) ?? "",
      hasEmail: ((formData.get("hasEmail") as string | null) ?? "0") === "1",
      redirectTo: (formData.get("redirectTo") as string | null) ?? "",
      paymentDays: (formData.get("paymentDays") as string | null) ?? "",
      paymentMethod: (formData.get("paymentMethod") as string | null) ?? "",
      comment: (formData.get("comment") as string | null) ?? "",
      priority: parsePriority((formData.get("priority") as string | null) ?? "5"),
      sortOrder: Number.parseInt(
        (formData.get("sortOrder") as string | null) ?? "0",
        10
      )
    });

    revalidatePath("/bakcakanat");
    redirect(
      (outcome.ok
        ? "/bakcakanat?updated=1"
        : `/bakcakanat?error=${encodeURIComponent(outcome.errorMessage ?? "Kayıt güncellenemedi.")}`) as Parameters<
        typeof redirect
      >[0]
    );
  }

  async function deleteAction(formData: FormData) {
    "use server";
    if (!(await isBakcakanatAuthenticated())) {
      redirect("/bakcakanat" as Parameters<typeof redirect>[0]);
    }
    const id = (formData.get("id") as string | null) ?? "";
    if (id) {
      await deleteAkcakanatDomain(id);
    }
    revalidatePath("/bakcakanat");
    redirect("/bakcakanat?deleted=1" as Parameters<typeof redirect>[0]);
  }

  const domains = result.items;
  const filledCount = domains.filter(
    (item) => item.hosting || item.email || item.domainInfo
  ).length;

  // Distinct chip values, computed from the unfiltered list.
  const priorityValues = Array.from(
    new Set(domains.map((item) => item.priority))
  ).sort((a, b) => a - b);
  const hostingValues = Array.from(
    new Set(domains.map((item) => item.hosting).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b, "tr"));
  const paymentValues = Array.from(
    new Set(domains.map((item) => item.paymentMethod).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b, "tr"));

  const visibleDomains = domains.filter((item) => {
    if (filters.priority && String(item.priority) !== filters.priority) {
      return false;
    }
    if (filters.email === "var" && !item.hasEmail) return false;
    if (filters.email === "yok" && item.hasEmail) return false;
    if (filters.redirect === "var" && !item.redirectTo) return false;
    if (filters.redirect === "yok" && item.redirectTo) return false;
    if (filters.hosting && item.hosting !== filters.hosting) return false;
    if (filters.payment && item.paymentMethod !== filters.payment) return false;
    return true;
  });

  // Builds a filter link that keeps every other active filter intact.
  function filterHref(key: FilterKey, value: string): string {
    const merged = { ...filters, [key]: value };
    const query = new URLSearchParams();
    for (const [paramKey, paramValue] of Object.entries(merged)) {
      if (paramValue) query.set(paramKey, paramValue);
    }
    const qs = query.toString();
    return qs ? `/bakcakanat?${qs}` : "/bakcakanat";
  }

  const hasActiveFilter = Object.values(filters).some(Boolean);

  // Open the add-form accordion automatically only while editing a record.
  const formOpen = Boolean(editing);

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#060908] px-4 py-8 sm:px-6 lg:px-8">
      {/* Ambient glow field — black · emerald · sky */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(55% 45% at 15% 8%, rgba(52,211,153,0.14), transparent 60%)," +
            "radial-gradient(45% 45% at 88% 4%, rgba(56,189,248,0.14), transparent 58%)," +
            "radial-gradient(70% 70% at 50% 120%, rgba(45,212,191,0.10), transparent 60%)," +
            "linear-gradient(180deg, #070b0a 0%, #060908 55%, #040606 100%)"
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 opacity-[0.3]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)," +
            "linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(120% 80% at 50% 0%, black, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(120% 80% at 50% 0%, black, transparent 80%)"
        }}
      />

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
        {/* Header card */}
        <section className="overflow-hidden rounded-[1.6rem] border border-white/10 bg-white/[0.03] backdrop-blur-xl">
          <div className="flex flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div className="flex items-center gap-3">
              <span
                className="relative flex h-9 w-9 items-center justify-center rounded-xl ring-1 ring-white/15"
                style={{ backgroundImage: BAKCAKANAT_BRAND_GRADIENT }}
              >
                <span className="font-body text-sm font-extrabold tracking-tight text-black">
                  A
                </span>
              </span>
              <div>
                <p
                  className="text-[10px] font-semibold uppercase tracking-[0.28em]"
                  style={{ color: BAKCAKANAT_EMERALD }}
                >
                  Akçakanat
                </p>
                <h1 className="font-body text-[clamp(1.2rem,3vw,1.6rem)] font-bold tracking-[-0.03em] text-white">
                  Domain yönetimi
                </h1>
              </div>
            </div>
            <form action={bakcakanatSignOutAction}>
              <button
                type="submit"
                className="inline-flex min-h-[40px] items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[13px] font-semibold text-white/80 transition hover:border-rose-400/40 hover:text-rose-300"
              >
                Çıkış yap
              </button>
            </form>
          </div>
        </section>

        {/* Feedback banners */}
        {createdParam === "1" && (
          <div className="rounded-[1.1rem] border border-emerald-400/25 bg-emerald-400/10 px-5 py-3 text-[13px] font-medium text-emerald-200">
            Kayıt eklendi.
          </div>
        )}
        {updatedParam === "1" && (
          <div className="rounded-[1.1rem] border border-emerald-400/25 bg-emerald-400/10 px-5 py-3 text-[13px] font-medium text-emerald-200">
            Kayıt güncellendi.
          </div>
        )}
        {deletedParam === "1" && (
          <div className="rounded-[1.1rem] border border-rose-400/25 bg-rose-400/10 px-5 py-3 text-[13px] font-medium text-rose-200">
            Kayıt silindi.
          </div>
        )}
        {errorParam && (
          <div className="rounded-[1.1rem] border border-rose-400/25 bg-rose-400/10 px-5 py-3 text-[13px] font-medium text-rose-200">
            Hata: {errorParam}
          </div>
        )}
        {result.source === "env-missing" && (
          <div className="rounded-[1.1rem] border border-amber-400/25 bg-amber-400/10 px-5 py-3 text-[13px] font-medium text-amber-200">
            Supabase bağlantısı yapılandırılmamış (SUPABASE_SERVICE_ROLE_KEY
            eksik). Kayıtlar yüklenemiyor.
          </div>
        )}
        {result.source === "error" && (
          <div className="rounded-[1.1rem] border border-rose-400/25 bg-rose-400/10 px-5 py-3 text-[13px] font-medium text-rose-200">
            Kayıtlar yüklenirken hata oluştu: {result.errorMessage}
          </div>
        )}

        {/* Stats */}
        <section className="grid gap-3 sm:grid-cols-3">
          {[
            { label: "Toplam domain", value: domains.length },
            { label: "Bilgisi girilmiş", value: filledCount },
            { label: "Gösterilen", value: visibleDomains.length }
          ].map((stat) => (
            <article
              key={stat.label}
              className="rounded-[1.2rem] border border-white/10 bg-white/[0.03] px-5 py-4 backdrop-blur-xl"
            >
              <p
                className="text-[10px] font-semibold uppercase tracking-[0.2em]"
                style={{ color: BAKCAKANAT_EMERALD }}
              >
                {stat.label}
              </p>
              <p className="mt-1.5 font-body text-2xl font-bold text-white">
                {stat.value}
              </p>
            </article>
          ))}
        </section>

        {/* Add / edit form — collapsed-by-default accordion; "Düzenle" opens it */}
        <details
          open={formOpen}
          className="group overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.03] backdrop-blur-xl"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-4 sm:px-8 [&::-webkit-details-marker]:hidden">
            <h2 className="flex items-center gap-2 font-body text-base font-semibold text-white">
              <span
                className="flex h-6 w-6 items-center justify-center rounded-full text-sm font-bold text-black"
                style={{ backgroundImage: BAKCAKANAT_BRAND_GRADIENT }}
              >
                +
              </span>
              {editing ? `Kaydı düzenle · ${editing.site}` : "Yeni site ekle"}
            </h2>
            <span className="flex items-center gap-3">
              {editing ? (
                <a
                  href="/bakcakanat"
                  className="text-[13px] font-semibold"
                  style={{ color: BAKCAKANAT_EMERALD }}
                >
                  İptal
                </a>
              ) : null}
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white/40 transition-transform duration-200 group-open:rotate-180"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </span>
          </summary>
          <form
            action={editing ? updateAction : createAction}
            className="space-y-4 px-6 pb-6 pt-1 sm:px-8"
          >
            {editing ? <input type="hidden" name="id" value={editing.id} /> : null}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <label className="block">
                <span className={formLabel}>
                  Site <span style={{ color: BAKCAKANAT_EMERALD }}>*</span>
                </span>
                <input
                  type="text"
                  name="site"
                  required
                  minLength={3}
                  maxLength={253}
                  defaultValue={editing?.site ?? ""}
                  placeholder="ör. example.com"
                  className={darkInput}
                />
              </label>
              <label className="block">
                <span className={formLabel}>Domain</span>
                <input
                  type="text"
                  name="domainInfo"
                  maxLength={300}
                  defaultValue={editing?.domainInfo ?? ""}
                  placeholder="Kayıt firması / bitiş tarihi…"
                  className={darkInput}
                />
              </label>
              <label className="block">
                <span className={formLabel}>Hosting</span>
                <input
                  type="text"
                  name="hosting"
                  maxLength={300}
                  defaultValue={editing?.hosting ?? ""}
                  placeholder="Hosting sağlayıcı…"
                  className={darkInput}
                />
              </label>
              <label className="block">
                <span className={formLabel}>Email</span>
                <input
                  type="text"
                  name="email"
                  maxLength={300}
                  defaultValue={editing?.email ?? ""}
                  placeholder="E-posta sağlayıcı / adres…"
                  className={darkInput}
                />
              </label>
              <label className="block">
                <span className={formLabel}>Email var mı?</span>
                <select
                  name="hasEmail"
                  defaultValue={editing?.hasEmail ? "1" : "0"}
                  className={darkInput}
                >
                  <option value="0" className="bg-[#0b0f0e] text-white">
                    Yok
                  </option>
                  <option value="1" className="bg-[#0b0f0e] text-white">
                    Var
                  </option>
                </select>
              </label>
              <label className="block">
                <span className={formLabel}>Yönlendirme (nereye)</span>
                <input
                  type="text"
                  name="redirectTo"
                  maxLength={300}
                  defaultValue={editing?.redirectTo ?? ""}
                  placeholder="Yoksa boş bırak — ör. corteqs.net"
                  className={darkInput}
                />
              </label>
              <label className="block">
                <span className={formLabel}>Ödeme günleri</span>
                <input
                  type="text"
                  name="paymentDays"
                  maxLength={300}
                  defaultValue={editing?.paymentDays ?? ""}
                  placeholder="ör. her yıl 20 Nisan"
                  className={darkInput}
                />
              </label>
              <label className="block">
                <span className={formLabel}>Ödeme yöntemi</span>
                <input
                  type="text"
                  name="paymentMethod"
                  maxLength={300}
                  defaultValue={editing?.paymentMethod ?? ""}
                  placeholder="ör. sanal kart (Revolut)"
                  className={darkInput}
                />
              </label>
              <label className="block">
                <span className={formLabel}>Yorum</span>
                <input
                  type="text"
                  name="comment"
                  maxLength={1000}
                  defaultValue={editing?.comment ?? ""}
                  placeholder="Opsiyonel not…"
                  className={darkInput}
                />
              </label>
              <label className="block">
                <span className={formLabel}>Önem sırası</span>
                <select
                  name="priority"
                  defaultValue={editing?.priority ?? 5}
                  className={darkInput}
                >
                  {PRIORITY_OPTIONS.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                      className="bg-[#0b0f0e] text-white"
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className={formLabel}>Sıra</span>
                <input
                  type="number"
                  name="sortOrder"
                  defaultValue={editing?.sortOrder ?? (domains.length + 1) * 10}
                  className={darkInput}
                />
              </label>
            </div>
            <button
              type="submit"
              className="inline-flex min-h-[44px] items-center justify-center rounded-[0.9rem] px-6 py-2.5 text-[13px] font-bold tracking-tight text-black shadow-[0_12px_40px_-8px_rgba(52,211,153,0.5)] ring-1 ring-inset ring-white/15 transition hover:shadow-[0_16px_50px_-8px_rgba(56,189,248,0.6)]"
              style={{ backgroundImage: BAKCAKANAT_BRAND_GRADIENT }}
            >
              {editing ? "Değişiklikleri kaydet" : "Site ekle"}
            </button>
          </form>
        </details>

        {/* Filters — one group per field */}
        <section className="rounded-[1.3rem] border border-white/10 bg-white/[0.03] px-6 py-4 backdrop-blur-xl sm:px-8">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="w-24 shrink-0 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
                Önem
              </span>
              <a
                href={filterHref("priority", "")}
                className={`${chipBase} ${filters.priority ? chipIdle : chipActive}`}
              >
                Tümü
              </a>
              {priorityValues.map((value) => (
                <a
                  key={value}
                  href={filterHref("priority", String(value))}
                  title="1 en önemli · 10 en önemsiz"
                  className={`${chipBase} ${
                    filters.priority === String(value) ? chipActive : chipIdle
                  }`}
                >
                  {value}
                </a>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="w-24 shrink-0 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
                Email
              </span>
              {[
                { value: "", label: "Tümü" },
                { value: "var", label: "Var" },
                { value: "yok", label: "Yok" }
              ].map((option) => (
                <a
                  key={option.label}
                  href={filterHref("email", option.value)}
                  className={`${chipBase} ${
                    filters.email === option.value ? chipActive : chipIdle
                  }`}
                >
                  {option.label}
                </a>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="w-24 shrink-0 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
                Yönlendirme
              </span>
              {[
                { value: "", label: "Tümü" },
                { value: "var", label: "Var" },
                { value: "yok", label: "Yok" }
              ].map((option) => (
                <a
                  key={option.label}
                  href={filterHref("redirect", option.value)}
                  className={`${chipBase} ${
                    filters.redirect === option.value ? chipActive : chipIdle
                  }`}
                >
                  {option.label}
                </a>
              ))}
            </div>
            {hostingValues.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="w-24 shrink-0 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
                  Hosting
                </span>
                <a
                  href={filterHref("hosting", "")}
                  className={`${chipBase} ${filters.hosting ? chipIdle : chipActive}`}
                >
                  Tümü
                </a>
                {hostingValues.map((value) => (
                  <a
                    key={value}
                    href={filterHref("hosting", value)}
                    className={`${chipBase} ${
                      filters.hosting === value ? chipActive : chipIdle
                    }`}
                  >
                    {value}
                  </a>
                ))}
              </div>
            )}
            {paymentValues.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="w-24 shrink-0 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
                  Ödeme
                </span>
                <a
                  href={filterHref("payment", "")}
                  className={`${chipBase} ${filters.payment ? chipIdle : chipActive}`}
                >
                  Tümü
                </a>
                {paymentValues.map((value) => (
                  <a
                    key={value}
                    href={filterHref("payment", value)}
                    className={`${chipBase} ${
                      filters.payment === value ? chipActive : chipIdle
                    }`}
                  >
                    {value}
                  </a>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Domain list — one compact read-only row per record */}
        <section className="space-y-2">
          {visibleDomains.length === 0 ? (
            <p className="rounded-[1.3rem] border border-dashed border-white/15 px-5 py-8 text-center text-[13px] text-white/50">
              {domains.length === 0
                ? "Henüz kayıt yok. Yukarıdan ilk siteyi ekle."
                : hasActiveFilter
                  ? "Bu filtreyle eşleşen kayıt yok."
                  : "Kayıt bulunamadı."}
            </p>
          ) : (
            visibleDomains.map((item) => (
              <DomainRow key={item.id} item={item} deleteAction={deleteAction} />
            ))
          )}
        </section>
      </div>
    </main>
  );
}

interface DomainRowProps {
  item: AkcakanatDomainItem;
  deleteAction: (formData: FormData) => void | Promise<void>;
}

/**
 * One compact read-only row. Editing happens in the top accordion form via the
 * "Düzenle" link (?edit=id); only deletion stays inline.
 */
function DomainRow({ item, deleteAction }: DomainRowProps) {
  const siteHref = normalizeSiteHref(item.site);
  const detailLine = [
    item.domainInfo,
    item.email ? `E-posta: ${item.email}` : "",
    item.paymentDays ? `Ödeme: ${item.paymentDays}` : "",
    item.comment
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <article className="rounded-[0.95rem] border border-white/10 bg-white/[0.03] backdrop-blur-xl transition hover:border-white/20">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2.5 sm:flex-nowrap">
        {/* 1) Importance rank */}
        <span
          className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-[11px] font-bold text-white/80"
          title={`Önem: ${item.priority} (1 en önemli · 10 en önemsiz)`}
        >
          {item.priority}
        </span>

        {/* 2) Site (clickable URL) — primary, takes remaining width */}
        {siteHref ? (
          <a
            href={siteHref}
            target="_blank"
            rel="noopener noreferrer"
            className="min-w-0 flex-1 truncate font-body text-[14px] font-semibold text-white transition hover:text-[#34D399]"
            title={item.site}
          >
            {item.site}
          </a>
        ) : (
          <span className="min-w-0 flex-1 truncate font-body text-[14px] font-semibold text-white/50">
            (site yok)
          </span>
        )}

        {/* 3) Hosting (hidden on small screens) */}
        {item.hosting ? (
          <span className="hidden max-w-[150px] shrink-0 truncate text-[11px] text-white/45 lg:inline">
            {item.hosting}
          </span>
        ) : null}

        {/* 4) Email var/yok badge */}
        <span
          className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] ${
            item.hasEmail
              ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
              : "border-white/10 bg-white/[0.04] text-white/40"
          }`}
          title={item.hasEmail ? "E-postası var" : "E-postası yok"}
        >
          {item.hasEmail ? "email ✓" : "email —"}
        </span>

        {/* 5) Redirect badge */}
        <span
          className={`inline-flex max-w-[180px] shrink-0 items-center truncate rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] ${
            item.redirectTo
              ? "border-sky-400/30 bg-sky-400/10 text-sky-300"
              : "border-white/10 bg-white/[0.04] text-white/40"
          }`}
          title={
            item.redirectTo
              ? `Yönlendirme: ${item.redirectTo}`
              : "Yönlendirme yok"
          }
        >
          {item.redirectTo ? `→ ${item.redirectTo}` : "→ yok"}
        </span>

        {/* 6) Payment method badge */}
        {item.paymentMethod ? (
          <span
            className="inline-flex max-w-[150px] shrink-0 items-center truncate rounded-full border border-violet-400/30 bg-violet-400/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-violet-300"
            title={`Ödeme yöntemi: ${item.paymentMethod}`}
          >
            {item.paymentMethod}
          </span>
        ) : null}

        {/* 7) Actions */}
        <div className="flex shrink-0 items-center gap-1.5">
          <a
            href={`/bakcakanat?edit=${item.id}`}
            className="inline-flex min-h-[30px] items-center justify-center rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[11px] font-semibold text-white/80 transition hover:border-[#34D399]/40 hover:text-[#34D399]"
          >
            Düzenle
          </a>
          <form action={deleteAction}>
            <input type="hidden" name="id" value={item.id} />
            <button
              type="submit"
              className="inline-flex min-h-[30px] items-center justify-center rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[11px] font-semibold text-white/80 transition hover:border-rose-400/40 hover:bg-rose-400/10 hover:text-rose-300"
            >
              Sil
            </button>
          </form>
        </div>
      </div>

      {/* Optional second line: registrar info, e-mail provider, payment days, notes */}
      {detailLine ? (
        <div className="border-t border-white/[0.06] px-4 py-2">
          <span className="text-[11px] text-white/45">{detailLine}</span>
        </div>
      ) : null}
    </article>
  );
}
