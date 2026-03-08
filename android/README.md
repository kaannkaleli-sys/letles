# Word to PDF Android Prototype

Bu klasör, offline çalışan Word (`.docx`) → PDF uygulaması için başlangıç seviyesinde çalışan bir Android mimari iskeleti içerir.

## Neler eklendi?
- Compose tabanlı 3 ekran akışı: Home → Convert → Result
- `MainViewModel` ile durum yönetimi (`StateFlow`)
- Kaynak sorusu: dosya nereden seçilecek? (Telefon Depolama / Google Drive)
- Kaydetme sorusu: PDF nereye kayıt edilecek? (Download / Documents)
- `ConvertDocxToPdfUseCase` ile domain katmanında dönüşüm orkestrasyonu
- `FakeDocxToPdfConverter` ile demo dönüşüm (gerçek kütüphane entegrasyonu için yer tutucu)

## Sonraki adım
- Gradle proje dosyaları eklenip modül ayağa kaldırılmalı.
- `FakeDocxToPdfConverter` yerine Apache POI + PdfBox/iText implementasyonu yapılmalı.
- Seçilen kaynağa göre gerçek `ACTION_OPEN_DOCUMENT`/provider entegrasyonu eklenmeli.
