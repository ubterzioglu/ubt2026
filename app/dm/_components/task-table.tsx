"use client";

import { useMemo, useState } from "react";

import type {
  ProjectTaskItem,
  ProjectTaskPriority,
  ProjectTaskStatus
} from "@/types/site";

interface OptionMeta<T extends string> {
  value: T;
  label: string;
}

interface TaskTableProps {
  tasks: ProjectTaskItem[];
  statusOptions: OptionMeta<ProjectTaskStatus>[];
  priorityOptions: OptionMeta<ProjectTaskPriority>[];
  owners: string[];
  statusBadge: Record<ProjectTaskStatus, string>;
  priorityBadge: Record<ProjectTaskPriority, string>;
  inlineStatusAction: (formData: FormData) => void | Promise<void>;
  deleteAction: (formData: FormData) => void | Promise<void>;
}

const ALL = "__all__";

/**
 * Compact badge labels for the list rows only — the form dropdowns keep the
 * full, descriptive labels (e.g. "Yapılacak", "Devam ediyor"). Short labels
 * keep the status/priority chips on a single line so they never overlap the
 * neighbouring columns.
 */
const STATUS_SHORT: Record<ProjectTaskStatus, string> = {
  todo: "Açık",
  in_progress: "Devam",
  done: "Bitti",
  blocked: "Bloke"
};

const PRIORITY_SHORT: Record<ProjectTaskPriority, string> = {
  low: "Düşük",
  normal: "Normal",
  high: "Yüksek",
  top5: "İlk 5"
};

export function TaskTable({
  tasks,
  statusOptions,
  priorityOptions,
  owners,
  statusBadge,
  priorityBadge,
  inlineStatusAction,
  deleteAction
}: TaskTableProps) {
  const [query, setQuery] = useState("");
  const [owner, setOwner] = useState<string>(ALL);
  const [status, setStatus] = useState<string>(ALL);
  const [priority, setPriority] = useState<string>(ALL);

  const visible = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("tr-TR");
    return tasks.filter((task) => {
      if (owner !== ALL && task.owner !== owner) return false;
      if (status !== ALL && task.status !== status) return false;
      if (priority !== ALL && task.priority !== priority) return false;
      if (needle) {
        const haystack = [
          task.title,
          task.owner,
          task.category,
          task.notes,
          task.dueTarget
        ]
          .join(" ")
          .toLocaleLowerCase("tr-TR");
        if (!haystack.includes(needle)) return false;
      }
      return true;
    });
  }, [tasks, owner, status, priority, query]);

  const filtersActive =
    query.trim() !== "" ||
    owner !== ALL ||
    status !== ALL ||
    priority !== ALL;

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
            placeholder="Görev, sorumlu, kategori, not ara…"
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
            value={priority}
            onChange={(event) => setPriority(event.target.value)}
            className={selectClass}
            aria-label="Öncelik filtresi"
          >
            <option value={ALL} className="bg-[#0a0712] text-white">
              Öncelik: Tümü
            </option>
            {priorityOptions.map((option) => (
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
                setPriority(ALL);
              }}
              className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/60 transition hover:border-[#67e8f9]/45 hover:text-white"
            >
              Temizle
            </button>
          ) : null}
          <span className="text-[11px] font-medium tabular-nums text-white/40">
            {visible.length}/{tasks.length}
          </span>
        </div>
      </div>

      {/* Single flat list */}
      <div className="relative overflow-hidden rounded-xl border border-white/[0.07] bg-[#0a0712]/70">
        {/* Neon top edge */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255,45,149,0.5), rgba(168,85,247,0.5), rgba(34,211,238,0.5), transparent)"
          }}
        />
        {/* Column header (md+) */}
        <div className="hidden border-b border-white/[0.07] bg-white/[0.025] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40 md:grid md:grid-cols-[minmax(0,1fr)_5.5rem_8rem_8.5rem_5.5rem] md:items-center md:gap-3">
          <span>Görev</span>
          <span>Sorumlu</span>
          <span>Kategori</span>
          <span>Durum</span>
          <span className="text-right">İşlem</span>
        </div>

        {visible.length === 0 ? (
          <p className="px-4 py-6 text-xs text-white/55">
            Bu filtreyle eşleşen görev yok.
          </p>
        ) : (
          <ul className="divide-y divide-white/[0.06]">
            {visible.map((task) => (
              <li
                key={task.id}
                className={`px-4 py-2.5 transition hover:bg-white/[0.02] md:grid md:grid-cols-[minmax(0,1fr)_5.5rem_8rem_8.5rem_5.5rem] md:items-center md:gap-3 ${
                  task.status === "done" ? "opacity-55" : ""
                }`}
              >
                {/* Title */}
                <div className="min-w-0">
                  <p
                    className={`truncate text-xs leading-5 text-white/90 ${
                      task.status === "done" ? "line-through" : ""
                    }`}
                    title={task.title}
                  >
                    {task.title}
                  </p>
                  {task.notes ? (
                    <p
                      className="truncate text-[11px] leading-4 text-white/40"
                      title={task.notes}
                    >
                      {task.notes}
                    </p>
                  ) : null}
                </div>

                {/* Owner */}
                <div className="mt-1 md:mt-0">
                  <span className="text-[11px] font-medium text-white/65 md:text-xs">
                    <span className="text-white/35 md:hidden">Sorumlu: </span>
                    {task.owner}
                  </span>
                </div>

                {/* Category (+ due target) */}
                <div className="mt-1 min-w-0 md:mt-0">
                  <span className="block truncate text-[11px] text-white/55 md:text-xs">
                    <span className="text-white/35 md:hidden">Kategori: </span>
                    {task.category || "Genel"}
                  </span>
                  {task.dueTarget ? (
                    <span className="block truncate text-[10px] text-white/35" title={task.dueTarget}>
                      {task.dueTarget}
                    </span>
                  ) : null}
                </div>

                {/* Status / priority */}
                <div className="mt-1.5 flex flex-nowrap items-center gap-1.5 md:mt-0">
                  <span
                    className={`shrink-0 whitespace-nowrap rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.08em] ${statusBadge[task.status]}`}
                  >
                    {STATUS_SHORT[task.status]}
                  </span>
                  <span
                    className={`shrink-0 whitespace-nowrap rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.08em] ${priorityBadge[task.priority]}`}
                  >
                    {PRIORITY_SHORT[task.priority]}
                  </span>
                </div>

                {/* Actions */}
                <div className="mt-2 flex items-center justify-start gap-1.5 md:mt-0 md:justify-end">
                  <form action={inlineStatusAction} className="flex items-center">
                    <input type="hidden" name="id" value={task.id} />
                    <input type="hidden" name="status" value="done" />
                    {task.status !== "done" ? (
                      <button
                        type="submit"
                        title="Bitti olarak işaretle"
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
                    ) : null}
                  </form>
                  <a
                    href={`/dm?edit=${task.id}`}
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
                    <input type="hidden" name="id" value={task.id} />
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
