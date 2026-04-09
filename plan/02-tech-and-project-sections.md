# 02 - Tech Stack and Project Section Updates

## Goal
Tech Stack pillerini küçük kare kartlara çevirmek ve Corporate / Private Projects bölümündeki logoları büyütmek.

## TODOs

### Tech Stack card redesign
- [ ] `components/tech-stack.tsx` dosyasını aç.
- [ ] Mevcut group yapısını ve item render mantığını incele.
- [ ] Mevcut pill tabanlı `span` yapısını kaldırıp kart tabanlı grid yapısına geçirilecek alanı belirle.
- [ ] Her grup için başlık yapısını koru.
- [ ] Grup altındaki item listesini `flex-wrap` yerine grid veya sıkı kart düzenine çevir.
- [ ] Her teknoloji öğesini küçük kare kart olarak tasarla.
- [ ] Kart içinde üstte logo alanı oluştur.
- [ ] Kart içinde altta teknoloji adı alanı oluştur.
- [ ] Logo olan item’larda görsel hizasını ortala.
- [ ] Logo olmayan item’larda üst alanda dengeli placeholder/boş hizalama davranışı belirle.
- [ ] Kart oranını kare tut.
- [ ] Kart padding’ini küçük öğe yoğunluğuna göre optimize et.
- [ ] Hover davranışını section tasarım diline uygun şekilde koru.

### Capital I normalization
- [ ] `content/profile.ts` içindeki `stackGroups` verisini incele.
- [ ] Büyük `İ` içeren teknoloji adı olup olmadığını kontrol et.
- [ ] Çıktıda büyük `I` kullanılmasını garanti edecek yaklaşımı belirle.
- [ ] Veri düzeyinde düzeltme mümkünse doğrudan içerik verisini güncelle.
- [ ] Veri düzeyinde güncelleme gerekmiyorsa render sırasında normalize et.
- [ ] Teknoloji isimlerinin geri kalanında istenmeyen dönüşüm yaratmadığını doğrula.

### Tech Stack responsiveness
- [ ] Mobilde kartların çok daralıp daralmadığını kontrol et.
- [ ] Tablet ve desktop görünümünde grup başlıkları ile kartların dikey ritmini doğrula.
- [ ] Logo-boyut / metin-boyut dengesini kontrol et.
- [ ] Çok uzun teknoloji isimlerinde iki satır veya sıkışma davranışını kontrol et.

### Corporate Projects logo scaling
- [ ] `app/page.tsx` içindeki Corporate Projects bölümünü aç.
- [ ] Logo render eden `Image` bileşenini bul.
- [ ] Mevcut `width` ve `height` değerlerini tespit et.
- [ ] Görsel sınıflarındaki `h-*` ve `w-*` değerlerini tespit et.
- [ ] Tüm logo ölçülerini yaklaşık 1.5x artır.
- [ ] Yeni logo boyutunun kartta metinle çakışmadığını doğrula.
- [ ] `sm:flex-row` düzeninde metin alanı ile logo alanı arasındaki mesafeyi gözden geçir.
- [ ] Gerekirse kart padding veya `sm:pr-*` değerlerini ayarla.
- [ ] Logo büyümesine rağmen kart yüksekliğinin görsel olarak dengeli kaldığını doğrula.

### Private Projects logo scaling
- [ ] `app/page.tsx` içindeki Private Projects bölümünü aç.
- [ ] Logo render eden `Image` bileşenini bul.
- [ ] Mevcut boyutları Corporate Projects ile karşılaştır.
- [ ] Aynı oranda yaklaşık 1.5x büyüt.
- [ ] Büyük logo ile başlık/metin hizasını gözle kontrol et.
- [ ] Kartların farklı satırlarda boyut tutarlılığını doğrula.

### Section-level validation
- [ ] Tech Stack bölümünü gözle kontrol et.
- [ ] Corporate Projects bölümünü gözle kontrol et.
- [ ] Private Projects bölümünü gözle kontrol et.
- [ ] Aynı sayfa içinde tüm kart ve logo ölçülerinin görsel dil açısından tutarlı olduğunu doğrula.
