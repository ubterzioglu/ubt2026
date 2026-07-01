"use client";

import { useMemo, useState } from "react";

import type { SocialPlatform, SocialPostItem } from "@/types/site";
import { SOCIAL_PLATFORMS } from "@/types/site";
import { DM_BRAND_GRADIENT } from "@/app/dm/_components/theme";

interface SocialTabProps {
  posts: SocialPostItem[];
  cardClass: string;
  cardInnerClass: string;
  /** Server action: toggles a post's shared flag for one platform. */
  toggleShareAction: (formData: FormData) => void | Promise<void>;
}

const ALL = "__all__";

const PLATFORM_LABEL: Record<SocialPlatform, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  x: "X",
  tiktok: "TikTok",
  reddit: "Reddit",
  linkedin: "LinkedIn"
};

/** Brand marks as inline SVG paths (project uses no icon library). */
function PlatformIcon({ platform }: { platform: SocialPlatform }) {
  const common = {
    width: 15,
    height: 15,
    viewBox: "0 0 24 24",
    "aria-hidden": true
  } as const;
  switch (platform) {
    case "instagram":
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth={2}>
          <rect x="2" y="2" width="20" height="20" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
        </svg>
      );
    case "facebook":
      return (
        <svg {...common} fill="currentColor">
          <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z" />
        </svg>
      );
    case "x":
      return (
        <svg {...common} fill="currentColor">
          <path d="M18.9 2.5h3.3l-7.2 8.2 8.5 11.3h-6.7l-5.2-6.9-6 6.9H2.3l7.7-8.8L1.9 2.5h6.8l4.7 6.3 5.5-6.3zm-1.2 17.8h1.8L7.1 4.3H5.2l12.5 16z" />
        </svg>
      );
    case "tiktok":
      return (
        <svg {...common} fill="currentColor">
          <path d="M16.5 3c.4 2.3 1.7 3.9 4 4.2v2.7c-1.4.1-2.7-.3-4-1v6.1c0 3.5-2.6 5.9-5.9 5.9A5.8 5.8 0 0 1 4.8 15c0-3.4 3-6 6.6-5.4v2.9c-.4-.1-.9-.2-1.3-.2-1.5 0-2.6 1.1-2.6 2.6 0 1.6 1.2 2.7 2.7 2.7 1.6 0 2.7-1.2 2.7-2.9V3h3.6z" />
        </svg>
      );
    case "reddit":
      return (
        <svg {...common} fill="currentColor">
          <path d="M22 11.8c0-1.2-1-2.2-2.2-2.2-.6 0-1.1.2-1.5.6-1.5-1-3.4-1.6-5.6-1.7l1-4.4 3.1.7c0 .8.7 1.4 1.4 1.4.8 0 1.4-.6 1.4-1.4S19 3 18.2 3c-.6 0-1 .3-1.3.8l-3.4-.8c-.2 0-.4.1-.4.3l-1.1 5c-2.2.1-4.2.7-5.7 1.7-.4-.4-1-.6-1.5-.6C3.5 9.6 2.5 10.6 2.5 11.8c0 .8.5 1.6 1.2 1.9v.6c0 3 3.5 5.5 7.8 5.5s7.8-2.5 7.8-5.5v-.6c.8-.3 1.4-1.1 1.4-1.9zM7 13.4c0-.8.6-1.4 1.4-1.4s1.4.6 1.4 1.4-.6 1.4-1.4 1.4S7 14.2 7 13.4zm7.9 3.7c-1 1-3 1-3.4 1s-2.4 0-3.4-1c-.1-.1-.1-.4 0-.5s.4-.1.5 0c.6.6 2 .8 2.9.8s2.3-.2 2.9-.8c.1-.1.4-.1.5 0 .2.2.2.4.1.5zm-.3-2.3c-.8 0-1.4-.6-1.4-1.4s.6-1.4 1.4-1.4 1.4.6 1.4 1.4-.6 1.4-1.4 1.4z" />
        </svg>
      );
    case "linkedin":
      return (
        <svg {...common} fill="currentColor">
          <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z" />
        </svg>
      );
  }
}

async function copyToClipboard(text: string): Promise<boolean> {
  if (
    typeof navigator !== "undefined" &&
    navigator.clipboard &&
    window.isSecureContext
  ) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fall through to the textarea fallback
    }
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.top = "-9999px";
    ta.style.left = "-9999px";
    ta.setAttribute("readonly", "");
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, ta.value.length);
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

