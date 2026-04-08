# Kalan İşler

Bu dosya, planın tamamlanmamış kısımlarını mikro adımlar halinde listeler.
Her bölüm bağımsız bir session'da yapılabilir. Her adım sonrası `npm run lint && npm run typecheck` çalıştırılmalı.

---

## 1. Key Achievements - Card Grid Redesign

**Durum:** Bekliyor
**Dosyalar:** `app/page.tsx:154-171`, yeni dosya: `components/achievement-card.tsx`

### Adımlar:
1. `components/achievement-card.tsx` oluştur - Her achievement için resim + text kartı
2. `content/profile.ts` → `keyAchievements` dizisine `image` alanı ekle (string | undefined)
3. `types/site.ts` → `AchievementItem` tipini güncelle
4. `app/page.tsx:154-171` → Mevcut `<ul>` listesini kaldır, yeni grid layout ile `<AchievementCard>` kullan
5. Grid layout: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
6. Kart yapısı: Üstte placeholder/görsel (`aspect-square rounded-2xl`), altta achievement text
7. Resim stratejisi: Statik renkli placeholder kullan (`bg-gradient-to-br from-accent/20 to-sunrise/20`)

### Örnek Kart Yapısı:
```
┌─────────────────────┐
│  [Gradient/Image]   │  aspect-square, rounded-2xl
│                     │
├─────────────────────┤
│ Achievement Text    │  p-4, text-sm
└─────────────────────┘
```

---

## 2. Private Projects - Layout Değişikliği

**Durum:** Bekliyor
**Dosyalar:** `app/page.tsx:230-246`

### Adımlar:
1. `app/page.tsx:230-246` → Grid layout'u `flex flex-col gap-4` olarak değiştir
2. Her `<article>`'ı corporate projects ile aynı yapıya getir:
   ```
   <article className="flex flex-col gap-4 rounded-[1.35rem] border border-line/80 bg-white/82 p-5 sm:flex-row sm:items-center sm:justify-between">
     <div className="flex-1 sm:pr-4">...</div>
     {project.image && (
       <Image src={`/private/${project.image}`} ... className="h-16 w-16 sm:h-20 sm:w-20 rounded-full ..." />
     )}
   </article>
   ```
3. Mevcut `public/private/` klasöründeki logolar zaten mevcut: `logoubtest.png`, `logoallin2min.png`, vb.
4. NOT: Plan `public/ppimage/` öneriyor ama `public/private/` zaten var, aynı yerde kalabilir
5. `privateProjects` zaten `image` alanına sahip (`content/profile.ts:193-236`)

---

## 3. Articles - FeaturedGrid Image Desteği

**Durum:** Bekliyor
**Dosyalar:** `components/featured-grid.tsx`, `types/site.ts`

### Adımlar:
1. `types/site.ts` → `FeaturedItem` interface'ine `imageUrl?: string | null` ekle
2. `lib/featured-items.ts` → `SupabaseFeaturedRow` ve `toFeaturedItem`'a `image_url` ekle
3. `components/featured-grid.tsx` → Kartın üstüne image alanı ekle:
   - Varsa: `<div className="aspect-video overflow-hidden rounded-t-[1.3rem]"><img .../></div>`
   - Yoksa: Gradient placeholder `<div className="aspect-video bg-gradient-to-br from-accent/15 to-sunrise/15" />`
4. Kart içeriği: image (üst) → badge + title + summary (alt)

---

## 4. Tech Stack - Logo Entegrasyonu

**Durum:** Bekliyor
**Dosyalar:** `components/tech-stack.tsx`, `types/site.ts`, `content/profile.ts`

### Adımlar:
1. `public/tech-logos/` klasörü oluştur
2. Her teknoloji için SVG logo indir (simpleicons.org kaynaklı):
   - selenium.svg, ranorex.svg, java.svg, csharp.svg, python.svg,
   - typescript.svg, jenkins.svg, docker.svg, git.svg, jira.svg, postman.svg
   - maven.svg, testng.svg, junit.svg, cucumber.svg, rest.svg, soapui.svg, xray.svg, polarion.svg
