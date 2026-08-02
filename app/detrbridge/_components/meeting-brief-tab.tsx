"use client";

import { useState, type ReactNode } from "react";

import {
  DETRBRIDGE_BRAND_GRADIENT,
  DETRBRIDGE_GOLD
} from "@/app/detrbridge/_components/theme";

type BriefPriority = "Yüksek" | "Orta" | "Düşük";

interface BriefTask {
  index: string;
  priority: BriefPriority;
  status: string;
  title: string;
  description: string;
  owner: string;
  target: string;
  source: string;
}

interface BriefDecision {
  index: string;
  type: string;
  title: string;
  description: string;
  source: string;
}

interface BriefInfo {
  icon: string;
  title: string;
  items: string[];
  source: string;
}

const MEETING_DURATION_LABEL = "72 dk";
const PARTICIPANT_COUNT = 6;

const TASKS: BriefTask[] = [
  {
    index: "01",
    priority: "Yüksek",
    status: "Planlandı",
    title: "Sorumluluk alanlarını ve temas kişilerini belirleme",
    description:
      "Web sitesi, pazarlama, sosyal medya, finans/muhasebe gibi alanlar için birer temas kişisi belirlenip görev kapsamları dokümante edilecek. Toplantıda geçen kişi–rol örnekleri kesin atama değildir.",
    owner: "Tüm ekip · kolaylaştırıcı: Umut",
    target: "Önümüzdeki 10 gün",
    source: "1. oturum · 29:43–31:52"
  },
  {
    index: "02",
    priority: "Yüksek",
    status: "Başlatılacak",
    title: "Görev takip panelini geçici merkez olarak kullanma",
    description:
      "Mevcut paneldeki “Görevler” alanı kararlar, görevler ve ilerleme için ortak çalışma alanı olacak; dağınık/eski içerikler düzenlenecek ve gerekli kayıtlar taşınacak.",
    owner: "Umut + ekip",
    target: "Hemen",
    source: "1. oturum · 39:08–40:08"
  },
  {
    index: "03",
    priority: "Yüksek",
    status: "Taahhüt edildi",
    title: "Toplantı çıktısını yazılı dosya halinde paylaşma",
    description:
      "Konuşulan konular; kararlar, yapılacaklar ve başlıklar halinde düzenlenerek ekip ile paylaşılacak.",
    owner: "Umut",
    target: "Transkript sonrası",
    source: "1. oturum · 28:02–28:42 ve 38:49–39:08"
  },
  {
    index: "04",
    priority: "Yüksek",
    status: "Planlandı",
    title: "Türkiye ve Almanya için fiyatlandırma çalıştayı",
    description:
      "Web sitesi ve diğer hizmetler için özellik, kapsam, efor ve test boyutlarını içeren; ekip içi kullanılacak iki ayrı fiyat çerçevesi hazırlanacak.",
    owner: "Tüm ekip · geliştirme/test desteği: Umut",
    target: "Yaklaşan toplantılarda",
    source: "1. oturum · 40:38–42:57"
  },
  {
    index: "05",
    priority: "Orta",
    status: "Açık konu",
    title: "Operasyon giderleri ve ortak fon modelini netleştirme",
    description:
      "Sunucu, domain ve kurumsal e-posta giderleri birlikte hesaplanacak; aylık katkı tutarı kesinleştirilecek. Hesap hareketlerinin düzenli ve şeffaf paylaşılması esas olacak.",
    owner: "Umut + ekip",
    target: "Bir sonraki değerlendirme",
    source: "1. oturum · 44:44–47:37 ve 53:31–56:43"
  },
  {
    index: "06",
    priority: "Yüksek",
    status: "İlerliyor",
    title: "Showcase web sitesini yayına hazırlama",
    description:
      "Mevcut ön yüz canlı/staging ortama taşınacak; ekip geri bildirimi alınacak. Admin paneli, backend bağlantıları ve içerikler kademeli olarak tamamlanacak.",
    owner: "Web ekibi · koordinasyon: Sümeyya",
    target: "Devam ediyor",
    source: "1. oturum · 48:01–51:11"
  },
  {
    index: "07",
    priority: "Yüksek",
    status: "Planlandı",
    title: "SEO aracına erişim verip gereklilikleri uygulama",
    description:
      "Umut, premium SEO aracına bir ekip üyesi için erişim açacak. Araç önerileri site tamamlanmadan önce tasarıma ve koda işlenecek.",
    owner: "Erişim: Umut · uygulama: web ekibi",
    target: "Erişim: hafta sonu / Pazartesi–Salı; uygulama: finalden önce",
    source: "1. oturum · 51:24–52:58"
  },
  {
    index: "08",
    priority: "Orta",
    status: "Değerlendirilecek",
    title: "Kurumsal e-posta çözümünü karşılaştırıp seçme",
    description:
      "Mevcut Zoho tabanlı çözüm ile domain sağlayıcısı/Hostinger benzeri alternatifler maliyet ve kullanım açısından değerlendirilecek.",
    owner: "Tüm ekip",
    target: "Açık",
    source: "1. oturum · 53:31–56:43"
  },
  {
    index: "09",
    priority: "Düşük",
    status: "Değerlendirilecek",
    title: "Maskot taslaklarını değerlendirip karar verme",
    description:
      "Drive klasöründeki maskot taslakları incelenecek; kullanılması kararlaştırılırsa seçilen maskotun farklı açıları hazırlanarak siteye entegre edilecek.",
    owner: "Tüm ekip · görseller: Umut",
    target: "Açık",
    source: "1. oturum · 57:08–58:24"
  },
  {
    index: "10",
    priority: "Orta",
    status: "Taahhüt edildi",
    title: "ATS / işe alım otomasyonu fikrini tek sayfada anlatma",
    description:
      "Doğal dille ilan üretimi, başvuru puanlama, aday sıralama ve kişiselleştirilmiş geri bildirim akışını anlatan bir sayfalık doküman veya PDF hazırlanıp Umut’a gönderilecek.",
    owner: "Murat Berat",
    target: "Proje değerlendirme toplantısından önce",
    source: "2. oturum · 07:40–12:16"
  },
  {
    index: "11",
    priority: "Orta",
    status: "Planlandı",
    title: "Bir sonraki toplantı için anket açma",
    description:
      "3–4 gün açık kalacak bir tarih anketi ile takip toplantısı belirlenecek; toplantı süresi gidişata göre yaklaşık 30–60 dakika olacak.",
    owner: "Sümeyya",
    target: "2 hafta içinde",
    source: "2. oturum · 12:34–13:15"
  },
  {
    index: "12",
    priority: "Orta",
    status: "Devam ediyor",
    title: "Yeni iş fırsatlarını ekip için olgunlaştırma",
    description:
      "Burak’ın ortaklık modeliyle gelebilecek projeleri, 2–3 basit web sitesi işini, Şahin üzerinden gelebilecek daha büyük işleri ve ABD bağlantısından doğabilecek fırsatları takip edecek.",
    owner: "Umut",
    target: "Süreç içinde",
    source: "2. oturum · 04:10–06:52"
  }
];

