window.BUYORBYE_DATA = {
  ui: {
    heroTitle: "oparayaben",
    heroSubtitle: "15 hızlı soruyu yanıtla, net bir AL / BEKLE / VAZGEÇ önerisi al.",

    pillReady: "Hazır.",
    pillStep: (n, total) => `${n}/${total}`,
    pillResult: "Sonuç hazır.",

    buttons: {
      next: "İleri",
      back: "Geri",
      showResult: "Sonucu göster",
      startOver: "Baştan başla"
    },

    yes: "Evet",
    no: "Hayır",
    optional: "Opsiyonel",

    errors: {
      required: "Bu alan zorunlu.",
      numberInvalid: "Lütfen geçerli bir sayı gir.",
      budgetMustBeGte0: "Bütçe 0 veya daha büyük olmalı.",
      priceMustBeGte0: "Fiyat 0 veya daha büyük olmalı."
    },

    stepTitles: {
      s1: "1) Temeller",
      s2: "2) Kullanım & öncelikler",
      s3: "3) Gerçeklik kontrolü",
      result: "4) Sonucun"
    },
    stepSubs: {
      s1: "Önce sayılar, sonra sakin bir karar.",
      s2: "Kararın netleştiği bölüm.",
      s3: "Dürtüsel alışverişe karşı birkaç koruyucu soru."
    },

    result: {
      why: "Neden",
      tradeoffs: "Tavizler",
      nextSteps: "Öneri",
      nudge: "Bu araç senin tarafında. Paranın keyfini çıkar; harcadığına pişman olma."
    },

    fallbackWhy: "Yanıtların dengesi bu sonuca işaret ediyor.",
    fallbackTrade: "Emin değilsen 72 saat beklemek ucuz bir sigortadır.",
    fallbackNext: "Acil değilse kısa bir bekleme genelde kazandırır."
  },

  steps: [
    { id: "s1", qids: ["item", "price", "budget", "incomePct", "urgency"] },
    { id: "s2", qids: ["frequency", "needwant", "priorities", "alt80", "returnPolicy"] },
    { id: "s3", qids: ["regret2y", "priceDrop15", "reliability", "socialPressure", "impulse", "canWait72"] }
  ],

  questions: {
    item: {
      id: "item",
      type: "text",
      required: false,
      label: "Ne satın alıyorsun?",
      sub: "Kısa bir isim yeterli.",
      placeholder: "örn. kulaklık, monitör, kurs"
    },

    price: {
      id: "price",
      type: "number",
      required: true,
      label: "Fiyat (EUR)",
      sub: "Bugün ödeyeceğin toplam tutar.",
      placeholder: "örn. 199"
    },

    budget: {
      id: "budget",
      type: "number",
      required: true,
      label: "Maksimum bütçen (EUR)",
      sub: "Kendini rahat hissederek harcayabileceğin üst limit.",
      placeholder: "örn. 250"
    },

    incomePct: {
      id: "incomePct",
      type: "single",
      required: true,
      label: "Kabaca: Bu alışveriş aylık gelirinin yüzde kaçı?",
      sub: "Maaşını söylemene gerek yok. Sadece aralığı seç.",
      options: [
        { v: "p10", t: "≈ %10" },
        { v: "p20", t: "≈ %20" },
        { v: "p30", t: "≈ %30" },
        { v: "p40", t: "≈ %40" },
        { v: "p50", t: "%50 veya daha fazla" },
        { v: "unk", t: "Emin değilim" }
      ]
    },

    urgency: {
      id: "urgency",
      type: "single",
      required: true,
      label: "Ne kadar acil?",
      sub: "Acil durum en iyi stratejiyi değiştirir.",
      options: [
        { v: "today", t: "Bugün" },
        { v: "week",  t: "7 gün içinde" },
        { v: "month", t: "30 gün içinde" },
        { v: "none",  t: "Acil değil" }
      ]
    },

    frequency: {
      id: "frequency",
      type: "single",
      required: true,
      label: "Ne sıklıkla kullanacaksın?",
      sub: "Kullanım sıklığı pişmanlığın güçlü göstergelerinden biridir.",
      options: [
        { v: "daily",   t: "Her gün" },
        { v: "weekly",  t: "Haftada birkaç kez" },
        { v: "monthly", t: "Ayda birkaç kez" },
        { v: "rare",    t: "Nadiren" }
      ]
    },

    needwant: {
      id: "needwant",
      type: "single",
      required: true,
      label: "Bu daha çok ihtiyaç mı istek mi?",
      sub: "Yargı yok. Sadece netlik.",
      options: [
        { v: "need", t: "İhtiyaç" },
        { v: "want", t: "İstek" }
      ]
    },

    priorities: {
      id: "priorities",
      type: "multi",
      required: true,
      max: 3,
      label: "En fazla 3 öncelik seç",
      sub: "‘İyi’ senin için ne demek, onu anlarız.",
      options: [
        { v: "price",       t: "Fiyat" },
        { v: "quality",     t: "Kalite" },
        { v: "durability",  t: "Dayanıklılık" },
        { v: "warranty",    t: "Garanti" },
        { v: "performance", t: "Performans" },
        { v: "ease",        t: "Kullanım kolaylığı" },
        { v: "design",      t: "Tasarım" },
        { v: "brand",       t: "Marka" }
      ]
    },

    alt80: {
      id: "alt80",
      type: "yesno",
      required: true,
      label: "Zaten “yeterince iyi” (≈%80) çalışan bir alternatifin var mı?",
      sub: "Evetse, beklemek çoğu zaman daha akıllıca olur."
    },

    returnPolicy: {
      id: "returnPolicy",
      type: "yesno",
      required: true,
      label: "İade politikası var mı?",
      sub: "İade, özellikle pahalı ürünlerde riski azaltır."
    },

    regret2y: {
      id: "regret2y",
      type: "yesno",
      required: true,
      label: "2 yıl içinde bozulsa bile bugün yine alır mıydın?",
      sub: "Bu en güçlü pişmanlık testidir."
    },

    priceDrop15: {
      id: "priceDrop15",
      type: "yesno",
      required: true,
      label: "Gelecek ay fiyat %15 düşerse, bugün aldığın için pişman olur musun?",
      sub: "‘Erken aldım’ acısını yakalar."
    },

    reliability: {
      id: "reliability",
      type: "single",
      required: true,
      label: "Senin için güvenilirlik / garanti ne kadar önemli?",
      sub: "Önem yükseldikçe riskli satın alımlardan kaçınmak gerekir.",
      options: [
        { v: "low",  t: "Düşük" },
        { v: "med",  t: "Orta" },
        { v: "high", t: "Yüksek" }
      ]
    },

    socialPressure: {
      id: "socialPressure",
      type: "yesno",
      required: true,
      label: "Bunu daha çok trend / sosyal etki yüzünden mi alıyorsun?",
      sub: "Bu çoğu zaman hızlı pişmanlığa gider."
    },

    impulse: {
      id: "impulse",
      type: "yesno",
      required: true,
      label: "Şu an stres / sıkılma duygusunu bastırmak için mi alışveriş yapıyorsun?",
      sub: "Dürtüsel alışveriş nadiren değer."
    },

    canWait72: {
      id: "canWait72",
      type: "yesno",
      required: true,
      label: "Önemli bir şey kaybetmeden 72 saat bekleyebilir misin?",
      sub: "Evetse, beklemek genelde kazandırır."
    }
  },

  scoring: {
    hard: {
      overBudgetOutcome: "bye",
      overBudgetReasonKey: "overBudget"
    },
    thresholds: {
      buyMin: 3,
      byeMax: -3
    },

    pctBands: [
      { maxPct: 10, score: +1, key: "pctLow" },
      { maxPct: 20, score:  0, key: "pctMedium" },
      { maxPct: 30, score: -1, key: "pctHigh" },
      { maxPct: 40, score: -2, key: "pctVeryHigh" },
      { maxPct: 100, score: -3, key: "pctExtreme" }
    ],

    weights: {
      urgency: { today: +2, week: +1, month: 0, none: -1 },
      frequency: { daily: +2, weekly: +1, monthly: 0, rare: -1 },
      needwant: { need: +1, want: -1 },
      alt80: { yes: -2, no: +1 },
      returnPolicy: { yes: +1, no: -1 },
      regret2y: { yes: +2, no: -2 },
      priceDrop15: { yes: -1, no: +1 },
      reliability: { low: 0, med: -1, high: -2 },
      socialPressure: { yes: -2, no: 0 },
      impulse: { yes: -2, no: 0 },
      canWait72: { yes: -1, no: +1 }
    }
  },

  reasons: {
    overBudget: {
      why: [
        "Bu alışveriş bütçeni aşıyor.",
        "Bu, pişmanlığa giden en hızlı yollardan biri."
      ],
      tradeoffs: [
        "Finansal nefes alanın korunur.",
        "Fiyat düşerse veya koşullar değişirse tekrar bakabilirsin."
      ],
      next: [
        "Hâlâ istiyorsan bir hedef fiyat belirle ve bekle.",
        "En önemli önceliğine uyan daha ucuz bir alternatif düşün."
      ]
    },

    pctLow: {
      why: ["Gelire oranla makul görünüyor."],
      tradeoffs: ["Yine de: hızlı karşılaştır, sonsuz sekme gezmesine girme."],
      next: ["Diğer yanıtlar da iyiyse, almak mantıklı olabilir."]
    },

    pctMedium: {
      why: ["Gelire oranla yönetilebilir görünüyor."],
      tradeoffs: ["Bir indirim yakalamak akıllı bir iyileştirme olabilir."],
      next: ["Acil değilse fiyat alarmı kurmayı düşün."]
    },

    pctHigh: {
      why: ["Aylık bütçende hissedilir bir pay."],
      tradeoffs: ["Beklemek pişmanlık riskini azaltır."],
      next: ["72 saat bekleyebiliyorsan bekle — sonra yanıtlarını tekrar kontrol et."]
    },

    pctVeryHigh: {
      why: ["Aylık gelirine göre ciddi bir yük."],
      tradeoffs: ["İndirim veya daha ucuz seçenek seni koruyabilir."],
      next: ["BEKLE + net hedef fiyat yaklaşımını dene. Acele etme."]
    },

    pctExtreme: {
      why: ["Aylık gelire göre aşırı pahalı."],
      tradeoffs: ["Dürtüsel kararın en çok can yaktığı yer burası."],
      next: ["Güçlü öneri: dur, alternatifleri kıyasla, çok daha iyi bir fırsatı bekle."]
    }
  },

  outcomes: {
    buy:  { label: "AL",     headline: "Almak mantıklı görünüyor.", tone: "Büyük bir kırmızı bayrak yok. Keyfini çıkar — bilinçli şekilde." },
    wait: { label: "BEKLE",  headline: "Biraz bekle.",             tone: "Kararın kötü değil ama zaman para ve pişmanlık kazandırabilir." },
    bye:  { label: "VAZGEÇ", headline: "Şimdilik pas geç.",        tone: "Senin tarafındayız — bu karar cüzdanın ya da gelecekteki sen için riskli görünüyor." }
  }
};
