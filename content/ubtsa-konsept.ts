/**
 * "Weiterbildung ve İş Birliği Konsepti" içeriği. Metin DEĞİŞTİRİLMEDEN, konu
 * akışına göre bölümlere ve maddelere ayrılmıştır.
 *
 * BU DOSYA /ubtsa'nın TEK kaynağıdır. İçerik hiçbir HTML/markdown dosyasından
 * runtime'da okunmaz — sayfa yalnızca buradaki veriyi render eder. İlk
 * dökümün geldiği HTML `docs/archive/root-files/weiterbildung_isbirligi.html`
 * altında arşivdedir ve artık kaynak değildir; metin düzeltmesi buraya yapılır.
 *
 * Her maddenin `key` alanı stabildir (`b{bölüm}-m{madde}`) ve veritabanındaki
 * yorumların (`ubtsa_comments.item_key`) bağlandığı anahtardır. Bir maddenin
 * metnini düzeltmek serbesttir; ANAHTARINI değiştirmek o maddenin yorumlarını
 * öksüz bırakır — madde silinecekse yorumları da bilinçli olarak temizle.
 */

export interface UbtsaItem {
  /** Stabil yorum anahtarı — asla yeniden numaralandırma. */
  key: string;
  text: string;
}

export interface UbtsaSection {
  /** Kenar çubuğu bağlantısı için anchor id. */
  id: string;
  /** Bölüm numarası (1 tabanlı). */
  number: number;
  title: string;
  /** İçindekiler listesinde gösterilen kısa başlık. */
  navLabel: string;
  items: UbtsaItem[];
}

export const UBTSA_TITLE = "Weiterbildung ve İş Birliği Konsepti";

export const UBTSA_SUBTITLE =
  "Metin, içeriği değiştirilmeden konu akışına göre bölümlendirilmiştir. Her maddenin altına yorum bırakabilirsin.";

