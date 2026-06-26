import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isBatubtAuthenticated } from "@/lib/admin-auth";
import { AdminGate } from "@/app/admin/_components/admin-gate";
import { batubtSignInAction, batubtSignOutAction } from "@/app/batubt/_actions";
import {
  getAllFooterClientsAdmin,
  getFooterClientByIdAdmin,
  createFooterClient,
  updateFooterClient,
  deleteFooterClient
} from "@/lib/footer-clients";
import type { FooterClientItem, FooterClientStatus } from "@/types/site";

export const metadata = {
  title: "BatuBT · Footer Yönetimi",
  robots: { index: false, follow: false }
};

interface BatubtPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

function readParam(value: string | string[] | undefined): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value[0] ?? "";
  return "";
}

const STATUS_OPTIONS: { value: FooterClientStatus; label: string }[] = [
  { value: "pending", label: "Beklemede" },
  { value: "added", label: "Eklendi" },
  { value: "verified", label: "Doğrulandı" }
];

const STATUS_BADGE: Record<FooterClientStatus, string> = {
  pending: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  added: "border-sky-400/30 bg-sky-400/10 text-sky-300",
  verified: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
};

function statusLabel(value: FooterClientStatus): string {
  return STATUS_OPTIONS.find((option) => option.value === value)?.label ?? value;
}

function parseStatus(value: string): FooterClientStatus {
  return STATUS_OPTIONS.some((option) => option.value === value)
    ? (value as FooterClientStatus)
    : "pending";
}

