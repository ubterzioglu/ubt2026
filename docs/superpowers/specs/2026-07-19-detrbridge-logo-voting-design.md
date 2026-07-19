# detrbridge logo oylama sistemi — tasarım

## Amaç

`/detrbridge` panosundaki "Logo Seçimi" sekimi bugün admin-only bir araç:
tek şifreyle giren kişi dosya yükler ve tek bir `rating` kolonunu elle 1-5
arası ayarlar. Bunu, aynı şifreyle giren **herkesin** her logoyu 1-5 yıldız
ile oylayabildiği, isimlerin kayıt altına alındığı ve ortalama puana göre
sıralamanın canlı güncellendiği bir halk oylaması hâline getiriyoruz.

`docs/logodetrbridge/` altındaki 21 JPEG, bir kerelik script ile sisteme
yüklenecek.

## Kapsam

- Var olan admin panelini genişletiyoruz (ayrı bir sayfa/sekme yok).
- Aynı `/detrbridge` şifre kapısı geçerli; ek bir kimlik doğrulama katmanı yok.
- "Seç" butonu (nihai seçim rozeti) admin-only olarak aynen kalıyor.
- Admin'in elle puan girdiği eski `rating` kolonu ve "Puanı güncelle" kutusu
  kaldırılıyor; yerini oy tablosundan hesaplanan ortalama alıyor.

## Veri modeli

### Yeni tablo: `detrbridge_logo_votes`

| kolon        | tip                     | not                                  |
|--------------|--------------------------|---------------------------------------|
| `id`         | uuid, pk, default gen    |                                        |
| `logo_id`    | uuid, fk → `detrbridge_logos.id` on delete cascade | |
| `voter_name` | text, not null           | trim edilmiş, 2-60 karakter           |
| `rating`     | smallint, not null       | 1-5, check constraint                 |
| `created_at` | timestamptz, default now |                                        |

Kısıt: `unique (logo_id, voter_name)` — aynı isim aynı logoyu iki kez
oylayamaz. Bu sunucu tarafı asıl garanti; localStorage sadece kullanıcı
deneyimi için (formu önceden gizlemek amacıyla) kullanılır, güvenlik sınırı
değildir — bir isim çakışması olursa insert hata döner ve kullanıcıya
"zaten oy kullanmışsın" mesajı gösterilir.

### `detrbridge_logos` değişikliği

- `rating` kolonu **kaldırılıyor** (migration ile drop).
- `is_selected`, `storage_path`, `file_name`, `size_bytes`, `created_at`
  aynen kalıyor.

### Sıralama ve gösterim