export const UBTSA_SECTIONS: readonly UbtsaSection[] = [
  {
    id: "bolum-1",
    number: 1,
    title: "Giriş ve Konseptin Genel Açıklaması",
    navLabel: "Giriş ve Konseptin Genel Açıklaması",
    items: [
      { key: "b1-m1", text: "Merhaba Umut." },
      { key: "b1-m2", text: "Şöyle bir erkenden mesaj göndereyim dedim de sana." },
      { key: "b1-m3", text: "Daha sonra akşamüstü unutmayayım." },
      { key: "b1-m4", text: "Zaten bizimkisi de yılan hikayesine dönüştü." },
      { key: "b1-m5", text: "Bugün, yarın görüşeceğiz diye." },
      { key: "b1-m6", text: "Şimdi zaten konsept çok basit." },
      { key: "b1-m7", text: "Biraz bahsetmiştim." },
      { key: "b1-m8", text: "Ben senin web siteni görmüştüm." },
      {
        key: "b1-m9",
        text: "Orada Almanya'dan gelen Türk arkadaşlara yardımcı olduğunu gördüm web sitesinde."
      },
      {
        key: "b1-m10",
        text: "Bunlar yeni gelenler olsun, birkaç seneden beri orada yaşayanlar olsun vs."
      },
      { key: "b1-m11", text: "Şimdi bizim, benim konseptime uyan bölüm ise şu:" },
      {
        key: "b1-m12",
        text: "Bu arkadaşların arasında gerek job center, gerek agentür ve arbayta kayıtlı olanlar varsa yani işsiz olanlar varsa,"
      },
      {
        key: "b1-m13",
        text: "şu anda yaptıkları işten memnun değillerse ve onu değiştirmek istiyorlarsa,"
      },
      {
        key: "b1-m14",
        text: "başka yeni bir şey öğrenmek istiyorlarsa biz ona \"Vitabiner\" diyoruz biliyorsun."
      },
      {
        key: "b1-m15",
        text: "onu Job Center veya Agentur für Arbeit üzerinden yapabiliyorlar."
      },
      { key: "b1-m16", text: "Hem de bedava yapabiliyorlar." },
      {
        key: "b1-m17",
        text: "Yani yeni bir şey öğreniyorlar, yeni bir meslek öğreniyorlar vs."
      },
      { key: "b1-m18", text: "Bunu bedavaya yapabiliyorlar." }
    ]
  },
  {
    id: "bolum-2",
    number: 2,
    title: "Vermittlungsgutschein veya Bildungsgutschein Şartı",
    navLabel: "Gutschein Şartı",
    items: [
      {
        key: "b2-m1",
        text: "Tabi bunun karşılığında Job Center'dan o Zahberberte dediğimiz kişiden Vermittungsgutschein veya Bildungsgutschein almak şartıyla eğer bunu alırlarsa o zaman buraya katılmaya hak kazanıyorlar."
      },
      { key: "b2-m2", text: "Benim bu konuda çalıştığım değişik firmalar var." },
      {
        key: "b2-m3",
        text: "Bir tanesinde böyle bir Vita Bildung 4 ila 6-7 hafta arasında sürebiliyor."
      },
      {
        key: "b2-m4",
        text: "Burada tabii ki yeni bir meslek öğrenmek, öğrenmenin dışında bir de ona yani firmalara nasıl yazışma yaparsın, nasıl şey gönderirsin, beraber gönderirsin falan vesaire nasıl daha etkili bir şekilde bunu yaparsın, bunu da gösteriyorlar."
      },
      {
        key: "b2-m5",
        text: "Aynı zamanda da iş bulma konusunda bir miktar yardımcı olabiliyorlar."
      }
    ]
  },
  {
    id: "bolum-3",
    number: 3,
    title: "Kendi İşini Kurmak İsteyenlere Sağlanan Destek",
    navLabel: "Kendi İşini Kurma Desteği",
    items: [
      {
        key: "b3-m1",
        text: "Onun dışında bir de kendini SEP işlemlik yapmak isteyen yani kendi iş yerini açmak isteyen arkadaşlara da yardımcı olunabiliyor."
      },
      {
        key: "b3-m2",
        text: "Bunun için yine Job Center'dan bir Vermittus kurşun alınıyor SEP işlemlik üzerine."
      },
      {
        key: "b3-m3",
        text: "Bu SEP işlemlik yapacak arkadaşlar yalnız şunu da yapmak zorundalar."
      },
      { key: "b3-m4", text: "Bu şeyin içerisinde, Vita Bill'in içerisinde." }
    ]
  },
  {
    id: "bolum-4",
    number: 4,
    title: "Birinci Seçenek: Yeni Bir Meslek Öğrenmek",
    navLabel: "Yeni Bir Meslek Öğrenmek",
    items: [
      { key: "b4-m1", text: "Şimdi birincisini anlattım." },
      { key: "b4-m2", text: "Birincisi meslek yapmak üzerine." },
      {
        key: "b4-m3",
        text: "Yani bu bulunduğu meslekten sağlık sorunları, psikolojik nedenler vesaire ötürü bunu yapmak istemeyen, meslek değiştirmek isteyen arkadaşlar başka bir meslek öğrenebiliyor."
      },
      { key: "b4-m4", text: "Bu bir." }
    ]
  },
  {
    id: "bolum-5",
    number: 5,
    title: "İkinci Seçenek: Kendi İşini Kurmak",
    navLabel: "Kendi İşini Kurmak",
    items: [
      {
        key: "b5-m1",
        text: "İkincisi kendi işini yapmak isteyen arkadaşlar yani sahip işlemek olmak isteyen arkadaşlar."
      },
      {
        key: "b5-m2",
        text: "Bunlar da ilk etapta Job Center veya Agentur für Arbeitten o feminist kuşağını aldıktan sonra bu Bu firmalarda başladıklarında biz onlara billiustere gidiyoruz."
      },
      {
        key: "b5-m3",
        text: "Burada başladıklarında ilk önce bir business plan yapmayı öğreniyorlar."
      },
      { key: "b5-m4", text: "Finance plan yapmayı öğreniyorlar." },
      {
        key: "b5-m5",
        text: "Ondan sonra onun akabinde onların yapacağı işin tutarlı olup olmadığına o firma karar veriyor."
      },
      { key: "b5-m6", text: "Yani o White Abbey'in yaptıkları firma karar veriyor." },
      {
        key: "b5-m7",
        text: "Onun akabinde de eğer track face guide dediğimiz o yazılı belgeyi yani bu iş yürür ve bu kişi bu işi yapabilir adlı belgeyi alabilirse o zaman bunu alıp tekrar job center'a ve agent de fabrika götürüyor."
      },
      {
        key: "b5-m8",
        text: "Bu her ikisinden birisi de nereye kayıtlıysa onlara bu konuda nasıl söyleyeyim, maddi olanaklar sağlıyor."
      }
    ]
  },
  {
    id: "bolum-6",
    number: 6,
    title: "Çilingircilik Üzerinden Verilen Kişisel Örnek",
    navLabel: "Çilingircilik Örneği",
    items: [
      { key: "b6-m1", text: "Mesela diyelim ki, mesela ben kendimden örnek vereyim istersen." },
      { key: "b6-m2", text: "Ben 15 sene önce böyle bir şey yapmıştım." },
      { key: "b6-m3", text: "O zamanlar bir senenin üstünde işsizdim." },
      {
        key: "b6-m4",
        text: "Bir tanıdığım bir arkadaş vardı, uzun süre görüşmediğim birkaç sene."
      },
      {
        key: "b6-m5",
        text: "Sonra bir gün böyle, benim o zamanki eşim, eski eşim, kapıyı çekerken, dış kapıyı, anahtarı içeride unutmuş."
      },
      { key: "b6-m6", text: "Neyse, çilingirci çağırdık." },
      { key: "b6-m7", text: "Ondan sonra Amel'le şu üstü de istiyorlar biliyorsun." },
      { key: "b6-m8", text: "Çilingirci geldi ama kim geldi?" },
      { key: "b6-m9", text: "Benim o arkadaş geldi." },
      { key: "b6-m10", text: "Ben de şaşırdım." },
      { key: "b6-m11", text: "O da şaşırdı falan." },
      { key: "b6-m12", text: "Nasıl oldu diye böyle." },
      {
        key: "b6-m13",
        text: "Ondan sonra ben o kapıyı açtıktan sonra ben tabii ki biraz konuyla ilgilendiğim için sordum."
      },
      { key: "b6-m14", text: "Ya bu nedir?" },
      { key: "b6-m15", text: "Ne yapıyorsun?" },
      { key: "b6-m16", text: "Ne kadar kazanıyorsun?" },
      {
        key: "b6-m17",
        text: "Dedi ya ben bir seneden beri bu işi yapıyorum dedi içine gireceğim dedi vesaire peki nasıl oldu falan ben dedi arbaşsatma üzerinden yaptım dedi tamam güzel şu anda ben de arbaşsatmayım tabii bana işin detaylarını falan anlattı biraz biraz da gösterdi nasıl yapıldığını falan gösterdi bu iş için sana ausbildung yani meslek lazım değil dedi eğer senin El becerim varsa bunu yapabiliyorsan bir türlü bir yerde kursta mursta veya benim gibi arkadaşların öğrendiysem bunu yapabilirsin dedi."
      },
      { key: "b6-m18", text: "O da çok güzel." }
    ]
  },
  {
    id: "bolum-7",
    number: 7,
    title: "Job Center'a Başvuru Süreci",
    navLabel: "Job Center Başvurusu",
    items: [
      { key: "b7-m1", text: "Neyse ben Arbastelant'a gittim." },
      { key: "b7-m2", text: "Dedim ben çilingircilik yapmak istiyorum dedim." },
      { key: "b7-m3", text: "Sayfıştanlık olarak falan." },
      {
        key: "b7-m4",
        text: "Zahper Bart'ı önce bir şaşırdı tabii ama ondan sonra dedi bu konuda bana nasıl bir referans verebilirsin dedi."
      },
      { key: "b7-m5", text: "Benim mesleğim otelcilikti aslında." },
      { key: "b7-m6", text: "Otelcilik mesleği öğrenmiştim Almanya'da." },
      { key: "b7-m7", text: "Ama babam marangozdu Türkiye'den." },
      { key: "b7-m8", text: "Dedem marangoz, bizim ailem marangoz." },
      {
        key: "b7-m9",
        text: "Dedim işte böyle benim babam marangozdur, dedem marangozdur, ben de biraz öğrenmişimdir, el yatkınlığım vardır falan diye."
      },
      { key: "b7-m10", text: "Neyse bana bir şekilde feminist kutuşağını verdi." },
      {
        key: "b7-m11",
        text: "Ben bu feminist kutuşağını işte o bildiğimiz yere gittim."
      },
      { key: "b7-m12", text: "Onlara bunu verdim, feminist kutuşağını." },
      { key: "b7-m13", text: "O şaynı onlara veriyorsun." },
      {
        key: "b7-m14",
        text: "O zaman onlar diyor ki tamam sen o zaman burada, sebep işlemli şikayet üzerine yapmak istediğin konu üzerine bizden 6 hafta boyunca, o zamanlar biraz daha uzundu, benim yaptığım zamanlar 15 sene önce."
      },
      { key: "b7-m15", text: "2 ay üzerinden gidiyorduk biz ama şu anda kısaldı." },
      { key: "b7-m16", text: "Şu anda mesela 5-6 haftada bitirebiliyorsun bunu." }
    ]
  },
  {
    id: "bolum-8",
    number: 8,
    title: "Business Plan ve Finance Plan Eğitimi",
    navLabel: "Business ve Finance Plan",
    items: [
      {
        key: "b8-m1",
        text: "Neyse orada işte sana kendi işlerini açacağın için business plan nasıl yapılır, nelere dikkat etmek gerekir, finance plan nasıl yapılır, nelere dikkat etmek gerekir."
      },
      {
        key: "b8-m2",
        text: "Ondan sonra bir de o altı hafta içerisinde sana bazı testler veriyorlar, şunu yapıyorlar, bunu yapıyorlar."
      },
      {
        key: "b8-m3",
        text: "Altı hafta sonunda senden bizzat kendin business planı hazırlamanı, finans planı hazırlamanı istiyorlar."
      },
      { key: "b8-m4", text: "Bunun içerisinde tabi çok detay var." },
      {
        key: "b8-m5",
        text: "Yani reklam nasıl yapılır falan da tut, müşteriye nasıl davranılır falan hepsi bunlar içerisinde."
      },
      {
        key: "b8-m6",
        text: "Ondan sonra sana sonunda diyorlar ki tamam sen testi geçtin Senin seçtiğin bu konuda şu anda burada yani çalışmak istediğin alan bu şehirde, şurada, burada mümkündür."
      },
      {
        key: "b8-m7",
        text: "Çok fazla konkurense yani ne bileyim yarış, seninle yarış halinde olan firma çok fazla yok falan dedikten sonra sana o track, fish, kite, beşerliğinin veriyorlar."
      }
    ]
  },
  {
    id: "bolum-9",
    number: 9,
    title: "Başlangıç Sermayesi ve Maddi Destekler",
    navLabel: "Maddi Destekler",
    items: [
      { key: "b9-m1", text: "Sana onunla gidiyorsun." },
      {
        key: "b9-m2",
        text: "Dediğim gibi job center'a veya neredeyse kayıtlıyorsan, gönül tufağı, abart."
      },
      {
        key: "b9-m3",
        text: "Orada mesela sana soruyorlar ki tamam sen bu işe başlarken ne kadar para ihtiyacım var?"
      },
      {
        key: "b9-m4",
        text: "Sen de diyorsun ki işte ne bileyim bu materyaller lazım, şu lazım, bu lazım."
      },
      { key: "b9-m5", text: "Bana bir 5000 Euro lazım." },
      { key: "b9-m6", text: "Tamam diyorlar sana bu parayı göndereceğiz." },
      {
        key: "b9-m7",
        text: "Ama sen her bunları satın aldığında bize işte satın alma belgesini göndermen lazım."
      },
      { key: "b9-m8", text: "Tamam güzel." },
      { key: "b9-m9", text: "Ve bunun yanında aylık olarak hala sana desteklerini veriyorlar." },
      { key: "b9-m10", text: "Yani ne bileyim kira yardımın olsun, şu olsun, bu olsun." },
      { key: "b9-m11", text: "Bir altı ay onu devam ediyorlar." },
      { key: "b9-m12", text: "Yani konsept bu şekilde ilerliyor." }
    ]
  },
  {
    id: "bolum-10",
    number: 10,
    title: "Eğitim Sonrası İş Bulma ve Başvuru Desteği",
    navLabel: "İş Bulma ve Başvuru Desteği",
    items: [
      {
        key: "b10-m1",
        text: "Sahip işlenmek olursan, meslek yaparsan, birinci bölümde anlatmıştım zaten."
      },
      { key: "b10-m2", text: "Sen altı, yedi hafta içerisinde mesleğini yapıyorsun." },
      {
        key: "b10-m3",
        text: "Ondan sonra Dediğim gibi sana bir miktar belki iş bulma konusunda yardımcı olabilirler ama zaten sen yeni bir meslek yaptığın için firmalara, yazışmalarına falan yapıyorsun."
      },
      {
        key: "b10-m4",
        text: "O yazışma konusunda işte Beberbunk, Bebanskreis 5 dediğimiz olaylarda da zaten sana en baştan yardımcı oluyorlar."
      },
      {
        key: "b10-m5",
        text: "Sana bunları bu şekilde detaylı anlatıyorum ki yani şu anda kafanda belki o şekilde tanıdığın insanlar vardır, çalışmıyorlardır, işte ne bileyim mesleklerine hoşnut değillerdir falan."
      },
      {
        key: "b10-m6",
        text: "Neyi nasıl detaylı bir şekilde nasıl yapabilirleri anlatmak istiyorum."
      },
      { key: "b10-m7", text: "Yani sana sorarlarsa ya bu işin arka planı nedir?" },
      { key: "b10-m8", text: "Sen de onları bu şekilde anlatabilirsin diyorum." }
    ]
  },
  {
    id: "bolum-11",
    number: 11,
    title: "Vermittlungsgutschein ile Yapılabilen Programlar",
    navLabel: "Vermittlungsgutschein",
    items: [
      { key: "b11-m1", text: "Başka bir yöntem daha var." },
      { key: "b11-m2", text: "Şimdi bu anlattığım yöntem, Famittus Gutschein içindi." },
      {
        key: "b11-m3",
        text: "Bu Famittus Gutschein ile bunları yapabiliyorsun 6-7 hafta içerisinde, takriben."
      }
    ]
  },
  {
    id: "bolum-12",
    number: 12,
    title: "Bildungsgutschein ve Cyber Security Eğitimi",
    navLabel: "Cyber Security Eğitimi",
    items: [
      { key: "b12-m1", text: "Şimdi bir de Billus Gutschein diye bir şey var." },
      { key: "b12-m2", text: "Bu biraz daha kapsamlı." },
      {
        key: "b12-m3",
        text: "Mesela şu anda benim elimde Cyber Security diye bir VitaBulum var."
      },
      { key: "b12-m4", text: "Sadece bunu bir firma sunuyor Almanya'da." },
      {
        key: "b12-m5",
        text: "Ve Almanya çapında da bu dalda çok fazla insan aranıyor şu anda."
      },
      { key: "b12-m6", text: "çalışmak için ve parası da çok güzel yani." },
      { key: "b12-m7", text: "White Abilene'den sonra." },
      {
        key: "b12-m8",
        text: "Bu en az 6 ay en fazla da 12 veya 15 ay süren bir White Abilene."
      },
      {
        key: "b12-m9",
        text: "Burada Cyber Security zaten düşünebilirsiniz neler olduğunu."
      },
      {
        key: "b12-m10",
        text: "Yani İnternet alanında internetle güvenlik alanıyla ilgili konularda işte bu arkadaşlar eğitim alıyorlar."
      }
    ]
  },
  {
    id: "bolum-13",
    number: 13,
    title: "Cyber Security Eğitiminin Ön Koşulları",
    navLabel: "Ön Koşullar",
    items: [
      {
        key: "b13-m1",
        text: "Tabi IT bilgisi olması lazım biraz bunların yani hiç IT bilgisi olmadan da buraya girmek pek akıl işi değil."
      },
      { key: "b13-m2", text: "Bir miktar bilmeleri lazım." },
      {
        key: "b13-m3",
        text: "En azından yani network nedir ne bileyim işte yani Böyle normal bilgisayar kullanması falan."
      },
      { key: "b13-m4", text: "Bunlardan biraz anlaması lazım bu kişilerin." },
      { key: "b13-m5", text: "Bunu yapmak isteyenlerin." }
    ]
  },
  {
    id: "bolum-14",
    number: 14,
    title: "Modüller ve Eğitmenler",
    navLabel: "Modüller ve Eğitmenler",
    items: [
      { key: "b14-m1", text: "Orada da mesela iki modül." },
      { key: "b14-m2", text: "Yani orada modüller var." },
      { key: "b14-m3", text: "Bir modül var." },
      { key: "b14-m4", text: "Onun yanına bir modül daha ekleyebilirsin." },
      { key: "b14-m5", text: "Biraz kapsamlı." },
      {
        key: "b14-m6",
        text: "Yani o konuda hangi eğitimi almak istiyorsan modülleri ekleyebiliyorsun."
      },
      { key: "b14-m7", text: "Veya tek bir modülle kalabiliyorsun." },
      { key: "b14-m8", text: "Bu firmada istihbarat şeyleri bile ne derler ona?" },
      {
        key: "b14-m9",
        text: "Devletin istihbarattan görevlendirdiği kişiler bile eğitim veriyorlar bu firmada."
      },
      { key: "b14-m10", text: "O yüzden çok ilginç." },
      { key: "b14-m11", text: "Gerçekten de sağlam bir emniyet mesleği bu." }
    ]
  },
  {
    id: "bolum-15",
    number: 15,
    title: "Laptop Hediyesi ve Motivasyon Teklifi",
    navLabel: "Laptop Hediyesi",
    items: [
      {
        key: "b15-m1",
        text: "İşte böyle bir insanların ilgisini çekmek için de şöyle bir teklif yapıyorlar mesela."
      },
      {
        key: "b15-m2",
        text: "İki modül alana yani iki modül öğrenmek isteyen iki modülü öğrenip bitiren VitaBildung'u bir tane laptop hediye ediyoruz falan diyorlar mesela insanları biraz böyle motive etmek için."
      },
      { key: "b15-m3", text: "Bu mesela Billions Goods şahane olan bir VitaBildung." },
      { key: "b15-m4", text: "Bu da çok değişik bir şey." },
      { key: "b15-m5", text: "Şu anda da çok aranan bir meslekte." },
      {
        key: "b15-m6",
        text: "O yüzden bunu da mesela ilgilenen arkadaşlar olursa IT bölümünde bunu da sunabiliriz."
      }
    ]
  },
  {
    id: "bolum-16",
    number: 16,
    title: "Olası İş Birliği Modeli",
    navLabel: "İş Birliği Modeli",
    items: [
      { key: "b16-m1", text: "Peki yani bizim çalışmamız bu konuda nasıl olabilir?" },
      {
        key: "b16-m2",
        text: "İşte sen böyle işsiz olup gerek Job Center'da gerek Agentur ve Arbeit'ta işsiz olup yeni bir meslek öğrenmek isteyen, kendini self-staging yapmak isteyen veya daha kapsamlı bir \"Billong\" dediğimiz işle yapmak isteyen arkadaşlara bu şekilde yönlendirebilirsin."
      },
      { key: "b16-m3", text: "Senin çok fazla vakit harcamana gerek yok." },
      {
        key: "b16-m4",
        text: "Eğer bu kafa yapısında olan arkadaşlar varsa direkt bana yönlendirip, bir miktar anlatıp kafalarına yeterse bana yönlendirip geri kısmını ben alabilirim."
      }
    ]
  },
  {
    id: "bolum-17",
    number: 17,
    title: "Başvuru ve Gutschein Alma Konusunda Verilecek Destek",
    navLabel: "Başvuru Desteği",
    items: [
      { key: "b17-m1", text: "Arkadaşları işte Job Center'a yönlendiririm." },
      { key: "b17-m2", text: "Agentürfe Haber'te yönlendiririm." },
      {
        key: "b17-m3",
        text: "Onların o feminist kutuşağını ve bildiğiniz kutuşağını almalarını sağlayabilirim."
      },
      {
        key: "b17-m4",
        text: "Çünkü benim elime böyle Hazır ilmi programları falan var, yazışmalar var."
      },
      { key: "b17-m5", text: "Onları kendilerine veririm." },
      { key: "b17-m6", text: "Onlar zaten onu ZAHR abartılarına gönderiyorlar." },
      { key: "b17-m7", text: "%50, %60 falan kabul ediliyor." },
      {
        key: "b17-m8",
        text: "Bazen ikinci görüşmede, birinci görüşmede red olsa bile ikinci görüşmede kabul edilebiliyor."
      },
      {
        key: "b17-m9",
        text: "Ondan sonra arkadaşlar bu shine'ları aldıktan sonra write'e bölümlerine başlıyorlar."
      }
    ]
  },
  {
    id: "bolum-18",
    number: 18,
    title: "Yönlendirme Başına Kazanç Modeli",
    navLabel: "Kazanç Modeli",
    items: [
      {
        key: "b18-m1",
        text: "Whiteaburling'e başladıktan 4 hafta sonra da biz buradan tabii ki gelir elde ediyoruz."
      },
      {
        key: "b18-m2",
        text: "Şöyle diyeyim, yani senin mesela bana tavsiye edip Whiteaburling'e giden arkadaşlar, olursa sen hemen hemen hiçbir şey yapmadan kişi başına 500 euro alabiliyorsun."
      },
      {
        key: "b18-m3",
        text: "Yani söylediğim haftada bir kişi olursa ayda 2000 euro falan eder bir ek kazanç."
      },
      { key: "b18-m4", text: "Güzel bir ek kazanç olabilir senin için bu." },
      { key: "b18-m5", text: "Bu şekilde ilerleyebiliriz eğer senin ilgini çekiyorsa." }
    ]
  },
  {
    id: "bolum-19",
    number: 19,
    title: "Sorular ve Yeniden Görüşme Önerisi",
    navLabel: "Sorular ve Görüşme",
    items: [
      {
        key: "b19-m1",
        text: "Daha başka sorularım varsa benim şu anda pek cevaplayamadığım, tabii sorabilirsin tekrar onları cevaplayabilirim."
      },
      {
        key: "b19-m2",
        text: "Veya başka bir uygun zamanlar, inşallah yani, ikimizin de uygun olduğu bir zaman olursa, o zaman tekrar bir camla görüşme yaparız."
      },
      {
        key: "b19-m3",
        text: "O zaman tekrar bir durumu genel olarak değerlendiririz neler yapabiliriz diye."
      },
      { key: "b19-m4", text: "Benim anlatabileceklerim bu konuda bu kadar." },
      { key: "b19-m5", text: "Çünkü çok da fazla bir detay yok." }
    ]
  },
  {
    id: "bolum-20",
    number: 20,
    title: "Hedef Kitle ve Çevredeki Kişilere Ulaşılması",
    navLabel: "Hedef Kitle",
    items: [
      {
        key: "b20-m1",
        text: "Sonuçta bu şu anda işsiz olan arkadaşlara bağlı veya senin çevrene bağlı diyeyim."
      },
      {
        key: "b20-m2",
        text: "Ne kadar çok fazla o kişilerle haşır neşir oluyorsun bilemiyorum tabii ki."
      },
      {
        key: "b20-m3",
        text: "Ama yani sen bu işi yapıyorsan yani Türkiye'den gelen arkadaşlara bu şekilde yardımcı olabiliyorsan sanırım ki herhalde böyle bir 3-4 sene, 5 sene burada olup da onların aralarında işsiz olan arkadaşlar varsa onlardan mesela onlara bu bilgileri sunabiliriz."
      },
      { key: "b20-m4", text: "Daha sonra da yardımcı olabiliriz." }
    ]
  },
  {
    id: "bolum-21",
    number: 21,
    title: "Kapanış",
    navLabel: "Kapanış",
    items: [
      {
        key: "b21-m1",
        text: "Peki dediğim gibi daha sonra eğer soruların varsa sorabilirsin cevaplarım veya işte uygun zamanda tekrar görüşürüz."
      },
      { key: "b21-m2", text: "İnşallah bir şeyler yapabiliriz." },
      { key: "b21-m3", text: "Teşekkürler, kolay gelsin sana." },
      { key: "b21-m4", text: "İyi günler." }
    ]
  }
] as const;