const DECISIONS: BriefDecision[] = [
  {
    index: "01",
    type: "Kesin karar",
    title: "Tek WhatsApp grubu, profesyonel iletişim",
    description:
      "İkinci bir sohbet grubu açılmayacak. Mevcut grup iş odaklı ve daha resmî kullanılacak; bilgi kirliliği oluşturacak yoğun sohbetten kaçınılacak.",
    source: "1. oturum · 18:33–20:33"
  },
  {
    index: "02",
    type: "Çalışma ilkesi",
    title: "Üslup yapıcı ve kırıcı olmayan biçimde korunacak",
    description:
      "Eleştiri ve uyarılar profesyonel biçimde yapılacak; imalı, incitici veya yıkıcı yazışmalardan kaçınılacak.",
    source: "1. oturum · 20:47–22:38"
  },
  {
    index: "03",
    type: "Çalışma ilkesi",
    title: "Mesajlara en geç 48 saat içinde dönüş beklentisi",
    description:
      "Bir talep yerine getirilemiyorsa dahi okunduğu ve yapılamayacağı ya da daha sonra ele alınacağı bildirilecek. Unutulan işler için hatırlatma yapmak normal ve istenen bir davranış.",
    source: "1. oturum · 22:38–28:02"
  },
  {
    index: "04",
    type: "Kesin karar",
    title: "Kararlar ve görevler yazılı olarak kayıt altına alınacak",
    description:
      "Yanlış anlamaları azaltmak ve geriye dönük iz bırakmak için toplantı çıktıları ve çalışma kararları dokümante edilecek.",
    source: "1. oturum · 10:25–14:50 ve 28:02–28:42"
  },
  {
    index: "05",
    type: "Yapısal karar",
    title: "Alan sorumluları lider değil, temas noktası olacak",
    description:
      "Her alan için bir sorumlu/temas kişisi bulunacak; bu kişi işi tek başına yapan hiyerarşik lider olarak değil, koordinasyon ve raporlama noktası olarak konumlanacak.",
    source: "1. oturum · 29:43–31:52"
  },
  {
    index: "06",
    type: "Ürün kararı",
    title: "Önce hızlı vitrin, sonra kapsamlı ürün",
    description:
      "Dışarıdan iletişim kurulabilecek mevcut showcase site kısa vadede kullanılacak. Daha kapsamlı görev, müşteri, finans ve yönetim paneli arka planda baskı oluşturmadan geliştirilecek; hazır olduğunda geçiş yapılacak.",
    source: "1. oturum · 33:55–38:11"
  },
  {
    index: "07",
    type: "Ticari ilke",
    title: "Ücretsiz iş varsayılan yaklaşım olmayacak",
    description:
      "Eş-dost dahil işler karşılıksız yapılmayacak. Öğrenme veya stratejik fayda amacıyla düşük ücret ya da müşteri yönlendirmesi karşılığı çalışma gibi istisnalar ekipçe değerlendirilebilir.",
    source: "1. oturum · 42:58–44:44"
  },
  {
    index: "08",
    type: "Ticari karar",
    title: "Fiyatlar standartlaştırılacak ve ekip içinde tutulacak",
    description:
      "Teklif verirken her defasında yeniden tartışmamak için Türkiye ve Almanya pazarlarına uygun, hizmet kapsamına göre ayrıştırılmış iç fiyat listeleri hazırlanacak.",
    source: "1. oturum · 40:38–42:57"
  },
  {
    index: "09",
    type: "Öncelik kararı",
    title: "Öncelik çekirdek Grow/ekip işlerinde",
    description:
      "Murat’ın ATS fikri değerli bulundu; ancak geliştirmeye başlamadan önce ekibin mevcut çekirdek işleri birlikte tamamlanacak. Yan proje şimdilik dokümante edilip olgunlaştırılacak.",
    source: "2. oturum · 06:52–12:34"
  },
  {
    index: "10",
    type: "Mali ilke",
    title: "Ortak giderlerde şeffaflık",
    description:
      "Sunucu ve diğer ortak masraflar için bir fon oluşturulması benimsendi; kesin kişi başı tutar henüz karara bağlanmadı. Gelir-gider hareketleri düzenli olarak ekiple paylaşılacak.",
    source: "1. oturum · 44:44–47:37"
  }
];

