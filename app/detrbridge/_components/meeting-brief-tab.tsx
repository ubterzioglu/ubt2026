"use client";

import { useState, type ReactNode } from "react";

import {
  BRIEF_DECISIONS,
  BRIEF_INFOS,
  BRIEF_OPEN_ITEMS,
  BRIEF_TASKS,
  MEETING_DURATION_LABEL,
  MEETING_PARTICIPANT_COUNT,
  type BriefPriority
} from "@/content/detrbridge-brief";
import type { BriefComment } from "@/lib/detrbridge-brief-comments";
import { BriefCommentThread } from "@/app/detrbridge/_components/brief-comment-thread";
import {
  DETRBRIDGE_BRAND_GRADIENT,
  DETRBRIDGE_GOLD
} from "@/app/detrbridge/_components/theme";

interface MeetingBriefTabProps {
  /** Madde anahtarı -> o maddenin yorumları (eskiden yeniye). */
  commentsByItemKey: Record<string, BriefComment[]>;
  /** Oturumdaki isim: yeni yorumun yazarı ve kimin silebileceğini belirler. */
  sessionName: string;
  /** Sayfa açılışında hangi maddenin yorum akışı açık gelsin (?open=...). */
  openItemKey: string | null;
  addCommentAction: (formData: FormData) => void | Promise<void>;
  deleteCommentAction: (formData: FormData) => void | Promise<void>;
}

const PRIORITY_BADGE: Record<BriefPriority, string> = {
  Yüksek: "border-[#F5B700]/30 bg-[#F5B700]/10 text-[#F5D77A]",
  Orta: "border-blue-400/25 bg-blue-400/10 text-blue-200",
  Düşük: "border-white/15 bg-white/[0.05] text-white/60"
};

const badgeBase =
  "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold tracking-tight";
const sourceClass =
  "text-[11px] font-semibold uppercase tracking-[0.1em] text-white/35";
const metaBoxClass =
  "flex-1 basis-[240px] rounded-[0.9rem] border border-white/[0.07] bg-black/25 px-3.5 py-2.5";

const COMBINING_MARK_START = 0x300;
const COMBINING_MARK_END = 0x36f;

/** tr-TR lowercase + NFD decomposition, with combining diacritics stripped. */
function normalize(value: string): string {
  const decomposed = value.toLocaleLowerCase("tr-TR").normalize("NFD");
  let result = "";
  for (const char of decomposed) {
    const code = char.codePointAt(0) ?? 0;
    if (code < COMBINING_MARK_START || code > COMBINING_MARK_END) {
      result += char;
    }
  }
  return result;
}

function matchesQuery(haystack: string, normalizedQuery: string): boolean {
  if (!normalizedQuery) return true;
  return normalize(haystack).includes(normalizedQuery);
}

/** Renders `**bold**` segments of a plain-text item as emphasized spans. */
function renderEmphasis(text: string): ReactNode {
  const parts = text.split("**");
  if (parts.length === 1) return text;
  return parts.map((part, index) =>
    index % 2 === 1 ? (
      <strong key={index} className="font-semibold text-white">
        {part}
      </strong>
    ) : (
      part
    )
  );
}

function SectionHead({
  kicker,
  title,
  note
}: {
  kicker: string;
  title: string;
  note: string;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p
          className="text-[10px] font-bold uppercase tracking-[0.2em]"
          style={{ color: DETRBRIDGE_GOLD }}
        >
          {kicker}
        </p>
        <h3 className="mt-1 font-body text-2xl font-bold tracking-[-0.03em] text-white sm:text-3xl">
          {title}
        </h3>
      </div>
      <p className="max-w-md text-[12px] text-white/45 sm:text-right">{note}</p>
    </div>
  );
}

interface CommentBlockProps {
  itemKey: string;
  comments: BriefComment[];
  open: boolean;
  onOpenChange: (itemKey: string, open: boolean) => void;
  sessionName: string;
  addCommentAction: (formData: FormData) => void | Promise<void>;
  deleteCommentAction: (formData: FormData) => void | Promise<void>;
}

/**
 * Bir maddenin altındaki açılır yorum akışı.
 *
 * Modül seviyesinde tanımlı (MeetingBriefTab'ın içinde değil): aksi halde her
 * arama tuşunda yeni bir bileşen tipi doğar, açık akış kapanır ve yazılmakta
 * olan yorum silinirdi.
 */
