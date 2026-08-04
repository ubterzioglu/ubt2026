import type { ReactNode } from "react";

import {
  UBTSA_PERSONA,
  UBTSA_PERSONA_TITLE,
  UBTSA_QUESTIONS,
  UBTSA_QUESTIONS_TITLE,
  UBTSA_SECTIONS,
  UBTSA_SUMMARY,
  UBTSA_SUMMARY_TITLE,
  type UbtsaNote
} from "@/content/ubtsa-konsept";
import type { UbtsaComment } from "@/lib/ubtsa-comments";
import type { UbtsaVisit } from "@/lib/ubtsa-visits";
import { formatSignedInAt } from "@/app/ubtsa/_components/visits-section";
import {
  NOTE_TONES,
  UBTSA_CARD_CLASS,
  type NoteTone
} from "@/app/ubtsa/_components/theme";

interface KonseptNavProps {
  /** All comments, keyed by madde/not key — drives the counters. */
  commentsByItemKey: Map<string, UbtsaComment[]>;
  /** Key of the thread currently expanded, so its group starts open. */
  openItemKey: string | null;
  /** Most recent sign-ins, newest first. */
  recentVisits: UbtsaVisit[];
}

interface NavGroupProps {
  title: string;
  /** Anchor of the matching section in the main column. */
  href: string;
  /** Small count shown next to the title. */
  itemCount: number;
  /** Comment total across the group; hidden when zero. */
  commentCount: number;
  defaultOpen: boolean;
  /** Accent flavour; `slate` is for groups that carry no comments. */
  tone: NoteTone | "teal" | "slate";
  children: ReactNode;
}

const GROUP_TONE = {
  ...NOTE_TONES,
  teal: { navTitle: "text-teal-700", navHover: "hover:bg-teal-50", navBadge: "bg-teal-600/12 text-teal-800" },
  slate: { navTitle: "text-slate-600", navHover: "hover:bg-slate-50", navBadge: "bg-slate-200 text-slate-700" }
} as const;

/**
 * One collapsible sidebar group. Native <details> — the sidebar stays fully
 * server-rendered with no client JavaScript, so `defaultOpen` decides the
 * initial state on every load.
 *
 * The title itself is a link to the matching section: pressing the chevron
 * area expands the list, pressing the title jumps you there.
 */