/** Toplam madde sayısı — başlıkta/rozette gösterilir. */
export const UBTSA_ITEM_COUNT = UBTSA_SECTIONS.reduce(
  (total, section) => total + section.items.length,
  0
);

/**
 * Yorumlanabilir "not" maddesi — özet, sorular ve insan modeli bölümlerinin
 * ortak şekli, hepsi aynı bileşenle basılabilsin diye. `detail` boş
 * bırakılabilir; doluysa başlığın altında daha soluk bir açıklama olarak
 * çıkar. Anahtarlar madde anahtarlarıyla aynı isim alanını paylaşır (`b*-m*`
 * maddeler, `o*` özet, `s*` sorular, `p*` insan modeli) ve çakışmaz.
 */
export interface UbtsaNote {
  /** Stabil yorum anahtarı — asla yeniden numaralandırma. */
  key: string;
  /** Maddenin kendisi: özet cümlesi, soru ya da profil şartı. */
  title: string;
  /** Neden önemli olduğu — cevabın veya şartın neyi güvenceye aldığı. */
  detail?: string;
}

export const UBTSA_QUESTIONS_TITLE = "UBT'nin Soruları";

export const UBTSA_QUESTIONS_INTRO =
  "Konsept bir ses kaydından çıkarılmış metne dayanıyor ve kayıtta kilit terimler bozuk geçiyor (\"Vitabiner\", \"feminist kuşağı\", \"White Abilene\", \"track face guide\"). Bu yüzden aşağıdaki soruların cevapları sözlü değil, yazılı olarak isteniyor. Her sorunun altına yorum bırakabilirsin.";

