import { DM_BRAND_GRADIENT } from "@/app/dm/_components/theme";
import { BoardGuide } from "@/app/dm/_components/board-guide";
import type { BoardGuideContent } from "@/app/dm/_components/board-guide";

// Collapsed how-to card shown at the top of the Info tab.
const INFO_GUIDE: BoardGuideContent = {
  title: "Bu sekme ne işe yarar? · Kullanım rehberi",
  intro:
    "Önemli bilgiler, ekibin sık başvurduğu referansları tek yerde " +
    "tutar: resmi sosyal medya profilleri ve açık genel işler listesi. " +
    "Bu sekmede form yok — salt okunur bir referans sayfasıdır.",
  sections: [
    {
      heading: "1 · Sosyal profiller",
      text: "DesireMap'in resmi hesaplarına hızlı erişim için:",
      steps: [
        "Kart üzerindeki Instagram, Facebook, X, TikTok, Reddit veya LinkedIn satırına tıkla.",
        "Bağlantı ilgili profili yeni sekmede açar.",
        "Kullanıcı adı/handle her satırın altında görünür — paylaşım yaparken referans alabilirsin."
      ]
    },
    {
      heading: "2 · Açık işler",
      text: "Diğer sekmelere sığmayan genel yapılacaklar burada listelenir:",
      steps: [
        "Liste salt okunurdur, buradan ekleme/silme yapılmaz.",
        "Örnek: yeni bir platformda (ör. Pornhub) profil açılması gibi tek seferlik işler.",
        "Böyle bir işi Görevler sekmesine taşımak istersen, oradan yeni görev olarak ekleyebilirsin."
      ]
    }
  ]
};

interface InfoTabProps {
  cardClass: string;
  cardInnerClass: string;
}

interface ProfileLink {
  label: string;
  handle: string;
  href: string;
  icon: React.ReactNode;
}

const iconProps = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  "aria-hidden": true
} as const;

/** Official DesireMap social profiles. Static reference — rarely changes. */
const PROFILES: ProfileLink[] = [
  {
    label: "Instagram",
    handle: "@desiremapde",
    href: "https://www.instagram.com/desiremapde",
    icon: (
      <svg {...iconProps} fill="none" stroke="currentColor" strokeWidth={2}>
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    )
  },
  {
    label: "Facebook",
    handle: "/desiremapde",
    href: "https://www.facebook.com/desiremapde",
    icon: (
      <svg {...iconProps} fill="currentColor">
        <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z" />
      </svg>
    )
  },
  {
    label: "X (Twitter)",
    handle: "@desiremap192504",
    href: "https://x.com/desiremap192504",
    icon: (
      <svg {...iconProps} fill="currentColor">
        <path d="M18.9 2.5h3.3l-7.2 8.2 8.5 11.3h-6.7l-5.2-6.9-6 6.9H2.3l7.7-8.8L1.9 2.5h6.8l4.7 6.3 5.5-6.3zm-1.2 17.8h1.8L7.1 4.3H5.2l12.5 16z" />
      </svg>
    )
  },
  {
    label: "TikTok",
    handle: "@desiremapde",
    href: "https://www.tiktok.com/@desiremapde",
    icon: (
      <svg {...iconProps} fill="currentColor">
        <path d="M16.5 3c.4 2.3 1.7 3.9 4 4.2v2.7c-1.4.1-2.7-.3-4-1v6.1c0 3.5-2.6 5.9-5.9 5.9A5.8 5.8 0 0 1 4.8 15c0-3.4 3-6 6.6-5.4v2.9c-.4-.1-.9-.2-1.3-.2-1.5 0-2.6 1.1-2.6 2.6 0 1.6 1.2 2.7 2.7 2.7 1.6 0 2.7-1.2 2.7-2.9V3h3.6z" />
      </svg>
    )
  },
  {
    label: "Reddit",
    handle: "r/desiremapde",
    href: "https://www.reddit.com/r/desiremapde/",
    icon: (
      <svg {...iconProps} fill="currentColor">
        <path d="M22 11.8c0-1.2-1-2.2-2.2-2.2-.6 0-1.1.2-1.5.6-1.5-1-3.4-1.6-5.6-1.7l1-4.4 3.1.7c0 .8.7 1.4 1.4 1.4.8 0 1.4-.6 1.4-1.4S19 3 18.2 3c-.6 0-1 .3-1.3.8l-3.4-.8c-.2 0-.4.1-.4.3l-1.1 5c-2.2.1-4.2.7-5.7 1.7-.4-.4-1-.6-1.5-.6C3.5 9.6 2.5 10.6 2.5 11.8c0 .8.5 1.6 1.2 1.9v.6c0 3 3.5 5.5 7.8 5.5s7.8-2.5 7.8-5.5v-.6c.8-.3 1.4-1.1 1.4-1.9zM7 13.4c0-.8.6-1.4 1.4-1.4s1.4.6 1.4 1.4-.6 1.4-1.4 1.4S7 14.2 7 13.4zm7.9 3.7c-1 1-3 1-3.4 1s-2.4 0-3.4-1c-.1-.1-.1-.4 0-.5s.4-.1.5 0c.6.6 2 .8 2.9.8s2.3-.2 2.9-.8c.1-.1.4-.1.5 0 .2.2.2.4.1.5zm-.3-2.3c-.8 0-1.4-.6-1.4-1.4s.6-1.4 1.4-1.4 1.4.6 1.4 1.4-.6 1.4-1.4 1.4z" />
      </svg>
    )
  },
  {
    label: "LinkedIn",
    handle: "/company/desiremap",
    href: "https://www.linkedin.com/company/desiremap",
    icon: (
      <svg {...iconProps} fill="currentColor">
        <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z" />
      </svg>
    )
  }
];