function NavGroup({
  title,
  href,
  itemCount,
  commentCount,
  defaultOpen,
  tone,
  children
}: NavGroupProps) {
  const palette = GROUP_TONE[tone];

  return (
    <details open={defaultOpen} className="group">
      <summary
        className={`flex cursor-pointer list-none items-center gap-2 rounded-[0.7rem] px-2 py-2 outline-none transition ${palette.navHover} focus-visible:ring-2 focus-visible:ring-teal-500/40 [&::-webkit-details-marker]:hidden`}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
          className={`shrink-0 transition-transform duration-200 group-open:rotate-90 ${palette.navTitle}`}
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
        <a
          href={href}
          className={`flex-1 text-[11px] font-bold uppercase tracking-[0.14em] ${palette.navTitle}`}
        >
          {title}
        </a>
        {itemCount > 0 && (
          <span className="shrink-0 text-[10px] font-semibold tabular-nums text-slate-400">
            {itemCount}
          </span>
        )}
        {commentCount > 0 && (
          <span
            className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums ${palette.navBadge}`}
          >
            {commentCount}
          </span>
        )}
      </summary>
      <div className="mt-1">{children}</div>
    </details>
  );
}

/** Sums the comments across a set of note keys. */
function countComments(
  keys: readonly string[],
  commentsByItemKey: Map<string, UbtsaComment[]>
): number {
  return keys.reduce(
    (total, key) => total + (commentsByItemKey.get(key)?.length ?? 0),
    0
  );
}

interface NoteListProps {
  items: readonly UbtsaNote[];
  tone: NoteTone;
  commentsByItemKey: Map<string, UbtsaComment[]>;
}

/** Numbered list of note titles, each linking to its anchor. */
function NoteList({ items, tone, commentsByItemKey }: NoteListProps) {
  const palette = NOTE_TONES[tone];
  return (
    <ol className="space-y-0.5">
      {items.map((item, index) => {
        const count = commentsByItemKey.get(item.key)?.length ?? 0;
        return (
          <li key={item.key}>
            <a
              href={`#${item.key}`}
              className={`flex items-start gap-2 rounded-[0.6rem] px-2 py-1.5 text-[12px] leading-snug text-slate-600 transition ${palette.navHover}`}
            >
              <span className="w-4 shrink-0 text-right text-[10.5px] font-bold tabular-nums text-slate-400">
                {index + 1}
              </span>
              <span className="line-clamp-2 min-w-0 flex-1">{item.title}</span>
              {count > 0 && (
                <span
                  className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums ${palette.navBadge}`}
                >
                  {count}
                </span>
              )}
            </a>
          </li>
        );
      })}
    </ol>
  );
}

/**
 * Sticky sidebar: every part of the board as its own collapsible group.
 * Each entry carries its comment count, so it is visible at a glance where
 * the discussion is happening.
 *
 * Only the group containing the currently-open thread starts expanded — with
 * six groups, opening everything by default would bury the list.
 */
export function KonseptNav({
  commentsByItemKey,
  openItemKey,
  recentVisits
}: KonseptNavProps) {
  const summaryKeys = UBTSA_SUMMARY.map((note) => note.key);
  const questionKeys = UBTSA_QUESTIONS.map((note) => note.key);
  const personaKeys = UBTSA_PERSONA.map((note) => note.key);
  const maddeKeys = UBTSA_SECTIONS.flatMap((section) =>
    section.items.map((item) => item.key)
  );

  const isOpen = (keys: string[]) =>
    openItemKey !== null && keys.includes(openItemKey);

  return (
    <nav
      aria-label="Sayfa içi gezinme"
      className={`${UBTSA_CARD_CLASS} top-4 max-h-[calc(100vh-2rem)] space-y-1 overflow-y-auto p-3 lg:sticky`}
    >
      <NavGroup
        title="Nasıl Kullanılır"
        href="#nasil-kullanilir"
        itemCount={0}
        commentCount={0}
        defaultOpen={false}
        tone="slate"
      >
        <p className="px-2 pb-1.5 text-[12px] leading-5 text-slate-500">
          Panonun ne işe yaradığı ve nasıl yorum yapıldığı.
        </p>
      </NavGroup>

      <div aria-hidden className="mx-2 border-t border-slate-100" />

      <NavGroup
        title={UBTSA_SUMMARY_TITLE}
        href="#konsept-ozeti"
        itemCount={UBTSA_SUMMARY.length}
        commentCount={countComments(summaryKeys, commentsByItemKey)}
        defaultOpen={isOpen(summaryKeys)}
        tone="sky"
      >
        <NoteList
          items={UBTSA_SUMMARY}
          tone="sky"
          commentsByItemKey={commentsByItemKey}
        />
      </NavGroup>

      <div aria-hidden className="mx-2 border-t border-slate-100" />

      <NavGroup
        title={UBTSA_QUESTIONS_TITLE}
        href="#ubt-sorulari"
        itemCount={UBTSA_QUESTIONS.length}
        commentCount={countComments(questionKeys, commentsByItemKey)}
        defaultOpen={isOpen(questionKeys)}
        tone="amber"
      >
        <NoteList
          items={UBTSA_QUESTIONS}
          tone="amber"
          commentsByItemKey={commentsByItemKey}
        />
      </NavGroup>

      <div aria-hidden className="mx-2 border-t border-slate-100" />

      <NavGroup
        title={UBTSA_PERSONA_TITLE}
        href="#insan-modeli"
        itemCount={UBTSA_PERSONA.length}
        commentCount={countComments(personaKeys, commentsByItemKey)}
        defaultOpen={isOpen(personaKeys)}
        tone="violet"
      >
        <NoteList
          items={UBTSA_PERSONA}
          tone="violet"
          commentsByItemKey={commentsByItemKey}
        />
      </NavGroup>

      <div aria-hidden className="mx-2 border-t border-slate-100" />

      <NavGroup
        title="Tam Metin"
        href="#bolum-1"
        itemCount={UBTSA_SECTIONS.length}
        commentCount={countComments(maddeKeys, commentsByItemKey)}
        defaultOpen={isOpen(maddeKeys)}
        tone="teal"
      >
        <ol className="space-y-0.5">
          {UBTSA_SECTIONS.map((section) => {
            const count = countComments(
              section.items.map((item) => item.key),
              commentsByItemKey
            );
            return (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="flex items-center gap-2 rounded-[0.6rem] px-2 py-1.5 text-[12.5px] leading-snug text-slate-600 transition hover:bg-teal-50 hover:text-teal-800"
                >
                  <span className="w-5 shrink-0 text-right text-[11px] font-bold tabular-nums text-slate-400">
                    {section.number}
                  </span>
                  <span className="min-w-0 flex-1">{section.navLabel}</span>
                  {count > 0 && (
                    <span className="shrink-0 rounded-full bg-teal-600/12 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-teal-800">
                      {count}
                    </span>
                  )}
                </a>
              </li>
            );
          })}
        </ol>
      </NavGroup>

      <div aria-hidden className="mx-2 border-t border-slate-100" />

      <NavGroup
        title="Giriş Logları"
        href="#giris-loglari"
        itemCount={recentVisits.length}
        commentCount={0}
        defaultOpen={false}
        tone="slate"
      >
        {recentVisits.length === 0 ? (
          <p className="px-2 pb-1.5 text-[12px] leading-5 text-slate-400">
            Henüz kayıt yok.
          </p>
        ) : (
          <ol className="space-y-0.5">
            {recentVisits.map((visit) => (
              <li key={visit.id}>
                <a
                  href="#giris-loglari"
                  className="flex items-center gap-2 rounded-[0.6rem] px-2 py-1.5 text-[11.5px] leading-snug text-slate-500 transition hover:bg-slate-50"
                >
                  <span className="w-12 shrink-0 font-bold capitalize text-slate-700">
                    {visit.name}
                  </span>
                  <span className="min-w-0 flex-1 truncate">
                    {formatSignedInAt(visit.signedInAt)}
                  </span>
                </a>
              </li>
            ))}
          </ol>
        )}
      </NavGroup>
    </nav>
  );
}
