import type { ProjectairDocument } from "@/types/projectair";

export const projectairDocument = {
  eyebrow: "Proje kararları",
  version: "Ana plan v0.26 · 13 Kasım 2026",
  title: "Havacılık Bakım Eğitim Platformu",
  summary:
    "Kurumlara teknik eğitim içeriği üretimi ve eğitim atama, tamamlama ve sonuç takibi için abonelikli bir platform.",
  phases: ["Demo", "Pilot", "Ücretli hizmet"],
  sections: [
    {
      id: "yon",
      number: "01",
      kicker: "Ürün",
      title: "İçerik üretimi ve platform",
      facts: [
        {
          term: "İlk pazar",
          description:
            "Türkiye. İlk görüşmeler özel havacılık okullarını ve bakım eğitimi veren şirketleri kapsar. Havayolları, MRO şirketleri ve teknik eğitim kurumları daha geniş hedef kapsamındadır."
        },
        {
          term: "Kullanıcılar",
          description:
            "Gençler ve havacılık bakım mesleğine başlamak isteyenler ilk odak. Eğitim modeli başlangıç ve deneyimli teknisyen seviyelerini kapsar."
        },
        {
          term: "Dil",
          description:
            "Mevcut plan Türkçe anlatım ve özgün İngilizce teknik terimlerle ilerler. İngilizce anlatım önerisi değerlendirme bekliyor."
        },
        {
          term: "Marka ve cihazlar",
          description:
            "Platform kendi markamızla veya müşterinin logosuyla sunulabilecek. Bilgisayar, tablet ve telefon desteklenecek."
        }
      ]
    },
    {
      id: "demo",
      number: "02",
      kicker: "Demo",
      title: "Bir parça, iki eğitim seviyesi",
      intro: [
        "İlk örnek için özgün bir eğitim parçası, temsili parça numarası ve özgün montaj şeması hazırlanacak. Eğitim ekranında örneğin temsili olduğu belirtilecek. Demo hem potansiyel müşteriye hem yatırımcıya yönelik."
      ],
      tiles: [
        {
          title: "Başlangıç",
          body: "Kullanıcı görselden parçayı tanır. Adını, örnek numarasını ve işlevini eşleştirir. Montaj sırasını açıklamalı görselle izler."
        },
        {
          title: "Deneyimli",
          body: "Kullanıcı aynı parça grubunu montaj öncesi görünümde inceler. Bileşenleri tanır ve montaj adımlarını sıralar."
        }
      ],
      flow: [
        "Yönetici eğitimi atar",
        "Kullanıcı eğitimi tamamlar ve soruları yanıtlar",
        "Sonuç kaydedilir",
        "Yönetici sonucu görür"
      ],
      outro: [
        "Sinematik video, açıklayıcı animasyon ve şemalar birlikte kullanılacak. Barış görseli ve etkileşimi prototipe işler. Gürkan öğrenme hedeflerini ve senaryoyu inceler."
      ],
      note: {
        tone: "pending",
        title: "Teyit bekleyen takvim.",
        body: "1 Aralık 2026 kısmi demo ve 15 Aralık 2026 tamamlanmış demo için görüşmede geçen hedefler."
      }
    },
    {
      id: "platform",
      number: "03",
      kicker: "Platform",
      title: "Eğitim yönetimi ve kullanıcı deneyimi",
      intro: ["Bu bölüm ürün kapsamını özetler. İlk demo akışı bir önceki bölümde yer alır."],
      facts: [
        {
          term: "Eğitime erişim",
          description:
            "Kurum eğitim atar. Kullanıcı da erişimine açık katalogdan eğitim seçebilir. Atama ve kişisel seçim ayrı kaydedilir."
        },
        {
          term: "Eğitim takibi",
          description:
            "Son tamamlama tarihi, hatırlatma ve gerektiğinde tekrar veya yenileme. Kullanıcı kaldığı yerden devam eder ve sonunda sonuç özetini ve tekrar çalışılacak konuları görür."
        },
        {
          term: "Yönetici ekranı",
          description:
            "Tamamlama, başarı puanı, yanlış cevaplanan konular ve belge durumu. Eğitim sonuçları, kullanıcı listeleri ve belge kayıtları dışa aktarılabilir."
        },
        {
          term: "Belgeler",
          description:
            "Katılım ve başarı belgesi sunulur. Verilme koşulları, düzenleyen taraf ve doğrulama yöntemi belirlenecek."
        },
        {
          term: "Destek ve entegrasyon",
          description:
            "İlk kurulum, yönetici eğitimi ve uygulama içi destek. Kullanıcı eğitimde soru sorabilir ve hata bildirebilir. Kurumun mevcut eğitim sistemiyle bağlantı plan kapsamında."
        },
        {
          term: "Kurum verileri",
          description:
            "Kuruma özel belgeler ve eğitimler ilgili kurumla sınırlı. Sözleşme sonunda veri teslimi, erişim kapatma ve saklama veya silme süreci uygulanacak."
        }
      ]
    },
    {
      id: "kaynaklar",
      number: "04",
      kicker: "İçerik",
      title: "İçerik üretimi, izinler ve revizyonlar",
      facts: [
        {
          term: "İki içerik kanalı",
          description:
            "Ekip kendi içeriklerini üretir ve gerektiğinde kurumlardan kaynak belge veya eğitim materyali alır. Genel kataloğa alınacak kuruma özel içerik için ayrıca izin gerekir."
        },
        {
          term: "Müşteri geri bildirimi",
          description:
            "Kuruma özel senaryo üretimden önce müşteriye gösterilir. Düzeltme talepleri ve içerik sürümleri platformda izlenir."
        },
        {
          term: "Kaynak temini",
          description:
            "İlk demo özgün içerikle hazırlanır. Gerçek uçak parçasına dayalı eğitim için konuya uygun belge, geçerli revizyon ve eğitimde kullanım hakkı doğrulanır. Hak sahibinden izin ve yetkili kurumla çalışma seçenekleri değerlendirilir."
        },
        {
          term: "Revizyon",
          description:
            "Kaynak değiştiğinde ilgili eğitim tekrar incelenir ve gerektiğinde geçici olarak yayından kaldırılır."
        }
      ]
    },
    {
      id: "ticari",
      number: "05",
      kicker: "Ticari plan",
      title: "İlk temas, pilot ve hizmet",
      facts: [
        {
          term: "Satış akışı",
          description: "Müşteri adayı → görüşme → demo → teklif → pilot → sözleşme → yenileme."
        },
        {
          term: "Pilot ölçümleri",
          description:
            "İçerik üretim maliyeti, uzman inceleme yükü ve kurumun ödeme isteği değerlendirilecek."
        },
        {
          term: "Fiyat seçenekleri",
          description:
            "Kurum aboneliği, kullanıcı başına ücret, içerik paketi ve özel içerik üretimi. Paketler ve tutarlar karar bekliyor."
        },
        {
          term: "Görüşme adayları",
          description:
            "Selim Kona uzman görüşü için, Southwind olası kurum teması için anıldı. İlk kurum ve muhatap teyit bekliyor."
        }
      ],
      note: {
        tone: "info",
        title: "Pazar araştırması.",
        body: "Benzer ürünler:",
        links: [
          {
            label: "Airbus ACT for Academy",
            href: "https://www.aircraft.airbus.com/en/services/train/maintenance-training-solutions/act-for-academy"
          },
          {
            label: "Boeing bakım eğitimi araçları",
            href: "https://services.boeing.com/insights/advanced-tools-aviation-maintenance-training"
          },
          {
            label: "Lufthansa Technical Training MAINTAIN360",
            href: "https://www.ltt.aero/en/maintain360"
          }
        ]
      }
    },
    {
      id: "ekip",
      number: "06",
      kicker: "Ortaklık",
      title: "Gürkan ve Barış",
      tiles: [
        {
          title: "Gürkan · Ürün sahipliği",
          body: "Havacılık ve eğitim ihtiyaçlarını ürün önceliklerine dönüştürür. İçerik kapsamına ve öğrenme hedeflerine yön verir."
        },
        {
          title: "Barış · Geliştirme",
          body: "Ürünün teknik tasarımını ve geliştirmesini yürütür. Yatırım Barış’ın tarafında yürütülür."
        }
      ],
      outro: ["Ortak sorumluluk: pazarlama ve halkla ilişkiler (PR)."]
    },
    {
      id: "acik",
      number: "07",
      kicker: "Takip",
      title: "Açık kararlar",
      tiles: [
        {
          status: "Gürkan’la görüşülecek",
          title: "İlk eğitim amacı ve uzman görüşü",
          items: [
            "Sınav hazırlığı veya mesleğe giriş. Sınav seçilirse hedef sınav ve eksik materyaller.",
            "Selim Kona’ya senaryo taslağının veya çalışan demonun gösterilmesi."
          ]
        },
        {
          status: "Teknik değerlendirme",
          title: "Eğitim içeriği ve kalite",
          items: [
            "İngilizce anlatım önerisi, motor konularının katalog önceliği ve B1/C kapsamı.",
            "Yayın öncesi uzman onayı, yanlış yanıta geri bildirim, tekrar hakkı, başarı ve belge kuralları.",
            "Pilot geri bildirim grupları, hata ölçümü ve grafik planı."
          ]
        },
        {
          status: "Ürün tasarımı",
          title: "İlk sürüm kapsamı",
          items: [
            "Hesap daveti veya kendi kaydı, çevrimdışı kullanım, altyazı ve anlatım metni.",
            "Kişisel notlar, işaretleme ve tanıtım eğitimine erişim şekli.",
            "Rol ve yetkiler, entegrasyon ayrıntıları, dış AI kullanımı ve demoda belge yükleme."
          ]
        },
        {
          status: "Ticari hazırlık",
          title: "Marka, bütçe ve takvim",
          items: [
            "Önemli TODO: ürün ve marka adı.",
            "Pilotun ücretli olup olmayacağı, paketler, fiyatlar, bütçe ve takvim teyidi.",
            "Şirket kuruluşu, sözleşmeler, muhasebe ve sigorta için uzman görüşü."
          ]
        }
      ]
    }
  ],
  filesFolder: {
    label: "Google Drive klasörünü aç",
    href: "https://drive.google.com/drive/folders/19ZonxonohIzFQkkR_NDwdOsrFHhZgDok?usp=sharing"
  },
  files: [
    {
      label: "01_E2E_Ana_Plan_v0.26.md",
      href: "https://drive.google.com/file/d/19PMREhWQ83gBbfCooYrYcTcPiP1AGkKP/view?usp=drivesdk"
    },
    {
      label: "02_E2E_Sistem_Mimarisi.md",
      href: "https://drive.google.com/file/d/1VECcDsocfEQKoKC-NwS0uASP-EaBHDTa/view?usp=drivesdk"
    },
    {
      label: "03_Yonetici_ve_Teknik_Rapor.md",
      href: "https://drive.google.com/file/d/11Nxn3YmeFN9BMXTsGYVRbcR4LeUKUKzX/view?usp=drivesdk"
    },
    {
      label: "04_Hibrit_AI_Proje_Plani.pdf",
      href: "https://drive.google.com/file/d/1e3VTULpauSATTg1xQLgsaTVYWeo4gtfw/view?usp=drivesdk"
    },
    {
      label: "05_Teknik_Degerlendirme_ve_Inceleme_Notlari.pdf",
      href: "https://drive.google.com/file/d/1BzKy-ZPhEaGZUvhb34w0OC5YcWThw4hf/view?usp=drivesdk"
    },
    {
      label: "06_Kullanici_Senaryosu_Storyboard.pdf",
      href: "https://drive.google.com/file/d/17bJjB8-EQwydR9Jpi9hHA74vPuzECFo4/view?usp=drivesdk"
    },
    {
      label: "07_Fikri_Mulkiyet_Kilavuzu.pdf",
      href: "https://drive.google.com/file/d/1AReLNL0mfE8w9DPcoIPtJMJU6G4fUP8y/view?usp=drivesdk"
    },
    {
      label: "08_Kaynak_NAMMSROA_000002.pdf",
      href: "https://drive.google.com/file/d/1Ws7hWWkVQy1m9_dQTPdfPnZPgOUDLilB/view?usp=drivesdk"
    }
  ],
  footer: "Kaynak belge · 01_E2E_Ana_Plan.md · Sürüm 0.26"
} as const satisfies ProjectairDocument;