export function InfoTab({ cardClass, cardInnerClass }: InfoTabProps) {
  return (
    <>
      <BoardGuide
        guide={INFO_GUIDE}
        cardClass={cardClass}
        cardInnerClass={cardInnerClass}
      />
      {/* Social profiles card */}
      <section className={cardClass}>
        <div className={`${cardInnerClass} p-4 sm:p-5`}>
          <div className="flex items-center gap-2.5">
            <span
              className="flex h-7 w-7 items-center justify-center rounded-lg text-white shadow-sm ring-1 ring-white/15"
              style={{ backgroundImage: DM_BRAND_GRADIENT }}
              aria-hidden
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
                <path d="M4 11a9 9 0 0 1 9 9" />
                <path d="M4 4a16 16 0 0 1 16 16" />
                <circle cx="5" cy="19" r="1" />
              </svg>
            </span>
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-[#f0abfc]/90">
                Sosyal medya
              </p>
              <h2 className="font-body text-sm font-bold text-white">
                DesireMap profilleri
              </h2>
            </div>
          </div>

          <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
            {PROFILES.map((profile) => (
              <a
                key={profile.label}
                href={profile.href}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center gap-3 rounded-xl border border-white/[0.08] bg-[#06040c]/60 px-3.5 py-3 transition hover:border-[#67e8f9]/45 hover:bg-white/[0.03]"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] text-white/75 transition group-hover:text-[#67e8f9]">
                  {profile.icon}
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-semibold text-white">
                    {profile.label}
                  </span>
                  <span className="block truncate text-[11px] text-white/45 group-hover:text-white/70">
                    {profile.handle}
                  </span>
                </span>
                <svg
                  className="ml-auto shrink-0 text-white/25 transition group-hover:text-[#67e8f9]"
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M7 17 17 7" />
                  <path d="M7 7h10v10" />
                </svg>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Todo / open items card */}
      <section className={cardClass}>
        <div className={`${cardInnerClass} p-4 sm:p-5`}>
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-amber-400/30 bg-amber-400/10 text-amber-300">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
            </span>
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-[#f0abfc]/90">
                Todo
              </p>
              <h2 className="font-body text-sm font-bold text-white">
                Açık işler
              </h2>
            </div>
          </div>

          <ul className="mt-4 space-y-2">
            <li className="flex items-start gap-2.5 rounded-xl border border-white/[0.08] bg-[#06040c]/60 px-3.5 py-3">
              <span
                aria-hidden
                className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-300 shadow-[0_0_7px_rgba(251,191,36,0.9)]"
              />
              <span className="text-xs leading-5 text-white/80">
                Pornhub ve diğer yetişkin (p.) sitelerinde de profil açılacak.
              </span>
            </li>
          </ul>
        </div>
      </section>
    </>
  );
}
