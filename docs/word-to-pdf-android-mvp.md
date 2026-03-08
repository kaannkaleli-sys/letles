# Word → PDF Android Uygulaması (MVP Tasarım Başlangıcı)

Bu doküman, internet gerektirmeden çalışan Word dosyasını PDF'e çeviren Android uygulamasının ilk tasarım çerçevesini içerir.

## 1) Ürün hedefi
- Android cihazlarda çalışacak.
- İnternet bağlantısı olmadan dönüşüm yapacak.
- Kullanıcının seçtiği Word dosyasını (`.docx`) PDF'e çevirecek.
- Çıktıyı telefona kaydedecek ve paylaşmaya izin verecek.

## 2) MVP kapsamı

### Dahil
- Dosya seçici üzerinden `.docx` alma.
- Başka uygulamalardan "Paylaş" ile dosya açma.
- Cihaz içinde (offline) dönüşüm.
- PDF'i kullanıcı tarafından seçilen klasöre kaydetme.
- Dönüşüm sonucu ekranı (başarılı/hata).

### MVP dışında (sonraki sprint)
- `.doc` desteği.
- Gelişmiş stil sadakati (karmaşık tablo/şekiller).
- Toplu dönüşüm (batch).
- Şifreli Word dosyaları.

## 3) Kullanıcı akışı
1. Kullanıcı uygulamayı açar.
2. "Dosya Seç" ile Word dosyası seçer.
3. Uygulama dosya adını ve boyutunu doğrular.
4. "PDF'e Dönüştür" başlatılır.
5. İlerleme göstergesi görünür.
6. Başarılıysa çıktı yolu ve "Paylaş" seçeneği gösterilir.

## 4) Teknik mimari (öneri)

### Katmanlar
- **Presentation**: Compose ekranları, ViewModel.
- **Domain**: `ConvertDocxToPdfUseCase`.
- **Data**: `DocxParser`, `PdfWriter`, `StorageRepository`.

### Önerilen teknoloji
- Kotlin + Jetpack Compose
- Coroutines
- WorkManager (uzun süren işler için)
- Apache POI (docx okuma)
- PdfBox-Android veya iText (pdf üretme)

## 5) Güvenlik ve gizlilik
- İnternet izni istemeden çalıştırma (`INTERNET` izni olmadan).
- Dönüşümde kullanılan geçici dosyaları iş bitince temizleme.
- Dosya içeriğini cihaz dışına göndermeme.
- Hata loglarında içerik saklamama (yalnız teknik hata kodu).

## 6) Performans hedefleri (MVP)
- 1–5 MB tipik bir `.docx` için dönüşüm başlangıç süresi: < 1 sn.
- Orta boy belgelerde dönüşüm süresi: mümkünse 3–10 sn.
- Bellek taşmasını önlemek için akış bazlı okuma/yazma.

## 7) İlk sprint görev planı (1 hafta)
1. Proje iskeleti + navigasyon (1 gün)
2. Dosya seçme ve URI izinleri (1 gün)
3. Basit docx metin okuma + PDF yazma (2 gün)
4. Kaydetme/Paylaşma ekranı (1 gün)
5. Hata durumları + temel testler (1 gün)

## 8) Riskler ve azaltma
- **Risk:** Word stillerinin birebir taşınamaması.
  - **Aksiyon:** MVP'de sade metin + başlık odaklı dönüşüm.
- **Risk:** Büyük dosyalarda RAM kullanımı.
  - **Aksiyon:** Streaming yaklaşımı ve iş parçalama.
- **Risk:** Üretici bazlı Android dosya izin farklılıkları.
  - **Aksiyon:** Storage Access Framework standart akışı.

## 9) Sonraki adım
Bir sonraki adımda Android proje klasör yapısı ve ekran wireframe'i hazırlanacak:
- `home` (dosya seçimi)
- `convert` (işlem/ilerleme)
- `result` (kaydet/paylaş)