/**
 * UBT'nin, işi kabul etmeden önce karşı tarafa sorması gereken sorular.
 * Konseptin tamamı okunarak çıkarıldı ve bilerek "garantici" tutuldu: her
 * biri, sözlü verilen bir vaadi yazılı ve doğrulanabilir bir taahhüde
 * çevirmeyi hedefliyor.
 */
export const UBTSA_QUESTIONS: readonly UbtsaNote[] = [
  {
    key: "s1",
    title:
      "Kişi başına ödenecek 500 €'nun hukuki dayanağı ne, sözleşmede hangi hizmetin karşılığı olarak geçecek?",
    detail: "Gutschein'lı katılımcı getiren üçüncü kişiye kişi başı prim ödenmesi, eğitim kurumunun AZAV onayı ve rekabet mevzuatı açısından tartışmalı bir alan. Ödemenin adı, dayanağı ve karşılığındaki hizmet tanımı yazılı olmalı ki ileride \"aracılık primi\" tartışması çıktığında elimde belge olsun."
  },
  {
    key: "s2",
    title:
      "Sözleşmeyi kiminle imzalıyorum — seninle mi, eğitim kurumuyla mı? Kurumun tam unvanı, HRB numarası ve AZAV sertifika numarası nedir?",
    detail: "Sertifikayı ve kurumun sicilini kendim doğrulayabilmem lazım; sertifikayı veren fachkundige Stelle ve geçerlilik tarihi de dahil. Karşımdaki taraf şahıs mı tüzel kişi mi, ödeme yükümlüsü kim — bunlar belirsizse alacağımı kime karşı ileri süreceğim de belirsiz."
  },
  {
    key: "s3",
    title:
      "Ödeme tam olarak hangi anda hak ediliyor ve hangi durumlarda geri isteniyor?",
    detail: "\"Başladıktan 4 hafta sonra\" deniyor. Katılımcı 5. haftada bırakırsa, kursu tamamlamazsa ya da Gutschein sonradan iptal edilirse ödeme geri talep edilecek mi? Rückforderung koşulları yazılı değilse, aylar sonra gelen bir geri ödeme talebiyle karşılaşabilirim."
  },
  {
    key: "s4",
    title:
      "Bugüne kadar kaç kişi yönlendirildi; kaçı Gutschein aldı, kaçı kursu bitirdi, kaçı iş buldu? Aynı işi yapan bir partnerle konuşabilir miyim?",
    detail: "\"Haftada bir kişi olursa ayda 2000 €\" bir varsayım, veri değil. Gerçek dönüşüm oranını görmeden kendi çevreme hangi sıklıkta ve hangi beklentiyle yaklaşacağımı planlayamam. Bağımsız bir referans, anlatılanın tek kaynaktan doğrulanmasını sağlar."
  },
  {
    key: "s5",
    title:
      "Yönlendireceğim kişilerin verisini hangi hukuki zeminde aktaracağım; aramızda veri işleme sözleşmesi ve katılımcıdan açık rıza metni olacak mı?",
    detail: "Aktarılacak bilgi sadece isim değil: işsizlik durumu, hatta konseptte geçtiği gibi sağlık ve psikolojik nedenlerle meslek değiştirme isteği. Bunlar DSGVO'da özel kategori veri. Rıza metni ve sözleşme yoksa ihlalin muhatabı doğrudan ben olurum."
  },
  {
    key: "s6",
    title:
      "Başvurusu reddedilen %40-50'lik kesim için yazılı bir akış var mı; ikinci görüşmede de red alan kişiye ne söyleyeceğim?",
    detail: "Kabul oranı %50-60 olarak veriliyor. Reddedilenler benim tavsiyemle Job Center'a gitmiş olacak ve sonucu bana dönecek. Bu kişilere sunulacak net bir plan yoksa, kaybedeceğim şey komisyon değil, o çevredeki itibarım."
  },
  {
    key: "s7",
    title:
      "Cyber Security programının sonunda katılımcı hangi belgeyi alıyor; son 12 ayın mezun sayısı ve işe yerleşme oranı nedir?",
    detail: "Kurum içi bir katılım belgesi ile akredite bir sertifika arasında iş piyasasında ciddi fark var. Ayrıca \"bu dalda çok insan aranıyor\" ve \"devletin istihbarat görevlileri ders veriyor\" ifadeleri doğrulanabilir olmalı — insanları 6-15 ay sürecek bir programa yönlendiriyorum."
  },
  {
    key: "s8",
    title:
      "\"İki modülü bitirene laptop\" teşviki Job Center / Agentur mevzuatıyla uyumlu mu; kurumun bunu gösteren yazılı bir görüşü var mı?",
    detail: "Katılımcıya verilen maddi teşvik, kurum açısından pazarlama olabilir ama katılımcı açısından Gutschein'ın kötüye kullanımı tartışmasına yol açarsa riske giren kişi katılımcı olur. Yönlendiren taraf olarak bu riski bilmeden aktaramam."
  },
  {
    key: "s9",
    title:
      "Bu gelir benim tarafımda neyi tetikliyor — Gewerbe gerekiyor mu, KDV'li mi faturalanacak, mevcut faaliyetimle çakışması var mı?",
    detail: "Düzenli ve kişi başı ödenen bir gelir, arızi kazanç sayılmaz. Ödemenin resmi fatura karşılığı ve banka üzerinden yapılacağını baştan netleştirmek, hem vergi tarafını hem de ilerideki ispat yükünü çözer."
  },
  {
    key: "s10",
    title:
      "Anlaşmanın sınırları ne: münhasırlık veya rekabet yasağı istenecek mi, süre ne kadar, tek taraflı nasıl çıkarım ve çıkınca devam eden yönlendirmelerin ödemesi ne olur?",
    detail: "Konsept \"ilgini çekiyorsa bu şekilde ilerleyebiliriz\" diye bitiyor — yani çerçeve tamamen açık. Süre, münhasırlık ve çıkış koşulları baştan yazılmazsa, işi bırakmak istediğimde hem devam eden yönlendirmelerin ödemesi hem de başka sağlayıcılarla çalışma hakkım tartışmalı hale gelir."
  }
];