const INFOS: BriefInfo[] = [
  {
    icon: "◷",
    title: "Toplantı özeti",
    items: [
      "**Tarih:** 31 Temmuz 2026",
      "**Oturumlar:** 58 dakika + 14 dakika (toplam yaklaşık 72 dakika)",
      "**Katılımcılar:** Aslıhan, Fatih Çalışkan, Murat Berat Başarı, Sefa Eyer, Sümeyya Nacar, Umut Barış Terzioğlu",
      "**Ana amaç:** Profesyonel çalışma çerçevesi, sorumluluklar, ürün planı, fiyatlandırma ve operasyon altyapısını netleştirmek"
    ],
    source: "Her iki oturum"
  },
  {
    icon: "▦",
    title: "Web sitesi mevcut durumu",
    items: [
      "Üç dil desteği hedeflenen bir vitrin sitesi hazırlanıyor.",
      "Admin girişi/paneli, hakkımızda, hizmetler, projeler, blog, iletişim formu ve WhatsApp bağlantısı tasarımda yer alıyor.",
      "Frontend başlangıç sürümü ekip tarafından olumlu değerlendirildi; backend ve admin bağlantıları aşamalı tamamlanacak.",
      "Blog bölümünün düzenli ve güncel teknik içeriklerle beslenmesi planlanıyor."
    ],
    source: "1. oturum · 48:01–52:58"
  },
  {
    icon: "▤",
    title: "Teknik altyapı",
    items: [
      "Mevcut uzaktaki sunucunun Almanya menşeli bir sağlayıcıdan alındığı belirtildi.",
      "Transkriptte sunucu kapasitesi yaklaşık **320 GB ve 16 çekirdek**, mevcut site sayısı ise **25–30** olarak ifade edildi.",
      "Sunucu maliyetinin yaklaşık **20 € / ay** olduğu söylendi; ekip katkısının kesin modeli henüz net değil.",
      "Kurumsal e-posta için mevcut Zoho benzeri çalışma alanı kullanılabilir; alternatif çözümler de değerlendirilecek."
    ],
    source: "1. oturum · 44:44–56:43"
  },
  {
    icon: "◇",
    title: "İş fırsatları ve gelir kanalları",
    items: [
      "Burak tarafında, altyapı ekipçe geliştirilip gelir veya hisse paylaşımıyla ilerleyebilecek proje fikirleri bulunuyor.",
      "Yakın çevreden gelebilecek 2–3 basit kişisel web sitesi işi için yaklaşık 150–200 € seviyesinde fiyat konuşuldu.",
      "Şahin üzerinden gelecekte daha kapsamlı işler gelebileceği belirtildi.",
      "ABD’deki bir bağlantı ve Türkiye’deki Aytekin üzerinden kapasite fazlası işlerin ekibe yönlendirilmesi gündemde."
    ],
    source: "2. oturum · 04:10–06:52"
  },
  {
    icon: "✦",
    title: "ATS ürün fikri",
    items: [
      "Şirket profilinden ve doğal dilde girilen ihtiyaçtan otomatik iş ilanı üretme.",
      "Başvuruları/CV’leri kriterlere göre puanlama ve yüksek uyumlu adayları sıralama.",
      "Puan kaybının nedenlerini güçlü ve zayıf yönlerle açıklama.",
      "Olumlu veya olumsuz tüm adaylara kişiselleştirilmiş, profesyonel geri bildirim üretme.",
      "LinkedIn verisi/entegrasyonu ve teknik erişim yöntemi henüz araştırılması gereken bir alan."
    ],
    source: "2. oturum · 07:40–11:59"
  },
  {
    icon: "?",
    title: "Açık konular",
    items: [
      "Alan sorumlularının isimleri ve görev sınırları",
      "Aylık ortak fonun kişi başı kesin tutarı",
      "Kurumsal e-posta sağlayıcısı ve kullanıcı maliyeti",
      "Maskotun kullanılıp kullanılmayacağı",
      "Kapsamlı iç panelin ürün sınırları ve geliştirme takvimi",
      "Fiyat listelerinin detayları ve indirim/stratejik takas kuralları"
    ],
    source: "Her iki oturumdaki kesinleşmemiş maddeler"
  }
];

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
 * "Toplantı Özeti" panel: static brief of the 31 Temmuz 2026 UBT meeting
 * (tasks, decisions, context notes), ported from the standalone
 * grovegrove.html briefing page into the detrbridge navy/gold theme.
 * Content is fixed — only the text search is interactive.
 */
