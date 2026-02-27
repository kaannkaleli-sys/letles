# Cep Haberim

Telefon ekranına uygun, kullanımı basit bir RSS haber uygulaması.

## Hızlı test (tek dosya)
Projede tek başına çalıştırabileceğin dosya:
- `cep-haberim.html`

Bu dosyayı test etmek için:
```bash
python3 -m http.server 8080
```
Ardından tarayıcıda aç:
- `http://localhost:8080/cep-haberim.html`

## Özellikler
- Hazır haber kaynakları (özellikle TRT Haber kategorileri dahil).
- RSS ve Atom feed desteği.
- Haber başlığı, kısa özet, tarih ve kaynak gösterimi.
- Tek dokunuşla yenileme.

## Ekli kaynaklar
- TRT Haber - Son Dakika
- TRT Haber - Gündem
- TRT Haber - Dünya
- TRT Haber - Ekonomi
- TRT Haber - Spor
- BBC Türkçe
- NTV - Son Dakika
- Anadolu Ajansı - Güncel

> Not: Bazı RSS kaynakları CORS nedeniyle doğrudan açılamadığı için uygulama `allorigins` proxy kullanır.
