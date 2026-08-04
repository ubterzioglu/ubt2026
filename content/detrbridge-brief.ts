/**
 * "Toplantı Özeti" (31 Temmuz 2026) briefing content for the /detrbridge board.
 *
 * Lives in `content/` — not inside the tab component — because the server needs
 * the item keys to validate incoming comments: a comment may only be attached to
 * a key that actually exists here, so no orphan rows can be written.
 *
 * `key` values are explicit (not derived from array order or title text) so
 * reordering or rewording a maddeyi does not orphan its existing comments.
 */

export type BriefPriority = "Yüksek" | "Orta" | "Düşük";

export interface BriefTask {
  key: string;
  index: string;
  priority: BriefPriority;
  status: string;
  title: string;
  description: string;
  owner: string;
  target: string;
  source: string;
}

export interface BriefDecision {
  key: string;
  index: string;
  type: string;
  title: string;
  description: string;
  source: string;
}

export interface BriefInfo {
  key: string;
  icon: string;
  title: string;
  items: string[];
  source: string;
}

/** Tek bir açık konu — kendi kartı ve kendi yorum akışı olan, karara bağlanmamış başlık. */
export interface BriefOpenItem {
  key: string;
  index: string;
  title: string;
  source: string;
}

export const MEETING_DURATION_LABEL = "72 dk";
export const MEETING_PARTICIPANT_COUNT = 6;

