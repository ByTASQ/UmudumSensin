# Google Play Store Yayınlama Rehberi (İlan Bulucu)

Bu rehber, **İlan Bulucu** uygulamasını Google Play Store'da resmi bir Android uygulaması (TWA / PWA) olarak yayınlamanız için gereken tüm adımları ve dosyaları içermektedir.

Uygulamanız Google Play Store kalite standartlarına göre hazırlanmış olup:
- **Web App Manifest (`public/manifest.json`)** hazırlandı (Standalone, 192x192, 512x512 ve Maskable simgeler).
- **Service Worker (`public/sw.js`)** ve çevrimdışı önbellekleme entegre edildi.
- **Dijital Varlık Bağlantısı (`public/.well-known/assetlinks.json`)** hazırlandı (Adres çubuğunu gizler, tam yerel uygulama hissi verir).
- **Bubblewrap TWA Yapılandırması (`twa-manifest.json`)** eklendi.
- **Gizlilik Politikası URL'si (`/privacy`)** Google Play Console için yayına alındı.

---

## 🚀 1. Adım: Android Uygulama Paketini (.AAB) Üretme

Google Play Store artık `.apk` yerine **`.aab` (Android App Bundle)** formatını zorunlu tutmaktadır. `.aab` dosyasını üretmek için iki çok kolay yönteminiz vardır:

### Yöntem A: PWABuilder (Önerilen - En Kolay ve Hızlı Yol)
*Bilgisayarınıza hiçbir SDK veya Android Studio kurmanıza gerek yoktur.*