export const UBTSA_SUMMARY_TITLE = "Konsept Özeti";

export const UBTSA_SUMMARY_INTRO =
  "Tam metin bir ses kaydının çözümü olduğu için günlük konuşma cümleleriyle ilerliyor. Aşağısı aynı içeriğin karar vermeye yarayacak hâli: 12 maddede konseptin tamamı. Ayrıntı için soldaki İçindekiler'den tam metne geçebilirsin.";

/**
 * Konseptin tamamının genelleştirilmiş özeti. Tam metindeki 166 maddenin
 * içinden iş kararını ilgilendiren bilgi çekilerek yazıldı; sohbet, anı ve
 * tekrar cümleleri elendi. Sırayla teklifin ne olduğu, iki yol, gelir modeli
 * ve açık kalan noktalar.
 */
export const UBTSA_SUMMARY: readonly UbtsaNote[] = [
  {
    key: "o1",
    title:
      "Teklif, Almanya'da Job Center veya Agentur für Arbeit'a kayıtlı işsizleri ücretsiz meslek eğitimine yönlendirmek üzerine.",
    detail:
      "Hedef kitle UBT'nin web sitesi üzerinden ulaştığı, Almanya'daki Türk topluluğu — hem yeni gelenler hem yıllardır orada yaşayanlar."
  },
  {
    key: "o2",
    title:
      "Kapı Gutschein: kişi kendi danışmanından Vermittlungsgutschein veya Bildungsgutschein almak zorunda.",
    detail:
      "Gutschein olmadan katılım yok. Eğitimin bedeli kişiye değil, bu belge üzerinden kuruma ödeniyor."
  },
  {
    key: "o3",
    title:
      "Birinci yol — meslek değiştirme: 4-7 hafta süren kısa program.",
    detail:
      "Mevcut işini sağlık veya psikolojik nedenlerle sürdüremeyen kişi yeni bir alana geçiyor; program ayrıca firmalara nasıl başvurulacağını da öğretiyor."
  },
  {
    key: "o4",
    title:
      "İkinci yol — kendi işini kurma: 5-6 haftalık business ve finance plan eğitimi.",
    detail:
      "Sonunda kişi planı kendi hazırlıyor; kurum işin tutarlı olup olmadığına ve o şehirde rekabet açısından yürüyüp yürümeyeceğine karar veriyor."
  },
  {
    key: "o5",
    title:
      "Kurum olumlu görüş verirse maddi destek devreye giriyor: başlangıç sermayesi ve yaklaşık altı ay aylık destek.",
    detail:
      "Konseptte 5.000 € örneği veriliyor; para harcama belgesi karşılığı ödeniyor, yanında kira gibi kalemler için aylık destek sürüyor."
  },
  {
    key: "o6",
    title:
      "Serkan bu yolu 15 yıl önce kendisi kullanmış: otelcilikten çilingirciliğe geçmiş.",
    detail:
      "El becerisini referans göstererek Gutschein almış. Örneğin asıl anlamı: ausbildung şartı olmayan meslekler bu yola uygun."
  },
  {
    key: "o7",
    title:
      "Bildungsgutschein tarafındaki asıl ürün Cyber Security programı: 6-15 ay, modüler.",
    detail:
      "Tek bir kurum sunuyor; modül eklenerek kapsam genişletilebiliyor, iki modül bitirene laptop gibi teşvikler var."
  },
  {
    key: "o8",
    title:
      "Cyber Security programı IT temeli olmayan kişiye uygun değil.",
    detail:
      "Konseptin kendi ifadesi: hiç IT bilgisi olmadan girmek akıl işi değil; en azından network ve temel bilgisayar kullanımı bilinmeli."
  },
  {
    key: "o9",
    title:
      "UBT'den beklenen rol dar: uygun profilleri tespit edip yönlendirmek.",
    detail:
      "Başvuru, Gutschein alma ve kurumla ilişki Serkan'da. Konseptin ifadesiyle \"senin çok fazla vakit harcamana gerek yok\"."
  },
  {
    key: "o10",
    title:
      "Serkan başvuru için hazır materyal sağlıyor ve kabul oranını %50-60 veriyor.",
    detail:
      "Birinci görüşmede red alan bazı kişilerin ikinci görüşmede kabul edildiği söyleniyor. Yani yönlendirilen herkesin girmesi beklenmiyor."
  },
  {
    key: "o11",
    title:
      "Gelir modeli: kişi eğitime başladıktan 4 hafta sonra kişi başı 500 €.",
    detail:
      "Konseptte \"haftada bir kişi olursa ayda ~2.000 € ek gelir\" örneği veriliyor. Bu bir hedef, geçmiş veri değil."
  },
  {
    key: "o12",
    title:
      "Anlaşmanın çerçevesi henüz tamamen açık.",
    detail:
      "Süre, münhasırlık, ödeme koşulları, sözleşmenin tarafı ve komisyonun hukuki dayanağı konuşulmamış. Konsept \"ilgini çekiyorsa bu şekilde ilerleyebiliriz\" diye bitiyor."
  }
];

