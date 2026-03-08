# Word to PDF Android Prototype

Bu klasör, offline çalışan Word (`.docx`) → PDF uygulaması için çalıştırılabilir Android modül iskeletini içerir.

## Bu turda tamamlananlar
- Gradle proje dosyaları eklendi (`settings.gradle.kts`, kök `build.gradle.kts`, `app/build.gradle.kts`).
- `FakeDocxToPdfConverter` kaldırıldı, yerine Apache POI + PdfBox tabanlı `DocxToPdfConverterImpl` eklendi.
- Gerçek dosya seçimi için `ACTION_OPEN_DOCUMENT` akışı (`OpenDocument`) eklendi.
- PDF kayıt klasörü seçimi için `OpenDocumentTree` entegrasyonu eklendi.

## Akış
1. Kullanıcı dosya kaynağını seçer (Telefon Depolama / Google Drive).
2. Word dosyası sistem dosya seçici ile açılır.
3. PDF kayıt klasörü seçilir.
4. Dönüştürme işlemi başlatılır ve çıktı seçilen klasöre yazılır.

## Notlar
- Demo dönüştürücü, temel paragraf metnini PDF'e yazar; gelişmiş stiller (tablo/şekil/font) bir sonraki adımda genişletilecektir.
- Bu repoda Gradle wrapper (`gradlew`) henüz yok; wrapper eklendiğinde `./gradlew :app:assembleDebug` ile doğrulanabilir.
