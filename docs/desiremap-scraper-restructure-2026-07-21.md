# Desiremap Scraper Güncellemesi — 21 Temmuz 2026

## Sorun neydi

407 mekan bulduk ama sadece 174'ü gerçekten işe yarıyordu (%43). Kaybın sebepleri:

- **156 kayıt** — adres bilgisi yoktu ya da eksikti
- **47 kayıt** — aynı şehirde aynı mekan iki kez görünmüş, tekrar sayılmış
- **30 kayıt** — şehir adı tutmamış (Frankfurt / Frankfurt am Main / Cologne gibi farklı yazımlar aynı yer sanılmamış)

Ayrıca scraper mekanları kendi kafasına göre kategoriye sokuyordu (FKK/Bordell/Studio/Privat), ve bunu çoğu zaman yanlış yapıyordu — Laufhaus, Masaj salonu, Domina gibi işletmeler yanlış kutuya girmişti.

## Ne yaptık

- **Adresi parçalara ayırdık.** Artık tek bir karışık adres satırı yerine sokak, kapı numarası ve posta kodu ayrı ayrı geliyor. Bu sayede hem adres daha net oluyor hem de aynı mekanın iki kez sayılması engelleniyor.
- **Şehir adını düzelttik.** Artık her zaman resmi Almanca yazım kullanılıyor (Köln, Frankfurt am Main gibi) — İngilizce ya da kısaltılmış hâller (Cologne, Frankfurt) otomatik düzeltiliyor.
- **Kategoriyi artık scraper koymuyor.** Yapay zeka bir mekanı FKK mı Bordell mi diye sınıflandırmıyor, sadece işletmenin kendi tanımını (ör. "Laufhaus und Eroscenter") olduğu gibi veriyor. Doğru kategoriyi zaten hangi arama sonucunda bulunduğuna göre biz belirliyoruz — bu yanlış sınıflandırma sorununu tamamen çözdü.
- **Hizmet listesini olduğu gibi bıraktık.** "Sauna", "Whirlpool" gibi etiketleri değiştirmiyoruz/birleştirmiyoruz, ham hâliyle geliyor. Ayrıca her etiketin hangi sayfadan alındığını da kaydediyoruz.
- **Mekanın kendi sözlerini ayrı bir alana koyduk.** Bir mekan "biz çiftlere yönelik bir kulübüz" gibi kendi hakkında açıkça bir şey söylüyorsa bunu alıntı olarak kaydediyoruz. Fotoğraftan, fiyattan ya da belirsiz ipuçlarından tahmin yürütmüyoruz — bu hem yanlış olabilir hem hukuken riskli. Sadece mekanın kendi ağzından çıkanı, kaynağıyla birlikte veriyoruz.

## Hukuki taraf hâlâ güvende

- Her bilgi hangi sayfadan geldiğini gösteriyor (kaynak linki + alıntı) — bir itiraz gelirse elimizde dayanak var.
- Fotoğraf çekmiyoruz — telif riski yok.
- Mekanların kendi yazdığı uzun açıklama metinlerini kopyalamıyoruz, sadece kısa alıntılar alıyoruz.

## Eski verilere ne oldu

Daha önce toplanan 409 kayıt olduğu gibi duruyor, silinmedi. Sadece yeni alanlar (sokak, posta kodu vs.) bu eski kayıtlarda boş — çünkü onlar eski yöntemle toplanmıştı. Yeniden taramadık çünkü maliyetli olurdu. Bundan sonraki yeni taramalar (Bonn, Münster ve devamı) yeni ve daha düzgün formatla gelecek.

## Test ettik mi

Evet:
- Kod hatasız çalışıyor.
- Örnek bir mekan metniyle yapay zekaya gerçek bir test yaptırdık — adres doğru parçalandı, mekanın kendi sözleri doğru yakalandı, kategori artık hiç dönmüyor (beklendiği gibi).
- Uçtan uca gerçek veritabanına yazma testini de yaptık, her şey doğru kaydedildi.
- Panelde (Rapor sayfası ve iş detay sayfası) yeni adres formatı ve "Öz-tanım" bölümü görünüyor.

## Beklenen fayda

Sadece adres ve şehir düzeltmesiyle, önceki 174 kullanılabilir kayıt sayısının yeni taramalarda **~360'a** çıkması bekleniyor — iki kattan fazla.

## Bu turda yapmadıklarımız (sıradaki işler)

- Fotoğraf çekme
- Mekanların kendi açıklama metnini tam olarak kopyalama
- Bonn ve Münster'ın taranması (Tavily kotası bitti, bekliyor)
- Kullanıcı doğrulama/onay akışı