export const UBTSA_PERSONA_TITLE = "UBT'nin Önerebileceği İnsan Modeli";

export const UBTSA_PERSONA_INTRO =
  "Konseptin tamamından çıkarılan uygun aday profili. İlk sekiz madde doğrudan metinde geçen şartlardan; son iki madde metinde hiç konuşulmayan ama Gutschein sürecinde belirleyici olan iki eksik. Yanlış kişiyi yönlendirmenin maliyeti komisyon değil, o çevredeki itibar.";

/**
 * Yönlendirilecek kişi profili. Sıra kasıtlı: önce elemeyi yapan zorunlu
 * şartlar, sonra hangi programa kimin uyduğu, en sonda konseptte hiç
 * geçmeyen ama pratikte süreci bitiren iki koşul.
 */
export const UBTSA_PERSONA: readonly UbtsaNote[] = [
  {
    key: "p1",
    title:
      "Job Center veya Agentur für Arbeit'a kayıtlı ve şu anda işsiz olmalı.",
    detail:
      "Bu, tartışmasız ön şart. Çalışan biri — işinden ne kadar memnunsuz olursa olsun — bu kapsamda değil, boşuna yönlendirilmemeli."
  },
  {
    key: "p2",
    title:
      "Meslek değiştirmek için somut ve anlatılabilir bir gerekçesi olmalı.",
    detail:
      "Sağlık sorunu, fiziksel olarak sürdürülemeyen iş, psikolojik nedenler. Gutschein'ı veren danışmanı ikna eden şey bu gerekçe; \"canım istemiyor\" ile Gutschein çıkmıyor."
  },
  {
    key: "p3",
    title:
      "Danışmanıyla ilişkisini yürütebilen, randevusuna giden, süreci takip eden biri olmalı.",
    detail:
      "Kabul oranı %50-60 ve bazen ikinci görüşmede çıkıyor. Yani ilk redde pes etmeyecek, evrakını takip edecek kişi lazım."
  },
  {
    key: "p4",
    title:
      "El becerisi olup ausbildung'u olmayanlar en uygun grup.",
    detail:
      "Çilingircilik örneğinin gösterdiği tam olarak bu: ausbildung şartı olmayan mesleklerde, aile mesleği veya pratik tecrübe referans olarak kullanılabiliyor."
  },
  {
    key: "p5",
    title:
      "Kendi işini kurma yolu için: plan yazabilecek ve riski taşıyabilecek kişi.",
    detail:
      "6 hafta sonunda business ve finance planı kendisi hazırlayacak, iş fikri o şehirde rekabet değerlendirmesinden geçecek. Fikri olmayan kişi bu yola sokulmamalı."
  },
  {
    key: "p6",
    title:
      "Cyber Security programı için: en az temel IT bilgisi olan kişi.",
    detail:
      "Network nedir bilen, bilgisayarı rahat kullanan. Sıfırdan giren kişi 6-15 ayını riske atar — bu, konseptin kendi uyarısı."
  },
  {
    key: "p7",
    title:
      "Uzun programlar için hayat şartları 6-15 ay boyunca müsait olmalı.",
    detail:
      "Gutschein süresince destek devam ediyor ama aile, çocuk ve geçim yükü programa devamı fiilen imkânsız kılıyorsa kişi yarıda bırakır — bu hem onun hem yönlendirenin kaybı."
  },
  {
    key: "p8",
    title:
      "Beklentisi gerçekçi olmalı: bu bir meslek değiştirme programı, hediye kampanyası değil.",
    detail:
      "\"Bedava kurs + laptop\" beklentisiyle gelen kişi ilk zorlukta bırakır. Motivasyonu iş değiştirmek olan kişi aranıyor."
  },
  {
    key: "p9",
    title:
      "Almanca seviyesi eğitimi takip etmeye yetmeli — konseptte hiç konuşulmayan konu.",
    detail:
      "6-15 aylık teknik bir eğitim Almanca veriliyor. B1 altı bir seviyeyle programa giren kişi büyük olasılıkla tamamlayamaz. Yönlendirmeden önce sorulması gereken ilk şeylerden biri, ama teklifte hiç geçmiyor."
  },
  {
    key: "p10",
    title:
      "İkamet ve çalışma statüsü oturmuş olmalı — bu da konseptte geçmiyor.",
    detail:
      "Job Center kaydı ve Gutschein hakkı, kişinin oturum ve çalışma iznine bağlı. \"Yeni gelenler\" hedef kitlede sayılıyor ama yeni gelen herkesin bu hakkı yok; statü teyit edilmeden yönlendirme yapılmamalı."
  }
];

/**
 * Bilinen tüm yorum anahtarları (maddeler + özet + sorular + insan modeli).
 * Yorum yazma akışı, gelen `itemKey` değerini buna karşı doğrular — böylece
 * uydurma anahtarlarla tabloya öksüz satır yazılamaz.
 */
export const UBTSA_ITEM_KEYS: ReadonlySet<string> = new Set([
  ...UBTSA_SECTIONS.flatMap((section) => section.items.map((item) => item.key)),
  ...UBTSA_SUMMARY.map((note) => note.key),
  ...UBTSA_QUESTIONS.map((question) => question.key),
  ...UBTSA_PERSONA.map((note) => note.key)
]);
