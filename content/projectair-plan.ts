export const PROJECTAIR_PLAN_MARKDOWN = String.raw`
## Havacılık Bakım Eğitim Platformu — E2E Ana Doküman

**Sürüm:** 0.26 — İlk demo için temsili parça kararı\
**Güncelleme tarihi:** 13 Kasım 2026\
**Durum:** Soru-cevap ile geliştirilecek çalışma taslağı\
**Ürün adı:** Kararlaştırılmadı — ÖNEMLİ TODO

### Ara taslağı okuyacak kişiye not

Bu belge tamamlanmamış bir çalışma taslağıdır. İçerik üretimi ve abonelikli eğitim platformunu birlikte kapsayan işin ana çerçevesi oluşturuldu; demo → pilot → hizmet sırası benimsendi. İlk pazar Türkiye, ilk dil Türkçe. Kararlaştırılan işlevlerin tamamının ilk demoda uygulanacağı taahhüt edilmedi.

**Önemli açık konular:** Ürün/marka adı; ilk eğitim konusu; yayın öncesi uzman onayının zorunluluğu; rol/yetki modeli; dış AI servislerinin kullanımı; demoda belge yükleyerek içerik üretiminin çalıştırılması; yanlış cevap sonrası açıklama/tekrar davranışı; başarı ve belge koşulları; ayrıntılı değerlendirme/grafik planı; pilot geri bildirim grupları; fiyatlar ve pilotun ücretli/ücretsiz olması. Kaynak izinleri ve teknik içerik ayrıca incelenecek. Bütçe tabloları şablondur; proje tarihleri ve süreleri atanmadı.

Gürkan'dan beklenen teknik yanıtlar ve kullanıcıyla görüşmenin devam noktası aşağıda kayıtlıdır. Öneriler ile alınmış kararlar farklı statüdedir.

**Yeni kaynak notu:** Tek sayfalık “Havacılık Teknik Değerlendirme ve İnceleme Notları” PDF'si incelendi. İçindeki 10 görüş aşağıdaki kaynak değerlendirme tablosuna işlendi. Özellikle İngilizce eğitim önerisi mevcut Türkçe kararıyla uyuşmuyor; motor önceliği ve B1/C kapsamı ise yeni değerlendirme başlıkları. Bunlar henüz yeni ürün kararı değildir.

### İçindekiler

[Açık kararlar](#mevcut-bağlam-ve-henüz-kararlaştırılmamış-konular) · [Kaynak değerlendirmesi](#241-yeni-pdf-kaynak-değerlendirmesi--pdf-t01) · [Soru-cevap devam noktası](#görüşmeye-dönüş-noktası--henüz-cevaplanmayan-beş-soru)

1. [Yönetici özeti ve proje kimliği](#1-yönetici-özeti-ve-proje-kimliği)
2. [Problem, ihtiyaç ve mevcut çalışma biçimi](#2-problem-ihtiyaç-ve-mevcut-çalışma-biçimi)
3. [Pazar, hedef müşteriler ve rekabet](#3-pazar-hedef-müşteriler-ve-rekabet)
4. [Ürün konumlandırması ve değer önerisi](#4-ürün-konumlandırması-ve-değer-önerisi)
5. [Paydaşlar, roller ve karar yetkileri](#5-paydaşlar-roller-ve-karar-yetkileri)
6. [Kullanıcı senaryoları ve uçtan uca yolculuklar](#6-kullanıcı-senaryoları-ve-uçtan-uca-yolculuklar)
7. [Eğitim modeli ve öğrenme tasarımı](#7-eğitim-modeli-ve-öğrenme-tasarımı)
8. [İçerik kapsamı ve eğitim kataloğu](#8-i̇çerik-kapsamı-ve-eğitim-kataloğu)
9. [Kaynak dokümanlar ve veri yönetimi](#9-kaynak-dokümanlar-ve-veri-yönetimi)
10. [Teknik doğruluk, emniyet ve içerik güvencesi](#10-teknik-doğruluk-emniyet-ve-içerik-güvencesi)
11. [İçerik üretimi ve yapay zekâ iş akışı](#11-i̇çerik-üretimi-ve-yapay-zekâ-iş-akışı)
12. [Ürün işlevleri ve kapsam yönetimi](#12-ürün-işlevleri-ve-kapsam-yönetimi)
13. [Ekranlar, kullanıcı deneyimi ve tasarım](#13-ekranlar-kullanıcı-deneyimi-ve-tasarım)
14. [Sistem mimarisi, entegrasyonlar ve geliştirme](#14-sistem-mimarisi-entegrasyonlar-ve-geliştirme)
15. [Bilgi güvenliği, mahremiyet ve süreklilik](#15-bilgi-güvenliği-mahremiyet-ve-süreklilik)
16. [Hukuk, fikri mülkiyet ve düzenleyici çerçeve](#16-hukuk-fikri-mülkiyet-ve-düzenleyici-çerçeve)
17. [Ticari model, paketler ve fiyatlandırma](#17-ticari-model-paketler-ve-fiyatlandırma)
18. [Pazarlama, satış, ortaklıklar ve CRM](#18-pazarlama-satış-ortaklıklar-ve-crm)
19. [Müşteri kurulumu, destek ve günlük operasyon](#19-müşteri-kurulumu-destek-ve-günlük-operasyon)
20. [Ekip, tedarikçiler ve çalışma düzeni](#20-ekip-tedarikçiler-ve-çalışma-düzeni)
21. [Finans, bütçe ve yatırım ihtiyacı](#21-finans-bütçe-ve-yatırım-ihtiyacı)
22. [Pilot, doğrulama ve başarı ölçümü](#22-pilot-doğrulama-ve-başarı-ölçümü)
23. [Yol haritası, bağımlılıklar ve riskler](#23-yol-haritası-bağımlılıklar-ve-riskler)
24. [Doküman yönetimi ve ekler](#24-doküman-yönetimi-ve-ekler)

### Dokümanın amacı ve kullanım şekli

Fikrin doğrulanmasından ilk müşteriye, içerik üretiminden yazılım geliştirmeye, satıştan günlük işletime kadar projenin ortak başvuru kaynağını oluşturmak. Bu sürüm bir içindekiler listesinden daha ayrıntılı bir çalışma iskeletidir; tamamlanmış iş planı, teknik şartname veya uygunluk beyanı değildir.

Her bölüm soru-cevapla doldurulurken şu alanları taşıyacak:

- Amaç ve beklenen sonuç.
- Kullanıcının verdiği kararlar ve gerekçeleri.
- Öneriler ve henüz sınanmamış varsayımlar.
- Kanıtlar, kaynaklar ve doğrulama ihtiyacı.
- İş akışı, sorumlular ve teslim edilecek çıktılar.
- Maliyet, bağımlılıklar ve riskler.
- Başarı/kabul ölçütleri ve açık sorular.

Karar durumları: **Öneri → Kararlaştırıldı → Doğrulandı → Uygulandı.** Bir öneri, yalnızca dokümana yazıldığı için alınmış karar sayılmayacak. Sorumlular belirlenene kadar isim yerine rol kullanılacak.

### 1. Yönetici özeti ve proje kimliği

**Markalaşma:** Görüşmede markalaşma başlığının ilerletilmesi uygun bulundu. Marka adı seçimi açık ve önemli bir iş olarak takip ediliyor.

**ÖNEMLİ TODO — ürün/marka adı:** İsim çalışması daha sonra yapılacak; kullanıcı bu işi önemli TODO olarak belirledi. Henüz isim seçilmedi. Önceki raporlarda geçen “AeroTeach AI” ve benzeri adlar onaylanmış marka değildir. İleride isim adayları, hedef kitle/dil uyumu, alan adı ve marka uygunluğu incelemesi ele alınacak. Logo, görsel kimlik ve alan adı kararları isim çalışmasıyla ilişkilendirilecek. Tarih, bütçe veya araştırma sonucu atanmadı; kullanıcı konuya dönene kadar isim seçimi tekrar sorulmayacak.

**Kararlaştırıldı — 7 Kasım 2026:** İş modeli, kurumlara eğitim içeriği üretimi ile abonelikli eğitim platformunu birlikte sunacak. İçerik üretimi ve platformun ayrı ayrı satılıp satılmayacağı, paketleme ve fiyatlandırma henüz belirlenmedi.

**Mevcut durum — kullanıcı beyanı:** Kaynak belgeler ve yatırımcı bağlantısı mevcut. Teknik uzmanlar bulunacak. Yatırımcı bağlantısı, yatırım taahhüdü veya sağlanmış finansman olarak kabul edilmiyor. Kaynak belgelerin işlenme ve dağıtım izinleri ayrıca doğrulanacak.

- Projenin tek cümlelik tanımı, çözmek istediği problem ve sunduğu değer.
- Kurucu vizyonu, motivasyon, uzun vadeli hedef ve başarı tanımı.
- Ürün adı, marka yaklaşımı, faaliyet ülkeleri ve hedef diller.
- Bugünkü durum, mevcut varlıklar, kaynaklar ve kısıtlar.

**Çıktı:** Bir sayfalık proje özeti.

### 2. Problem, ihtiyaç ve mevcut çalışma biçimi

**Kurucu gözlemi:** Görüşmede dile getirilen kişisel örnek, sınava giren bir adayın elinde yeterli ön hazırlık materyali bulunmaması. Bu deneyim, sınav ve mesleğe giriş hazırlığı için erişilebilir materyal ihtiyacını araştırmaya temel oluşturuyor. İlk eğitimin belirli bir sınava mı, mesleğe girişe mi odaklanacağı Gürkan’la görüşülecek. Sınav seçeneği benimsenirse hedef sınav ve eksik materyaller belirlenecek.

- Teknisyen, eğitmen ve kurumların bugün yaşadığı sorunlar.
- Mevcut eğitim, doküman bulma ve yetkinlik takibi süreçleri.
- Sorunların sıklığı, etkisi ve mevcut çözümlerin eksikleri.
- Müşteri görüşmeleriyle doğrulanacak ihtiyaç hipotezleri.

**Çıktı:** Önceliklendirilmiş problem listesi ve doğrulama planı.

### 3. Pazar, hedef müşteriler ve rekabet

**İlk pazar odağı:** Özel sektörde eğitim veren şirketler ilk kurumsal müşteri grubu. Gençler ve yaştan bağımsız olarak havacılık bakım mesleğine başlamak isteyenler ilk kullanıcı grubu. İGA çevresindeki ve özel kurumlara bağlı eğitim yolları görüşmede gündeme geldi. Bu yolların ön hazırlık materyallerini kimin sağladığı ve hangi gruplarda boşluk olduğu araştırılacak.

**İlk temas kapsamı:** Özel havacılık okulları ve bakım eğitimi veren şirketlerin ikisi de görüşme listesine alınacak. İlk görüşülecek kurum ve temas sırası açık.

#### Benzer ürünler

| Şirket ve ürün | Kamuya açık ürün kapsamı |
| - | - |
| Airbus ACT for Academy | Eğitim kurumlarına yönelik, sanal Airbus uçağıyla etkileşimli bakım eğitimi. [Airbus ürün sayfası](https://www.aircraft.airbus.com/en/services/train/maintenance-training-solutions/act-for-academy) |
| Boeing Maintenance Training Services | Modüler bakım eğitimi ve etkileşimli öğrenme araçları. 3B uçak tanıtımı sunan Airplane Virtual Tour da bu kapsamda. [Boeing eğitim araçları](https://services.boeing.com/insights/advanced-tools-aviation-maintenance-training) |
| Lufthansa Technical Training MAINTAIN360 | A320 bakım görevleri için sanal uçak ortamı. [MAINTAIN360](https://www.ltt.aero/en/maintain360) |

**Doğrulanacak konumlandırma:** Mesleğe giriş ve sınav hazırlığı, kısa ve aranabilir içerik, parça tanımlama ve kurumun eğitim takibi ilk müşteri görüşmelerinde sınanacak. Görüşmede Pegasus ve Turkish Technic’in kurum içi eğitimleri mevcut alternatif olarak anıldı. Sistemleri ve müşteri açısından karşılaştırma ölçütleri ayrıca araştırılacak.

**Kararlaştırıldı — 7 Kasım 2026:** İlk hedef pazar Türkiye. Havayolları, bakım-onarım şirketleri (MRO) ve teknik eğitim kurumları hedef müşteri kapsamında. 9 Kasım görüşme notu, ilk temaslarda özel eğitim sağlayıcılarını öne çıkarıyor. İlk kurum ve muhatap teyit edilecek.

**TODO — kullanıcıdan daha sonra alınacak:** Hedef kurumlar, mevcut bağlantılar ve erişilebilecek kişiler listesi. Üç müşteri grubunun da listede değerlendirilmesi sağlanacak. Sorumlu: kullanıcı. Tarih: henüz belirlenmedi. Bu bilgi sonraki soru turlarında şimdilik tekrar istenmeyecek.

- Havayolu, MRO, eğitim kuruluşu ve diğer olası müşteri grupları.
- İlk ülke/bölge, ilk müşteri profili ve erişim kanalları.
- Kullanıcı, satın alan, bütçe sahibi, teknik onaylayan ve satın almayı engelleyebilecek roller.
- Doğrudan rakipler, mevcut LMS çözümleri ve müşterinin kendi iç çözümleri.
- Pazar büyüklüğü, farklılaşma ve müşteri talebini destekleyen kanıtlar.

**Çıktı:** İlk hedef müşteri profili ve kaynaklı rekabet değerlendirmesi.

### 4. Ürün konumlandırması ve değer önerisi

**Kararlaştırıldı — altıncı soru-cevap turu:** Hem kendi markamızla hem müşterinin logosu/kurum kimliğiyle sunum desteklenecek. Kuruma özel ad, renk, alan adı, e-posta ve belge görünümü gibi uyarlamaların kapsamı henüz belirlenmedi. İki seçeneğin fiyatlandırma ve sürümlere dağılımı ayrıca kararlaştırılacak.

**Kararlaştırıldı:** Birleşik teklif iki bileşenden oluşacak: (1) eğitim içeriği hazırlama/üretme hizmeti, (2) bu içeriklerin sunulduğu ve kurum eğitimlerinin yönetildiği abonelikli platform. İlk aşamada her bileşenin derinliği demo ve pilot kapsamına göre belirlenecek.

- Eğitim içeriği, eğitim yönetimi ve satış CRM'inin ürün içindeki yeri.
- Müşterinin neden bu ürünü satın alacağı ve hangi fayda için ödeme yapacağı.
- Eğitim desteği, değerlendirme ve operasyonel kullanım arasındaki kapsam sınırları.
- Müşteriye sunulacak vaatler ve bunların nasıl kanıtlanacağı.

**Çıktı:** Ürün tanımı, değer önerisi ve kapsam sınırları.

### 5. Paydaşlar, roller ve karar yetkileri

Gürkan ve Barış proje ortaklarıdır. Proje ekibindeki görev dağılımı [Ekip, tedarikçiler ve çalışma düzeni](#20-ekip-tedarikçiler-ve-çalışma-düzeni) bölümünde yer alır.

**Sonraya bırakıldı — on ikinci soru-cevap turu:** Platform yöneticisi, kurum yöneticisi, eğitmen/içerik hazırlayan, öğrenci ve ayrı teknik inceleyen rolleri önceki taslakta öneri olarak bulunuyor. Kullanıcı rol/yetki modelini daha sonra yanıtlayacak; bu rollerin kesin listesi, yetkileri ve görev ayrımları henüz onaylanmadı. Teknik uzman onayının zorunluluğu da ayrı açık karar olarak korunuyor. Kullanıcı konuya dönene kadar aynı rol seçimi tekrar sorulmayacak.

**Netleştirilecek:** Kurumdan içerik sağlayan kişi ile teknik inceleyen/yayımlayan kişinin yetkileri; katılım ve başarı belgelerinin düzenleyicisi ve onay yetkilisi. İçerik sağlayabilmek, doğrudan yayımlama yetkisi olarak kararlaştırılmadı.

- Kurucu, yatırımcı, pilot kurum, teknik uzman ve içerik üretim ortakları.
- Platform yöneticisi, kurum yöneticisi, eğitmen, içerik yazarı, inceleyen ve öğrenci rolleri.
- Kimin hazırladığı, kontrol ettiği, onayladığı ve yayımladığı.
- Karar alma, anlaşmazlık çözümü ve dış uzmanlara başvurma düzeni.

**Çıktı:** Rol/yetki ve sorumluluk tablosu.

### 6. Kullanıcı senaryoları ve uçtan uca yolculuklar

**Kararlaştırıldı — yedinci soru-cevap turu:** Kurumun eğitim atamasına ek olarak kullanıcı katalogdan kendi eğitimini seçebilecek. Kurum ataması ve kişisel seçim ayrı kayıt türleri olarak izlenecek. **Netleştirilecek:** Kullanıcıya açık katalog, kurum erişim sınırları, ön koşullar, onay gerektiren eğitimler ve seçimin varsa ücret/lisans etkisi.

**Yeni akışlar:** Kullanıcı kendisine açık katalogdan eğitim seçer → gerekli koşullar kontrol edilir → eğitime başlar → tamamlanma/başarı sonucu kaydedilir. Süreli eğitimlerde son tamamlama tarihi takip edilir → uygun hatırlatma gönderilir → gecikme veya yenileme ihtiyacı yöneticiye gösterilir. Yenileme periyodu ve hatırlatma kuralları henüz tanımlanmadı.

**Kararlaştırıldı:** Demo hem yatırımcıya hem potansiyel müşteriye sunulacak. **Plan önerisi:** Aynı demo için yatırımcıya iş modeli ve ölçeklenebilirliği, müşteriye eğitim akışı ve kurum yönetimini gösteren iki sunum akışı hazırlanacak. Demo, pilotta ölçülecek faydaları doğrulanmış sonuçlar gibi sunmayacak.

**Kararlaştırıldı — üçüncü soru-cevap turu:** Demo, yalnızca bir eğitim oynatıcısı yerine uçtan uca eğitim akışını gösterecek: yönetici eğitim atar → öğrenci eğitimi tamamlar ve karar sorularını yanıtlar → sonuç kaydedilir → yönetici sonucu görür.

**Önerilen tamamlayıcı akış:** İçerik hazırlayan kişi kaynak ve senaryoyu ekler → teknik uzman inceler → yetkili kişi yayımlar → eğitim atanabilir hale gelir. Bu üretim/onay akışının demoda çalışır mı yoksa açıklayıcı ekranlarla mı gösterileceği henüz belirlenmedi. Otomatik AI üretiminin demo için zorunlu olduğu kararlaştırılmadı.

**Tartışılacak ve karar verilecek — on birinci tur:** Belge yükleme → içerik üretimi sürecinin demoda çalışır biçimde gösterilip gösterilmeyeceği açık bırakıldı. Önceden hazırlanmış eğitim kullanımı ile demoda çalışan üretim hattı alternatifleri değerlendirilecek; bu turda iki seçenekten biri seçilmedi. Karşılaştırmada kaynak/izinler, üretim kalitesi, inceleme akışı, iş yükü ve maliyet ele alınacak. Tarih veya tutar atanmayacak.

- Müşteri adayı → demo → pilot → sözleşme → kurum kurulumu → kullanım → yenileme.
- Kaynak belge → içerik taslağı → uzman kontrolü → yayın → eğitim → değerlendirme → güncelleme.
- Öğrenciye eğitim atanması, eğitimin tamamlanması ve sonuçların incelenmesi.
- Eksik bilgi, başarısız sınav, süresi geçen eğitim ve değişen kaynak gibi istisnalar.

**Çıktı:** Ana süreç haritaları ve örnek kullanım senaryoları.

### 7. Eğitim modeli ve öğrenme tasarımı

**Yeni kaynak girdisi — PDF-T01, maddeler 03, 04 ve 07:** Notlar, başlangıç seviyesinde öğrenme ihtiyacını; deneyimli teknisyenlerde tip/ yetki gelişimi beklentisini vurguluyor. Bunlar kullanıcı görüşmeleriyle doğrulanacak ihtiyaç hipotezleri olarak işlenecek; platformun yetki veya tip sertifikası kazandırdığı iddiası oluşturmayacak.

**Karar bekleyen dil uyuşmazlığı:** Kullanıcı Türkçe anlatım + özgün İngilizce teknik terimleri seçmişti. PDF-T01 ise eğitimin İngilizce olması gerektiğini savunuyor. Mevcut karar kullanıcı değiştirmedikçe korunacak. **TODO:** Platform arayüzü, anlatım, altyazı, kaynak alıntısı ve sınav dilini ayrı ayrı ele alarak Türkçe destekli İngilizce teknik eğitim / Türkçe teknik anlatım / tam İngilizce içerik seçeneklerini değerlendirmek. Kaynak metindeki dil görüşü, doğrulanmış bir otorite gerekliliği olarak kabul edilmedi.

**Başarı yaklaşımı — açık görüş:** Kaynakta adayların çoğunluğunun geçer not alması isteniyor; ancak oran, puan veya gerekçe verilmemiş. Bu görüş başarı barajı, garanti edilmiş geçme oranı veya standart düşürme kararı olarak uygulanmayacak. Başarı ölçütleri ve kritik soruların rolü daha sonra tanımlanacak; gözlenen geçme oranı ile öğrenme hedeflerine ulaşma ayrı değerlendirilecek.

**Kararlaştırıldı — on üçüncü soru-cevap turu:** Kullanıcı yarım bıraktığı eğitime kaldığı yerden devam edebilecek. Eğitim sonunda sonuç özeti ve tekrar çalışması önerilen konular gösterilecek.

**Sonraya bırakıldı:** Yanlış cevap sonrası açıklamanın gösterilmesi ve yeniden deneme davranışı daha sonra değerlendirilecek. Önceki bölümlerdeki açıklamalı geri bildirim akışları tasarım önerisidir; yanlış yanıt anındaki davranışın kesinleştiği anlamına gelmez. Sonuçta konu önerisi gösterilmesi kararı, anlık açıklama, otomatik tekrar veya sınırsız deneme kararı değildir.

**Kararlaştırıldı:** Eğitimler için son tamamlama tarihi, hatırlatma ve gerektiğinde yenileme/tekrar eğitimi özellikleri olacak. **TODO — eğitim kuralları:** Zorunlu/isteğe bağlı ayrımı, başarısızlık sonrası tekrar, süre uzatma, yenileme gerektiren eğitimler, geçerli sayılan sonuç ve eski sonuçların korunması tanımlanacak. Her eğitime otomatik yenileme veya tek tip bir geçerlilik süresi atanması kararlaştırılmadı.

**Kararlaştırıldı — beşinci soru-cevap turu:** Katılım belgesi ve başarı belgesi sunulacak. **Tanım önerisi:** Katılım belgesi belirlenen katılım/tamamlama koşuluna; başarı belgesi ayrıca belirlenen değerlendirme ölçütlerine bağlanacak. Bu koşullar henüz belirlenmedi. Belgeler eğitim kaydı olarak tasarlanacak; mesleki yetki veya resmî onay iddiaları için ayrıca kapsam ve yetkili incelemesi gerekecek.

**TODO — belge kuralları:** Katılım/tamamlama koşulu, başarı eşiği, tekrar hakkı, düzenleyen kurum, imza/onay, belge dili ve şablonu belirlenecek. Belge üzerinde katılımcı, eğitim/modül ve sürümü, belge türü, düzenlenme tarihi ve benzersiz belge numarası tutulması öneriliyor. Düzenlenme tarihi bir ürün veri alanıdır; proje takvimi için tarih atanması anlamına gelmez.

**Kararlaştırıldı — dördüncü soru-cevap turu:** Hem yeni başlayanlar hem deneyimli teknisyenler kapsanacak. **Tasarım önerisi:** Başlangıç düzeyinde terimler, doküman okuma ve yönlendirmeli kararlar; deneyimli düzeyde daha az yönlendirme, karşılaştırmalı senaryolar ve gerekçeli karar soruları sunulacak. Deneyim düzeyi ile erişim yetkisi ayrı tutulacak. Seviye belirleme yöntemi, ön koşullar ve başarı eşikleri henüz belirlenmedi. **On birinci tur kararı:** İlk demoda aynı konunun başlangıç ve deneyimli seviyeleri birlikte gösterilecek; her seviyenin süre ve ayrıntıları ayrıca tanımlanacak.

**Kararlaştırıldı:** İçerik ve platformun ilk dili Türkçe. **On yedinci tur kararı:** Türkçe eğitimlerde teknik terimler özgün İngilizce karşılıklarıyla birlikte gösterilecek; örneğin “Uygulanabilirlik (Effectivity)”. Bu karar tam İngilizce eğitim veya İngilizce arayüz kararı değildir. Kaynak alıntılarının gösterim yöntemi ve ek dil desteği henüz belirlenmedi.

**TODO — terim standardı:** Türkçe karşılık, özgün İngilizce terim, varsa kısaltma ve kaynak referansını içeren ortak terim sözlüğü hazırlanacak. Tekrarlanan kullanımlarda, seslendirmede, şemalarda ve soru metinlerinde gösterim biçimi ayrıca tanımlanacak. Teknik çeviriler kaynak ve uzman incelemesiyle doğrulanacak; henüz onaylı bir terim sözlüğü oluşturulmadı.

**Kararlaştırıldı:** Görsel anlatım, sinematik video ile açıklayıcı animasyon ve şemaların birleşimi olacak. **Üretim önerisi:** Sinematik bölümler bağlamı kuracak; açıklayıcı görseller belgeyi, karar mantığını ve teknik ayrıntıları gösterecek. Seçim noktalarında eğitim duracak, yanıt sonrası açıklamalı geri bildirimle devam edecek. Kesin süreler ve formatların oranı ilk modül seçildikten sonra belirlenecek.

- Öğrenme hedefleri, hedef bilgi seviyesi ve ön koşullar.
- Video, metin, görsel, etkileşimli karar ve uygulamalı eğitimin rolleri.
- Geri bildirim, tekrar, başarı eşiği ve yeniden değerlendirme yaklaşımı.
- Dil, altyazı, erişilebilirlik ve farklı öğrenme ihtiyaçları.
- Bilgi kazanımı ile uygulamalı beceri/yetkilendirme arasındaki ayrım.

**Çıktı:** Eğitim tasarım standardı ve ölçme-değerlendirme planı.

### 8. İçerik kapsamı ve eğitim kataloğu

**Kararlaştırılan demo kapsamı:** Bir parçayı görselde tanıma, parça numarasını ve görevini öğrenme ve montaj sırasını gösterme. Gerçek montaj adımlarının işlenmesi, seçilen uçak ve parça için geçerli teknik kaynağa ve uzman incelemesine bağlı. Hangar hissi, kısa videolar ve seslendirme demo için değerlendirilecek tasarım girdileri.

**İlk demo için karar.** Projeye özel tasarlanmış temsili bir eğitim parçası, örnek parça numarası ve özgün montaj şeması kullanılacak. Eğitim ekranında örneğin temsili olduğu belirtilecek. Gerçek uçak parçası seçimi ve teknik kaynak izinleri ayrı bir çalışma olarak değerlendirilecek.

| Seviye | Eğitim akışı | Kullanıcı etkileşimi |
| - | - | - |
| Başlangıç | Parçanın görseli, örnek parça numarası ve işlevi tanıtılır. Montaj sırası açıklamalı görselle gösterilir. | Kullanıcı parça adını, numarasını ve işlevini eşleştirir. |
| Deneyimli | Aynı parça grubu montaj öncesi görünümüyle sunulur. | Kullanıcı bileşenleri tanır ve montaj adımlarını doğru sıraya dizer. |

**Demo hazırlığı.** Barış, özgün parça görselini, montaj şemasını ve iki seviyeli etkileşimi prototipe işleyecek. Gürkan, eğitim hedefleri ve senaryoyu inceleyecek. Yönetici eğitimi atayacak, kullanıcı tamamlayacak ve yönetici sonucu görebilecek. Parça tasarımı ve senaryo ayrıntıları demo hazırlığında belirlenecek.

**Hata senaryoları:** Gürkan, teknisyenin sık karşılaştığı hataları ve güvenli tepkiyi eğitim senaryosunda göstermeyi önerdi. Örnekleri ve olay sıralamasını seçmek için kullanım izni doğrulanmış CBT (bilgisayar tabanlı eğitim) örneği veya uzman tarafından hazırlanmış senaryo değerlendirilecek. Hata sonrası ekranda ne gösterileceği açık karar.

**Kararlaştırıldı:** Aday konular dokümanda listelenecek; ilk demo için kolay hazırlanabilen bir konu daha sonra seçilecek. Henüz modül seçimi yapılmadı.

**Demo kapsamı — kararlaştırıldı:** Seçilecek tek konu başlangıç ve deneyimli seviyelerinde sunulacak. Bu karar iki ayrı konu seçilmesi veya tüm kataloğun iki seviyede üretilmesi anlamına gelmiyor. İki seviyenin öğrenme hedefleri, yönlendirme miktarı, soruları ve geri bildirimleri ayrı tanımlanacak; ortak görsellerin ne ölçüde kullanılacağı planlanacak.

#### 8.1 Aday eğitim konuları

Aşağıdaki liste başlangıç kataloğu önerisidir; tüm havacılık eğitimlerinin eksiksiz listesi veya mevcut belgelerde bu konuların tamamının bulunduğu beyanı değildir. Zorluklar teknik konunun önemini değil, sınırlı bir demo üretmenin göreli iş yükünü ifade eden ilk plan tahminleridir. Kaynak incelemesi ve uzman görüşüyle değişebilir.

| Kod | Aday modül | Örnek öğrenme/karar hedefi | Demo hazırlama zorluğu | Kaynak ve üretim ihtiyacı |
| - | - | - | - | - |
| E01 | AMM'ye giriş ve doküman yapısı | Dokümanın bölümlerini tanımak, bilgiye nereden ulaşacağını seçmek | Düşük | Doğrulanmış örnek sayfalar ve açıklayıcı şema |
| E02 | Doküman revizyonunu kontrol etme | Verilen kayıtlar arasında güncel/geçerli sürümü ayırt etmek | Düşük | Revizyon bilgileri ve açıkça etiketlenmiş eğitim örnekleri |
| E03 | Görev ve alt görev bulma | Verilen ihtiyaca karşılık gelen belge referansını takip etmek | Düşük–orta | Kaynakta doğrulanmış görev yapısı ve ekran vurguları |
| E04 | Uyarı, dikkat ve notları okuma | Kaynakta verilen uyarı türlerini fark etmek ve anlamını açıklamak | Düşük–orta | Kaynaktaki ifadeler ve uzman incelemesi |
| E05 | Kısaltmalar ve teknik terimler | Seçilmiş terimlerin anlamını kaynak sözlüğünden bulmak | Düşük | Doğrulanmış terim listesi; Türkçe anlatım/özgün terim eşleştirmesi |
| E06 | ATA yapısı ve sayfa blokları | Doküman içindeki başlık ve numaralandırma ilişkisini okumak | Düşük–orta | Kaynak dokümanın yapısı ve gezinme şeması |
| E07 | Effectivity / uygulanabilirlik kontrolü | Verilen uçak ve konfigürasyon kayıtlarıyla görevin uygunluğunu değerlendirmek | Orta | Tutarlı uçak/konfigürasyon örneği, eksik bilgide karar verememe dalı |
| E08 | Şekil, tablo ve metni birlikte okuma | İşaretlenen öğeyi doğru açıklama ve referansla eşleştirmek | Orta | Kullanım izni değerlendirilmiş şekil/tablo ve doğrulanmış etiketler |
| E09 | Takım ve parça referanslarını okuma | İstenen referansı ilgili listede bulmak | Orta | Doğrulanmış referans örnekleri; fiziksel kullanım öğretimi ayrı kapsam |
| E10 | İş hazırlığı, işlem ve kapanış yapısını tanıma | Bir görevin bölümlerini ve bunların sırasını belge üzerinde izlemek | Orta | Eksiksiz örnek görev ve uzman kontrolü |
| E11 | Birim ve teknik değerleri okuma | Kaynaktaki değer/birim çiftini doğru tanımak | Orta | Doğrulanmış değerler ve kontrol edilmiş soru/yanıtlar |
| E12 | Eksik veya çelişkili bilgide karar verme | Tahmin etmek yerine eksik kaydı belirlemek ve doğrulama istemek | Orta | Açıkça tanımlanmış senaryo ve uzman onaylı geri bildirim |
| E13 | İnsan faktörü ve karar senaryoları | Senaryodaki iletişim/dikkat sorununu fark etmek | Orta | Uygun kaynaklar ve senaryo konusunda uzman incelemesi |
| E14 | Kuruma özel eğitim ve iş kartı akışı | Kurumun onaylı süreç ve dokümanlarını doğru takip etmek | Orta–yüksek | Pilot kurumun süreçleri, kaynakları ve onayı |
| E15 | Belirli bir bakım işleminin görsel anlatımı | Seçilmiş bir işlemin adımlarını eğitim bağlamında anlamak | Yüksek | İlgili tam görev, teknik uzman, doğrulanmış çekim veya kontrollü animasyon |
| E16 | Sistem/komponent çalışma prensibi | Seçilen sistemin ilişkilerini ve işlevlerini açıklamak | Yüksek | Uygun teknik kaynaklar, şemalar ve gerektiğinde kontrollü 3D üretim |
| E17 | Motor sistemleri — ilk kapsam belirlenecek | Seçilen motor sistemi konusunu ve ilgili teknik kaynak ilişkilerini anlamak | Kapsama bağlı; henüz puanlanmadı | PDF-T01'in öncelik önerisi; uçak/motor tipi, görev derinliği, kaynak ve uzman erişimi doğrulanacak |

**Katalog güncellemesi:** 17 aday konu bulunuyor. PDF-T01 madde 05 motor sistemlerine öncelik öneriyor; madde 01 ise tek bir başlangıç önceliği seçmeden ürünün bütününe dikkat çekiyor. Bu görüşler birlikte değerlendirilecek. İlk demo için kolay konu seçme yaklaşımı ile ticari katalogda motor konularına önem verme ayrı plan kararlarıdır. Motor konusu henüz ilk demo olarak seçilmedi; konu zorluğu tam bakım işlemi mi yoksa sınırlı kavramsal anlatım mı seçileceğine göre yeniden değerlendirilecek.

#### 8.2 İlk modülü seçme yöntemi

Her aday; kaynakların hazır ve kullanılabilir olması, uzman incelemesine erişim, tek ve açık öğrenme hedefi, görsel üretim yükü, etkileşimli soruya uygunluk ve demo kitlesine değer gösterme açısından karşılaştırılacak. İlk kısa liste E01, E02 ve E05; bunlar yalnızca başlangıç plan önerisidir. Kaynaklar incelendikten sonra en uygun aday seçilecek. Tüm kataloğun demo aşamasında üretilmesi planlanmıyor.

**TODO:** PDF kaynaklarını inceleyerek adayları mevcut sayfa/bölümlerle eşleştirmek; karşılığı olmayan adayları ayrıca kaynak gerektirenler olarak işaretlemek.

- İlk uçak ailesi, konu, kullanıcı seviyesi ve modül seçimi.
- Chapter 00 için önerilen ilk öğrenme hedefi ve alternatifleri.
- Modül yapısı, süre yaklaşımı, ön koşullar ve katalog sınıflandırması.
- Genel içerik, kuruma özel içerik ve müşteriye özel uyarlamalar.

**Çıktı:** İlk demo kapsamı ve aşamalı eğitim kataloğu.

### 9. Kaynak dokümanlar ve veri yönetimi

**İçerik kaynağı açığı:** Gürkan, demo konusu için eldeki dokümantasyonu yetersiz buldu. AMM, IPC ve iş kartlarına ek olarak ASM, AWM, MMEL, TSM ve SRM görüşmede anıldı. İlk konu seçilince her belgenin işlevi, üretici terminolojisi, revizyonu ve o senaryoda gerekli olup olmadığı doğrulanacak. Sohbetteki Boeing PDF ve eğitim örnekleri önce kaynak envanterinde tanımlanacak.

**Web tabanlı içerik taslağı.** Barış, öğrenme hedefi, seviye, parça ve işlev, senaryo, etkileşim ve inceleme kaydını içeren bir modül şablonu hazırlayacak. İlk demoya özgün ve temsili eğitim örneği girilecek. Gerçek teknik kaynakla hazırlanacak modüller için şablonda kaynak kimliği ve revizyonu yer alacak. Gürkan bu modüller için gerekli belgeleri ve yetkili başvuru kanalını araştıracak.

**Yeni kaynak girdisi — PDF-T01 madde 02:** Mevcut kaynak setinin eksik olduğu, AMM yanında IPC, FIM ve Task Card'ların da değerlendirilmesi gerektiği belirtiliyor. Bu görüş kaynak yeterliliği incelemesine eklendi; belgelerin tamamının elde olduğu veya her modül için aynı belge setinin zorunlu olduğu sonucuna varılmadı.

**TODO — konu bazlı kaynak matrisi:** Seçilecek modül için AMM (Aircraft Maintenance Manual), IPC (Illustrated Parts Catalog), FIM (Fault Isolation Manual) ve ilgili iş kartlarının gerekli/uygulanabilir olup olmadığını uzmanla belirlemek. Her kaynak için belge sahibi, uçak/motor/konfigürasyon kapsamı, revizyon, diğer kaynaklarla referans ilişkisi, erişim ve kullanım izni, eksikler kaydedilecek. Eksik kaynakların temini ayrı iş paketi olacak; eldeki set tam kabul edilmeyecek.

**Kararlaştırıldı — on altıncı soru-cevap turu:** Kurumlar eğitim sonuçlarını, kullanıcı listelerini ve katılım/başarı belgesi kayıtlarını dışa aktarabilecek. Dışa aktarma yalnızca yetkili olunan kurum ve veri kapsamıyla sınırlı olacak; rol ayrıntıları daha sonra belirlenecek.

**TODO — dışa aktarma:** Dosya formatları, alanlar, filtreler, sürüm bilgisi, kişi/veri erişim yetkileri ve işlem kayıtları tanımlanacak. Belge kayıtlarının dışa aktarılması, tüm belge dosyalarının toplu indirilmesi veya kaynak içerik/medya dosyalarının teslimi olarak henüz kararlaştırılmadı. Bu ek kapsamlar ayrıca değerlendirilecek.

**Kararlaştırıldı — on ikinci soru-cevap turu:** Kuruma özel belgeler ve eğitimler yalnızca ilgili kuruma açık olacak. Bu içeriklerin genel kataloğa alınması için ayrıca izin istenecek. Bu erişim kararı, mülkiyet veya türev üretim haklarının devri anlamına gelmiyor.

**TODO — izin kaydı:** İzin veren yetkili, izin verilen içerik/sürüm, kullanım ve dağıtım kapsamı, koşullar ve varsa izin değişikliği/sona erme süreci tanımlanacak. Genel katalog izni bulunmayan içerik başka kurumlara açılmayacak. Platform ekibinin inceleme/destek erişimi için yetki sınırları rol modeliyle birlikte ayrıca belirlenecek.

**Kararlaştırıldı:** İki içerik kanalı desteklenecek: platform ekibinin ürettiği içerikler ve gerektiğinde kurumlardan alınan içerikler. Kurum girdileri kaynak belge veya eğitim materyali olabilir; kabul edilecek format ve kapsam henüz belirlenmedi.

**Önerilen kurum içeriği kabul akışı:** İçerik teslimi → sahiplik/kullanım izinleri ve gizlilik kapsamının kaydı → kaynak, sürüm ve kalite kontrolü → gerekiyorsa uyarlama → teknik/pedagojik inceleme → onay → belirlenen erişim kapsamıyla yayın. Kurumun içeriği kendi hesabından yüklemesi ile ekibimize teslim etmesi seçenekleri açık; self-servis yükleme henüz kararlaştırılmadı.

**TODO — içerik paylaşım modeli:** Hangi içeriklerin yalnızca ilgili kuruma açık kalacağı, genel kataloğa alınma izni, değişiklik ve türev üretim hakları, güncelleme sorumluluğu, ücretlendirme ve sözleşme sonunda kullanım koşulları tanımlanacak. Kurumdan içerik almak, diğer müşterilere dağıtım izni olarak kabul edilmeyecek.

- Kaynak türleri, belge sahipliği, temin şekli ve kullanım izinlerinin kaydı.
- Doküman, revizyon, sayfa, görev, şekil ve uygulanabilirlik bilgilerinin tutulması.
- Metin/tablo/şekil çıkarımı, kalite kontrolü ve belirsiz verilerin ele alınması.
- Kurum verilerinin ayrılması, saklama, silme, dışa aktarma ve kaynak değişikliği takibi.

**Çıktı:** Kaynak envanteri, veri sözlüğü ve veri yaşam döngüsü.

### 10. Teknik doğruluk, emniyet ve içerik güvencesi

**Revizyon takibi girdisi:** Sohbette, güncellemelerin üretici düzeltmesi veya bölüm bazında değişiklik olarak gelebileceği aktarıldı. Pilot için takvim bazlı kontrolün yanında yetkili kaynaktan revizyon bildirimi alma, etkilenen modülleri bulma ve yeniden inceleme akışı değerlendirilecek. Takip kanalı ve sorumlu kurumla netleştirilecek.

**Açık karar — sekizinci soru-cevap turu:** Yayın öncesinde teknik uzman onayının zorunlu olup olmayacağına daha sonra karar verilecek. Önceki bölümlerdeki teknik inceleme/onay akışları plan önerileridir; tüm içerikler için alınmış bir zorunlu onay kararı olarak yorumlanmayacak. Bu erteleme, kontrolsüz yayına izin verildiği anlamına gelmez; yayın politikası henüz belirlenmedi.

**Kararlaştırıldı:** Kaynak belge değiştiğinde bağlı eğitimler yeniden incelemeye alınacak; gerektiğinde geçici olarak yayından kaldırılabilecek.

**Önerilen revizyon akışı:** Kaynak değişikliği kaydedilir → ilgili eğitim/sahne/sorular belirlenir → yeniden inceleme durumu açılır → yayın sorumlusu geçici kaldırma gereğini değerlendirir → düzeltme ve kontroller tamamlanır → belirlenecek yayın politikasına göre yeniden yayımlanır. Otomatik değişiklik tespiti veya her değişiklikte otomatik kaldırma kararı alınmadı.

**TODO — revizyon kuralları:** İnceleme/kaldırma yetkisi ve ölçütleri, kullanıcı/kurum bildirimleri, devam eden eğitimlere etkisi, eski sonuç ve belgelerin korunması, yeniden eğitim gereği ve tekrar yayın koşulları tanımlanacak. Uzman onayının kapsamı/zorunluluğu ayrı açık karar olarak tutulacak.

**Kararlaştırıldı:** Kullanıcı eğitim içinde hata bildirebilecek ve soru sorabilecek.

**Önerilen geri bildirim akışı:** Kullanıcı eğitim/soru/sahne bağlamıyla kayıt açar → kayıt hata bildirimi veya soru olarak ayrılır → sorumluya atanır → değerlendirilir/yanıtlanır → kullanıcıya sonuç bildirilir → kayıt kapatılır. Bildirim tek başına doğrulanmış hata veya otomatik yayından kaldırma sebebi sayılmayacak; değerlendirme sonucu revizyon akışını başlatabilecek.

**TODO — soru ve hata yönetimi:** Yanıtlayan roller, görünürlük (kişisel/kurum içi/genel), ek dosyalar, bildirimler, önceliklendirme ve kapanış kuralları belirlenecek. AI yanıtı veya herkese açık tartışma alanı kararlaştırılmadı. Yanıt süreleri daha sonra belirlenecek; bu aşamada süre taahhüdü verilmeyecek.

- Her teknik ifadenin kaynağına bağlanması ve bağımsız uzman kontrolü.
- Kaynak bilgisi, öğretici açıklama ve kurgusal örneğin ayırt edilmesi.
- Eksik/çelişkili bilgi olduğunda üretimi veya yayını durdurma kuralları.
- Hata bildirme, etkilenen eğitimleri bulma, yayından kaldırma ve yeniden onaylama.
- Kritik hata sınıfları, inceleme kayıtları ve yayın kabul ölçütleri.

**Çıktı:** Teknik inceleme ve yayın onayı prosedürü.

### 11. İçerik üretimi ve yapay zekâ iş akışı

#### Kuruma özel içerikte müşteri geri bildirimi

**Kararlaştırıldı — on beşinci soru-cevap turu:** Kuruma özel içeriklerde senaryo taslağı medya üretiminden önce müşteriye gösterilecek ve geri bildirim alınacak. Müşterinin düzeltme talepleri ve içerik sürümleri platform üzerinden takip edilecek.

**Önerilen akış:** İçerik kapsamı → senaryo taslağı → müşteriye sunum → geri bildirim/düzeltme kaydı → yeni senaryo sürümü → üretime geçiş → üretilen içeriğin sürüm ve düzeltme takibi. Üretime geçiş için müşterinin resmî onayının gerekip gerekmediği ve kimin onay verebileceği henüz belirlenmedi. Müşteri geri bildirimi, teknik uzman onayı yerine geçtiği anlamına gelmez; uzman onayının zorunluluğu ayrı açık karardır.

**TODO — düzeltme süreci:** Dahil düzeltme sayısı, kapsam değişikliği ile düzeltme ayrımı, ek ücret koşulları, talep önceliği, sorumlular ve kapanış ölçütleri tanımlanacak. Tarih veya yanıt/teslim süresi atanmadı.

**Sonraya bırakıldı:** Kaynak belgelerin dış yapay zekâ servislerine gönderilmesi hakkında karar alınmadı. Dış servis kullanımı, yalnızca kurum izniyle kullanım veya başka işleme seçenekleri ileride değerlendirilecek; bu taslak veri gönderme yetkisi sağlamıyor. **TODO:** İşlenecek veri türleri, kaynak izinleri, servis koşulları, saklama/yeniden kullanım, veri konumu, erişim ve maliyet seçeneklerini karşılaştırıp karar vermek. Bu aşamada belirli servis veya işleme yöntemi seçilmeyecek.

**Kararlaştırıldı:** İçerik üretim hattı hem kendi üretimimizi hem kurumdan gelen kaynakların/eğitimlerin alınmasını ve gerektiğinde uyarlanmasını kapsayacak. Hazır kurum içeriğinin kabulü de inceleme ve yayın akışında tanımlanacak; içeriğin geldiği kanal ayrı kaydedilecek.

**Kararlaştırıldı:** Üretim yaklaşımı sinematik video + açıklayıcı animasyon/şema birleşimi. Araç/model seçimi, gerçek çekim ihtiyacı ve üretim bütçesi henüz belirlenmedi.

- Senaryo, görsel, kontrollü animasyon, gerçek çekim, ses ve kurgu aşamaları.
- Yapay zekânın hangi işleri üstleneceği ve nerede insan kararı gerekeceği.
- Üretim şablonları, marka dili, teknik görsel standartlar ve dosya sürümleri.
- Araç/tedarikçi seçimi, yeniden üretim, uzman inceleme süresi ve üretim maliyeti.
- Kaynak verilerin dış servislere gönderilmesi için uygulanacak kararlar.

**Çıktı:** İçerik üretim rehberi ve modül başına maliyet şablonu.

### 12. Ürün işlevleri ve kapsam yönetimi

**Gürkan’ın ürün önerileri:** İlk girişte kullanıcı paneli, e-posta ile giriş, kısa videolarda arama, evden erişim ve aylık/yıllık abonelik seçeneği. Eğitim sonunda tamamlama belgesi ve faydalı hata bildirimlerini teşvik etme de önerildi. Kayıt yöntemi, paket dönemi, belge koşulları ve teşvik modeli karar bekliyor.

**Yeni kapsam — kurumsal veri dışa aktarma:** Eğitim sonuçları, kullanıcı listeleri ve belge kayıtları dışa aktarılabilecek. Formatlar ve demo/pilot/ticari sürüme dağılımı TODO. Yetki kontrolü ve dışa aktarma kaydı, daha sonra belirlenecek rol/veri politikalarıyla ilişkilendirilecek.

**Yeni kapsam — müşteri içerik iş birliği:** Kuruma özel senaryo taslağını müşteriye sunma, geri bildirim/düzeltme talebi kaydetme ve içerik sürümlerini platformda takip etme desteklenecek. Demo, pilot ve ticari sürümde hangi derinlikte uygulanacağı açık.

**Önerilen kayıt alanları:** İlgili kurum, içerik/senaryo sürümü, talep sahibi, talep açıklaması, ilgili sahne/bölüm, sorumlu, durum ve çözüm notu. Sürüm geçmişinde önceki kayıtların korunması ve hangi talebin hangi sürümde ele alındığının izlenmesi planlanacak. Karşılaştırmalı görünüm, ek dosya ve bildirim ayrıntıları henüz seçilmedi. Erişim yetkileri daha sonra belirlenecek rol modeliyle uyumlu tasarlanacak.

#### Eğitime devam ve öğrenci sonuç ekranı

**Kararlaştırıldı:** Yarım kalan eğitimde ilerleme korunacak ve kullanıcı kaldığı yerden devam edebilecek. Tamamlanan eğitim sonunda kullanıcı kendi sonuç özetini ve tekrar çalışması önerilen konuları görebilecek.

**TODO — devam kuralları:** Video/etkileşim konumunun ve yanıtların nasıl kaydedileceği, cihaz değişiminde devam, kesinti sonrası kayıt tutarlılığı ve eğitim sürümü değiştiğinde uygulanacak davranış tanımlanacak. Çevrimdışı kullanım veya cihazlar arası eşzamanlı oturum davranışı henüz kararlaştırılmadı.

**TODO — sonuç özeti:** Gösterilecek puan/tamamlama bilgileri, konu bazlı değerlendirme ve tekrar önerilerinin ölçütleri belirlenecek. Öneriler için AI kullanılması kararlaştırılmadı. Başarı eşiği, deneme sınırı ve yanlış cevap sonrası açıklama/yeniden deneme politikası açık kalıyor. Bu özelliklerin demo/pilot/ticari sürüme dağılımı ayrıca belirlenecek.

**Sekizinci tur kapsam ekleri:** Kaynak revizyonuna bağlı yeniden inceleme, gerektiğinde geçici yayından kaldırma, eğitim içi hata bildirimi ve soru sorma ürün planına dahil. Demo/pilot/ticari sürüme dağılımı henüz belirlenmedi. Yayın öncesi zorunlu teknik uzman onayı açık karardır.

#### Eğitim seçimi ve takip kapsamı — kararlaştırılanlar

- Kurum yöneticisi eğitim atayabilecek; kullanıcı erişimine açık katalogdan kendi eğitimini seçebilecek.
- Son tamamlama tarihi tanımlama ve hatırlatma özellikleri bulunacak.
- Gerektiğinde yenileme/tekrar eğitimi izlenebilecek.
- Yönetici tamamlama durumunu, başarı puanını, yanlış cevaplanan konuları ve katılım/başarı belgesi durumunu görebilecek.

**Önerilen durum modeli — henüz kesinleşmedi:** Atandı/seçildi → başlanmadı → devam ediyor → tamamlandı; değerlendirme sonucu ayrıca başarılı/başarısız olarak tutulacak. Gecikme, yenileme ihtiyacı ve belge durumu ayrı alanlar olarak izlenecek; eğitimin tamamlanması otomatik olarak başarılı sayılma veya belge düzenlenmesi anlamına gelmeyecek.

**TODO — bildirimler:** Kanal (uygulama içi/e-posta/diğer), gönderim zamanı, alıcı, tekrar sıklığı, tercih yönetimi ve başarısız gönderim davranışı belirlenecek. SMS, mesajlaşma uygulaması veya mobil bildirim seçimi yapılmadı. Son tamamlama tarihi bir ürün özelliğidir; proje teslim takvimine tarih atanmış değildir.

**TODO — raporlar:** Hesaplama tanımları, kişi/ekip/eğitim/seviye filtreleri, yanlış yanıtların konu eşleştirmesi, birden çok denemenin gösterimi, belge durumu ve dışa aktarma ihtiyacı netleştirilecek. Yöneticinin görebileceği veriler kurum ve rol yetkileriyle sınırlandırılacak. Eğitimlerin ve kurumların verilerinin birbirine karışmaması için erişim kapsamı tanımlanacak.

**Sürüm kapsamı açık:** Bu özellikler ürün planına dahil edildi; tamamının ilk demoda bulunması henüz kararlaştırılmadı. Asgari demo akışı eğitim atama → öğrenci tamamlama/soru yanıtlama → yönetici sonuç görüntüleme olarak korunuyor.

**Yeni kapsam kararları:** İki marka sunumu; bilgisayar, tablet ve telefon üzerinden kullanım; kurumların mevcut eğitim sistemleriyle entegrasyon ihtiyacı ürün planına dahil. Bunların tüm ayrıntılarının ilk demoda uygulanması henüz kararlaştırılmadı. Kullanıcı cihazlar arasında bir öncelik belirtmedi.

**Kararlaştırıldı:** Katılım ve başarı belgesi ürün kapsamında. Belge düzenleme, indirme, doğrulama, yeniden düzenleme ve gerektiğinde iptal davranışları gereksinim olarak ayrıntılandırılacak. Hangi işlevlerin demo, pilot veya ticari sürümde yer alacağı henüz seçilmedi.

**Belge yaşam döngüsü önerisi:** Eğitim sonucu → uygunluk koşullarının kontrolü → belge düzenleme → katılımcının erişimi → yetkili doğrulama → gerekiyorsa iptal/yeniden düzenleme. Eğitim revizyonu değiştiğinde eski belgelerin nasıl ele alınacağı ve doğrulamada hangi kişisel bilgilerin gösterileceği ayrıca belirlenecek.

**Kararlaştırılan asgari demo akışı:** Yönetici eğitim atar → öğrenci açar ve tamamlar → karar soruları yanıtlanır → sonuç saklanır → yönetici sonucu inceler. Rol bazlı ekranların aynı eğitim ve katılımcı kaydı üzerinden tutarlı çalışması hedeflenir.

**On birinci tur kapsam güncellemesi:** Aynı konu için başlangıç ve deneyimli eğitim deneyimleri demoda gösterilecek. Atama, soru ve sonuç kayıtlarında seviye bilgisinin korunması planlanacak. Seviye seçimi/ataması yöntemi açık. Belge yükleyerek içerik üretiminin çalışır demo kapsamına dahil edilmesi ayrı, tartışılacak karardır.

**Önerilen demo kabul örneği:** Örnek kurum yöneticisi bir eğitimi örnek öğrenciye atayabilir; öğrenci tamamladığında yanıtlar ve sonuç yönetici ekranında görülebilir. Yarım kalan ve başarısız tamamlanan eğitim davranışları ayrıca tanımlanacak. Kullanıcı/kurum kurulumunun derinliği, gerçek giriş yöntemi ve üretim/onay ekranları açık kapsam konularıdır.

- Kurum/kullanıcı yönetimi, eğitim kütüphanesi ve etkileşimli oynatıcı.
- Eğitim atama, sınav, ilerleme, sonuçlar ve bildirimler.
- İçerik hazırlama, inceleme, onay, yayın ve revizyon yönetimi.
- Kurum raporları, platform yönetimi ve destek araçları.
- Satış CRM'inin kapsamı ve mevcut araçlarla entegrasyon seçenekleri.
- Demo, pilot, ilk ticari sürüm ve sonraki sürümlerin ayrılması.

**Çıktı:** Önceliklendirilmiş gereksinimler ve sürüm kapsamları.

### 13. Ekranlar, kullanıcı deneyimi ve tasarım

**Yeni kapsam:** Eğitim ekranında kaldığı yerden devam; öğrenci sonuç ekranında kişisel sonuç özeti ve tekrar çalışılacak konu önerileri olacak. Yanlış yanıt sonrasında gösterilecek ekran/akış henüz seçilmedi.

**Kararlaştırıldı:** Bilgisayar, tablet ve telefon desteklenecek. **Tasarım önerisi:** Ekran boyutuna uyarlanan web arayüzüyle eğitim, soru yanıtlama ve sonuç görüntüleme akışları hazırlanacak; yönetim ve içerik üretim ekranlarının cihazlara göre kullanılabilirliği ayrıca tanımlanacak. Yerel mobil uygulama ve çevrimdışı kullanım henüz kararlaştırılmadı.

**TODO — cihaz kabul ölçütleri:** Desteklenecek ekran boyutları, tarayıcılar, dokunmatik etkileşim, video/şema okunabilirliği ve ana akışların cihaz testleri tanımlanacak. Demo, pilot ve ticari sürümde doğrulanacak cihaz kapsamı ayrıştırılacak.

**TODO — kuruma özel görünüm:** Logo, renkler, giriş ekranı, belge şablonları ve varsa alan adı/e-posta uyarlaması için kapsam ve yetkiler belirlenecek. Müşterinin logosuyla sunum kararı, her kurum için ayrı yazılım kurulumu veya ayrı uygulama geliştirme kararı değildir.

- Rol bazında menüler, ekranlar ve temel görev akışları.
- Masaüstü/tablet/mobil kullanım, bağlantı koşulları ve olası çevrimdışı ihtiyaç.
- Eğitim ekranı, soru/geri bildirim davranışı ve kaldığı yerden devam etme.
- Erişilebilirlik, hata/boş/yüklenme durumları ve kullanılabilirlik testleri.

**Çıktı:** Ekran haritası, tasarım ilkeleri ve tıklanabilir prototip kapsamı.

### 14. Sistem mimarisi, entegrasyonlar ve geliştirme

**Kararlaştırıldı:** Kurumların mevcut eğitim sistemleriyle bağlantı ihtiyacı E2E planında yer alacak. Hangi sistemlerle, hangi veri ve işlemler üzerinden entegrasyon yapılacağı sonraya bırakıldı.

**TODO — entegrasyon keşfi:** Pilot kurumdan mevcut sistem adı, teknik imkânlar ve ihtiyaç duyulan akışlar alınacak. Eğitim başlatma, kullanıcı/atama aktarımı, tamamlanma ve puan paylaşımı, belge bağlantısı veya kurumsal giriş gibi seçenekler değerlendirilecek; tamamı taahhüt edilmiş işlev değildir. Veri sahipliği, izinler, aktarım yönü, hata/tekrar davranışı ve destek sorumluluğu tanımlanacak. Protokol, tedarikçi, maliyet ve uygulama aşaması seçilmedi. Sorumlu rol: ürün/teknik ekip ve müşteri sistem sorumlusu; kişiler daha sonra atanacak.

- Uygulama bileşenleri, veri modeli, medya depolama ve içerik işleme işleri.
- Kurumların birbirinden ayrılması ve yetkilendirme yaklaşımı.
- LMS, kurumsal giriş, e-posta, ödeme ve diğer entegrasyon ihtiyaçları.
- Hazır hizmet satın alma ile özel geliştirme kararları.
- Geliştirme ortamları, dağıtım, izleme, kapasite ve teknoloji seçim ölçütleri.

**Çıktı:** Mimari tasarım, entegrasyon sözleşmeleri ve geliştirme iş paketleri.

### 15. Bilgi güvenliği, mahremiyet ve süreklilik

**Kararlaştırıldı:** Sözleşme sonunda veri teslimi, erişim kapatma ve saklama/silme ayrı bir süreç olarak planlanacak. **TODO:** Veri kategorilerine göre saklama/silme koşulları, yedeklerdeki veriler, işlem kanıtları, belge doğrulama kayıtlarının durumu ve ilgili sözleşme koşulları uzmanlarla netleştirilecek. Bu aşamada saklama süresi, otomatik silme veya teslim formatı seçilmedi.

**Kararlaştırılan erişim sınırı:** Kuruma özel kaynaklar ve eğitimler diğer kurumlara görünmeyecek; genel katalog paylaşımı için ayrıca izin gerekecek. **Açık kararlar:** Platform içi rol/yetki modeli ve dış AI servislerinde veri işleme yaklaşımı. Bu konuların sonraya bırakılması, sınırsız erişim veya veri aktarımı izni olarak yorumlanmayacak.

- Korunacak veriler, erişim sınırları ve tehdit değerlendirmesi.
- Kimlik doğrulama, kayıtlar, gizli bilgiler ve güvenli veri aktarımı.
- Kişisel veri işleme, saklama süreleri, veri konumu ve alt hizmet sağlayıcılar.
- Yedekleme, geri yükleme, hizmet kesintisi ve güvenlik olayı müdahalesi.
- Müşterilerin güvenlik incelemeleri için hazırlanacak belgeler.

**Çıktı:** Güvenlik/mahremiyet gereksinimleri ve olay müdahale planı.

### 16. Hukuk, fikri mülkiyet ve düzenleyici çerçeve

#### Kaynak temini ve eğitimde kullanım kararı

Airbus, teknik yayınlara erişim için AirbusWorld ve airnavX kanalını açıklıyor. Boeing, MyBoeingFleet içindeki pazaryerinde yetkili müşterilere bakım verisi ve teknik yayın erişimi sunuyor ve teknik veri lisanslama seçenekleri yayımlıyor. Ekip, eğitim ürünü için gerekli kullanım haklarını seçilen belge ve müşteri modeli üzerinden yazılı olarak doğrulayacak. [Airbus airnavX](https://www.airbus.com/en/newsroom/news/2018-02-new-generation-technical-data-management-with-airnavx) · [Boeing Data & Services Marketplace](https://services.boeing.com/maintenance/tech-ops/data-services-marketplace) · [Boeing lisanslama](https://www.boeing.com/company/licensing)

| Seçenek | İlk adım | Karar için gerekli bilgi |
| - | - | - |
| Hak sahibinden doğrudan izin veya lisans | Seçilen uçak tipi, belge seti ve eğitim senaryosuyla ilgili üreticiye veya hak sahibine başvuru kapsamını hazırlamak | Kaynak erişimi, uyarlama ve çeviri, görüntü/şema kullanımı, AI işleme, pilot ve ticari dağıtım için yazılı koşullar |
| Yetkili kurumla çalışma veya özgün demo | Pilot kurumun paylaşım ve üçüncü tarafa işleme yetkisini sözleşmeden doğrulamak. İzin netleşene kadar genel kavramları özgün görsel ve temsili parçayla göstermek | Kuruma özel kullanım sınırı, üçüncü kişiye sunum izni, kaynağın güncelliği ve uzman incelemesi |

**Demo kaynak kararı.** İlk demo özgün ve temsili içerikle hazırlanacak. Gerçek teknik kaynaklara dayalı modüller için doküman erişimi, ticari eğitimde uyarlama ve dağıtma hakları sözleşmede ayrı ayrı kontrol edilecek. Üreticiye başvuru gereği seçilen kaynağın hak sahibine ve mevcut lisans kapsamına göre değerlendirilecek. Gerçek teknik kaynakların temin yolu Gürkan ve Barış’ın kararına açık.

**Eğitim statüsü:** Sınava hazırlık içeriğinin hangi sınavı hedeflediği ayrıca belirlenecek. Resmî bakım eğitimi, sınav veya yetki iddiası düşünülürse kapsam SHGM ve ilgili yetkili eğitim kuruluşuyla doğrulanacak. [SHGM bakım eğitim kuruluşları](https://web.shgm.gov.tr/tr/s/2070-shy-147-bakim-teknisyeni-egitim-kuluslari)

**Yeni kaynak girdisi — PDF-T01 maddeler 06 ve 10:** B1 hedefi, gerekirse C kapsamının değerlendirilmesi ve farklı otoritelerin gereksinimlerinin incelenmesi öneriliyor. Bunlar doğrulanmamış kapsam önerileridir; platformun lisans vermesi veya mevcut katılım/başarı belgelerinin lisans yerine geçmesi kararlaştırılmadı.

**TODO — hedef kapsam ve otorite matrisi:** Türkiye hedefiyle ilişkili otorite/gereksinimler; hedef kullanıcı profili ile B1 ve olası C bağlamı; destekleyici eğitim ile onaylı eğitim beklentisi ayrı ayrı uzman incelemesine alınacak. Kaynakta adı geçen SHGM, EASA ve FAA başlıklarının ürüne hangi ölçüde uygulanacağı güncel birincil kaynaklarla doğrulanacak. B1/C kapsamı, uzman nitelikleri, müfredat eşleştirmesi, değerlendirme ve belge ifadeleri bu inceleme sonrasında karara bağlanacak. Bu sürüm mevzuat uygunluğu beyanı değildir.

#### Uzmanlarla netleştirilecek idari ve hukuki iş listeleri

**Kararlaştırıldı — onuncu soru-cevap turu:** Şirket kuruluşu, sözleşmeler, muhasebe ve sigorta ayrı iş listeleri olarak tutulacak. Aşağıdakiler uzman incelemesiyle netleştirilecek planlama konularıdır; belirli bir şirket türü, hukuki zorunluluk veya sigorta ürünü seçimi değildir. Tarih ve bütçe tutarı atanmadı.

| İş listesi | TODO / hazırlanacak çıktı | Görüşü alınacak rol | Durum |
| - | - | - | - |
| Şirket kuruluşu | Mevcut tüzel yapı varsa uygunluğunu değerlendirmek; kuruluş gerekip gerekmediğini, faaliyet/ortaklık yapısını, görevleri ve başvuru adımlarını belirlemek | Kurucu, mali müşavir ve gerektiğinde hukuk uzmanı | TODO |
| Sözleşmeler | Müşteri hizmeti, pilot, içerik izinleri, uzman/tedarikçi, gizlilik ve veri işleme ihtiyaçlarını değerlendirmek; gereken metinleri ve onay sürecini hazırlamak | Hukuk uzmanı ve ilgili iş sorumluları | TODO |
| Muhasebe | Kayıt/faturalama düzeni, tahsilat, gider belgeleri, abonelik/üretim gelirlerinin takibi ve uygulanacak vergi yaklaşımını belirlemek | Mali müşavir / finans | TODO |
| Sigorta | Faaliyet, içerik, hizmet ve veri risklerini değerlendirmek; gerekli/uygun teminatları, istisnaları ve teklifleri karşılaştırmak | Sigorta uzmanı; gerektiğinde hukuk uzmanı | TODO |

**Bağlantılar:** Sözleşme çalışmaları içerik kullanım hakları ve müşteri destek kapsamıyla; muhasebe çalışmaları fiyatlandırma ve bütçe tablolarıyla; sigorta değerlendirmesi risk kaydıyla birlikte güncellenecek. Uzmanların ve karar sorumlularının isimleri henüz belirlenmedi.

**Yeni kapsam konuları:** Kurumdan alınan içeriğin kullanım/uyarlama/paylaşım izinleri, uzman sözleşmelerinde üretilen eser ve inceleme sorumlulukları, katılım/başarı belgelerinin düzenleyicisi ve kullanılacak ifadeler. Belgeler için akreditasyon, mevzuat tanınırlığı veya bakım yetkilendirmesi iddiası kararlaştırılmadı; böyle bir hedef seçilirse ayrıca doğrulanacak.

- Şirket yapısı, faaliyet ülkeleri ve sözleşme tarafları.
- AMM ve diğer kaynakların işlenmesi, türev içerik oluşturulması ve dağıtım hakları.
- Üretilen içerik, yazılım, müşteri verisi ve ortak üretimlerin mülkiyeti.
- Gizlilik, hizmet, veri işleme, pilot ve uzman/tedarikçi sözleşmeleri.
- Eğitim statüsü, belgelendirme iddiaları, sorumluluk sınırları ve sigorta ihtiyacı.
- Uzman hukuki/düzenleyici inceleme gerektiren konular ve inceleme kayıtları.

**Çıktı:** Hukuki konu ve sözleşme envanteri; doğrulanmış kullanım sınırları.

### 17. Ticari model, paketler ve fiyatlandırma

**TODO — özel içerik teslim koşulları:** Senaryo geri bildirim aşaması, dahil düzeltme kapsamı/sayısı, kapsam dışı değişikliklerin fiyatlandırılması ve kabul koşulları teklif/sözleşmede tanımlanacak. Bu turda düzeltme sayısı, ek ücret veya üretime geçiş için zorunlu müşteri onayı belirlenmedi.

#### 17.1 Fiyatlandırma seçenekleri — tutarlar daha sonra

**Kararlaştırıldı — dokuzuncu soru-cevap turu:** Fiyatlandırma seçenekleri listelenecek; fiyatlar daha sonra belirlenecek ve TODO olarak tutulacak. Aşağıdaki modeller seçeneklerdir; tamamının aynı anda uygulanması veya her biri için ayrı ücret alınması kararlaştırılmadı.

| Seçenek | Ücretin dayanağı | Tanımlanacak kapsam | Fiyat | Durum |
| - | - | - | - | - |
| Kurum aboneliği | Kurum ve seçilecek abonelik dönemi | Dahil kullanıcı, katalog, yönetim/raporlar ve destek sınırları | | TODO |
| Kullanıcı başına ücret | Kayıtlı, aktif veya atanan kullanıcı — ölçüt seçilecek | Minimum kullanıcı, kullanım hesabı ve dönem | | TODO |
| İçerik paketi | Seçilen eğitim/modül grubu | Modüller, seviyeler, erişim süresi ve güncelleme kapsamı | | TODO |
| Özel içerik üretimi | Kuruma özel üretim/uyarlama işi | Kaynak hazırlığı, senaryo, medya, inceleme ve düzeltme kapsamı | | TODO |

**TODO — fiyat ve paketler:** Modellerin ayrı/karma kullanımı, paket içerikleri, ücretlendirme birimi, para birimi, vergi yaklaşımı, ödeme/yenileme koşulları ve indirim politikası belirlenecek. Fiyatlar maliyet, müşteri görüşmeleri ve pilot bulgularıyla değerlendirilecek. Bu aşamada fiyat veya fiyat aralığı atanmadı. Kuruma özel görünüm ve entegrasyon için ek ücret gerekip gerekmediği de açık.

#### 17.2 Pilotun ticari koşulları

**Açık karar:** Pilotun ücretli veya ücretsiz olmasına daha sonra karar verilecek. Pilot fiyatı, süresi, katılımcı sayısı, üretilecek içerik, destek sınırları, veri/geri bildirim paylaşımı ve ticari hizmete geçiş koşulları henüz belirlenmedi. Ücretli pilot bir zorunluluk veya alınmış karar olarak kabul edilmeyecek.

**TODO — yeni kapsamın fiyat etkisi:** Müşteri markasıyla sunum ve kuruma özel entegrasyonun standart pakete dahil mi yoksa ek hizmet mi olacağı belirlenecek. Bütçe şablonundaki ürün tasarımı/geliştirme, müşteri kurulumu/entegrasyon ve destek kalemleriyle ilişkilendirilecek; tutar yazılmayacak.

- Platform aboneliği, kullanıcı lisansı, içerik paketi, kurulum ve özel üretim gelirleri.
- Ücretli/ücretsiz pilot tercihi, kapsam sınırları ve ticari sürüme geçiş.
- Fiyat araştırması, maliyet tabanı, indirim ve ek kullanım politikaları.
- İçerik güncellemesi, destek ve özel entegrasyonların paketlere dahil edilmesi.

**Çıktı:** Fiyat hipotezleri, paket tablosu ve teklif modeli.

### 18. Pazarlama, satış, ortaklıklar ve CRM

#### İlk görüşme adayları ve sunum sırası

- **Uzman görüşü.** Selim Kona’ya senaryo taslağını mı yoksa çalışan demoyu mu göstereceğimiz Gürkan’la görüşülecek. Berk Kabacı ve Kaan Boyçay görüşmede bağlantı adayı olarak anıldı. Rolleri ve hangi konuda destek olabilecekleri teyit edilecek.
- **Kurumsal adaylar.** İlk sunum için özel eğitim sağlayıcıları öncelikli. Sohbette Southwind olası bağlantı olarak geçiyor. Northwind adı ilk notlarda belirsiz geçtiği için kurum ve muhatap teyit edilecek. Pegasus ve Turkish Technic görüşme veya karşılaştırma adayları olarak değerlendirilecek. Aktif satın alma talebi veya pilot anlaşması henüz teyit edilmedi.
- **İlk muhatap.** Gürkan, İK’yı giriş noktası olarak önerdi. Eğitim ve teknik birimler demo kapsamı ve değerlendirme için aday muhataplar. İlk görüşme listesi ve mesajlar Gürkan ile Barış’ın ortak değerlendirmesinden geçecek.
- **Sunum hazırlığı.** Önce konu ve kaynaklar seçilecek, sonra Barış prototipi hazırlayacak. Gürkan ve deneyimli bir uzmanla ön inceleme yapıldıktan sonra ilk kurum sunumu planlanacak. Üreticiyle kaynak izni görüşmesi ile havayoluna ürün sunumu ayrı işler olarak takip edilecek.

Gürkan ve Barış, pazarlama ve halkla ilişkiler (PR) çalışmalarını birlikte yürütür.

#### 18.1 Kararlaştırılan satış CRM'i akışı

**Kararlaştırıldı:** Müşteri adayı → görüşme → demo → teklif → pilot → sözleşme → yenileme akışı plana dahil.

| Aşama | Amaç | Önerilen kayıt/çıktı |
| - | - | - |
| Müşteri adayı | Kurumu ve ilk bağlantıyı kaydetmek | Kurum türü, kişi/rol, bağlantı kaynağı ve ilk ihtiyaç |
| Görüşme | İhtiyacı ve satın alma sürecini anlamak | Görüşme notu, karar vericiler, ihtiyaçlar ve sonraki adım |
| Demo | Eğitim + platform teklifini göstermek | Gösterilen kapsam, geri bildirim ve ilgilenilen kullanım |
| Teklif | Kapsamı ve ticari koşulları sunmak | Teklif sürümü, teslim/hizmet kapsamı, fiyat belirlenince tutar |
| Pilot | Kurumla sınırlı uygulamayı değerlendirmek | Pilot kapsamı, ticari koşul kararı, kabul ölçütleri ve bulgular |
| Sözleşme | Ticari hizmet ilişkisini kurmak | Hizmet/paket, taraflar, onaylar ve sözleşme kaydı |
| Yenileme | Devam, kapsam değişikliği veya ayrılmayı yönetmek | Kullanım/değer değerlendirmesi, yenileme sonucu ve gerekçe |

**Netleştirme:** Bu sıra CRM takip akışıdır. Pilotun başlaması için gerekli olabilecek pilot sözleşmesi, gizlilik veya veri işleme düzenlemeleri ilgili aşamada ayrıca ele alınacak; sözleşme aşamasının pilot sonrasında görünmesi pilotun sözleşmesiz yapılacağı anlamına gelmez.

**TODO — CRM ayrıntıları:** Aşama geçiş koşulları, sorumlu kişiler, görev/hatırlatma, kaybedildi/beklemede gibi durumlar, teklif sürümleri, raporlar ve hazır CRM kullanımı ya da platform içinde geliştirme seçimi belirlenecek. CRM'in ilk demoda çalışır kapsamda bulunması henüz kararlaştırılmadı. Kurum ve bağlantı listesinin kullanıcıdan daha sonra alınması TODO olarak korunuyor.

**Kararlaştırıldı:** İlk pazarlama ve satış odağı Türkiye; demo hedef kitlesi yatırımcılar ve potansiyel müşteriler birlikte. Kurum ve bağlantı listesinin kullanıcı tarafından daha sonra paylaşılması açık TODO olarak takip edilecek.

- İlk müşterilere erişim, kurucu ağı, sektör ortakları ve satış kanalları.
- Mesajlar, web sitesi, tanıtım materyalleri ve demo sunumu.
- Müşteri adayı → görüşme → demo → teklif → pilot → sözleşme süreci.
- Kurumsal satın alma, teknik değerlendirme ve güvenlik inceleme adımları.
- CRM kayıtları, satış sorumluları ve satış başarısı ölçütleri.

**Çıktı:** Pazara giriş planı, satış süreci ve ilk müşteri edinme planı.

### 19. Müşteri kurulumu, destek ve günlük operasyon

#### 19.3 Müşteri ayrılış süreci

**Kararlaştırıldı — on altıncı tur:** Sözleşme sona erdiğinde veri teslimi, erişim kapatma ve saklama/silme adımları ayrı bir süreçte yönetilecek.

**Önerilen iş akışı:** Sona erme koşullarını doğrulama → müşteri ve ekip muhataplarını belirleme → teslim edilecek veri envanterini çıkarma → yetkili kişiye güvenli teslim ve teslim kontrolü → erişim/entegrasyonları kapatma → belirlenecek saklama/silme politikasını uygulama → kapanış kaydı oluşturma. Kesin sıralama ve geçiş koşulları sözleşme ve veri politikasıyla netleştirilecek.

**TODO — ayrılış koşulları:** Talep/onay yetkileri, veri teslim kapsamı ve yöntemi, müşteri kabulü, hesap ve entegrasyon erişimleri, varsa teslim ücreti, saklama/silme, yedekler, açık destek talepleri ve düzenlenmiş belgelerin doğrulanmasına etkisi belirlenecek. Kuruma ait kaynaklar ile platforma ait içerik/yazılımın ayrımı ayrıca yapılacak. Tarih, süre veya ücret atanmadı.

**Yeni operasyon ihtiyacı:** Kuruma özel içeriklerde senaryo geri bildirimi, düzeltme talepleri ve sürüm geçmişi takip edilecek. Genel kullanım desteği, eğitim içi hata/soru ve üretim düzeltme talepleri arasındaki ilişki tanımlanacak; aynı kaydın tekrar işlenmesini önleyecek yönlendirme düzeni planlanacak. Müşteri tarafındaki muhatap ve ekip sorumlusu henüz atanmadı.

#### 19.1 Kurulum ve müşteri eğitimi

**Kararlaştırıldı:** İlk kurulum, kurum yöneticisi eğitimi ve kullanım desteği hizmet kapsamında sunulacak.

**Önerilen kurulum akışı:** Kurum/marka bilgilerini alma → hesap ve yetki düzenini kurma → kullanıcı/katalog ayarlarını yapma → örnek eğitim atama → yöneticiye kullanım eğitimi → ilk kullanım kontrolü → destek akışına geçiş. Veri aktarımı veya entegrasyon gerekiyorsa kapsam ayrıca belirlenecek.

**TODO — hizmet sınırları:** Kurulumda teslim edilecekler, eğitim yöntemi/materyali, oturum kapsamı, müşteri ve ekip sorumlulukları, kabul kontrolü ve ek hizmetler tanımlanacak. Bu hizmetlerin standart pakete dahil veya ayrıca ücretli olması fiyatlandırma çalışmasında kararlaştırılacak.

#### 19.2 Uygulama içi destek

**Kararlaştırıldı:** Destek kanalı uygulama içi talepler olacak. E-posta, telefon veya WhatsApp destek kanalı olarak seçilmedi. Destek kanalı kararı, eğitim hatırlatmalarının bildirim kanalını belirlemiyor; o konu ayrı TODO olarak kalıyor.

**Önerilen talep akışı:** Kullanıcı destek talebi açar → kategori ve ilgili kurum/eğitim bağlamı kaydedilir → sorumluya atanır → yanıt ve durum uygulama içinde gösterilir → çözüm kaydedilir → talep kapatılır; gerekirse yeniden açılır.

**TODO — destek kuralları:** Talep açabilecek roller, kategoriler, öncelikler, ek dosya ve erişim kuralları, sorumlular, çalışma düzeni ve kapanış ölçütleri belirlenecek. Yanıt/çözüm süreleri ve hizmet taahhütleri daha sonra değerlendirilecek; bu aşamada süre atanmadı.

**İçerik bildirimleriyle ilişki:** Eğitim içindeki hata bildirme ve soru sorma özellikleri korunacak. Bu kayıtların genel destek talepleriyle aynı sistemde mi yoksa bağlantılı ayrı ekranlarda mı yönetileceği açık tasarım kararıdır. Teknik içerik soruları uygun inceleyen role yönlendirilecek.

**Yeni operasyon akışları:** Eğitim içi sorular ve hata bildirimleri sorumlulara yönlendirilecek; içerik incelemesi gerektiren kayıtlar revizyon iş akışına bağlanacak. Kaynak değişikliğinde etkilenen kurum/eğitimlerin takibi, gerektiğinde erişimin durdurulması ve yeniden yayın iletişimi tanımlanacak. Destek ile teknik içerik yanıtı sorumlulukları ayrıca ayrıştırılacak.

**Yeni operasyon ihtiyaçları:** Kuruma açık katalog ve atama kuralları, hatırlatma ayarları, geciken eğitim takibi ve tekrar eğitimlerinin yönetimi müşteri kurulumunda ele alınacak. Raporlara erişecek yöneticiler belirlenecek. Tarih değişikliği, hatalı atama, tekrar talebi ve belge düzeltme işlemlerinin sorumluları/iz kayıtları tanımlanacak.

- Kurumun sisteme alınması, kullanıcı aktarımı, yönetici eğitimi ve ilk eğitim ataması.
- Destek kanalları, olay öncelikleri ve hizmet taahhütleri.
- İçerik güncellemeleri, müşteri talepleri ve özel işlerin yönetimi.
- Kullanımın izlenmesi, müşteri başarı görüşmeleri, yenileme ve ayrılma süreci.
- Sözleşme sonunda veri aktarımı, erişim kapatma ve silme işlemleri.

**Çıktı:** Operasyon rehberi, müşteri kurulum ve ayrılma kontrol listeleri.

### 20. Ekip, tedarikçiler ve çalışma düzeni

#### Proje ortakları ve görev dağılımı

| Ortak | Ana sorumluluk | Ortak sorumluluk |
| - | - | - |
| Gürkan | Ürün sahipliği (Product Owner). Havacılık ve eğitim ihtiyaçlarını ürün önceliklerine dönüştürür, içerik ve ürün kapsamının şekillenmesine yön verir. | Pazarlama ve halkla ilişkiler (PR) |
| Barış | Yazılım geliştirme. Ürün kapsamının teknik tasarımını ve uygulamaya geçirilmesini yürütür. | Pazarlama ve halkla ilişkiler (PR) |

#### 20.1 Uzmanlarla çalışma seçenekleri

**Kararlaştırıldı:** Aşağıdaki üç seçenek dokümanda tutulacak; seçim sonraya bırakılacak. Modeller gerektiğinde farklı işler için birlikte kullanılabilir; bu henüz karar değildir.

| Model | Önerilen kullanım | Netleştirilecek ticari/çalışma koşulları | Planlama riski |
| - | - | - | - |
| Danışmanlık | Düzenli teknik görüş, inceleme ve revizyon desteği | Saat/gün veya dönem ücreti, erişilebilirlik, iş sınırı, inceleme teslimi | Kapasite ve yanıt süresi belirsizliği |
| Proje başına hizmet | Belirli modül, kaynak seti veya pilotun incelenmesi/üretilmesi | İş tanımı, teslim/kabul koşulu, düzeltme hakkı, ücret ve güncelleme kapsamı | Yeni revizyonların ilk teklif dışında kalması |
| Ortaklık | Uzun vadeli uzman katkısı ve ürün geliştirme iş birliği | Katkı beklentisi, karar yetkisi, kazanç/pay modeli, fikri mülkiyet ve ayrılma koşulları | Rol, beklenti ve karar yetkisi uyuşmazlığı |

**TODO — uzman modeli seçimi:** Aday uzmanlar ve iş yükü belirlendikten sonra seçenekler maliyet, süreklilik, bağımsız inceleme, çıkar çatışması, uzmanlık uygunluğu ve kapasite açısından değerlendirilecek. Henüz ücret, ortaklık payı veya kişi belirlenmedi.

**Plan bağımlılığı:** Teknik uzmanlar henüz belirlenmedi. Uzman bulma, görev kapsamını belirleme ve çalışma koşullarını netleştirme hazırlık aşamasının iş paketidir. İnceleme ve yayın sorumlulukları tanımlanacak; rol dağılımı ve yayın öncesi teknik uzman onayının zorunluluğu henüz kararlaştırılmadı.

- Kurucu ekip, teknik uzmanlar, geliştirme, içerik, satış ve destek rolleri.
- İç kaynak/dış kaynak kararları, kapasite ve işe alım ihtiyacı.
- Uzman erişimi, üretici/kurum ortaklıkları ve tedarikçi bağımlılıkları.
- Toplantı düzeni, iş takibi, kalite sorumluluğu ve karar kayıtları.

**Çıktı:** Ekip planı, sorumluluk tablosu ve tedarikçi seçim ölçütleri.

### 21. Finans, bütçe ve yatırım ihtiyacı

**Kararlaştırıldı:** Bu aşamada bütçe tutarları belirlenmeyecek. Aşağıdaki tablo sonradan doldurulacak bütçe şablonudur. Boş hücreler sıfır maliyet veya ücretsiz hizmet anlamına gelmez. Kalemler planlama adaylarıdır; satın alma/harcama kararı değildir.

#### 21.1 Doldurulacak bütçe tablosu

| Kod | Gider kalemi | Aşama | Gider türü | Miktar | Birim | Birim fiyat | Para birimi | Dönem / sıklık | Hesaplanan tutar | Teklif / dayanak | Sorumlu rol | Durum |
| - | - | - | - | - | - | - | - | - | - | - | - | - |
| B01 | Kaynak doküman erişimi ve kullanım izinleri | Hazırlık / devamı | Tek seferlik / tekrarlayan | | Lisans / belge | | | | | | Proje / hukuk | TODO |
| B02 | Teknik uzman ve içerik incelemesi | Demo / pilot / hizmet | Üretim hacmine bağlı | | Saat / modül | | | | | | Eğitim / teknik kalite | TODO |
| B03 | Öğrenme tasarımı ve senaryo yazımı | Demo / pilot / hizmet | Üretim hacmine bağlı | | Saat / modül | | | | | | Eğitim / içerik | TODO |
| B04 | Sinematik video, animasyon, şema ve kurgu | Demo / pilot / hizmet | Üretim hacmine bağlı | | Sahne / dakika / modül | | | | | | Medya üretimi | TODO |
| B05 | Seslendirme ve altyazı | Demo / pilot / hizmet | Üretim hacmine bağlı | | Dakika / modül | | | | | | Medya üretimi | TODO |
| B06 | AI ve medya üretim araçları | Demo / pilot / hizmet | Abonelik / kullanım | | Hesap / kredi / işlem | | | | | | İçerik / teknik ekip | TODO |
| B07 | Ürün tasarımı ve yazılım geliştirme | Demo / pilot / hizmet | Proje / bakım | | Saat / iş paketi | | | | | | Ürün / geliştirme | TODO |
| B08 | Barındırma, veri ve medya depolama, video aktarımı | Demo / pilot / hizmet | Tekrarlayan / kullanım | | Ay / depolama / trafik | | | | | | Teknik operasyon | TODO |
| B09 | Alan adı, e-posta ve çalışma araçları | Hazırlık / devamı | Tekrarlayan | | Hesap / dönem | | | | | | Operasyon | TODO |
| B10 | Test, erişilebilirlik ve güvenlik incelemesi | Demo / pilot / hizmet | Proje / tekrarlayan | | Saat / inceleme | | | | | | Kalite / güvenlik | TODO |
| B11 | Hukuk, sözleşmeler ve veri koruma incelemesi | Hazırlık / pilot / hizmet | Proje / danışmanlık | | Saat / belge | | | | | | Hukuk / proje | TODO |
| B12 | Şirket kuruluşu, muhasebe ve idari giderler | Gerektiğinde | Tek seferlik / tekrarlayan | | İşlem / dönem | | | | | | Yönetim / finans | TODO |
| B13 | Marka, tanıtım, satış ve yatırımcı materyalleri | Demo / pilot / hizmet | Proje / tekrarlayan | | İş paketi / dönem | | | | | | Satış / pazarlama | TODO |
| B14 | Pilot uygulama, katılımcılar ve ölçüm | Pilot | Proje / katılımcıya bağlı | | Kurum / kişi / oturum | | | | | | Pilot koordinasyonu | TODO |
| B15 | Müşteri kurulumu, eğitim ve entegrasyon | Pilot / hizmet | Müşteriye bağlı | | Kurum / saat / entegrasyon | | | | | | Müşteri / teknik ekip | TODO |
| B16 | Destek, bakım ve müşteri başarısı | Pilot / hizmet | Tekrarlayan / kullanıma bağlı | | Saat / dönem | | | | | | Operasyon | TODO |
| B17 | Kaynak revizyonu ve içerik güncellemesi | Pilot / hizmet | Revizyona bağlı | | Revizyon / modül / saat | | | | | | İçerik / teknik kalite | TODO |
| B18 | Seyahat, toplantı ve saha çalışması | Gerektiğinde | Faaliyete bağlı | | Ziyaret / kişi | | | | | | Proje / satış | TODO |
| B19 | Sigorta ve diğer gerekli hizmetler | Gerektiğinde | Tek seferlik / tekrarlayan | | Poliçe / hizmet | | | | | | Yönetim / hukuk | TODO |
| B20 | Risk payı / beklenmeyen gider rezervi | Tüm aşamalar | Ayrı rezerv | | Tutar / oran | | | | | | Yönetim / finans | TODO |

**Doldurma kuralları:** Her satırda tek bir ölçü birimi ve hesaplama temeli seçilecek; alternatifler birlikte çarpılmayacak. Aşamaya göre fiyat veya miktar değişiyorsa satır ayrılacak. Tek seferlik tutar miktar × birim fiyat; tekrarlayan toplam buna seçilen dönem sayısının uygulanmasıyla hesaplanacak. Kullanım giderleri seçilen hacim varsayımına dayanacak. KDV/vergi dahil-hariç tercihi, para birimi ve kur varsayımı doldurma aşamasında belirtilecek. Farklı para birimleri doğrudan toplanmayacak.

**Çifte sayım kontrolü:** Dış hizmet teklifinin içinde bulunan uzman, araç veya üretim giderleri ayrıca tekrar eklenmeyecek. Kurucu/ekip emeği nakit ödeme gerektirmese bile ayrı izlenecek. Risk rezervi normal giderlerden ayrı gösterilecek; ayrıca bir kez daha giderleştirilmeyecek.

#### 21.2 Aşama bazında bütçe özeti — doldurulacak

| Aşama | Tek seferlik giderler | Üretim / kullanım giderleri | Tekrarlayan giderler | Toplam nakit ihtiyacı | Nakit dışı ekip emeği | Dayanak / açık varsayımlar |
| - | - | - | - | - | - | - |
| Hazırlık | | | | | | |
| Demo | | | | | | |
| Pilot | | | | | | |
| Ücretli hizmete geçiş | | | | | | |
| Sürekli işletim — dönem belirlenecek | | | | | | |
| Ayrı risk rezervi | | | | | | |

**TODO — bütçe:** İş paketleri ve miktarlar netleştiğinde teklifler/fiyat dayanakları toplanacak; para birimi, hesaplama dönemi, ekip emeği, vergi yaklaşımı ve rezerv yöntemi belirlenerek iki tablo doldurulacak. Sorumlu rol: proje yönetimi / finans; atanacak kişi henüz belirlenmedi. Son tarih atanmadı. Bu aşamada bütçe üst sınırı veya tutar tahmini kararlaştırılmadı.

- Başlangıç yatırımı, aylık sabit/değişken giderler ve nakit ihtiyacı.
- Onaylı içerik dakikası/modülü başına üretim ve güncelleme maliyeti.
- Müşteri başına hizmet maliyeti, gelir, katkı payı ve satış maliyeti.
- Düşük/temel/yüksek talep senaryoları, nakit akışı ve başabaş koşulları.
- Yatırım tutarı, kaynak kullanımı ve yatırımın ulaşacağı kilometre taşları.

**Çıktı:** Varsayımları açık finans modeli ve bütçe planı.

### 22. Pilot, doğrulama ve başarı ölçümü

**Yeni ölçüm önerisi — PDF-T01 madde 09:** Hata sayısı ve hata sıklığı pilot ölçüm tasarımına aday olarak eklendi. Kaynaktaki ifade henüz kesin KPI veya hedef oran değildir. Grafik/etkileşim planı daha sonra yapılacak.

**TODO — hata ölçümü tasarımı:** Eğitimde yanlış yanıt, kaynak/konfigürasyon seçim hatası ve içerik üretim hatası ayrı sınıflandırılacak. Sayım birimi, toplam fırsat/yanıt gibi oran paydası, tekrar denemeleri, kritik hata ayrımı ve seviye/modül bazında raporlama tanımlanacak. İncelenen süre/oturum sayısı gibi sıklık temeli ayrıca belirlenecek. Simülasyondaki hata azalması gerçek bakım olaylarının azaldığını tek başına kanıtlayan sonuç olarak sunulmayacak.

#### 22.1 Kararlaştırılan pilot ölçüm başlıkları

**Kararlaştırıldı — on dördüncü soru-cevap turu:** İçerik üretim maliyeti, uzman inceleme yükü ve kurumun ödeme isteği pilotta değerlendirilecek.

| Ölçüm başlığı | Önerilen kayıtlar | Netleştirilecekler |
| - | - | - |
| İçerik üretim maliyeti | Senaryo, medya, araç kullanımı, düzeltme ve inceleme giderleri; ekip emeği | Modül/dakika başına hesaplama, gider dağıtımı ve nakit dışı emeğin gösterimi |
| Uzman inceleme yükü | İncelenen modül/sürüm, inceleme emeği, düzeltme turu ve yeniden inceleme | Kayıt yöntemi, iş türleri ve kabul edilebilir yük |
| Kurumun ödeme isteği | Görüşülen yetkili, değerlendirilen paket/kapsam ve gerekçeli geri bildirim | Görüşme/teklif yöntemi, karar verici doğrulaması ve ticari değerlendirme ölçütleri |

**Not:** Ölçüm başlıkları kararlaştırıldı; yöntemler, hedefler ve eşikler henüz seçilmedi. Ödeme isteği beyanı, gerçekleşmiş satış veya gelir olarak raporlanmayacak. Uzman inceleme yükünü ölçmek, yayın öncesi uzman onayının zorunluluğunu karara bağlamıyor.

#### 22.2 Sonraya bırakılan değerlendirme ve etkileşim planı

**TODO — ayrıntılı grafik planı:** Kullanıcının etkileşimi artırma hedefi doğrultusunda değerlendirme akışı, etkileşim noktaları ve sonuçların görsel sunumu daha sonra birlikte planlanacak. Eğitim öncesi/sonrası değerlendirmenin kullanılması henüz kararlaştırılmadı; önceki taslaktaki başlangıç/son ölçüm başlıkları yöntem adayı olarak kalıyor. Grafik türleri, gösterilecek veriler, ölçüm yöntemi ve ekran ayrıntıları bu aşamada seçilmeyecek. Etkileşim artışı doğrulanmış sonuç değil, tasarım hedefidir.

**Sonraya bırakıldı — geri bildirim grupları:** Öğrenci, eğitmen ve kurum yöneticisinden ayrı ayrı geri bildirim toplanıp toplanmayacağına kullanıcı daha sonra karar verecek. Gruplar, sorular, yöntem ve katılımcı sayıları henüz belirlenmedi. Genel demo/pilot geri bildirim ihtiyacı korunuyor; her gruptan ayrı veri toplama zorunluluğu oluşturulmadı.

- Pilot kurumun, katılımcıların ve teknik inceleyenlerin seçimi.
- Başlangıç ölçümü, eğitim sonrası ölçüm ve bilgi kalıcılığı takibi.
- Kullanılabilirlik, teknik doğruluk, üretim maliyeti ve ödeme isteği değerlendirmesi.
- Yazılım, içerik ve operasyon kabul ölçütleri.
- Devam etme, kapsam değiştirme veya durdurma kararları için eşikler.

**Çıktı:** Pilot protokolü, ölçüm planı ve değerlendirme raporu şablonu.

### 23. Yol haritası, bağımlılıklar ve riskler

**Takvim görüşme notu:** Önceki plan tarih atamadan hazırlanmıştı. 9 Kasım görüşme notunda yaklaşık iki hafta içinde 2–3 hazırlık toplantısı, 1 Aralık 2026 için kısmi demo ve 15 Aralık 2026 için tamamlanmış demo önerildi. Bunlar görüşme hedefleri. Kapsam, kaynak izinleri ve inceleyen kişinin uygunluğu netleşince Gürkan ve Barış birlikte teyit edecek.

#### 23.1 Tarihsiz uygulama planı

| Sıra | İş paketi | Ön koşul | Beklenen teslim | Sorumlu rol — atanacak | Takvim durumu |
| - | - | - | - | - | - |
| 1 | E2E kapsamını derinleştirme | Mevcut belgeler ve soru-cevaplar | Kararlar, açık sorular ve kapsam | Proje yönetimi | TODO — daha sonra |
| 2 | Kaynak envanteri ve kullanım hakları incelemesi | Kaynak belgelere erişim | Kaynak/kullanım sınırları listesi | İçerik / hukuk | TODO — daha sonra |
| 3 | Uzman bulma ve iş birliğini tanımlama | Teknik inceleme ihtiyacının tanımı | Uzman rolleri ve çalışma koşulları | Proje yönetimi | TODO — daha sonra |
| 4 | Aday konuları değerlendirip ilk modülü seçme | Kaynak ve uzman değerlendirmesi | Tek konu için başlangıç ve deneyimli seviyelerini kapsayan demo içerik planı | Eğitim / teknik uzman | TODO — daha sonra |
| 5 | Demo senaryosu, ekranlar ve bütçe hazırlığı | İlk modül ve uçtan uca akış kapsamı | Senaryo, ekran planı ve doldurulmuş bütçe | Ürün / içerik / finans | TODO — daha sonra |
| 6 | Demo içerik ve uygulama üretimi | Kaynak uygunluğu, sorumlular ve uygulanabilir bütçe | Uçtan uca demo ve incelenmiş eğitim | Geliştirme / medya / teknik uzman | TODO — daha sonra |
| 7 | Demo sunumu ve geri bildirim | Sunuma hazır demo | Müşteri/yatırımcı geri bildirim kaydı | Proje / satış | TODO — daha sonra |
| 8 | Pilot hazırlığı ve uygulaması | Pilot kurum, kapsam ve kabul ölçütleri | Kullanım, öğrenme ve maliyet verileri | Pilot koordinasyonu | TODO — daha sonra |
| 9 | Ticari hizmete geçiş | Pilot değerlendirmesi ve ticari hazırlık | Paket, sözleşme ve işletim düzeni | Yönetim / satış / operasyon | TODO — daha sonra |

Bağımsız işler gerektiğinde birlikte yürütülebilir; sıralama tüm işlerin tek tek bitmesini zorunlu kılmaz. **TODO — takvim:** Kapsam, uzman kapasitesi ve kaynak bağımlılıkları netleşince başlangıç/bitiş tarihleri, süreler ve kilometre taşları belirlenecek. Sorumlu rol: proje yönetimi. Şimdilik tarih veya süre atanmadı.

**Kararlaştırıldı:** Önce kaba uçtan uca plan hazırlanacak; uygulama sırası **demo → pilot → ücretli hizmet** olacak. Aşağıdaki işler ve geçiş koşulları ilk plan önerisidir; süre ve bütçe taahhüdü değildir.

| Aşama | Amaç | Önerilen ana işler | Önerilen geçiş koşulu |
| - | - | - | - |
| Hazırlık ve kaba plan | Kapsamı ve uygulanabilirliği netleştirmek | Kaynak envanteri, hedef müşteri, ilk eğitim konusu, uzman arayışı, hak incelemesi, ilk maliyet kalemleri | Demo amacı, sınırları, kaynakları ve sorumluları belirlenmiş |
| Demo | Birleşik içerik + platform fikrini somut göstermek | Kolay adaylardan seçilecek tek eğitim, sinematik video + animasyon/şema, eğitim atama → öğrenci tamamlama → yönetici sonuç inceleme akışı, teknik inceleme ve sunum | Teknik açıdan incelenmiş uçtan uca demo üzerinden müşteri/yatırımcı geri bildirimi alınmış |
| Pilot | Gerçek kurum ve kullanıcılarla değeri sınamak | Pilot kurum bulma, uzman iş birliği, sınırları belli içerik üretimi, eğitim atama ve sonuç takibi, öğrenme ve maliyet ölçümü | Önceden belirlenecek öğrenme, kullanım, doğruluk ve ticari ölçütler değerlendirilmiş |
| Ücretli hizmet | İçerik üretimini ve platform aboneliğini işletmek | Sözleşme/paketler, müşteri kurulumu, destek, içerik güncelleme, faturalama ve yenileme | İlk ücretli müşteri ve sürdürülebilir teslim/destek düzeni |

**Kararlaştırılan kapsam:** İlk pazar Türkiye. İçerik ve platformun ilk dili Türkçe. Demo yatırımcı ve potansiyel müşterilere yönelik. Havayolu, MRO ve teknik eğitim kurumları hedef kapsamda. Görüşmede ilk temaslar için özel eğitim sağlayıcıları öne çıktı. İlk kurum ve muhatap teyit edilecek.

**Açık konular:** İlk müşteri/segment önceliği (kullanıcı daha sonra paylaşacak), aday katalogdan ilk modülün seçimi, tamamlayıcı demo özellikleri, uzman temini, bütçe, süreler ve pilotun ücretli olup olmayacağı.

- Keşif → demo → pilot → ilk ticari sürüm → ölçekleme aşamaları.
- Her aşamanın teslimleri, sorumluları, bütçesi ve tamamlanma koşulları.
- Kaynak izinleri, uzman erişimi ve müşteri bulunması gibi dış bağımlılıklar.
- Teknik, ticari, hukuki, finansal, emniyet ve tedarikçi riskleri.
- Her risk için olasılık/etki, erken işaret, önlem, alternatif ve sorumlu.

**Çıktı:** Aşamalı uygulama planı ve risk kaydı. Tarihler kapsam ve kapasite belirlendikten sonra kesinleştirilecek.

### 24. Doküman yönetimi ve ekler

**Yeni iç kaynak:** 29 Ekim–11 Kasım WhatsApp görüşmesinin Markdown ve metin kayıtları incelendi. İki dosya aynı görüşmenin farklı dışa aktarımları. Görüşmedeki şirket ve kişi ifadeleri ilişki ve ihtiyaç doğrulaması için iç girdi olarak kaydedildi. Markdown kaydı · Metin kaydı

#### 24.1 Yeni PDF kaynak değerlendirmesi — PDF-T01

**Kaynak:** [Havacılık Teknik Değerlendirme ve İnceleme Notları](https://drive.google.com/file/d/1BzKy-ZPhEaGZUvhb34w0OC5YcWThw4hf/view?usp=drivesdk), sayfa 1/1. Belge başlığı: “Havacılık Bakım & Yetkinlik İncelemesi — Teknik Değerlendirme ve Uygulama Notları”. Klasöre yeni eklenen PDF'nin tamamı metin ve sayfa görüntüsü üzerinden incelendi. Metindeki tablo 10 kayıtlı görüş içeriyor; dayanak mevzuat veya dış kanıt eklenmemiş. Yazar/yanıtlayan kişi belgede belirtilmediğinden Gürkan'a atfedilmedi ve beklenen 10 sorunun kesin yanıtları olarak eşleştirilmedi.

| Kaynak maddesi | Kayıtlı görüşün özeti | Plana etkisi / durum | İlgili bölüm |
| - | - | - | - |
| 01 | Tek öncelik yerine ürünün bütünü önemli; ilk öncelik net seçilmiyor | İlk modül seçimi açık kalıyor; seçimin kullanıcı/konu/kaynak dayanağı netleştirilecek | 8 |
| 02 | Eldeki kaynaklar eksik; AMM yanında IPC/FIM/iş kartları ele alınmalı | Konu bazlı kaynak yeterliliği ve eksik belge matrisi TODO | 9 |
| 03 | Yeni başlayan ve deneyimli teknisyenlerin gelişim motivasyonları farklı | İki seviyeli modelle ilişkilendirildi; tip/yetki beklentisi ayrıca doğrulanacak | 7 |
| 04 | İngilizce eğitim savunuluyor | Mevcut Türkçe kararıyla uyuşmazlık; dil katmanları ayrı değerlendirilecek | 7 |
| 05 | Motor sistemlerine öncelik öneriliyor | E17 aday konu eklendi; ilk demo seçimi veya uçak/motor tipi belirlenmedi | 8 |
| 06 | B1 hedefi, gerekirse C kapsamı öneriliyor | Kullanıcı/müfredat/lisans beklentisi ve otorite incelemesi TODO; sertifika yetkisi kabul edilmedi | 16 |
| 07 | Çoğunluğun geçer not alması isteniyor | Ölçütü belirsiz görüş; geçme eşiği veya oranı atanmadı | 7, 22 |
| 08 | Bir başlık açık bırakılmış | Başlık adı/soru eşleştirmesi yok; açıklama istenecek, başka açık karara bağlanmadı | 24 |
| 09 | Hata sayısı ve sıklığı izlenmeli | Hata ölçümü tasarımına aday eklendi; yöntem ve hedefler TODO | 22 |
| 10 | Otorite gereksinimlerinin farklılığına dikkat çekiliyor | Hedef ülke/otorite/ürün kapsamı eşleştirmesi ve güncel kaynak doğrulaması TODO | 16 |

**Takip listesi:** PDF yazarını/bağlamını doğrulama; madde 08'in hangi konuya ait olduğunu öğrenme; dil uyuşmazlığını karara bağlama; kaynak eksiklerini çıkarma; motor adayını değerlendirme; B1/C hedefini ve otorite beklentisini netleştirme; başarı/hata ölçüm yöntemini tasarlama. Kullanıcının sonraya bıraktığı konular bu belgeyle kendiliğinden kapanmadı. Tarih, bütçe veya başarı eşiği atanmadı.

- Karar günlüğü, açık sorular, varsayımlar, kaynaklar ve değişiklik geçmişi.
- Gereksinim → ekran/süreç → uygulama → doğrulama bağlantıları.
- Terimler sözlüğü, süreç şemaları, veri sözlüğü ve örnek içerik şablonları.
- Sözleşme, teklif, pilot, teknik inceleme ve destek şablonlarına bağlantılar.

**Çıktı:** Güncel ve izlenebilir ortak proje bilgi tabanı.

### Mevcut bağlam ve henüz kararlaştırılmamış konular

#### Gürkan'dan beklenen girdi

Gürkan, fikri getiren proje ortağıdır ve ürün sahipliği rolünü üstlenir. Gürkan’a yöneltilen sorular havacılık ve eğitim içeriğiyle ilgili açık kararlara odaklanır. Yatırım Barış’ın tarafında yürütülür. Proje ortaklarının görev dağılımı Bölüm 20’de yer alır.

**TODO — yanıtlar bekleniyor:** Kullanıcı, Gürkan'a hazırlanan 10 teknik sorunun yanıtlarını daha sonra paylaşacak. Konular: ilk eğitim konusu; kaynakların yeterliliği; başlangıç/deneyimli seviye farkları; İngilizce kalacak terimler; video/şema/gerçek çekim/3D ihtiyacı; uzman niteliği ve adayları; uzman kontrolünün kapsamı; yanlış yanıt davranışı; başarı ölçütleri; kaynak değişikliklerinin öğrenilmesi ve eğitimin durdurulması.

Yanıtlar geldiğinde ilgili bölümlere öneri/uzman girdisi olarak işlenecek; kullanıcının daha sonra karar vereceğini belirttiği konular kendiliğinden kesinleştirilmeyecek. Bu sırada kullanıcıyla diğer açık konular üzerinde çalışılabilir.

**Okunan kaynaklar:** Klasördeki iki Markdown raporu, “hava” ve “hava 2” sohbetleri; yeni eklenen PDF-T01 teknik değerlendirme notları (1 sayfa, tamamı). Önceden mevcut diğer dört PDF henüz ayrıntılı incelenmedi. PDF-T01 görüşleri kaynak girdisi olarak işlendi; dış teknik/mevzuat doğrulaması yapılmış sonuçlar olarak kullanılmadı.

**Mevcut fikir:** Havacılık bakım dokümanlarından uzman kontrolüyle etkileşimli eğitim üretmek; kurumların eğitim atama ve sonuç takibini desteklemek.

**İlk soru-cevap turunda kararlaştırılanlar — 7 Kasım 2026:**

- Eğitim içeriği üretimi ve abonelikli platform birlikte sunulacak.
- Önce kaba E2E plan yapılacak; demo, pilot ve ücretli hizmet sırasıyla ilerleyecek.
- Kaynak belgeler ve yatırımcı bağlantısı mevcut; teknik uzmanlar bulunacak.

**Önceki sohbetlerde önerilmiş, henüz kesinleşmemiş yönler:**

- İçerik hizmeti ile platform arasındaki ticari ağırlık ve paketleme.
- Satış CRM'inin destekleyici ve sınırlı tutulması.
- İlk modülün konusu: aday katalog hazır; seçim kaynak ve zorluk değerlendirmesinden sonra yapılacak.
- İlk sürümün uzman tarafından hazırlanmış içerikle çalışabilmesi.

**İkinci soru-cevap turunda kararlaştırılanlar — 7 Kasım 2026:**

- İlk pazar Türkiye.
- Havayolları, MRO şirketleri ve teknik eğitim kurumları hedef kapsamda.
- Hedef kurum ve bağlantı listesi kullanıcıdan daha sonra alınacak TODO.
- Demo hem yatırımcıya hem potansiyel müşteriye yönelik.
- İçerik ve platformun ilk dili Türkçe.

**Doğrulama bekleyenler:** İlk müşteri önceliği, kaynak kullanım hakları, eğitim kapsamı/statüsü, ekip, bütçe, takvim, fiyatlar, teknoloji seçimleri ve başarı hedefleri. Önceki raporlardaki fiyatlar ve fayda yüzdeleri doğrulanmış sonuç değildir.

**Üçüncü soru-cevap turunda kararlaştırılanlar:**

- Aday eğitim konuları listelenecek; ilk modül kolay adaylar arasından daha sonra seçilecek.
- Demo eğitim atama, öğrencinin tamamlaması ve yöneticinin sonuçları görmesini kapsayan uçtan uca akış sunacak.
- Görsel anlatım sinematik video ile açıklayıcı animasyon ve şemaları birlikte kullanacak.

**Değişiklik kaydı:** 0.4 sürümünde 16 aday modül, seçim ölçütleri, PDF kaynak eşleştirme TODO'su ve uçtan uca demo akışı eklendi; ilgili eğitim, üretim, işlev ve yol haritası bölümleri güncellendi.

**Dördüncü soru-cevap turunda kararlaştırılanlar:**

- Hem başlangıç hem deneyimli teknisyen seviyesi kapsanacak; seviye bazında ayrıntılar ayrıca tanımlanacak.
- Tarih ve süre atanmadan uygulama planı hazırlanacak; takvimin belirlenmesi TODO olarak tutulacak.
- Tutarlar yazılmadan bütçe kalemleri ve aşama özeti hazırlanacak; tabloların doldurulması TODO olarak tutulacak.

**Değişiklik kaydı — 0.5:** Eğitim seviyeleri eklendi; 20 gider kalemli bütçe şablonu, aşama özeti ve tarihsiz iş paketi planı oluşturuldu. Takvim ve bütçe doldurma işleri sorumlu rolü henüz kişiye atanmamış TODO olarak kaydedildi.

**Beşinci soru-cevap turunda kararlaştırılanlar:**

- İçerikler hem ekibimiz tarafından üretilebilecek hem gerektiğinde kurumlardan alınabilecek.
- Uzmanlar için danışmanlık, proje başına hizmet ve ortaklık seçenekleri listelenecek; seçim daha sonra yapılacak.
- Katılım ve başarı belgeleri sunulacak; koşulları ve sürümlere dağılımı daha sonra belirlenecek.

**Değişiklik kaydı — 0.6:** İki içerik kanalı ve kurum içeriği kabul akışı, uzman çalışma modelleri tablosu ve belge yaşam döngüsü eklendi. İzinler, yetkiler, belge koşulları ve uzman modeli seçimi açık iş olarak kaydedildi.

**Altıncı soru-cevap turunda kararlaştırılanlar:**

- Kendi markamızla ve müşterinin logosu/kurum kimliğiyle sunum seçeneklerinin ikisi de olacak.
- Bilgisayar, tablet ve telefon desteklenecek; cihaz önceliği belirtilmedi.
- Mevcut eğitim sistemleriyle entegrasyon plana dahil; kapsam ve teknik ayrıntılar TODO olarak tutulacak.

**Değişiklik kaydı — 0.7:** Marka ve cihaz kapsamı ilgili ürün/tasarım bölümlerine işlendi; entegrasyon keşfi, cihaz kabul ölçütleri, kuruma özel görünüm ve fiyatlandırma etkisi açık işler olarak eklendi.

**Yedinci soru-cevap turunda kararlaştırılanlar:**

- Kullanıcı, kurum atamasına ek olarak katalogdan kendi eğitimini seçebilecek.
- Eğitimler için son tamamlama tarihi, hatırlatma ve gerektiğinde yenileme/tekrar eğitimi özellikleri olacak.
- Yönetici tamamlama, başarı puanı, yanlış cevaplanan konular ve belge durumunu görebilecek.

**Değişiklik kaydı — 0.8:** Eğitim seçimi, takip/tekrar akışları ve yönetici raporları kapsama eklendi. Katalog erişimi, bildirim kuralları, başarı/tekrar politikaları ve rapor tanımları TODO olarak kaydedildi. Bütçe tutarı, proje tarihi veya süre atanmadı.

**Sekizinci soru-cevap turunda kararlaştırılanlar:**

- Yayın öncesi teknik uzman onayının zorunluluğuna daha sonra karar verilecek.
- Kaynak değişikliğinde ilgili eğitim yeniden incelemeye alınacak ve gerektiğinde geçici yayından kaldırılabilecek.
- Kullanıcı eğitim içinde hata bildirebilecek ve soru sorabilecek.

**Değişiklik kaydı — 0.9:** Zorunlu uzman onayı açık karar olarak belirtildi; revizyon, geçici yayından kaldırma ve soru/hata yönetimi akışları eklendi. Roller, kurallar ve sürüm kapsamları TODO olarak tutuldu.

**Dokuzuncu soru-cevap turunda kararlaştırılanlar:**

- Kurum aboneliği, kullanıcı başına ücret, içerik paketi ve özel içerik üretimi fiyatlandırma seçenekleri olarak listelendi; fiyatların belirlenmesi TODO.
- Pilotun ücretli/ücretsiz olmasına daha sonra karar verilecek.
- Müşteri adayı → görüşme → demo → teklif → pilot → sözleşme → yenileme satış CRM'i akışı plana dahil.

**Değişiklik kaydı — 0.10:** Fiyatsız ticari model tablosu, pilotun açık ticari kararı ve aşama bazında CRM akışı eklendi. Tutar, proje tarihi veya süre atanmadı.

**Onuncu soru-cevap turunda kararlaştırılanlar:**

- İlk kurulum, yönetici eğitimi ve kullanım desteği sunulacak.
- Destek kanalı uygulama içi olacak.
- Şirket kuruluşu, sözleşmeler, muhasebe ve sigorta için ayrı, uzmanlarla netleştirilecek TODO listeleri tutulacak.

**Değişiklik kaydı — 0.11:** Müşteri kurulumu ve uygulama içi destek akışları eklendi; dört idari/hukuki iş listesi hazırlandı. Hizmet sınırları, sorumlular, ticari koşullar ve süreler açık bırakıldı.

**On birinci soru-cevap turunda kararlaştırılanlar:**

- Belge yükleme ve içerik üretiminin demoda çalışır biçimde gösterilmesi tartışılacak ve karar verilecek konu olarak kalacak; önceden hazırlanmış içerik alternatifi de henüz seçilmedi.
- Demoda aynı konunun başlangıç ve deneyimli seviyeleri birlikte gösterilecek.

**Değişiklik kaydı — 0.12:** Açık üretim kararı ve iki seviyeli demo kapsamı kullanıcı yolculuğu, eğitim modeli, katalog, ürün kapsamı ve tarihsiz iş planına işlendi.

**On ikinci soru-cevap turunda kararlaştırılanlar:**

- Kuruma özel belge ve eğitimler yalnızca ilgili kuruma açık; genel kataloğa alınmaları ayrıca izne bağlı.
- Kaynak belgelerin dış AI servislerinde işlenmesi kararı sonraya bırakıldı.
- Rol/yetki modeline kullanıcı daha sonra yanıt verecek; taslaktaki rol listeleri öneri olarak kalıyor.

**Değişiklik kaydı — 0.13:** Kurumsal içerik erişim sınırı kaynak ve güvenlik bölümlerine işlendi; izin kaydı, dış AI kullanımı ve rol modeli açık işler olarak belirtildi. Tarih, süre, tutar veya servis seçimi yapılmadı.

**On üçüncü soru-cevap turunda kararlaştırılanlar:**

- Kullanıcı eğitime kaldığı yerden devam edebilecek.
- Yanlış cevap sonrası açıklama ve yeniden deneme davranışı sonraya bırakıldı.
- Kullanıcı eğitim sonunda sonuç özeti ve tekrar çalışması önerilen konuları görecek.

**Değişiklik kaydı — 0.14:** Devam etme ve kişisel sonuç ekranı kapsamı eklendi; kayıt, sürüm değişikliği ve öneri kuralları TODO olarak belirtildi. Yanlış yanıt davranışı açık karar olarak korundu.

**On dördüncü soru-cevap turunda kararlaştırılanlar:**

- Değerlendirme ve etkileşim için ayrıntılı grafik planı daha sonra hazırlanacak; ön test/son test yöntemi henüz seçilmedi.
- Öğrenci, eğitmen ve kurum yöneticisinden ayrı geri bildirim alınmasına daha sonra karar verilecek.
- İçerik üretim maliyeti, uzman inceleme yükü ve kurumun ödeme isteği pilot ölçüm başlıklarına eklenecek.

**Değişiklik kaydı — 0.15:** Pilot ölçüm tablosu eklendi; grafik planı ve geri bildirim grupları açık işler olarak kaydedildi. Ölçüm eşikleri, fiyat, tarih ve süre atanmadı.

**On beşinci soru-cevap turunda kararlaştırılanlar:**

- Kuruma özel içeriklerde senaryo taslağı üretimden önce müşteriye gösterilecek ve geri bildirim alınacak.
- Müşteri düzeltme talepleri ve içerik sürümleri platformda takip edilecek.
- Dahil düzeltme sayısı ve ücret koşulları sonraya bırakılacak.

**Değişiklik kaydı — 0.16:** Müşteri senaryo geri bildirimi, düzeltme ve sürüm takibi üretim, ürün, ticari koşullar ve operasyon bölümlerine işlendi. Resmî müşteri onayı, roller ve sürüm kapsamı açık bırakıldı.

**On altıncı soru-cevap turunda kararlaştırılanlar:**

- Kurumlar eğitim sonuçlarını, kullanıcı listelerini ve belge kayıtlarını dışa aktarabilecek; formatlar sonra belirlenecek.
- Sözleşme sonunda veri teslimi, erişim kapatma ve saklama/silme ayrı süreç olarak planlanacak; süre ve koşullar sonraya bırakılacak.

**Değişiklik kaydı — 0.17:** Kurumsal dışa aktarma ve müşteri ayrılışı kaynak/veri, ürün, güvenlik ve operasyon bölümlerine işlendi. Format, süre ve ücret atanmadı.

**On yedinci soru-cevap turunda kararlaştırılanlar:**

- Ürün/marka adı çalışması sonraya bırakıldı ve ÖNEMLİ TODO olarak işaretlendi.
- Türkçe eğitimlerde teknik terimler özgün İngilizce karşılıklarıyla birlikte gösterilecek.

**Değişiklik kaydı — 0.18:** Marka adı önemli TODO olarak üst bilgiye ve proje kimliğine işlendi; teknik terim gösterimi kararı ve ortak sözlük işi eğitim modeline eklendi. Önceki raporlardaki isimlerin onaylanmış marka olmadığı belirtildi.

**Değişiklik kaydı — 0.19:** Gürkan'ın fikri getiren kişi olduğu, yatırım/geliştirmenin kullanıcı tarafında bulunduğu ve 10 teknik sorunun yanıtlarının kullanıcıdan beklendiği kaydedildi. Yeni ürün kararı alınmadı.

### Soru-cevap ile derinleştirme sırası

#### Görüşmeye dönüş noktası — henüz cevaplanmayan beş soru

Kullanıcı taslağı paylaşmak üzere aşağıdaki soruları yanıtlamadan ara verdi. Hiçbiri ürün kararı sayılmayacak; devam edildiğinde buradan başlanabilir:

1. Hesaplar yalnızca kurum davetiyle mi açılacak; kullanıcının kendi kaydı ve kuruma katılma isteği de desteklenecek mi?
2. İlk sürümde çevrimiçi kullanım yeterli mi; çevrimdışı eğitim ihtiyacı değerlendirilecek mi?
3. Türkçe altyazı ve okunabilir anlatım metni sunulacak mı?
4. Kişisel not ve önemli bölümleri işaretleme olacak mı?
5. Tanıtım eğitimi doğrudan erişilebilir mi olacak, yoksa verilecek demo hesabıyla mı açılacak?

**Beklenen diğer girdi:** Kullanıcı Gürkan'ın 10 teknik soruya yanıtlarını daha sonra paylaşacak. Takvim, bütçe tutarları ve diğer ertelenen kararlar açık kalacak.

**Değişiklik kaydı — 0.20:** Ara paylaşım için okuyucu notu, açık konular özeti ve yanıtlanmamış beş soruluk devam noktası eklendi. Yeni ürün kararı alınmadı.

#### Bölüm bazında ilerleme sırası

**Değişiklik kaydı — 0.21:** Yeni tek sayfalık PDF'nin 10 maddesi kaynak kimliği ve bölüm bağlantılarıyla işlendi. Dil uyuşmazlığı açık işaretlendi; kaynak matrisi, motor adayı, B1/C incelemesi ve hata ölçüm tasarımı eklendi. Kullanıcının mevcut kararları otomatik değiştirilmedi; beş yanıtlanmamış soru ve Gürkan'dan beklenen yanıtlar korunuyor.

**Değişiklik kaydı — 0.22:** Gürkan ve Barış’ın ortaklığı, ürün sahipliği ve geliştirme görevleri ile ortak pazarlama ve PR sorumlulukları kaydedildi.

**Değişiklik kaydı — 0.23:** 24 ana bölüm için tıklanabilir içindekiler, açık kararlar, kaynak değerlendirmesi ve soru-cevap devam noktası için hızlı bağlantılar eklendi.

**Değişiklik kaydı — 0.24:** Görüşme kayıtlarından ilk müşteri ve kullanıcı odağı, sınava hazırlık ihtiyacı, demo içeriği, kaynak temini seçenekleri, görüşme adayları ve taslak demo tarihleri eklendi. Benzer ürünler ve resmî kaynak kanalları bağlantılarıyla işlendi.

**Değişiklik kaydı — 0.25:** Her iki ilk müşteri grubu görüşme kapsamına alındı ve montaj sırası demo kapsamına eklendi. İlk kullanım amacı ile Selim Kona’ya ne zaman danışılacağı Gürkan’la görüşülecek. Temsili parça yaklaşımı öneri olarak kaydedildi.

**Değişiklik kaydı — 0.26.** İlk demo için temsili parça yaklaşımı onaylandı. İki seviyenin eğitim akışı, etkileşimleri ve hazırlık görevleri yazıldı.

1. **Amaç ve ticari yön:** Ne kuruyoruz, kime sunuyoruz, ilk somut başarı ne?
2. **Eğitim ve ilk ürün:** Hangi problemi hangi içerik ve kullanıcı akışıyla çözüyoruz?
3. **Kaynak, doğruluk ve haklar:** Hangi veriyi hangi izinle, kimlerin kontrolüyle kullanıyoruz?
4. **Müşteri ve operasyon:** Nasıl satıyor, kuruyor, destekliyor ve güncel tutuyoruz?
5. **Yazılım ve üretim:** Hangi ekran, veri, araç, entegrasyon ve güvenlik ihtiyaçları var?
6. **Finans ve uygulama:** Hangi ekip ve bütçeyle, hangi aşamalarda ilerliyoruz?

Her turda 3–5 bağlantılı soru ele alınacak. Yanıtlar ilgili bölümlere işlenecek; bunların etkilediği diğer bölümler de güncellenecek. Henüz yanıtlanamayanlar açık soru veya sınanacak varsayım olarak kalacak. Soru-cevapta gelişen kapsam, kullanıcı kararı olmadan geliştirme veya yayınlama yetkisi sayılmayacak.
`;