function parseSortOrder(value: string): number {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeDomainHref(domain: string): string | null {
  const trimmed = domain.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

// Shared dark input styling so the form reads as one premium glass surface.
const darkInput =
  "w-full rounded-[0.95rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] outline-none transition focus:border-accent/55 focus:bg-white/[0.06] focus:ring-4 focus:ring-accent/12";
const darkLabel =
  "mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-white/50";

export default async function BatubtPage({ searchParams }: BatubtPageProps) {
  const params = searchParams ? await searchParams : {};
  const hasAccess = await isBatubtAuthenticated();

  if (!hasAccess) {
    return (
      <AdminGate
        redirectTo="/batubt"
        variant="dark"
        brand="BatuBT"
        subtitle="Footer Yönetimi"
        footerCaption="ubterzioglu.de · internal"
        eyebrow="Yönetim erişimi"
        title="Footer kod yönetimi"
        description="Müşteri domainlerine girilecek footer kodlarını bu özel pano üzerinden yönetiyoruz. Devam etmek için erişim anahtarını gir."
        submitLabel="Panoyu aç"
        signInAction={batubtSignInAction}
      />
    );
  }

  const result = await getAllFooterClientsAdmin();
  const createdParam = readParam(params.created);
  const updatedParam = readParam(params.updated);
  const deletedParam = readParam(params.deleted);
  const ownerFilter = readParam(params.owner);
  const statusFilter = readParam(params.status);
  const editId = readParam(params.edit);
  const editing = editId ? await getFooterClientByIdAdmin(editId) : null;

  async function createAction(formData: FormData) {
    "use server";
    if (!(await isBatubtAuthenticated())) {
      redirect("/batubt" as Parameters<typeof redirect>[0]);
    }
    await createFooterClient({
      clientName: (formData.get("clientName") as string | null) ?? "",
      domain: (formData.get("domain") as string | null) ?? "",
      owner: (formData.get("owner") as string | null) ?? "",
      responsible: (formData.get("responsible") as string | null) ?? "",
      footerCode: (formData.get("footerCode") as string | null) ?? "",
      status: parseStatus((formData.get("status") as string | null) ?? "pending"),
      notes: (formData.get("notes") as string | null) ?? "",
      sortOrder: parseSortOrder((formData.get("sortOrder") as string | null) ?? "0")
    });

    revalidatePath("/batubt");
    redirect("/batubt?created=1" as Parameters<typeof redirect>[0]);
  }

  async function updateAction(formData: FormData) {
    "use server";
    if (!(await isBatubtAuthenticated())) {
      redirect("/batubt" as Parameters<typeof redirect>[0]);
    }
    const id = (formData.get("id") as string | null) ?? "";
    if (!id) {
      redirect("/batubt" as Parameters<typeof redirect>[0]);
    }
    await updateFooterClient(id, {
      clientName: (formData.get("clientName") as string | null) ?? "",
      domain: (formData.get("domain") as string | null) ?? "",
      owner: (formData.get("owner") as string | null) ?? "",
      responsible: (formData.get("responsible") as string | null) ?? "",
      footerCode: (formData.get("footerCode") as string | null) ?? "",
      status: parseStatus((formData.get("status") as string | null) ?? "pending"),
      notes: (formData.get("notes") as string | null) ?? "",
      sortOrder: parseSortOrder((formData.get("sortOrder") as string | null) ?? "0")
    });

    revalidatePath("/batubt");
    redirect("/batubt?updated=1" as Parameters<typeof redirect>[0]);
  }

  async function inlineStatusAction(formData: FormData) {
    "use server";
    if (!(await isBatubtAuthenticated())) {
      redirect("/batubt" as Parameters<typeof redirect>[0]);
    }
    const id = (formData.get("id") as string | null) ?? "";
    const status = parseStatus((formData.get("status") as string | null) ?? "pending");
    if (id) {
      await updateFooterClient(id, { status });
    }
    revalidatePath("/batubt");
    redirect("/batubt" as Parameters<typeof redirect>[0]);
  }

  async function deleteAction(formData: FormData) {
    "use server";
    if (!(await isBatubtAuthenticated())) {
      redirect("/batubt" as Parameters<typeof redirect>[0]);
    }
    const id = (formData.get("id") as string | null) ?? "";
    if (id) {
      await deleteFooterClient(id);
    }
    revalidatePath("/batubt");
    redirect("/batubt?deleted=1" as Parameters<typeof redirect>[0]);
  }

  const allClients = result.items;
  const owners = Array.from(
    new Set(allClients.map((client) => client.owner).filter(Boolean))
  );

  const visibleClients = allClients.filter((client) => {
    if (ownerFilter && client.owner !== ownerFilter) return false;
    if (statusFilter && client.status !== statusFilter) return false;
    return true;
  });

  const pendingCount = allClients.filter((c) => c.status === "pending").length;
  const addedCount = allClients.filter((c) => c.status === "added").length;
  const verifiedCount = allClients.filter((c) => c.status === "verified").length;

  function filterHref(nextOwner: string, nextStatus: string): string {
    const query = new URLSearchParams();
    if (nextOwner) query.set("owner", nextOwner);
    if (nextStatus) query.set("status", nextStatus);
    const qs = query.toString();
    return qs ? `/batubt?${qs}` : "/batubt";
  }

  const chipBase =
    "rounded-full px-3 py-1 text-xs font-semibold transition";
  const chipActive = "bg-accent text-white shadow-[0_8px_24px_-8px_rgba(27,122,110,0.7)]";
  const chipIdle =
    "border border-white/10 bg-white/[0.04] text-white/70 hover:border-accent/40 hover:text-white";

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#070b10] px-4 py-8 sm:px-6 lg:px-8">
      {/* Ambient glow field — same visual language as the gate */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(55% 45% at 15% 8%, rgba(27,122,110,0.28), transparent 60%)," +
            "radial-gradient(45% 45% at 88% 4%, rgba(202,124,71,0.18), transparent 58%)," +
            "radial-gradient(70% 70% at 50% 120%, rgba(27,122,110,0.14), transparent 60%)," +
            "linear-gradient(180deg, #080c12 0%, #06090d 55%, #04060a 100%)"
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

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        {/* Header bar */}
        <section className="rounded-[1.6rem] border border-white/10 bg-white/[0.03] px-6 py-5 backdrop-blur-xl sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-[#0f4f47] shadow-lg shadow-accent/30 ring-1 ring-white/15">
                <span className="font-body text-base font-extrabold tracking-tight text-white">
                  B
                </span>
              </span>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-accent/90">
                  BatuBT
                </p>
                <h1 className="font-body text-[clamp(1.5rem,4vw,2rem)] font-bold tracking-[-0.03em] text-white">
                  Footer kod yönetimi
                </h1>
              </div>
            </div>
            <form action={batubtSignOutAction}>
              <button
                type="submit"
                className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm font-semibold text-white/80 transition hover:border-rose-400/40 hover:text-rose-300"
              >
                Çıkış yap
              </button>
            </form>
          </div>
        </section>

        {/* Feedback banners */}
        {createdParam === "1" && (
          <div className="rounded-[1.2rem] border border-emerald-400/25 bg-emerald-400/10 px-5 py-4 text-sm font-medium text-emerald-200">
            Kayıt eklendi.
          </div>
        )}
        {updatedParam === "1" && (
          <div className="rounded-[1.2rem] border border-emerald-400/25 bg-emerald-400/10 px-5 py-4 text-sm font-medium text-emerald-200">
            Kayıt güncellendi.
          </div>
        )}
        {deletedParam === "1" && (
          <div className="rounded-[1.2rem] border border-rose-400/25 bg-rose-400/10 px-5 py-4 text-sm font-medium text-rose-200">
            Kayıt silindi.
          </div>
        )}
        {result.source === "env-missing" && (
          <div className="rounded-[1.2rem] border border-amber-400/25 bg-amber-400/10 px-5 py-4 text-sm font-medium text-amber-200">
            Supabase bağlantısı yapılandırılmamış (SUPABASE_SERVICE_ROLE_KEY
            eksik). Kayıtlar yüklenemiyor.
          </div>
        )}
        {result.source === "error" && (
          <div className="rounded-[1.2rem] border border-rose-400/25 bg-rose-400/10 px-5 py-4 text-sm font-medium text-rose-200">
            Kayıtlar yüklenirken hata oluştu: {result.errorMessage}
          </div>
        )}

        {/* Stats */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Toplam", value: allClients.length },
            { label: "Beklemede", value: pendingCount },
            { label: "Eklendi", value: addedCount },
            { label: "Doğrulandı", value: verifiedCount }
          ].map((stat) => (
            <article
              key={stat.label}
              className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] px-6 py-5 backdrop-blur-xl"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent/90">
                {stat.label}
              </p>
              <p className="mt-2 font-body text-3xl font-bold text-white">
                {stat.value}
              </p>
            </article>
          ))}
        </section>

        {/* Add / edit form */}
        <section className="rounded-[1.6rem] border border-white/10 bg-white/[0.03] px-6 py-6 backdrop-blur-xl sm:px-8">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-body text-xl font-semibold text-white">
              {editing ? "Kaydı düzenle" : "Yeni kayıt ekle"}
            </h2>
            {editing ? (
              <a
                href="/batubt"
                className="text-sm font-semibold text-accent hover:text-accent/80"
              >
                Düzenlemeyi iptal et
              </a>
            ) : null}
          </div>
          <form
            action={editing ? updateAction : createAction}
            className="mt-6 space-y-4"
          >
            {editing ? <input type="hidden" name="id" value={editing.id} /> : null}
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className={darkLabel}>
                  Müşteri / metin <span className="text-accent">*</span>
                </span>
                <input
                  type="text"
                  name="clientName"
                  required
                  minLength={2}
                  maxLength={200}
                  defaultValue={editing?.clientName ?? ""}
                  placeholder="ör. ACME GmbH"
                  className={darkInput}
                />
              </label>
              <label className="block">
                <span className={darkLabel}>Domain</span>
                <input
                  type="text"
                  name="domain"
                  maxLength={253}
                  defaultValue={editing?.domain ?? ""}
                  placeholder="ör. acme.de"
                  className={darkInput}
                />
              </label>
              <label className="block">
                <span className={darkLabel}>Kime ait (sahip)</span>
                <input
                  type="text"
                  name="owner"
                  maxLength={120}
                  defaultValue={editing?.owner ?? ""}
                  placeholder="ör. Batuhan"
                  className={darkInput}
                />
              </label>
              <label className="block">
                <span className={darkLabel}>Sorumlu</span>
                <input
                  type="text"
                  name="responsible"
                  maxLength={120}
                  defaultValue={editing?.responsible ?? ""}
                  placeholder="ör. Ümit"
                  className={darkInput}
                />
              </label>
              <label className="block">
                <span className={darkLabel}>Durum</span>
                <select
                  name="status"
                  defaultValue={editing?.status ?? "pending"}
                  className={darkInput}
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                      className="bg-[#0b1118] text-white"
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className={darkLabel}>Sıra</span>
                <input
                  type="number"
                  name="sortOrder"
                  defaultValue={editing?.sortOrder ?? 0}
                  className={darkInput}
                />
              </label>
              <label className="block sm:col-span-2">
                <span className={darkLabel}>Footer kodu (snippet)</span>
                <textarea
                  name="footerCode"
                  rows={5}
                  defaultValue={editing?.footerCode ?? ""}
                  placeholder="Siteye gömülecek footer HTML/JS kodu…"
                  className={`${darkInput} font-mono text-[13px] leading-6`}
                />
              </label>
              <label className="block sm:col-span-2">
                <span className={darkLabel}>Not</span>
                <textarea
                  name="notes"
                  rows={2}
                  maxLength={1000}
                  defaultValue={editing?.notes ?? ""}
                  placeholder="Opsiyonel detay"
                  className={darkInput}
                />
              </label>
            </div>
            <button
              type="submit"
              className="inline-flex min-h-[48px] items-center justify-center rounded-[1rem] px-6 py-3 text-sm font-bold tracking-tight text-white shadow-[0_12px_40px_-8px_rgba(27,122,110,0.7)] ring-1 ring-inset ring-white/15 transition hover:shadow-[0_16px_50px_-8px_rgba(27,122,110,0.85)]"
              style={{
                backgroundImage:
                  "linear-gradient(110deg, rgb(27,122,110) 0%, rgb(34,150,135) 50%, rgb(27,122,110) 100%)"
              }}
            >
              {editing ? "Değişiklikleri kaydet" : "Kayıt ekle"}
            </button>
          </form>
        </section>

        {/* Filters */}
        <section className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] px-6 py-5 backdrop-blur-xl sm:px-8">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            {owners.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">
                  Sahip
                </span>
                <a
                  href={filterHref("", statusFilter)}
                  className={`${chipBase} ${ownerFilter ? chipIdle : chipActive}`}
                >
                  Tümü
                </a>
                {owners.map((owner) => (
                  <a
                    key={owner}
                    href={filterHref(owner, statusFilter)}
                    className={`${chipBase} ${
                      ownerFilter === owner ? chipActive : chipIdle
                    }`}
                  >
                    {owner}
                  </a>
                ))}
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">
                Durum
              </span>
              <a
                href={filterHref(ownerFilter, "")}
                className={`${chipBase} ${statusFilter ? chipIdle : chipActive}`}
              >
                Tümü
              </a>
              {STATUS_OPTIONS.map((option) => (
                <a
                  key={option.value}
                  href={filterHref(ownerFilter, option.value)}
                  className={`${chipBase} ${
                    statusFilter === option.value ? chipActive : chipIdle
                  }`}
                >
                  {option.label}
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* List */}
        <section className="space-y-4">
          {visibleClients.length === 0 ? (
            <p className="rounded-[1.4rem] border border-dashed border-white/15 px-5 py-8 text-center text-sm text-white/50">
              {allClients.length === 0
                ? "Henüz kayıt yok. Yukarıdan ilk müşteriyi ekle."
                : "Bu filtreyle eşleşen kayıt yok."}
            </p>
          ) : (
            visibleClients.map((client) => (
              <FooterClientCard
                key={client.id}
                client={client}
                inlineStatusAction={inlineStatusAction}
                deleteAction={deleteAction}
              />
            ))
          )}
        </section>
      </div>
    </main>
  );
}

interface FooterClientCardProps {
  client: FooterClientItem;
  inlineStatusAction: (formData: FormData) => void | Promise<void>;
  deleteAction: (formData: FormData) => void | Promise<void>;
}

function FooterClientCard({
  client,
  inlineStatusAction,
  deleteAction
}: FooterClientCardProps) {
  const domainHref = normalizeDomainHref(client.domain);

  return (
    <article className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] px-5 py-5 backdrop-blur-xl sm:px-7">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] ${STATUS_BADGE[client.status]}`}
            >
              {statusLabel(client.status)}
            </span>
            {domainHref ? (
              <a
                href={domainHref}
                target="_blank"
                rel="noopener noreferrer"
                className="font-body text-base font-semibold text-white hover:text-accent"
              >
                {client.domain}
              </a>
            ) : (
              <span className="font-body text-base font-semibold text-white/50">
                (domain yok)
              </span>
            )}
          </div>

          <p className="mt-1.5 text-sm font-medium text-white/85">
            {client.clientName}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
            {client.owner ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-white/60">
                <span className="text-white/35">Sahip:</span> {client.owner}
              </span>
            ) : null}
            {client.responsible ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-white/60">
                <span className="text-white/35">Sorumlu:</span>{" "}
                {client.responsible}
              </span>
            ) : null}
          </div>

          {client.notes ? (
            <p className="mt-2 text-xs leading-5 text-white/45">{client.notes}</p>
          ) : null}

          {client.footerCode ? (
            <details className="group mt-3">
              <summary className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-accent/90 hover:text-accent">
                <span>Footer kodunu göster</span>
                <span className="text-white/30 transition group-open:rotate-90">
                  ›
                </span>
              </summary>
              <pre className="mt-2 max-h-72 overflow-auto rounded-[0.9rem] border border-white/10 bg-black/40 p-4 text-[12px] leading-5 text-white/75">
                <code>{client.footerCode}</code>
              </pre>
            </details>
          ) : (
            <p className="mt-3 text-xs italic text-white/30">
              Footer kodu henüz girilmemiş.
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2 lg:flex-col lg:items-end">
          <form action={inlineStatusAction} className="flex items-center gap-2">
            <input type="hidden" name="id" value={client.id} />
            <select
              name="status"
              defaultValue={client.status}
              className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs font-semibold text-white outline-none transition focus:border-accent/55"
            >
              {STATUS_OPTIONS.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  className="bg-[#0b1118] text-white"
                >
                  {option.label}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="inline-flex min-h-[34px] items-center justify-center rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs font-semibold text-white/80 transition hover:border-accent/40 hover:text-accent"
            >
              Uygula
            </button>
          </form>
          <div className="flex items-center gap-2">
            <a
              href={`/batubt?edit=${client.id}`}
              className="inline-flex min-h-[34px] items-center justify-center rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs font-semibold text-white/80 transition hover:border-accent/40 hover:text-accent"
            >
              Düzenle
            </a>
            <form action={deleteAction}>
              <input type="hidden" name="id" value={client.id} />
              <button
                type="submit"
                className="inline-flex min-h-[34px] items-center justify-center rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs font-semibold text-white/80 transition hover:border-rose-400/40 hover:bg-rose-400/10 hover:text-rose-300"
              >
                Sil
              </button>
            </form>
          </div>
        </div>
      </div>
    </article>
  );
}