function CommentBlock({
  itemKey,
  comments,
  open,
  onOpenChange,
  sessionName,
  addCommentAction,
  deleteCommentAction
}: CommentBlockProps) {
  return (
    <details
      open={open}
      onToggle={(event) => onOpenChange(itemKey, event.currentTarget.open)}
      className="mt-4 border-t border-white/[0.06] pt-3"
    >
      <summary className="flex cursor-pointer list-none items-center gap-2 text-[12px] font-semibold text-white/50 outline-none transition hover:text-white focus-visible:ring-2 focus-visible:ring-[#F5B700]/40 [&::-webkit-details-marker]:hidden">
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        {comments.length > 0 ? `Yorumlar · ${comments.length}` : "Yorum yaz"}
      </summary>
      <div className="mt-3">
        <BriefCommentThread
          itemKey={itemKey}
          comments={comments}
          sessionName={sessionName}
          addCommentAction={addCommentAction}
          deleteCommentAction={deleteCommentAction}
        />
      </div>
    </details>
  );
}

function IndexTile({ children }: { children: ReactNode }) {
  return (
    <span
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[0.9rem] text-sm font-extrabold text-black"
      style={{ backgroundImage: DETRBRIDGE_BRAND_GRADIENT }}
    >
      {children}
    </span>
  );
}

/**
 * "Toplantı Özeti" panel: the 31 Temmuz 2026 UBT meeting brief (open topics,
 * tasks, decisions, context notes) in the detrbridge navy/gold theme.
 *
 * The brief text itself is fixed — it lives in content/detrbridge-brief.ts.
 * What is interactive: the text search, and a comment thread under every single
 * madde. Threads are expanded client-side (so typing in the search box never
 * collapses an open thread) and start expanded for the madde the server
 * redirected back to after a comment was posted (?open=<key>).
 */