export function MeetingBriefTab() {
  const [query, setQuery] = useState("");
  const normalizedQuery = normalize(query.trim());

  const visibleTasks = TASKS.filter((task) =>
    matchesQuery(
      [task.title, task.description, task.owner, task.target, task.status, task.priority, task.source].join(" "),
      normalizedQuery
    )
  );
  const visibleDecisions = DECISIONS.filter((decision) =>
    matchesQuery(
      [decision.title, decision.description, decision.type, decision.source].join(" "),
      normalizedQuery
    )
  );
  const visibleInfos = INFOS.filter((info) =>
    matchesQuery([info.title, ...info.items, info.source].join(" "), normalizedQuery)
  );
  const nothingVisible =
    visibleTasks.length + visibleDecisions.length + visibleInfos.length === 0;

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
          Görevler.{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: DETRBRIDGE_BRAND_GRADIENT }}
          >
            Kararlar.
          </span>{" "}
          Bilgiler.
        </h2>
        <p className="mt-3 max-w-2xl text-[13px] leading-relaxed text-white/55">
          31 Temmuz 2026 tarihli iki toplantı oturumunun; kesinleşen maddeler ile açık
          konuları birbirinden ayıran, uygulanabilir ve kaynak zaman damgalı özeti.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { value: String(TASKS.length), label: "Görev / takip maddesi" },
            { value: String(DECISIONS.length), label: "Karar / çalışma ilkesi" },
            { value: MEETING_DURATION_LABEL, label: "Toplam görüşme süresi" },
            { value: String(PARTICIPANT_COUNT), label: "Toplam katılımcı" }
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
                key={task.index}
                className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl transition hover:border-[#F5B700]/30 sm:p-6"
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
                    <footer className="mt-4 border-t border-white/[0.06] pt-3">
                      <span className={sourceClass}>{task.source}</span>
                    </footer>
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
                key={decision.index}
                className="flex items-start gap-4 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl transition hover:border-[#F5B700]/30 sm:p-6"
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
            note="Proje durumu, teknik altyapı, fırsatlar ve henüz karara bağlanmamış noktalar."
          />
          <div className="space-y-3">
            {visibleInfos.map((info) => (
              <article
                key={info.title}
                className="flex items-start gap-4 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl transition hover:border-[#F5B700]/30 sm:p-6"
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
