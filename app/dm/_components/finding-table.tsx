"use client";

import { useMemo, useState } from "react";

import type {
  TestFindingItem,
  TestFindingSeverity,
  TestFindingStatus
} from "@/types/site";

interface OptionMeta<T extends string> {
  value: T;
  label: string;
}

interface FindingTableProps {
  findings: TestFindingItem[];
  statusOptions: OptionMeta<TestFindingStatus>[];
  severityOptions: OptionMeta<TestFindingSeverity>[];
  owners: string[];
  statusBadge: Record<TestFindingStatus, string>;
  severityBadge: Record<TestFindingSeverity, string>;
  resolveAction: (formData: FormData) => void | Promise<void>;
  deleteAction: (formData: FormData) => void | Promise<void>;
}

const ALL = "__all__";

const STATUS_SHORT: Record<TestFindingStatus, string> = {
  open: "Açık",
  investigating: "İnceleme",
  resolved: "Çözüldü",
  wontfix: "Geçersiz"
};

const SEVERITY_SHORT: Record<TestFindingSeverity, string> = {
  low: "Düşük",
  normal: "Normal",
  high: "Yüksek",
  critical: "Kritik"
};

/** Glowing leading dot per status — premium indicator feel. */
const STATUS_DOT: Record<TestFindingStatus, string> = {
  open: "bg-[#ff5572] shadow-[0_0_7px_rgba(255,34,71,0.9)]",
  investigating: "bg-amber-300 shadow-[0_0_7px_rgba(251,191,36,0.9)]",
  resolved: "bg-emerald-300 shadow-[0_0_7px_rgba(16,185,129,0.9)]",
  wontfix: "bg-white/55 shadow-[0_0_6px_rgba(255,255,255,0.6)]"
};