Liste sorgusu artık `detrbridge_logos` ile `detrbridge_logo_votes`'u
birleştirip her logo için `avgRating` (ortalama, oy yoksa `null`) ve
`voteCount` hesaplıyor. Sıralama: `avgRating` DESC (null'lar en sona),
eşitlikte `created_at` ASC.

## Sunucu tarafı (`lib/detrbridge-logos.ts`)

- `DetrbridgeLogo` tipinden `rating: number` çıkar, yerine
  `avgRating: number | null` ve `voteCount: number` eklenir.
- `getAllLogosAdmin()`: iki sorgu (logos + votes) sonrası JS tarafında
  ortalama hesaplanır (Supabase'de agregasyon için ikinci bir `select` ile
  tüm oy satırları çekilir — 21 logo × birkaç oy için ölçek sorunu yok).
- `createLogo`: `rating` parametresini artık **almaz** (yeni logo oysuz,
  ortalaması `null`/sıralamada en altta başlar). İsim + dosya validasyonu
  aynen kalır.
- `updateLogoRating` fonksiyonu **silinir**.
- Yeni `castLogoVote(logoId: string, voterName: string, rating: number): Promise<MutationResult>`:
  - `voterName` trim edilir, 2-60 karakter aralığında olmalı.
  - `rating` 1-5 tam sayı olmalı.
  - `logo_id` var olan bir logoya işaret etmeli (FK zaten garanti eder).
  - Insert edilir; unique constraint ihlalinde
    (`error.code === "23505"`) `{ ok: false, errorMessage: "Bu logoyu zaten oyladın." }` döner.
- `selectLogo`, `deleteLogo` aynen kalır (silme, cascade ile o logonun
  oylarını da siler).

## İstemci tarafı

### İsim yakalama

- `localStorage.detrbridge_voter_name` anahtarında saklanır.
- Sayfa açıldığında bu değer yoksa, sayfanın üstünde (Logo Seçimi
  sekmesinin başında) bir "Adını yaz" mini formu gösterilir; girilen isim
  localStorage'a yazılır ve sayfa state'inde tutulur (client component).
- İsim varsa, dilenirse değiştirilebilecek küçük bir "Değiştir" linki
  gösterilir (input'u tekrar açar).
- Oy formu, isim boşken devre dışı/gizli davranır (kullanıcı önce isim
  girmeye yönlendirilir).

### Logo kartı (`LogoRow`)

- Rozet artık `★ 4.2 (7 oy)` biçiminde ortalama + oy sayısı gösterir; hiç
  oy yoksa `Henüz oy yok`.
- localStorage'daki `detrbridge_voted_logos` (dizi, logo id'leri) bu
  logonun id'sini içeriyorsa: oy formu yerine "✓ Puanın: 4" gösterilir
  (kullanıcının en son gönderdiği puanı client state'te tutarak).
- İçermiyorsa: 1-5 yıldız seçim + "Oy ver" butonu (mevcut server-action
  formu deseniyle, `voteAction`).
- Oy başarıyla kaydedilince client tarafta `detrbridge_voted_logos`
  dizisine id eklenir (form submit sonrası `revalidatePath` ile liste
  tazelenir; sıra değişebilir).
- "Seç" butonu ve "Sil" butonu aynen admin panelinde kalır (herkes şifre
  sahibi olduğu için bunlara da erişebilir — bu, mevcut tasarımın zaten
  kabul ettiği bir durum, bu spec'in kapsamı dışında).

### Yeni logo ekleme formu

- "Puan" alanı formdan kaldırılır (artık admin taban puanı girmiyor);
  sadece İsim + Dosya kalır.

## Server actions (`page.tsx` / `_actions.ts`)

- `rateAction` (admin puan güncelleme) **kaldırılır**.
- Yeni `voteAction(formData)`: `logoId`, `voterName`, `rating` alanlarını
  okur, `castLogoVote` çağırır, hata varsa `?error=` ile aynı sekmeye
  redirect eder, başarılıysa `revalidatePath("/detrbridge")` + redirect.
- `createAction`: `rating` okumayı bırakır.
- `selectAction`, `deleteAction` değişmez.

## Toplu logo yükleme scripti

- Tek seferlik script (`scripts/` altında, mevcut "detr-files →
  detrbridge-files kopyalama" script'i örnek alınarak), `SUPABASE_SERVICE_ROLE_KEY`
  kullanarak:
  - `docs/logodetrbridge/*.jpeg` dosyalarını sırayla okur.
  - Her biri için `detrbridge-logos` storage bucket'ına `logos/<timestamp>-<safe-name>`
    yoluna yükler (mevcut `uploadLogoFile` mantığıyla aynı path şeması).
  - `detrbridge_logos` tablosuna `name: "Logo 1"` … `"Logo 21"` (dosya
    sırasına göre numaralanmış), `file_name`, `size_bytes`, `storage_path`
    ile insert eder.
  - Script bir kez elle çalıştırılır, kod tabanında kalıcı bir route/cron
    olmaz.

## Hata durumları

- İsimsiz oy denemesi: client tarafta engellenir (buton disabled); sunucu
  tarafı da `voterName` boşsa reddeder (savunma derinliği).
- Aynı isim + aynı logo tekrar oy: unique constraint → "Bu logoyu zaten
  oyladın." hatası, sekme üstünde kırmızı banner (mevcut `errorParam`
  deseniyle).
- Supabase env eksikse: mevcut `env-missing` banner'ı aynen çalışmaya
  devam eder (oy formu da gösterilmez, çünkü `result` zaten boş döner).

## Test / doğrulama planı

- Manuel: iki farklı isimle aynı logoyu oyla → ikisi de kaydedilmeli,
  ortalama doğru hesaplanmalı.
- Manuel: aynı isimle aynı logoyu iki kez oylamayı dene → ikinci denemede
  hata mesajı.
- Manuel: localStorage temizlenince aynı kişi tekrar oy verebilmeli (kabul
  edilen davranış — sunucu tarafı isim bazlı engelliyor, bu localStorage'ı
  atlatmanın "istismarı" bu ölçekli bir iç araç için önemsiz).
- Manuel: yeni logo ekle (dosya + isim, puansız) → listede oysuz/en altta
  görünmeli.
- Manuel: "Seç" ve "Sil" butonları admin akışında değişmeden çalışmalı.
