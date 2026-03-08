# Android Proje Yapısı (Taslak)

```text
app/
  src/main/
    java/com/example/wordtopdf/
      data/
        parser/DocxParser.kt
        pdf/PdfWriter.kt
        storage/StorageRepository.kt
      domain/
        model/ConversionResult.kt
        usecase/ConvertDocxToPdfUseCase.kt
      presentation/
        home/HomeScreen.kt
        convert/ConvertScreen.kt
        result/ResultScreen.kt
        MainViewModel.kt
      MainActivity.kt
    AndroidManifest.xml
```

## Ekranlar
- **HomeScreen**: Dosya seç, dosya bilgisi göster.
- **ConvertScreen**: Dönüşüm ilerlemesi, iptal/geri seçenekleri.
- **ResultScreen**: Dosya yolu, tekrar dönüştür, paylaş.

## İlk mimari kararlar
- `Uri` bazlı çalışma: ham dosya yolu varsayımı yapılmayacak.
- Dosya okuma/yazma işlemleri yalnızca repository katmanında olacak.
- UI durum yönetimi `StateFlow` ile yapılacak.