1. **[PWABuilder.com](https://www.pwabuilder.com/)** adresine gidin.
2. Uygulamanızın canlı URL adresini girin ve **"Start"** butonuna basın.
3. PWABuilder uygulamanızı tarayacak ve Manifest / Service Worker puanınızın **tam puan (100)** olduğunu gösterecektir.
4. Sağ üstteki **"Package for Stores"** butonuna tıklayın.
5. **Google Play (Android)** seçeneğinin altındaki **"Generate Package"** butonuna basın.
6. Açılan formda:
   - **Package ID:** `com.ilanbulucu.app`
   - **App name:** `İlan Bulucu`
   - **Launcher name:** `İlan Bulucu`
   - **Key:** Yeni bir imza anahtarı (keystore) oluşturmasını seçin veya kendi anahtarınızı yükleyin.
7. **"Download Package"** butonuna bastığınızda, Google Play'e doğrudan yüklenebilecek imzalı **`.aab`** dosyanız hazır olarak bilgisayarınıza inecektir!

---

### Yöntem B: Google Bubblewrap CLI (Komut Satırı ile Üretim)
Google'ın resmi Node.js aracıyla yerel terminalde üretmek isterseniz:

```bash
# 1. Bubblewrap CLI aracını global yükleyin:
npm install -g @bubblewrap/cli

# 2. Proje dizininde paketi derleyin:
bubblewrap init --manifest=./public/manifest.json
bubblewrap build
```

Derleme tamamlandığında `app-release-bundle.aab` dosyanız hazır olacaktır.

---

## 📋 2. Adım: Google Play Console'da Uygulamayı Oluşturma

1. **[Google Play Console](https://play.google.com/console)** hesabınıza giriş yapın.
2. Sağ üstten **"Uygulama Oluştur" (Create App)** butonuna tıklayın.
3. Bilgileri doldurun:
   - **Uygulama Adı:** `İlan Bulucu - Kamu & Özel İş İlanları`
   - **Varsayılan Dil:** `Türkçe (tr-TR)`
   - **Uygulama mı Oyun mu?:** `Uygulama`
   - **Ücretsiz / Ücretli:** `Ücretsiz`
   - Şartları ve politikaları kabul edip onaylayın.

---

## 🛡️ 3. Adım: Google Play Politika ve Mağaza Bilgileri

Google Play Console sol menüsündeki **"Uygulama İçeriği" (App Content)** sekmesinde şu formları doldurun:

1. **Gizlilik Politikası (Privacy Policy):**
   - URL kutusuna uygulamanızın gizlilik sayfasını girin:
   - `https://[sitenizin-adresi]/privacy`
   *(Uygulama anonim çalıştığı ve hiçbir kullanıcı verisi toplamadığı için incelemeden 1. seferde sorunsuz geçer).*

2. **Hedef Kitle ve İçerik:**
   - Hedef yaş grubu: **18 yaş ve üzeri** (İş arayan yetişkinler).
   - Reklamlar: **"Uygulamamda reklam yok"** seçin.
   - Uygulama Erişimi: **"Tüm işlevler kısıtlama olmadan kullanılabilir"** seçin.
   - İçerik Derecelendirmesi: Anketi doldurun (Şiddet, kumar vb. bulunmadığı için derecelendirme **PEGI 3 / Herkes** olarak atanacaktır).

3. **Ana Mağaza Girişi (Main Store Listing):**
   - **Kısa Açıklama:** *Kamu ve özel sektör iş ilanlarını tarayan ve uygunluk analizi yapan mobil uygulama.*
   - **Tam Açıklama:**
     ```text
     İlan Bulucu ile Türkiye genelindeki tüm resmi kamu kurumları, belediyeler ve kurumsal özel sektör iş ilanlarına tek bir yerden ulaşın!

     Özellikler:
     • Kamu Alımları: Kariyer Kapısı (CBİKO), İŞKUR, T.C. Resmî Gazete, Kamu İlan SBB ve üniversite ilanları.
     • Özel Sektör: Kariyer.net, İşin Olsun, Secretcv, Eleman.net ve LinkedIn fırsatları.
     • Akıllı Eşleştirme: Meslek unvanınız, mezuniyetiniz, yaşınız ve KPSS puanınıza göre %100 uyan ilanları filtreleyin.
     • Doğrudan Başvuru: Aracı veya komisyonsuz, resmi başvuru portallarına doğrudan erişim.
     • Gizlilik Odaklı: Kişisel verileriniz sunucularda saklanmaz, üyelik veya hesap zorunluluğu yoktur.
     ```
   - **Uygulama Simgesi:** `public/icons/icon-512.png` dosyasını yükleyin (512x512 PNG).
   - **Öne Çıkan Grafik (Feature Graphic):** 1024x500 piksel boyutunda tanıtım görseli yükleyin.
   - **Ekran Görüntüleri:** En az 2 adet telefon ekran görüntüsü yükleyin.

---

## 🔑 4. Adım: Dijital Varlık Bağlantısı (AssetLinks) Doğrulaması

Android uygulamanız telefonda açıldığında üstte tarayıcı adres çubuğu çıkmaması ve **%100 yerel uygulama** gibi tam ekran açılması için:

1. Google Play Console'da **Sürüm > Uygulama İmzalama (App Signing)** sayfasına gidin.
2. **"Uygulama imzalama anahtarı sertifikası"** altındaki **SHA-256 parmak izini (SHA-256 certificate fingerprint)** kopyalayın.
3. `public/.well-known/assetlinks.json` dosyasını açıp içindeki SHA-256 parmak izi yerine bu değeri yapıştırın:
   ```json
   [
     {
       "relation": ["delegate_permission/common.handle_all_urls"],
       "target": {
         "namespace": "android_app",
         "package_name": "com.ilanbulucu.app",
         "sha256_cert_fingerprints": [
           "BURAYA_PLAY_CONSOLE_SHA256_PARMAK_IZINI_YAPISTIRIN"
         ]
       }
     }
   ]
   ```
4. Uygulamanızı yayınladığınızda Android işletim sistemi bu dosyayı otomatik doğrulayacak ve uygulama tamamen yerel bir Android uygulaması gibi tam ekran çalışacaktır.

---

## 🚀 5. Adım: Yayına Alma

1. Google Play Console sol menüden **Üretim (Production)** veya **Kapalı Test (Closed Testing)** sekmesine gidin.
2. **"Yeni sürüm oluştur"** butonuna tıklayın.
3. 1. Adımda PWABuilder veya Bubblewrap ile ürettiğiniz **`.aab`** dosyasını sürüm kutusuna sürükleyip bırakın.
4. Sürüm notu olarak örneğin: `İlk resmi sürüm: İlan Bulucu mobil uygulaması yayında.` yazın.
5. **"Kaydet ve İncelemeye Gönder"** butonuna basın.

Google inceleme ekibi uygulamanızı genellikle 24-48 saat içinde onaylayarak Google Play Store'da tüm kullanıcılara açacaktır!