export function MeetingBriefTab({
  commentsByItemKey,
  sessionName,
  openItemKey,
  addCommentAction,
  deleteCommentAction
}: MeetingBriefTabProps) {
  const [query, setQuery] = useState("");
  const [openKeys, setOpenKeys] = useState<ReadonlySet<string>>(
    () => new Set(openItemKey ? [openItemKey] : [])
  );
  const normalizedQuery = normalize(query.trim());

  function commentsFor(itemKey: string): BriefComment[] {
    return commentsByItemKey[itemKey] ?? [];
  }

  /** Yorum metinleri de aramaya dahil — bir konu yorumundan da bulunabilsin. */
  function commentText(itemKey: string): string {
    return commentsFor(itemKey)
      .map((comment) => `${comment.author} ${comment.body}`)
      .join(" ");
  }

  function setOpen(itemKey: string, open: boolean) {
    setOpenKeys((previous) => {
      if (previous.has(itemKey) === open) return previous;
      const next = new Set(previous);
      if (open) {
        next.add(itemKey);
      } else {
        next.delete(itemKey);
      }
      return next;
    });
  }

  /** Maddenin altına yorum akışını basar. */
  function commentBlock(itemKey: string) {
    return (
      <CommentBlock
        itemKey={itemKey}
        comments={commentsFor(itemKey)}
        open={openKeys.has(itemKey)}
        onOpenChange={setOpen}
        sessionName={sessionName}
        addCommentAction={addCommentAction}
        deleteCommentAction={deleteCommentAction}
      />
    );
  }

  const visibleOpenItems = BRIEF_OPEN_ITEMS.filter((item) =>
    matchesQuery([item.title, item.source, commentText(item.key)].join(" "), normalizedQuery)
  );
  const visibleTasks = BRIEF_TASKS.filter((task) =>
    matchesQuery(
      [
        task.title,
        task.description,
        task.owner,
        task.target,
        task.status,
        task.priority,
        task.source,
        commentText(task.key)
      ].join(" "),
      normalizedQuery
    )
  );
  const visibleDecisions = BRIEF_DECISIONS.filter((decision) =>
    matchesQuery(
      [
        decision.title,
        decision.description,
        decision.type,
        decision.source,
        commentText(decision.key)
      ].join(" "),
      normalizedQuery
    )
  );
  const visibleInfos = BRIEF_INFOS.filter((info) =>
    matchesQuery(
      [info.title, ...info.items, info.source, commentText(info.key)].join(" "),
      normalizedQuery
    )
  );
  const nothingVisible =
    visibleOpenItems.length +
      visibleTasks.length +
      visibleDecisions.length +
      visibleInfos.length ===
    0;

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.03] px-6 py-6 backdrop-blur-xl sm:px-8 sm:py-7">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: DETRBRIDGE_GOLD, boxShadow: `0 0 12px ${DETRBRIDGE_GOLD}` }}
          />
          UBT · Toplantı Brifingi
        </span>
        <h2 className="mt-4 font-body text-3xl font-bold leading-[1.05] tracking-[-0.04em] text-white sm:text-4xl">
          Açık konular.{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: DETRBRIDGE_BRAND_GRADIENT }}
          >
            Kararlar.
          </span>{" "}
          Görevler.
        </h2>
        <p className="mt-3 max-w-2xl text-[13px] leading-relaxed text-white/55">
          31 Temmuz 2026 tarihli iki toplantı oturumunun; kesinleşen maddeler ile açık
          konuları birbirinden ayıran, uygulanabilir ve kaynak zaman damgalı özeti. Her
          maddenin altına yorum bırakabilirsin.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {[
            { value: String(BRIEF_OPEN_ITEMS.length), label: "Açık konu" },
            { value: String(BRIEF_TASKS.length), label: "Görev / takip maddesi" },
            { value: String(BRIEF_DECISIONS.length), label: "Karar / çalışma ilkesi" },
            { value: MEETING_DURATION_LABEL, label: "Toplam görüşme süresi" },
            { value: String(MEETING_PARTICIPANT_COUNT), label: "Toplam katılımcı" }
          ].map((stat) => (
            <article
              key={stat.label}
              className="rounded-[1.2rem] border border-white/10 bg-white/[0.03] px-5 py-4"
            >
              <p className="font-body text-2xl font-bold text-white">{stat.value}</p>
              <p className="mt-1 text-[11px] text-white/45">{stat.label}</p>
            </article>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2.5">
          <nav className="flex flex-1 gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {[
              { href: "#brief-acik-konular", label: "00 · Açık Konular" },
              { href: "#brief-gorevler", label: "01 · Görevler" },
              { href: "#brief-kararlar", label: "02 · Kararlar" },
              { href: "#brief-bilgiler", label: "03 · Bilgiler" }
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[12px] font-semibold text-white/55 transition hover:border-[#F5B700]/40 hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Başlık, kişi veya konu ara…"
            aria-label="Toplantı özetinde ara"
            className="w-full rounded-[0.9rem] border border-white/10 bg-white/[0.04] px-4 py-2.5 text-[13px] text-white placeholder:text-white/25 outline-none transition focus:border-[#F5B700]/55 focus:bg-white/[0.06] focus:ring-4 focus:ring-[#F5B700]/12 sm:w-72"
          />
        </div>
      </section>

      {visibleOpenItems.length > 0 ? (
        <section id="brief-acik-konular" className="scroll-mt-24 space-y-4">
          <SectionHead
            kicker="00 / Karara bağlanmadı"
            title="Açık Konular"
            note="Toplantıda konuşulan ama sonuca bağlanmayan başlıklar. Her biri ayrı bir kart — görüşünü doğrudan ilgili konunun altına yaz."
          />
          <div className="grid gap-3 lg:grid-cols-2">
            {visibleOpenItems.map((item) => (
              <article
                key={item.key}
                id={item.key}
                className="scroll-mt-24 rounded-[1.5rem] border border-[#F5B700]/20 bg-[#F5B700]/[0.04] p-5 backdrop-blur-xl transition hover:border-[#F5B700]/40 sm:p-6"
              >
                <div className="flex items-start gap-4">
                  <IndexTile>{item.index}</IndexTile>
                  <div className="min-w-0 flex-1">
                    <span
                      className={`${badgeBase} border-[#F5B700]/30 bg-[#F5B700]/10 text-[#F5D77A]`}
                    >
                      Açık konu
                    </span>
                    <h4 className="mt-2 font-body text-base font-semibold tracking-tight text-white">
                      {item.title}
                    </h4>
                    <span className={`mt-3 block ${sourceClass}`}>{item.source}</span>
                  </div>
                </div>
                {commentBlock(item.key)}
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {visibleTasks.length > 0 ? (
        <section id="brief-gorevler" className="scroll-mt-24 space-y-4">
          <SectionHead
            kicker="01 / Uygulama"
            title="Görevler"
            note="Kesin sorumlusu veya tarihi olmayan maddeler açıkça işaretlendi; konuşma içindeki örnek atamalar karar olarak yazılmadı."
          />
          <div className="space-y-3">
            {visibleTasks.map((task) => (
              <article
                key={task.key}
                id={task.key}
                className="scroll-mt-24 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl transition hover:border-[#F5B700]/30 sm:p-6"
              >
                <div className="flex items-start gap-4">
                  <IndexTile>{task.index}</IndexTile>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="font-body text-base font-semibold tracking-tight text-white">
                        {task.title}
                      </h4>
                      <div className="flex shrink-0 gap-2">
                        <span className={`${badgeBase} ${PRIORITY_BADGE[task.priority]}`}>
                          {task.priority}
                        </span>
                        <span
                          className={`${badgeBase} border-emerald-400/25 bg-emerald-400/10 text-emerald-300`}
                        >
                          {task.status}
                        </span>
                      </div>
                    </div>
                    <p className="mt-2 text-[13px] leading-relaxed text-white/60">
                      {task.description}
                    </p>
                    <dl className="mt-3.5 flex flex-wrap gap-2.5">
                      <div className={metaBoxClass}>
                        <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/35">
                          Sorumlu
                        </dt>
                        <dd className="mt-0.5 text-[12px] text-white/80">{task.owner}</dd>
                      </div>
                      <div className={metaBoxClass}>
                        <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/35">
                          Hedef
                        </dt>
                        <dd className="mt-0.5 text-[12px] text-white/80">{task.target}</dd>
                      </div>
                    </dl>
                    <span className={`mt-4 block ${sourceClass}`}>{task.source}</span>
                    {commentBlock(task.key)}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {visibleDecisions.length > 0 ? (
        <section id="brief-kararlar" className="scroll-mt-24 space-y-4">
          <SectionHead
            kicker="02 / Çerçeve"
            title="Kararlar"
            note="Ekip iletişimi, çalışma disiplini, ürün önceliği ve ticari yaklaşım konusunda mutabık kalınan başlıklar."
          />
          <div className="space-y-3">
            {visibleDecisions.map((decision) => (
              <article
                key={decision.key}
                id={decision.key}
                className="flex scroll-mt-24 items-start gap-4 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl transition hover:border-[#F5B700]/30 sm:p-6"
              >
                <IndexTile>{decision.index}</IndexTile>
                <div className="min-w-0 flex-1">
                  <span className={`${badgeBase} border-blue-400/25 bg-blue-400/10 text-blue-200`}>
                    {decision.type}
                  </span>
                  <h4 className="mt-2 font-body text-base font-semibold tracking-tight text-white">
                    {decision.title}
                  </h4>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-white/60">
                    {decision.description}
                  </p>
                  <span className={`mt-3 block ${sourceClass}`}>{decision.source}</span>
                  {commentBlock(decision.key)}
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {visibleInfos.length > 0 ? (
        <section id="brief-bilgiler" className="scroll-mt-24 space-y-4">
          <SectionHead
            kicker="03 / Bağlam"
            title="Bilgiler"
            note="Proje durumu, teknik altyapı ve fırsatlar."
          />
          <div className="space-y-3">
            {visibleInfos.map((info) => (
              <article
                key={info.key}
                id={info.key}
                className="flex scroll-mt-24 items-start gap-4 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl transition hover:border-[#F5B700]/30 sm:p-6"
              >
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[0.9rem] border text-lg font-bold"
                  style={{
                    borderColor: "rgba(245,183,0,0.3)",
                    background: "rgba(245,183,0,0.1)",
                    color: DETRBRIDGE_GOLD
                  }}
                  aria-hidden
                >
                  {info.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <h4 className="font-body text-base font-semibold tracking-tight text-white">
                    {info.title}
                  </h4>
                  <ul className="mt-2.5 list-disc space-y-1.5 pl-5 text-[13px] leading-relaxed text-white/60 marker:text-white/25">
                    {info.items.map((item, index) => (
                      <li key={index}>{renderEmphasis(item)}</li>
                    ))}
                  </ul>
                  <span className={`mt-3 block ${sourceClass}`}>{info.source}</span>
                  {commentBlock(info.key)}
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {nothingVisible ? (
        <div className="rounded-[1.3rem] border border-dashed border-white/15 px-5 py-8 text-center text-[13px] text-white/50">
          Aramanızla eşleşen bir madde bulunamadı.
        </div>
      ) : null}

      <aside className="rounded-[1.3rem] border border-white/10 bg-white/[0.03] px-5 py-4 text-[12px] leading-relaxed text-white/50 backdrop-blur-xl">
        <strong className="font-semibold text-white">Not:</strong> Bu doküman transkriptte
        açıkça desteklenen ifadelerden hazırlanmıştır. Tutarlar ve teknik özellikler
        toplantıda sözlü olarak aktarıldığı haliyle özetlenmiş; kesinleşmeyen konular
        “açık konu” olarak bırakılmıştır.
      </aside>
    </div>
  );
}