function CopyButton({ text }: { text: string }) {
  const [label, setLabel] = useState("Kopyala");
  return (
    <button
      type="button"
      onClick={async () => {
        const ok = await copyToClipboard(text);
        setLabel(ok ? "Kopyalandı ✓" : "Hata");
        window.setTimeout(() => setLabel("Kopyala"), 1100);
      }}
      className="shrink-0 rounded-lg border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[11px] font-semibold text-white/75 transition hover:border-[#67e8f9]/45 hover:text-white"
    >
      {label}
    </button>
  );
}

/** One share-platform pill: green when shared, grey otherwise. Toggles via server action. */
function ShareToggle({
  post,
  platform,
  toggleShareAction
}: {
  post: SocialPostItem;
  platform: SocialPlatform;
  toggleShareAction: (formData: FormData) => void | Promise<void>;
}) {
  const active = post.shared[platform];
  return (
    <form action={toggleShareAction}>
      <input type="hidden" name="id" value={post.id} />
      <input type="hidden" name="platform" value={platform} />
      {/* Submit the NEXT desired state so the action is a pure set, not a read-modify-write. */}
      <input type="hidden" name="shared" value={active ? "0" : "1"} />
      <button
        type="submit"
        title={`${PLATFORM_LABEL[platform]}: ${active ? "paylaşıldı — kaldır" : "paylaşıldı işaretle"}`}
        aria-pressed={active}
        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition ${
          active
            ? "border-emerald-400/45 bg-gradient-to-b from-emerald-400/[0.22] to-emerald-400/[0.06] text-emerald-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_2px_12px_-3px_rgba(16,185,129,0.6)]"
            : "border-white/10 bg-white/[0.04] text-white/45 hover:border-white/25 hover:text-white/70"
        }`}
      >
        <PlatformIcon platform={platform} />
        {PLATFORM_LABEL[platform]}
      </button>
    </form>
  );
}

function PostCard({
  post,
  cardClass,
  cardInnerClass,
  toggleShareAction
}: {
  post: SocialPostItem;
  cardClass: string;
  cardInnerClass: string;
  toggleShareAction: (formData: FormData) => void | Promise<void>;
}) {
  const sharedCount = SOCIAL_PLATFORMS.filter((p) => post.shared[p]).length;
  const boxClass =
    "flex flex-col gap-2 rounded-2xl border border-white/[0.08] bg-[#06040c]/70 p-3";
  const textClass =
    "min-h-[190px] w-full resize-y whitespace-pre-wrap rounded-xl border border-white/10 bg-[#050409] px-3 py-2.5 text-[12.5px] leading-[1.5] text-white/85 outline-none transition focus:border-[#67e8f9]/45";

  return (
    <article className={cardClass}>
      <div className={`${cardInnerClass} p-4 sm:p-5`}>
        {/* Header: pill + number + title */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <span className="inline-block rounded-full border border-[#a855f7]/40 bg-[#a855f7]/[0.12] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#e9d5ff]">
              {post.category}
            </span>
            <h3 className="mt-2 font-body text-base font-bold tracking-[-0.01em] text-white">
              <span className="mr-2 text-[#67e8f9]">
                #{String(post.postNumber).padStart(2, "0")}
              </span>
              {post.title}
            </h3>
          </div>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums ${
              sharedCount > 0
                ? "border border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
                : "border border-white/10 bg-white/[0.04] text-white/40"
            }`}
            title="Paylaşılan platform sayısı"
          >
            {sharedCount}/{SOCIAL_PLATFORMS.length}
          </span>
        </div>

        {/* Two boxes: Canva prompt (left) + Instagram caption (right) */}
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          <div className={boxClass}>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[12px] font-semibold text-[#fde9c2]">
                🎨 Canva Prompt
                <span className="ml-1.5 font-normal text-white/35">
                  İngilizce · metinsiz
                </span>
              </span>
              <CopyButton text={post.canvaPrompt} />
            </div>
            <textarea readOnly value={post.canvaPrompt} className={textClass} />
          </div>
          <div className={boxClass}>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[12px] font-semibold text-[#ccfbf1]">
                📸 Instagram Post
                <span className="ml-1.5 font-normal text-white/35">
                  Almanca · 5 hashtag
                </span>
              </span>
              <CopyButton text={post.instagramCaption} />
            </div>
            <textarea
              readOnly
              value={post.instagramCaption}
              className={textClass}
            />
          </div>
        </div>

        {/* Share row: 4 platform toggles */}
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/[0.06] pt-3">
          <span className="mr-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">
            Paylaşıldı
          </span>
          {SOCIAL_PLATFORMS.map((platform) => (
            <ShareToggle
              key={platform}
              post={post}
              platform={platform}
              toggleShareAction={toggleShareAction}
            />
          ))}
        </div>
      </div>
    </article>
  );
}

export function SocialTab({
  posts,
  cardClass,
  cardInnerClass,
  toggleShareAction
}: SocialTabProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>(ALL);
  const [shareFilter, setShareFilter] = useState<string>(ALL);

  const categories = useMemo(
    () => Array.from(new Set(posts.map((p) => p.category))).sort(),
    [posts]
  );

  const visible = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("tr-TR");
    return posts.filter((p) => {
      if (category !== ALL && p.category !== category) return false;
      const sharedCount = SOCIAL_PLATFORMS.filter((pl) => p.shared[pl]).length;
      if (shareFilter === "shared" && sharedCount === 0) return false;
      if (shareFilter === "unshared" && sharedCount > 0) return false;
      if (needle) {
        const haystack = [p.title, p.category, p.instagramCaption, p.canvaPrompt]
          .join(" ")
          .toLocaleLowerCase("tr-TR");
        if (!haystack.includes(needle)) return false;
      }
      return true;
    });
  }, [posts, query, category, shareFilter]);

  const fullyShared = posts.filter((p) =>
    SOCIAL_PLATFORMS.every((pl) => p.shared[pl])
  ).length;
  const anyShared = posts.filter((p) =>
    SOCIAL_PLATFORMS.some((pl) => p.shared[pl])
  ).length;

  const selectClass =
    "rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/80 outline-none transition focus:border-[#ff2d95]/55 focus:bg-white/[0.06]";
  const filtersActive =
    query.trim() !== "" || category !== ALL || shareFilter !== ALL;

  return (
    <>
      {/* Stats */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Toplam post", value: posts.length },
          { label: "Paylaşımı başladı", value: anyShared },
          { label: "Tümü paylaşıldı", value: fullyShared },
          { label: "Kategori", value: categories.length }
        ].map((stat) => (
          <article key={stat.label} className={cardClass}>
            <div className={`${cardInnerClass} px-4 py-3`}>
              <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#f0abfc]/90">
                {stat.label}
              </p>
              <p className="mt-1 font-body text-xl font-bold text-white">
                {stat.value}
              </p>
            </div>
          </article>
        ))}
      </section>

      {/* Search + filters */}
      <section className={cardClass}>
        <div
          className={`${cardInnerClass} flex flex-col gap-3 px-4 py-3 sm:px-5 lg:flex-row lg:items-center lg:justify-between`}
        >
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
              placeholder="Başlık, kategori, metin ara…"
              className="w-full rounded-lg border border-white/10 bg-white/[0.04] py-2 pl-9 pr-3 text-xs text-white placeholder:text-white/30 outline-none transition focus:border-[#ff2d95]/55 focus:bg-white/[0.06] focus:ring-2 focus:ring-[#ff2d95]/15"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className={selectClass}
              aria-label="Kategori filtresi"
            >
              <option value={ALL} className="bg-[#0a0712] text-white">
                Kategori: Tümü
              </option>
              {categories.map((value) => (
                <option
                  key={value}
                  value={value}
                  className="bg-[#0a0712] text-white"
                >
                  {value}
                </option>
              ))}
            </select>
            <select
              value={shareFilter}
              onChange={(event) => setShareFilter(event.target.value)}
              className={selectClass}
              aria-label="Paylaşım filtresi"
            >
              <option value={ALL} className="bg-[#0a0712] text-white">
                Paylaşım: Tümü
              </option>
              <option value="shared" className="bg-[#0a0712] text-white">
                Paylaşılanlar
              </option>
              <option value="unshared" className="bg-[#0a0712] text-white">
                Paylaşılmayanlar
              </option>
            </select>
            {filtersActive ? (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setCategory(ALL);
                  setShareFilter(ALL);
                }}
                className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/60 transition hover:border-[#67e8f9]/45 hover:text-white"
              >
                Temizle
              </button>
            ) : null}
            <span className="text-[11px] font-medium tabular-nums text-white/40">
              {visible.length}/{posts.length}
            </span>
          </div>
        </div>
      </section>

      {/* Post cards */}
      {visible.length === 0 ? (
        <section className={cardClass}>
          <p className={`${cardInnerClass} px-4 py-6 text-xs text-white/55`}>
            Bu filtreyle eşleşen içerik yok.
          </p>
        </section>
      ) : (
        <section className="grid gap-4">
          {visible.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              cardClass={cardClass}
              cardInnerClass={cardInnerClass}
              toggleShareAction={toggleShareAction}
            />
          ))}
        </section>
      )}
    </>
  );
}