3. `types/site.ts` → `StackGroup.items` tipini `string[]` yerine `{name: string; logo?: string}[]` yap
4. `content/profile.ts` → `stackGroups` verisini güncelle, her item'a logo path ekle
5. `components/tech-stack.tsx` → Her pill'ın yanına logo ekle:
   ```
   <span className="inline-flex items-center gap-1.5 rounded-full ...">
     {item.logo && <img src={`/tech-logos/${item.logo}`} className="h-4 w-4" />}
     {item.name}
   </span>
   ```

---

## 5. Appointment Booking Sistemi (Tamamen Yeni)

**Durum:** Bekliyor
**Dosyalar:** Çok sayıda yeni dosya

### Alt görevler:

#### 5a. Supabase Migration SQL
1. `supabase/migrations/001_appointment_slots.sql` oluştur
2. `supabase/migrations/002_appointments.sql` oluştur

#### 5b. Type Tanımları
1. `types/appointment.ts` oluştur (AppointmentSlot, Appointment tipleri)

#### 5c. Data Layer
1. `lib/appointments.ts` oluştur (slot CRUD, appointment CRUD)

#### 5d. Public Booking Page
1. `app/book-appointment/page.tsx` oluştur
2. `components/appointment/slot-selector.tsx` oluştur
3. `components/appointment/booking-form.tsx` oluştur

#### 5e. Admin Panel
1. `app/admin/page.tsx` oluştur (dashboard)
2. `app/admin/slots/page.tsx` oluştur (slot yönetimi)
3. `app/admin/appointments/page.tsx` oluştur (randevu yönetimi)

#### 5f. Email Entegrasyonu
1. `lib/email.ts` oluştur (Resend API ile admin bildirimi)

#### 5g. Ana Sayfa Section
1. `app/page.tsx` → Contact öncesine "Book Appointment" section ekle

---

## 6. Bookmarks Upgrade (Supabase)

**Durum:** Bekliyor
**Dosyalar:** `lib/featured-items.ts`, Supabase migration

### Adımlar:
1. `supabase/migrations/003_bookmarks.sql` oluştur (title, summary, url, category, tags[], is_published, sort_order)
2. Mevcut bookmark fallback verilerini `content/featured.ts`'den export et
3. SQL insert script'i hazırla
4. `lib/featured-items.ts` → Bookmarks için ayrı fetch fonksiyonu ekle (category, tags filtreleme)
5. Frontend'de category filter UI ekle (opsiyonel)

---

## 7. Temizlik / Düzeltmeler

### types/site.ts Düzeltme Gerekli:
- `useful-apps` SECTION_IDS'den kaldır
- `ExperienceItem` iki kez tanımlı (satır 55-62 ve 71-79) → birleştir
- `StackGroup` tipini logo desteği için güncelle (görev 4 ile birlikte)

### lib/featured-items.ts:
- `apps` kategorisi `defaultCollections`'dan kaldırılabilir (useful-apps kaldırıldı)

---

## Tamamlananlar (Referans)

- [x] `content/site.ts` → useful-apps kaldırıldı, book-appointment eklendi
- [x] `components/site-header.tsx` → "UBT" buton, logo image, dikey bölücüler, yeni nav sırası
- [x] `app/page.tsx` → useful-apps section kaldırıldı, apps import/variable temizlendi
- [x] `components/hero-section.tsx` → Tekrar fotoğraf düzeltildi (flex-row layout, tek image)
- [x] `components/experience-section.tsx` → Stats (18+/8/3), chapter pills kaldırıldı, current badge kaldırıldı, highlights bullet listeye çevrildi, impactLabels 5'e çıkarıldı, KEY WORDS card container
