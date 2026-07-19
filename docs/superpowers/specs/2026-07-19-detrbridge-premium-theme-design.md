# detrbridge — Premium Turkuaz/Mavi/Kırmızı Tema + Yıldız Seçici (tasarım)

## Amaç

`/detrbridge` panosunun rengini navy/altın'dan turkuaz→mavi→kırmızı marka
gradyanına çevirmek, panoya daha premium/kurumsal bir his katmak, ve puan
seçiminde kullanılan native `<select>`'in koyu temayla uyumsuz görünen
tarayıcı varsayılan açılır kutusunu özel bir yıldız seçici bileşenle
değiştirmek.

## Renk sistemi

- Marka gradyanı: turkuaz `#14B8A6` → mavi `#2563EB` → kırmızı `#EF4444`.
  Mevcut navy `#1E3A8A` / altın `#F5B700` paletinin tamamen yerini alır.
- Zemin koyu kalır (`#050609`–`#0a0d16` tonları) — renk yoğunluğu sadece
  vurgu öğelerinde: logo rozeti, aktif sidebar sekmesi, CTA butonlar,
  "✓ Seçildi" rozetinin kenarlığı, form focus ring'leri.
- Ambient arka plan glow'ları üç renkten besleniyor: turkuaz üst-sol,
  mavi orta/merkez, kırmızı alt-sağ — mevcut iki-renkli radial-gradient
  düzeni üç-renkli hale genişletilir.
- Bu değişiklik sadece `app/detrbridge/_components/theme.ts`'teki sabitleri
  ve onları tüketen bileşenlerdeki inline `style`/hex referanslarını
  etkiler; global site teması ve diğer panolar (`/dm`, `/bakcakanat` vb.)
  değişmez.

## Yıldız seçici (`StarPicker`)

Yeni client component, `app/detrbridge/_components/star-picker.tsx`:

- 5 tıklanabilir yıldız ikonu (SVG), `useState` ile hover önizlemesi
  (fareyle üzerine gelince o noktaya kadar dolar) ve tıklanan değer kalıcı
  seçim olur.
- Prop olarak `name` (form alanı adı) ve `defaultValue` (mevcut puan, satır
  düzenleme formunda) alır; dahili olarak gizli bir
  `<input type="hidden" name={name} value={selected} />` render eder, böylece
  çevresindeki `<form action={...}>` ve server action imzaları hiç
  değişmeden çalışmaya devam eder.
- Hem "yeni logo ekle" formunda hem de mevcut logo satırındaki "puanı
  güncelle" mini formunda kullanılır — ikisi de aynı bileşeni farklı
  `defaultValue` ile çağırır.
- Native `<select name="rating">` her iki yerden de kaldırılır.
- Salt-okunur `StarBadge` (liste satırında rating gösterimi) değişmez —
  o zaten dropdown değil, düz metin/SVG gösterimiydi.

## Etkilenen dosyalar

- `app/detrbridge/_components/theme.ts` — renk sabitleri (isimler
  `DETRBRIDGE_NAVY`/`DETRBRIDGE_GOLD`'dan `DETRBRIDGE_TEAL`/
  `DETRBRIDGE_BLUE`/`DETRBRIDGE_RED` gibi üçe çıkar; gradyan/ambient
  arka plan/grid texture sabitleri güncellenir).
- `app/detrbridge/_components/star-picker.tsx` — yeni dosya.
- `app/detrbridge/_components/logos-tab.tsx` — iki native `<select>`
  StarPicker ile değiştirilir; renk referansları güncellenir.
- `app/detrbridge/_components/detrbridge-login.tsx` — renk referansları
  güncellenir (video paneli, şifre alanı, buton gradyanı); yapı/video/
  göster-gizle toggle değişmez.
- `app/detrbridge/_components/bridge-nav.tsx` — sidebar renk referansları.
- `app/detrbridge/_components/welcome-card.tsx`,
  `app/detrbridge/_components/visits-tab.tsx` — varsa renk referansları
  güncellenir (mevcut halleri okunup gerekiyorsa düzeltilecek).
- `app/detrbridge/page.tsx` — ambient arka plan/grid texture import'ları
  (isim değişirse) güncellenir.

## Kapsam dışı

- Layout/yapı değişikliği yok (sidebar, iki-sütunlu login kartı, video,
  şifre göster/gizle aynı kalır).
- Yeni bir panel/sekme eklenmiyor.
- `StarBadge` (salt-okunur rozet) bileşeni değişmiyor, sadece yeni
  `StarPicker` (etkileşimli) ekleniyor.

## Doğrulama

`tsc --noEmit` + `eslint --max-warnings=0` + `next build`. Görsel doğrulama
bu oturumda tarayıcı aracı olmadığı için HTML çıktısında beklenen class/
renk değerlerinin varlığını kontrol ederek yapılacak; kullanıcı gerçek
görünümü kendisi teyit edecek.
