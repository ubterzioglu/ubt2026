# PageSpeed Insights Analiz Raporu

**Website URL:** [https://ubterzioglu.de](https://ubterzioglu.de)  
**Platform:** Mobil (Mobile)  
**Kaynak Bağlantısı:** [Google PageSpeed Raporu](https://pagespeed.web.dev/analysis/https-ubterzioglu-de/5ew421m9fb?utm_source=search_console&form_factor=mobile&hl=de)  
**Tarih:** 24 Ekim 2026  

---

## 1. Genel Performans Özeti

Google PageSpeed Insights (Lighthouse) verilerine göre sitenizin genel performans durumu aşağıda özetlenmiştir:

*   **Performans (Performance):** [PUAN GİRİN, örn: 75]/100
*   **Erişilebilirlik (Accessibility):** [PUAN GİRİN]/100
*   **En İyi Uygulamalar (Best Practices):** [PUAN GİRİN]/100
*   **SEO:** [PUAN GİRİN]/100

---

## 2. Önemli Web Verileri (Core Web Vitals) Değerlendirmesi

Google'ın arama sıralamalarında doğrudan dikkate aldığı temel kullanıcı deneyimi metrikleri şunlardır:

*   **LCP (Largest Contentful Paint - En Büyük İçerikli Boyama):** [SÜRE GİRİN, örn: 2.4 sn] 
    *   *Hedef:* 2.5 saniyenin altında olmalıdır. Ana içeriğin yüklenme hızını ölçer.
*   **INP (Interaction to Next Paint - Sonraki Boyamaya Etkileşim):** [SÜRE GİRİN, örn: 150 ms]
    *   *Hedef:* 200 milisaniyenin altında olmalıdır. Sitenin kullanıcı etkileşimlerine ne kadar hızlı tepki verdiğini ölçer.
*   **CLS (Cumulative Layout Shift - Kümülatif Düzen Kayması):** [DEĞER GİRİN, örn: 0.04]
    *   *Hedef:* 0.1 veya daha düşük olmalıdır. Sayfa yüklenirken öğelerin beklenmedik şekilde yer değiştirmesini ölçer.

---

## 3. Diğer Performans Metrikleri

*   **FCP (First Contentful Paint - İlk İçerikli Boyama):** [SÜRE GİRİN] sn
*   **Speed Index (Hız İndeksi):** [SÜRE GİRİN] sn
*   **TBT (Total Blocking Time - Toplam Engelleme Süresi):** [SÜRE GİRİN] ms

---

## 4. İyileştirme Fırsatları ve Öneriler

Lighthouse analizine göre web sitenizin mobil performansını artırmak için uygulanması gereken başlıca adımlar şunlardır (Raporunuzdaki kırmızı/turuncu uyarılara göre bu bölümü güncelleyebilirsiniz):

### A. Görsel Optimizasyonları
*   **Yeni Nesil Formatlar Kullanın:** Görselleri WebP veya AVIF formatında sunarak dosya boyutlarını küçültün.
*   **Görselleri Uygun Boyutlandırın:** Mobil cihazlar için gereğinden büyük görseller yüklemekten kaçının. CSS ve HTML tarafında `width` ve `height` değerlerini mutlaka belirtin (CLS'yi önlemek için).

### B. Kod Yapısı ve Yükleme Optimizasyonları
*   **Kullanılmayan JavaScript ve CSS'i Azaltın:** Sayfanın ilk yüklenmesi sırasında gerekmeyen kodları erteleyin (Defer/Async) veya kaldırın.
*   **Oluşturmayı Engelleyen Kaynakları Ortadan Kaldırın (Render-blocking resources):** Kritik olmayan CSS ve JS dosyalarının sayfa yüklemesini geciktirmesini engelleyin.

### C. Sunucu ve Önbellek Yanıtı
*   **Önbellek Politikalarını Yapılandırın (Caching):** Sabit statik varlıklar (resimler, fontlar, CSS vb.) için uzun süreli tarayıcı önbellekleme (cache) süreleri belirleyin.
*   **Sunucu Yanıt Süresini (TTFB) Azaltın:** Sunucu tarafındaki veritabanı sorgularını hızlandırın veya bir CDN (İçerik Dağıtım Ağı) kullanın.

---

## 5. Sonuç

`ubterzioglu.de` sitesinin mobil performansı, kullanıcı deneyimi açısından kritik öneme sahiptir. Yukarıda belirtilen **Önemli Web Verileri (Core Web Vitals)** değerlerini Google'ın önerdiği "İyi" aralığına çekmek, hem SEO sıralamalarınızı olumlu etkileyecek hem de mobil cihazlardan gelen ziyaretçilerin sitede kalma süresini artıracaktır.