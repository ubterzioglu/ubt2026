# 03 - Booking Form Migration to Homepage

## Goal
Mevcut randevu formunu ana sayfadaki appointment bölümüne taşımak, mevcut submit ve feedback akışını korumak, eski URL'yi ana sayfadaki ilgili bölüme yönlendirmek.

## TODOs

### Current booking flow audit
- [ ] `app/book-appointment/page.tsx` dosyasını aç.
- [ ] `searchParams` okuma mantığını incele.
- [ ] `buildBookingUrl` mantığını incele.
- [ ] Server action `submitBookingRequest` akışını incele.
- [ ] `createAppointment`, `sendNewBookingNotification`, `revalidatePath`, `redirect` sırasını not et.
- [ ] `components/appointment/booking-form.tsx` bileşeninin beklentilerini not et.
- [ ] `components/appointment/slot-selector.tsx` davranışını not et.

### Homepage integration
- [ ] `app/page.tsx` dosyasını aç.
- [ ] `HomePage` bileşenine `searchParams` desteği eklenip eklenmeyeceğini Next App Router kurallarına göre belirle.
- [ ] Ana sayfada appointment bölümünün mevcut tanıtım içeriğini tespit et.
- [ ] Bu bölümün form render edecek yeni yapısını tasarla.
- [ ] `BookingForm` bileşenini ana sayfaya import et.
- [ ] `getAvailableAppointmentSlots` çağrısını ana sayfaya taşı.
- [ ] Gerekli feedback parametrelerini homepage düzeyinde çöz.
- [ ] Mevcut fallback feedback mantığını ana sayfada yeniden kur.
- [ ] `submitBookingRequest` server action’ını ana sayfa içinde tanımla.
- [ ] `createAppointment` çağrısını koru.
- [ ] Başarısız submit durumunda kullanıcıyı homepage appointment section’a geri yönlendir.
- [ ] Başarılı submit durumunda kullanıcıyı homepage appointment section’a geri yönlendir.
- [ ] Redirect URL’lerinde `status`, `message`, gerekirse `slot` query parametrelerini koru.
- [ ] Redirect hedefini `/#book-appointment` olacak şekilde ayarla.
- [ ] Feedback sonrası formun aynı section içinde mesaj gösterebildiğini doğrula.
- [ ] Slot seçimi başarısız senaryoda yeniden korunabiliyorsa koru.

### Copy and layout update
- [ ] Appointment section başlığını ve açıklama metnini ana sayfa bağlamına uygun hale getir.
- [ ] Eski sağ taraftaki “Open booking page” CTA kutusunu kaldır.
- [ ] `BookingForm` bileşeninin section panel içinde mi yoksa doğrudan section içinde mi kullanılacağına karar ver ve sabitle.
- [ ] Ana sayfadaki spacing’in diğer section’larla uyumlu olduğundan emin ol.
- [ ] Form ve yardımcı bilgi alanının mobile ve desktop düzenini kontrol et.

### Redirect old page
- [ ] `app/book-appointment/page.tsx` dosyasını sadeleştir.
- [ ] Sayfayı artık form render etmeyecek hale getir.
- [ ] Gelen query parametrelerini homepage redirect URL’ine taşı.
- [ ] Eski `/book-appointment` rotasını `/#book-appointment` hedefine yönlendir.
- [ ] Varsa başarı/hata mesajlarını redirect sırasında kaybetme.
- [ ] Backward compatibility için dışarıdan gelen eski linklerin çalıştığını doğrula.

### Revalidation paths
- [ ] `revalidatePath` çağrılarını gözden geçir.
- [ ] `/book-appointment` artık form sayfası olmayacağı için gerekli path setini yeniden değerlendir.
- [ ] Homepage üzerinde form bulunduğundan `/` path’inin revalidate edildiğini doğrula.
- [ ] Admin path revalidation davranışlarını koru.

### Empty / error / env-missing states
- [ ] Slot yoksa formun disable durumunu ana sayfada kontrol et.
- [ ] Supabase env eksikse hata mesajının ana sayfada göründüğünü kontrol et.
- [ ] Slot okuma hatasında hata mesajının ana sayfada göründüğünü kontrol et.
- [ ] Boş slot durumunda kullanıcı deneyiminin tutarlı olduğunu doğrula.

### Verification
- [ ] `npm run lint` çalıştır.
- [ ] `npm run typecheck` çalıştır.
- [ ] Ana sayfada appointment section görünümünü kontrol et.
- [ ] Form submit success senaryosunu kontrol et.
- [ ] Form submit validation error senaryosunu kontrol et.
- [ ] `/book-appointment` URL redirect davranışını kontrol et.
