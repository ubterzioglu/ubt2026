-- Seed the DesireMap planning board from the kickoff meeting transcript.
-- Idempotent: only inserts when the table is still empty, so re-applying
-- migrations against an existing board never duplicates rows.
-- Net decisions (Desire Hub ertelendi, önce veri sonra marketing, 2-3 ay
-- pazar yoklaması, proje rafa kalkmıyor) are captured as 'blocked'/'todo'
-- context tasks under the "Net kararlar" category.

INSERT INTO public.project_tasks
  (title, owner, category, status, priority, due_target, notes, sort_order)
SELECT * FROM (VALUES
  -- ── Net kararlar ──────────────────────────────────────────────
  ('Şimdilik Desire Hub''a geçilmeyecek; ana odak mevcut site/domain', 'Ortak', 'Net kararlar', 'todo', 'high', '', 'Desire Hub ileride ikinci/alternatif domain olarak tekrar değerlendirilecek.', 10),
  ('Önce site veriyle doldurulacak, sonra marketing yapılacak', 'Ortak', 'Net kararlar', 'todo', 'high', '', 'Boş/demo verili siteye trafik gönderilmeyecek; kullanıcı gerçekten arama yapıp sonuç bulabilmeli.', 20),
  ('Önümüzdeki 2-3 ay pazar yoklaması yapılacak', 'Ortak', 'Net kararlar', 'todo', 'high', 'Eylül/Ekim', 'Eylül/Ekim gibi tekrar bakılıp go / no-go kararı verilecek.', 30),
  ('Proje rafa kaldırılmıyor; düşük tempoda planlı devam', 'Ortak', 'Net kararlar', 'todo', 'normal', '', '', 40),

  -- ── Umut: Toplantı sonrası dokümantasyon ─────────────────────
  ('Videodan/transkriptten todoları çıkar', 'Umut', 'Toplantı sonrası dokümantasyon', 'done', 'normal', '', '', 10),
  ('Çıkan listeyi gruba gönder', 'Umut', 'Toplantı sonrası dokümantasyon', 'todo', 'normal', '', '', 20),
  ('Herkesin onayını al', 'Umut', 'Toplantı sonrası dokümantasyon', 'todo', 'normal', '', '', 30),
  ('Güncellemeleri ayrı WhatsApp grubundan yürüt', 'Umut', 'Toplantı sonrası dokümantasyon', 'todo', 'low', '', '', 40),

  -- ── Umut: Roadmap ve önceliklendirme ─────────────────────────
  ('Proje için kısa bir roadmap çıkar', 'Umut', 'Roadmap ve önceliklendirme', 'todo', 'high', '', '', 50),
  ('Yaklaşık tarihleri yaz', 'Umut', 'Roadmap ve önceliklendirme', 'todo', 'normal', '', '', 60),
  ('Kimden, ne zaman, ne isteyeceğini netleştir', 'Umut', 'Roadmap ve önceliklendirme', 'todo', 'normal', '', '', 70),
  ('Temmuz ortasına kadar gerekebilecek acil ihtiyaçları listele', 'Umut', 'Roadmap ve önceliklendirme', 'todo', 'high', 'Temmuz ortası', '', 80),
  ('Marketing sıralamasını Baran/Şahin''e gönder', 'Umut', 'Roadmap ve önceliklendirme', 'todo', 'normal', '', '', 90),

  -- ── Umut: Veri / mekan datası ────────────────────────────────
  ('Mekan datası toplayacak scraper/deep research akışını kur', 'Umut', 'Veri / mekan datası', 'todo', 'high', '', '', 100),
  ('İlk etapta örnek şehir/mekan listesi çıkar', 'Umut', 'Veri / mekan datası', 'todo', 'high', '', '', 110),
  ('Mekan bilgilerini JSON formatında hazırlamaya başla', 'Umut', 'Veri / mekan datası', 'todo', 'high', '', 'Alanlar: mekan adı, şehir, kategori, web sitesi, telefon, açıklama, yorum/puan, etiketler/hashtagler, görsel/logo.', 120),
  ('Baran''dan gelecek kesin JSON formatına göre datayı düzenle', 'Umut', 'Veri / mekan datası', 'blocked', 'high', '', 'Baran''ın JSON formatına bağlı.', 130),
  ('Önce küçük batch, sonra Almanya geneli şehir şehir genişlet', 'Umut', 'Veri / mekan datası', 'todo', 'normal', '', '', 140),

  -- ── Umut: Görseller ──────────────────────────────────────────
  ('Mekanlar için görsel/logoları hazırla', 'Umut', 'Görseller', 'todo', 'normal', '', '', 150),
  ('Gerçek görsel yoksa placeholder mantığı kur', 'Umut', 'Görseller', 'todo', 'normal', '', 'İlk etapta 20-30 random placeholder; sonra admin panelinden tek tek iyileştir.', 160),

  -- ── Umut: Marketing hazırlığı ────────────────────────────────
  ('Reddit, Instagram, LinkedIn, TikTok için strateji hazırla', 'Umut', 'Marketing hazırlığı', 'todo', 'normal', '', '', 170),
  ('Launch öncesi 50-60 postluk içerik havuzu oluştur', 'Umut', 'Marketing hazırlığı', 'todo', 'normal', '', '', 180),
  ('Her kanal için örnek post formatları çıkar', 'Umut', 'Marketing hazırlığı', 'todo', 'low', '', '', 190),
  ('Görsel + metin + açıklama + hashtag paketleri hazırla', 'Umut', 'Marketing hazırlığı', 'todo', 'low', '', '', 200),
  ('Marketing başlamadan gruba örnek strateji ve postları göster', 'Umut', 'Marketing hazırlığı', 'todo', 'normal', '', 'Onaydan sonra paylaşım süreci başlat.', 210),

  -- ── Umut: SEO hazırlığı ──────────────────────────────────────
  ('SEO''yu veri ve frontend hazırlandıktan sonraya al', 'Umut', 'SEO hazırlığı', 'todo', 'normal', '', '', 220),
  ('Repo üzerinden SEO analizi yaptır', 'Umut', 'SEO hazırlığı', 'todo', 'normal', '', '', 230),
  ('Şehir/kategori/detay/tag için end-to-end SEO prompt/plan çıkar', 'Umut', 'SEO hazırlığı', 'todo', 'normal', '', 'Gerekiyorsa ayrı branch/PR aç. Batuhan''dan keyword desteği alınabilir. Ana sayfadan çok detay sayfalarının index gücüne odaklan.', 240),

  -- ── Umut: Mail altyapısı ─────────────────────────────────────
  ('Zoho üzerinden proje mail altyapısını ayarla', 'Umut', 'Mail altyapısı', 'todo', 'high', '', '', 250),
  ('info@desiremap.de benzeri domain mailini oluştur', 'Umut', 'Mail altyapısı', 'todo', 'high', '', '', 260),
  ('Baran, Şahin ve gerekirse Burak''ı kullanıcı olarak ekle', 'Umut', 'Mail altyapısı', 'todo', 'normal', '', '', 270),
  ('Gelen maillerin yönetileceği ortak inbox yapısını kur', 'Umut', 'Mail altyapısı', 'todo', 'normal', '', '', 280),

  -- ── Baran: JSON / veri formatı ───────────────────────────────
  ('Umut''a mekan datası için beklenen JSON formatını ver', 'Baran', 'JSON / veri formatı', 'todo', 'top5', '', '', 10),
  ('Gerekli tablo/field yapısını netleştir', 'Baran', 'JSON / veri formatı', 'todo', 'high', '', '', 20),
  ('Gelen datayı filtreleyip içeri alabilecek yapıyı hazırla', 'Baran', 'JSON / veri formatı', 'todo', 'normal', '', '', 30),

  -- ── Baran: Frontend toparlama ────────────────────────────────
  ('Frontend''deki 3-5 küçük hatayı toparla', 'Baran', 'Frontend toparlama', 'todo', 'high', '', '', 40),
  ('Sayfaları daha sade / lean hale getir', 'Baran', 'Frontend toparlama', 'todo', 'normal', '', 'Fazla açıklama ve kalabalık alanları azalt.', 50),
  ('Kart görünümü / kullanım kolaylığını iyileştir', 'Baran', 'Frontend toparlama', 'todo', 'normal', '', '', 60),
  ('"Yakında açılıyoruz / Geliştirme aşamasındayız" mesajı ekle', 'Baran', 'Frontend toparlama', 'todo', 'normal', '', '', 70),
  ('İletişim alanı ekle', 'Baran', 'Frontend toparlama', 'todo', 'normal', '', '', 80),

  -- ── Baran: Hazır olmayan özellikleri kapatma ─────────────────
  ('Rezervasyon alanlarını şimdilik deaktive et', 'Baran', 'Hazır olmayan özellikleri kapatma', 'todo', 'top5', '', '', 90),
  ('Fiyat / rezervasyon yakın gibi kafa karıştıran alanları kaldır', 'Baran', 'Hazır olmayan özellikleri kapatma', 'todo', 'high', '', '', 100),
  ('Normal kullanıcı giriş/üyelik akışını gerekiyorsa kapat', 'Baran', 'Hazır olmayan özellikleri kapatma', 'todo', 'normal', '', '', 110),
  ('Admin ile normal kullanıcı girişlerini net ayır', 'Baran', 'Hazır olmayan özellikleri kapatma', 'todo', 'normal', '', 'Google Authentication sorunu sonra ayrıca ele alınacak.', 120),

  -- ── Baran: Deployment / teknik akış ──────────────────────────
  ('Minik frontend değişikliklerini parça parça deploy et', 'Baran', 'Deployment / teknik akış', 'todo', 'normal', '', 'Gerektiğinde mevcut versiyona geri dönülebilecek şekilde ilerle.', 130),
  ('Haftalık toplantıya kısa "şunları yaptım" özeti getir', 'Baran', 'Deployment / teknik akış', 'todo', 'low', '', '', 140),

  -- ── Baran: Chatbot fikri ─────────────────────────────────────
  ('Batuhan''ın chat yapısına benzer modül siteye eklenebilir mi bak', 'Baran', 'Chatbot fikri', 'todo', 'low', '', '"Nereye gitmeliyim, FKK nedir, şu kategori ne demek?" gibi sorular için basit rehber/chat alanı.', 150),

  -- ── Şahin ────────────────────────────────────────────────────
  ('Frontend/konsept tarafında gerekiyorsa Baran''a yönlendirme yap', 'Şahin', 'Şahin todoları', 'todo', 'normal', '', '', 10),
  ('Desire Hub kararı için 1-2 hafta içinde görüş bildir', 'Şahin', 'Şahin todoları', 'todo', 'high', '1-2 hafta', '', 20),
  ('Marketing ve SEO stratejisine geri bildirim ver', 'Şahin', 'Şahin todoları', 'todo', 'normal', '', '', 30),
  ('Haftalık cuma toplantılarına katılmaya çalış', 'Şahin', 'Şahin todoları', 'todo', 'normal', 'Cuma 22:00', '', 40),
  ('Konsept, görsel dil ve domain stratejisinde yönlendirme yap', 'Şahin', 'Şahin todoları', 'todo', 'normal', '', '', 50),

  -- ── Ortak: Haftalık update toplantısı ────────────────────────
  ('Cuma 22:00 haftalık yarım saatlik update toplantısı (fixlendi)', 'Ortak', 'Haftalık update toplantısı', 'done', 'high', 'Cuma 22:00', '', 100),
  ('Baran recurring meeting / series invite atsın', 'Ortak', 'Haftalık update toplantısı', 'todo', 'top5', '', '', 110),
  ('Katılamayan olursa önceden haber versin', 'Ortak', 'Haftalık update toplantısı', 'todo', 'low', '', '', 120),
  ('Her toplantıda herkes masaya ne getirdiğini kısaca anlatsın', 'Ortak', 'Haftalık update toplantısı', 'todo', 'low', '', '', 130),

  -- ── Ortak: 3 aylık test planı ────────────────────────────────
  ('Hazırlık dönemi: veri + frontend + iletişim altyapısı', 'Ortak', '3 aylık test planı', 'todo', 'normal', '', '', 140),
  ('Sonra kontrollü marketing', 'Ortak', '3 aylık test planı', 'todo', 'normal', '', '', 150),
  ('Trafik, kullanıcı davranışı ve geri dönüşleri takip et', 'Ortak', '3 aylık test planı', 'todo', 'normal', '', '', 160),
  ('Eylül/Ekim gibi tekrar değerlendirme yap', 'Ortak', '3 aylık test planı', 'todo', 'normal', 'Eylül/Ekim', '"Devam mı, durdurma mı, büyütme mi?" kararı.', 170),

  -- ── Ortak: Mekanlara ulaşma modeli ───────────────────────────
  ('Mekanlara mail/outreach yapılacak', 'Ortak', 'Mekanlara ulaşma modeli', 'todo', 'normal', '', '"Sizi platformda listeledik / listelemek istiyoruz" mesajı.', 180),
  ('İlk 6 ay ücretsiz model düşün; sonra 10-20-30-50 € paketleme', 'Ortak', 'Mekanlara ulaşma modeli', 'todo', 'low', '', 'Top listing/öne çıkarma karşılığında backlink veya kısa tanıtım yazısı istenebilir.', 190),
  ('Hazır mail şablonu hazırla', 'Ortak', 'Mekanlara ulaşma modeli', 'todo', 'normal', '', '', 200),

  -- ── Ortak: Legal / güvenli taraf ─────────────────────────────
  ('Scrape edilen verilerin nasıl kullanılacağını kontrol et', 'Ortak', 'Legal / güvenli taraf', 'todo', 'high', '', '', 210),
  ('Kişisel veri, görsel hakları, opt-out, Impressum/GDPR tarafını düşün', 'Ortak', 'Legal / güvenli taraf', 'todo', 'high', '', '', 220),
  ('Linklerde nofollow/sponsored mantığını değerlendir', 'Ortak', 'Legal / güvenli taraf', 'todo', 'normal', '', '', 230),
  ('Mekanların yanlış/uyduruk bilgilerle listelenmemesine dikkat et', 'Ortak', 'Legal / güvenli taraf', 'todo', 'normal', '', '', 240),

  -- ── Backlog / daha sonra ─────────────────────────────────────
  ('Desire Hub ikinci domain olarak tekrar değerlendirilecek', 'Backlog', 'Backlog / daha sonra', 'todo', 'low', '', '', 10),
  ('SEO için WebMCP / AI crawl / yeni Google indexleme incelenecek', 'Backlog', 'Backlog / daha sonra', 'todo', 'low', '', '', 20),
  ('Detay sayfalarına özel içerik stratejisi hazırlanacak', 'Backlog', 'Backlog / daha sonra', 'todo', 'low', '', '', 30),
  ('Şehir + kategori + tag bazlı landing page yapısı güçlendirilecek', 'Backlog', 'Backlog / daha sonra', 'todo', 'low', '', '', 40),
  ('Rezervasyon sistemi daha sonra tekrar değerlendirilecek', 'Backlog', 'Backlog / daha sonra', 'todo', 'low', '', '', 50),
  ('Üyelik / müşteri / mekan sahibi paneli sonra açılacak', 'Backlog', 'Backlog / daha sonra', 'todo', 'low', '', '', 60),
  ('Trafik oluşursa ücretli paketler ve premium listeleme netleştirilecek', 'Backlog', 'Backlog / daha sonra', 'todo', 'low', '', '', 70)
) AS seed(title, owner, category, status, priority, due_target, notes, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.project_tasks);
