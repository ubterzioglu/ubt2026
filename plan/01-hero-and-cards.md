# 01 - Hero and Card Layout Updates

## Goal
Ana sayfadaki hero alanını ve kare kart kullanan tüm içerik bloklarını görsel olarak tutarlı hale getirmek.

## TODOs

### Hero image alignment
- [ ] `components/hero-section.tsx` dosyasını aç.
- [ ] Hero görselini saran dış container'ı tespit et.
- [ ] Görsel wrapper yüksekliğinin mobil ve desktop'ta nasıl belirlendiğini kontrol et.
- [ ] Görselin alt kenara oturmasını engelleyen `items-center`, `self-center`, ekstra `py`, ya da benzeri hizalama sınıflarını tespit et.
- [ ] Görsel alanını alt hizalı yapacak sınıf düzenini tanımla.
- [ ] Görselin alt kenara yapışık görünmesi için wrapper içinde alt hizalama uygula.
- [ ] Gerekirse görselin kendisine alt odaklı bir class ekle.
- [ ] Değişiklik sonrası hero düzeninde metin ve görsel dengesi bozulmayacak şekilde `gap` ve genişlikleri yeniden dengele.
- [ ] Mobile görünümde görselin taşma veya gereksiz boşluk üretmediğini doğrula.
- [ ] Desktop görünümde kart alt kenarı ile görsel altı arasında boşluk kalmadığını doğrula.

### Hero intro text line breaks
- [ ] `content/site.ts` dosyasını aç.
- [ ] `siteMeta.intro` alanını bul.
- [ ] Metni tam 3 satır olacak şekilde satır kırılımlarıyla güncelle.
- [ ] 2. satırı `release discipline,` kelimesinden sonra bitecek şekilde ayarla.
- [ ] `whitespace-pre-wrap` davranışının bunu ek CSS gerektirmeden uyguladığını doğrula.
- [ ] Çok dar ekranlarda beklenmeyen ek satır kırılması riskini not et; metin genişliği gerekirse hero tarafında hafifçe ayarlanacak.

### Key Achievements cards
- [ ] `components/achievement-card.tsx` dosyasını aç.
- [ ] Mevcut kart oranını incele.
- [ ] Kart gövdesini tam kare yapacak yapı belirle.
- [ ] Üst alanı kartın %50 yüksekliği olacak şekilde ayarla.
- [ ] Alt metin alanını kartın %50 yüksekliği olacak şekilde ayarla.
- [ ] Üst yarıda mevcut gradient placeholder’ı koru.
- [ ] Alt yarıda metin spacing’ini kare kart yüksekliğine göre yeniden ayarla.
- [ ] Uzun achievement metinlerinde taşma davranışını değerlendir.
- [ ] Gerekirse başlık/metin boyutlarını kare kart içine sığacak şekilde azalt.
- [ ] Grid içinde tüm kartların eşit yükseklikte kaldığını doğrula.

### Featured grid square mode for Tools and Articles
- [ ] `components/featured-grid.tsx` dosyasını aç.
- [ ] Kare kart düzeninin tüm kullanım yerlerini etkileyip etkilemeyeceğini incele.
- [ ] Tools ve Articles için ayrı bir varyant prop tasarla.
- [ ] Gerekirse `FeaturedGridProps` içine örneğin `cardLayout: "default" | "square"` benzeri bir alan ekle.
- [ ] Default davranışı mevcut görünüm olarak bırak.
- [ ] Square varyantta kart container’ını kare olacak şekilde ayarla.
- [ ] Üst görsel alanını kartın %50 yüksekliğine sabitle.
- [ ] Alt içerik alanını kartın %50 yüksekliğine sabitle.
- [ ] Badge, title, summary hiyerarşisini koru.
- [ ] Başlık çok uzunsa kart kırılmadan davranışı gözden geçir.
- [ ] Summary alanı kare karta uyacak şekilde sıkıştırılmalı mı kararını implementasyon sırasında değil, mevcut metinlerle doğrula.
- [ ] Hover, border radius ve shadow davranışlarını koru.
- [ ] `app/page.tsx` içinde Tools grid kullanımını square varyanta geçir.
- [ ] `app/page.tsx` içinde Articles grid kullanımını square varyanta geçir.
- [ ] My Bookmarks kullanımını default varyantta bırak.
- [ ] Mobilde 1 kolon, küçük ekran üstünde 2 kolon, geniş ekranda mevcut grid mantığını koru.

### Visual validation
- [ ] Hero alanını gözle kontrol et.
- [ ] Key Achievements bölümünü gözle kontrol et.
- [ ] Tools bölümünü gözle kontrol et.
- [ ] Articles bölümünü gözle kontrol et.
- [ ] Aynı sayfada kare kartların border radius ve spacing bakımından tutarlı olduğunu doğrula.