export function FindingTable({
  findings,
  statusOptions,
  severityOptions,
  owners,
  statusBadge,
  severityBadge,
  resolveAction,
  deleteAction
}: FindingTableProps) {
  const [query, setQuery] = useState("");
  const [owner, setOwner] = useState<string>(ALL);
  const [status, setStatus] = useState<string>(ALL);
  const [severity, setSeverity] = useState<string>(ALL);

  const visible = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("tr-TR");
    return findings.filter((f) => {
      if (owner !== ALL && f.owner !== owner) return false;
      if (status !== ALL && f.status !== status) return false;
      if (severity !== ALL && f.severity !== severity) return false;
      if (needle) {
        const haystack = [f.title, f.area, f.owner]
          .join(" ")
          .toLocaleLowerCase("tr-TR");
        if (!haystack.includes(needle)) return false;
      }
      return true;
    });
  }, [findings, owner, status, severity, query]);

  const filtersActive =
    query.trim() !== "" ||
    owner !== ALL ||
    status !== ALL ||
    severity !== ALL;

  const selectClass =
    "rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/80 outline-none transition focus:border-[#ff2d95]/55 focus:bg-white/[0.06]";

  return (
    <div className="space-y-3">
      {/* Search + filter bar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-sm">
          <span
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Bulgu, alan, sorumlu ara…"
            className="w-full rounded-lg border border-white/10 bg-white/[0.04] py-2 pl-9 pr-3 text-xs text-white placeholder:text-white/30 outline-none transition focus:border-[#ff2d95]/55 focus:bg-white/[0.06] focus:ring-2 focus:ring-[#ff2d95]/15"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={owner}
            onChange={(event) => setOwner(event.target.value)}
            className={selectClass}
            aria-label="Sorumlu filtresi"
          >
            <option value={ALL} className="bg-[#0a0712] text-white">
              Sorumlu: Tümü
            </option>
            {owners.map((value) => (
              <option key={value} value={value} className="bg-[#0a0712] text-white">
                {value}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className={selectClass}
            aria-label="Durum filtresi"
          >
            <option value={ALL} className="bg-[#0a0712] text-white">
              Durum: Tümü
            </option>
            {statusOptions.map((option) => (
              <option
                key={option.value}
                value={option.value}
                className="bg-[#0a0712] text-white"
              >
                {option.label}
              </option>
            ))}
          </select>
          <select
            value={severity}
            onChange={(event) => setSeverity(event.target.value)}
            className={selectClass}
            aria-label="Önem filtresi"
          >
            <option value={ALL} className="bg-[#0a0712] text-white">
              Önem: Tümü
            </option>
            {severityOptions.map((option) => (
              <option
                key={option.value}
                value={option.value}
                className="bg-[#0a0712] text-white"
              >
                {option.label}
              </option>
            ))}
          </select>
          {filtersActive ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setOwner(ALL);
                setStatus(ALL);
                setSeverity(ALL);
              }}
              className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/60 transition hover:border-[#67e8f9]/45 hover:text-white"
            >
              Temizle
            </button>
          ) : null}
          <span className="text-[11px] font-medium tabular-nums text-white/40">
            {visible.length}/{findings.length}
          </span>
        </div>
      </div>

      {/* Single flat list */}
      <div className="relative overflow-hidden rounded-xl border border-white/[0.07] bg-[#0a0712]/70">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255,45,149,0.5), rgba(168,85,247,0.5), rgba(34,211,238,0.5), transparent)"
          }}
        />
        {/* Column header (md+) */}
        <div className="hidden border-b border-white/[0.07] bg-white/[0.025] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40 md:grid md:grid-cols-[3.5rem_minmax(0,1fr)_5.5rem_9.5rem_5.5rem_6rem] md:items-center md:gap-3">
          <span>Görsel</span>
          <span>Bulgu</span>
          <span>Sorumlu</span>
          <span>Durum / Önem</span>
          <span>Yorum</span>
          <span className="text-right">İşlem</span>
        </div>

        {visible.length === 0 ? (
          <p className="px-4 py-6 text-xs text-white/55">
            Bu filtreyle eşleşen bulgu yok.
          </p>
        ) : (
          <ul className="divide-y divide-white/[0.06]">
            {visible.map((f) => (
              <li
                key={f.id}
                className={`px-4 py-2.5 transition hover:bg-white/[0.02] md:grid md:grid-cols-[3.5rem_minmax(0,1fr)_5.5rem_9.5rem_5.5rem_6rem] md:items-center md:gap-3 ${
                  f.status === "resolved" ? "opacity-60" : ""
                }`}
              >
                {/* Thumb */}
                <div className="mb-2 md:mb-0">
                  {f.screenshotUrl ? (
                    <a
                      href={f.screenshotUrl}
                      target="_blank"
                      rel="noreferrer"
                      title="Görseli aç"
                      className="block h-9 w-12 overflow-hidden rounded-md border border-white/10 ring-1 ring-inset ring-white/10 transition hover:border-[#67e8f9]/45"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={f.screenshotUrl}
                        alt={f.title}
                        className="h-full w-full object-cover"
                      />
                    </a>
                  ) : (
                    <span className="flex h-9 w-12 items-center justify-center rounded-md border border-dashed border-white/10 text-white/20">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="9" cy="9" r="2" />
                        <path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21" />
                      </svg>
                    </span>
                  )}
                </div>

                {/* Title + area */}
                <div className="min-w-0">
                  <p
                    className={`truncate text-xs leading-5 text-white/90 ${
                      f.status === "resolved" ? "line-through" : ""
                    }`}
                    title={f.title}
                  >
                    {f.title}
                  </p>
                  {f.area ? (
                    <p className="truncate text-[11px] leading-4 text-white/40" title={f.area}>
                      {f.area}
                    </p>
                  ) : null}
                </div>

                {/* Owner */}
                <div className="mt-1 md:mt-0">
                  <span className="text-[11px] font-medium text-white/65 md:text-xs">
                    <span className="text-white/35 md:hidden">Sorumlu: </span>
                    {f.owner}
                  </span>
                </div>

                {/* Status / severity */}
                <div className="mt-1.5 flex flex-nowrap items-center gap-1.5 md:mt-0">
                  <span
                    className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-[3px] text-[9px] font-semibold uppercase tracking-[0.1em] ${statusBadge[f.status]}`}
                  >
                    <span
                      aria-hidden
                      className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[f.status]}`}
                    />
                    {STATUS_SHORT[f.status]}
                  </span>
                  <span
                    className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-full px-2 py-[3px] text-[9px] font-semibold uppercase tracking-[0.1em] ${severityBadge[f.severity]}`}
                  >
                    {SEVERITY_SHORT[f.severity]}
                  </span>
                </div>

                {/* Comments link */}
                <div className="mt-1.5 md:mt-0">
                  <a
                    href={`/dm?tab=findings&finding=${f.id}#yorumlar`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-white/70 transition hover:border-[#67e8f9]/45 hover:text-white"
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    {f.commentCount}
                  </a>
                </div>

                {/* Actions */}
                <div className="mt-2 flex items-center justify-start gap-1.5 md:mt-0 md:justify-end">
                  {f.status !== "resolved" ? (
                    <form action={resolveAction} className="flex items-center">
                      <input type="hidden" name="id" value={f.id} />
                      <button
                        type="submit"
                        title="Çözüldü olarak işaretle"
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] text-emerald-300/80 transition hover:border-emerald-400/40 hover:bg-emerald-400/10 hover:text-emerald-300"
                      >
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      </button>
                    </form>
                  ) : null}
                  <a
                    href={`/dm?tab=findings&edit=${f.id}`}
                    title="Düzenle"
                    className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] text-white/70 transition hover:border-[#67e8f9]/45 hover:text-[#67e8f9]"
                  >
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                    </svg>
                  </a>
                  <form action={deleteAction} className="flex items-center">
                    <input type="hidden" name="id" value={f.id} />
                    <button
                      type="submit"
                      title="Sil"
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] text-white/70 transition hover:border-rose-400/40 hover:bg-rose-400/10 hover:text-rose-300"
                    >
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 6h18" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