export const BRIEF_TASKS: BriefTask[] = [
  {
    key: "task-01",
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
    key: "task-02",
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
    key: "task-03",
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
    key: "task-04",
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
    key: "task-05",
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
    key: "task-06",
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
    key: "task-07",
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
    key: "task-08",
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
    key: "task-09",
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
    key: "task-10",
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
    key: "task-11",
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
    key: "task-12",
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

export const BRIEF_DECISIONS: BriefDecision[] = [
  {
    key: "decision-01",
    index: "01",
    type: "Kesin karar",
    title: "Tek WhatsApp grubu, profesyonel iletişim",
    description:
      "İkinci bir sohbet grubu açılmayacak. Mevcut grup iş odaklı ve daha resmî kullanılacak; bilgi kirliliği oluşturacak yoğun sohbetten kaçınılacak.",
    source: "1. oturum · 18:33–20:33"
  },
  {
    key: "decision-02",
    index: "02",
    type: "Çalışma ilkesi",
    title: "Üslup yapıcı ve kırıcı olmayan biçimde korunacak",
    description:
      "Eleştiri ve uyarılar profesyonel biçimde yapılacak; imalı, incitici veya yıkıcı yazışmalardan kaçınılacak.",
    source: "1. oturum · 20:47–22:38"
  },
  {
    key: "decision-03",
    index: "03",
    type: "Çalışma ilkesi",
    title: "Mesajlara en geç 48 saat içinde dönüş beklentisi",
    description:
      "Bir talep yerine getirilemiyorsa dahi okunduğu ve yapılamayacağı ya da daha sonra ele alınacağı bildirilecek. Unutulan işler için hatırlatma yapmak normal ve istenen bir davranış.",
    source: "1. oturum · 22:38–28:02"
  },
  {
    key: "decision-04",
    index: "04",
    type: "Kesin karar",
    title: "Kararlar ve görevler yazılı olarak kayıt altına alınacak",
    description:
      "Yanlış anlamaları azaltmak ve geriye dönük iz bırakmak için toplantı çıktıları ve çalışma kararları dokümante edilecek.",
    source: "1. oturum · 10:25–14:50 ve 28:02–28:42"
  },
  {
    key: "decision-05",
    index: "05",
    type: "Yapısal karar",
    title: "Alan sorumluları lider değil, temas noktası olacak",
    description:
      "Her alan için bir sorumlu/temas kişisi bulunacak; bu kişi işi tek başına yapan hiyerarşik lider olarak değil, koordinasyon ve raporlama noktası olarak konumlanacak.",
    source: "1. oturum · 29:43–31:52"
  },
  {
    key: "decision-06",
    index: "06",
    type: "Ürün kararı",
    title: "Önce hızlı vitrin, sonra kapsamlı ürün",
    description:
      "Dışarıdan iletişim kurulabilecek mevcut showcase site kısa vadede kullanılacak. Daha kapsamlı görev, müşteri, finans ve yönetim paneli arka planda baskı oluşturmadan geliştirilecek; hazır olduğunda geçiş yapılacak.",
    source: "1. oturum · 33:55–38:11"
  },
  {
    key: "decision-07",
    index: "07",
    type: "Ticari ilke",
    title: "Ücretsiz iş varsayılan yaklaşım olmayacak",
    description:
      "Eş-dost dahil işler karşılıksız yapılmayacak. Öğrenme veya stratejik fayda amacıyla düşük ücret ya da müşteri yönlendirmesi karşılığı çalışma gibi istisnalar ekipçe değerlendirilebilir.",
    source: "1. oturum · 42:58–44:44"
  },
  {
    key: "decision-08",
    index: "08",
    type: "Ticari karar",
    title: "Fiyatlar standartlaştırılacak ve ekip içinde tutulacak",
    description:
      "Teklif verirken her defasında yeniden tartışmamak için Türkiye ve Almanya pazarlarına uygun, hizmet kapsamına göre ayrıştırılmış iç fiyat listeleri hazırlanacak.",
    source: "1. oturum · 40:38–42:57"
  },
  {
    key: "decision-09",
    index: "09",
    type: "Öncelik kararı",
    title: "Öncelik çekirdek Grow/ekip işlerinde",
    description:
      "Murat’ın ATS fikri değerli bulundu; ancak geliştirmeye başlamadan önce ekibin mevcut çekirdek işleri birlikte tamamlanacak. Yan proje şimdilik dokümante edilip olgunlaştırılacak.",
    source: "2. oturum · 06:52–12:34"
  },
  {
    key: "decision-10",
    index: "10",
    type: "Mali ilke",
    title: "Ortak giderlerde şeffaflık",
    description:
      "Sunucu ve diğer ortak masraflar için bir fon oluşturulması benimsendi; kesin kişi başı tutar henüz karara bağlanmadı. Gelir-gider hareketleri düzenli olarak ekiple paylaşılacak.",
    source: "1. oturum · 44:44–47:37"
  }
];

export const BRIEF_INFOS: BriefInfo[] = [
  {
    key: "info-01",
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
    key: "info-02",
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
    key: "info-03",
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
    key: "info-04",
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
    key: "info-05",
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
  }
];

/**
 * Karara bağlanmamış başlıklar. Eskiden "Bilgiler" altında tek bir liste
 * maddesiydi; her biri ayrı ayrı tartışılacağı için kendi kartına ve kendi
 * yorum akışına ayrıldı ve sayfanın en üstüne alındı.
 */
export const BRIEF_OPEN_ITEMS: BriefOpenItem[] = [
  {
    key: "open-01",
    index: "01",
    title: "Alan sorumlularının isimleri ve görev sınırları",
    source: "1. oturum · 29:43–31:52"
  },
  {
    key: "open-02",
    index: "02",
    title: "Aylık ortak fonun kişi başı kesin tutarı",
    source: "1. oturum · 44:44–47:37"
  },
  {
    key: "open-03",
    index: "03",
    title: "Kurumsal e-posta sağlayıcısı ve kullanıcı maliyeti",
    source: "1. oturum · 53:31–56:43"
  },
  {
    key: "open-04",
    index: "04",
    title: "Maskotun kullanılıp kullanılmayacağı",
    source: "1. oturum · 57:08–58:24"
  },
  {
    key: "open-05",
    index: "05",
    title: "Kapsamlı iç panelin ürün sınırları ve geliştirme takvimi",
    source: "1. oturum · 33:55–38:11"
  },
  {
    key: "open-06",
    index: "06",
    title: "Fiyat listelerinin detayları ve indirim/stratejik takas kuralları",
    source: "1. oturum · 40:38–44:44"
  }
];

/** Every commentable key on the brief — the server validates against this. */
export const DETRBRIDGE_BRIEF_ITEM_KEYS: ReadonlySet<string> = new Set([
  ...BRIEF_OPEN_ITEMS.map((item) => item.key),
  ...BRIEF_TASKS.map((task) => task.key),
  ...BRIEF_DECISIONS.map((decision) => decision.key),
  ...BRIEF_INFOS.map((info) => info.key)
]);
