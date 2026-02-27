# Cep Haberim

Telefon ekranına uygun, hızlı ve kullanıcı dostu RSS/Atom haber uygulaması.

## Hızlı test
```bash
python3 -m http.server 8080
```
Ardından aç:
- `http://localhost:8080/index.html`
- `http://localhost:8080/cep-haberim.html` (tek dosya demo)

## Neleri iyileştirdim?
- Haber sitesi seçimi yerine kategori başlığına göre birleşik akış (Son Dakika, Güncel, Spor, Ekonomi, Dünya, Teknoloji, Magazin).
- Daha dayanıklı veri çekme: doğrudan istek + proxy fallback + timeout + aynı kaynak için alternatif RSS adresleri.
- Kısmi hata toleransı: bazı kaynaklar düşse bile çalışan kaynaklarla liste devam eder.
- Link, tarih, içerik temizliği ve tekrar eden haberleri tekilleştirme.
- Favori/okundu durumu, arama, sıralama, otomatik yenileme ve tema kalıcılığı.
- iOS uyumluluğu için safe-area, 16px form alanı ve paylaşım fallback desteği.

## Dosya düzeni
- `index.html`: Ana uygulama
- `styles.css`: Arayüz stilleri
- `app.js`: Uygulama mantığı
- `tek_dosya_uret.py`: Tek dosya HTML üreticisi
- `cep-haberim.html`: Tek dosyalık dağıtım
- `icon.svg`: Uygulama sekme/ana ekran ikonu

Tek dosyayı yeniden üretmek için:
```bash
python3 tek_dosya_uret.py
```

> Not: Mobil internet/CORS sorunları için uygulama artık birden fazla proxy ve JSON fallback denemesi yapar; yine de bazı kaynaklar dönemsel olarak engellenebilir.
