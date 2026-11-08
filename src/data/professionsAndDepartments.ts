/**
 * Türkiye Kapsamlı Meslek, Bölüm ve Sektör Veritabanı
 * İŞKUR Meslek Ana Listesi, Kamu Memur/Personel Unvanları, Üniversite & MYO Bölümleri
 */

export interface SuggestionItem {
  name: string;
  category?: string;
  subText?: string;
}

// Hızlı Sektör Filtreleme Başlıkları
export const PROFESSION_SECTORS = [
  'Tümü',
  'Sanayi & Üretim',
  'Kamu & Memur',
  'Mühendislik',
  'Sağlık',
  'Bilişim & Yazılım',
  'Lojistik & Ulaşım',
  'Hizmet & İşçi',
  'Finans & Büro',
  'Eğitim & Akademi',
  'Turizm & Gıda',
  'Güvenlik',
  'İnşaat & Teknik',
  'Tarım & Hayvancılık',
  'Hukuk & Adalet'
];

// ==========================================
// TÜM MESLEKLER (İŞKUR, KAMU VE ÖZEL SEKTÖR)
// ==========================================
export const ALL_PROFESSIONS: SuggestionItem[] = [
  // ==========================================
  // 1. SANAYİ, İMALAT & ÜRETİM TEKNOLOJİLERİ
  // ==========================================
  { name: 'Lazer Kesim Operatörü (Fiber / CO2 / CNC)', category: 'Sanayi & Üretim', subText: 'Metal & Sac İmalat • Özel Sektör' },
  { name: 'Lazer Markalama ve Kaynak Operatörü', category: 'Sanayi & Üretim', subText: 'Hassas İmalat & Medikal • Özel Sektör' },
  { name: 'Abkant Pres Operatörü', category: 'Sanayi & Üretim', subText: 'Büküm & Sac Şekillendirme' },
  { name: 'CNC Torna / Freze Operatörü', category: 'Sanayi & Üretim', subText: 'Talaşlı İmalat & Savunma Sanayi' },
  { name: 'Plastik Enjeksiyon Operatörü', category: 'Sanayi & Üretim', subText: 'Plastik ve Kalıp Sanayi' },
  { name: 'Kaynakçı (Gazaltı / Argon / TIG / MIG)', category: 'Sanayi & Üretim', subText: 'Fabrika, Tersane, Sanayi • Usta' },
  { name: 'Talaşlı İmalat Ustası / Operatörü', category: 'Sanayi & Üretim', subText: 'Makine & Metal Sanayi' },
  { name: 'Kalıpçı (Plastik / Sac Metal)', category: 'Sanayi & Üretim', subText: 'İmalat & Otomotiv Yan Sanayi' },
  { name: 'Oto Mekanik / Motor Ustası', category: 'Sanayi & Üretim', subText: 'Yetkili Servisler & Sanayi' },
  { name: 'Oto Elektrik ve Elektronik Ustası', category: 'Sanayi & Üretim', subText: 'Otomotiv Sanayi' },
  { name: 'Oto Kaporta ve Boya Ustası', category: 'Sanayi & Üretim', subText: 'Otomotiv Servis & Sanayi' },
  { name: 'Mekanik Bakım Onarım Elemanı', category: 'Sanayi & Üretim', subText: 'Fabrikalar & Endüstriyel Tesisler' },
  { name: 'Kalite Kontrol Elemanı / Uzmanı', category: 'Sanayi & Üretim', subText: 'Üretim & İmalat Fabrikaları' },
  { name: 'Montaj Elemanı', category: 'Sanayi & Üretim', subText: 'Beyaz Eşya, Otomotiv, Elektronik' },
  { name: 'Paketleme Elemanı', category: 'Sanayi & Üretim', subText: 'Gıda, İlaç, Kimya, Tekstil' },
  { name: 'Tekstil / Dikiş Makinesi Operatörü', category: 'Sanayi & Üretim', subText: 'Konfeksiyon & Tekstil Sanayi' },
  { name: 'Dökümcü / Metal Döküm Elemanı', category: 'Sanayi & Üretim', subText: 'Demir Çelik & Dökümhaneler' },
  { name: 'Tersane & Gemi İnşa İşçisi', category: 'Sanayi & Üretim', subText: 'Tersaneler & Denizcilik' },
  { name: 'Marangoz / Mobilya İmalat Ustası', category: 'Sanayi & Üretim', subText: 'Ahşap & Mobilya Sanayi' },
  { name: 'Boya / Elektrostatik Toz Boya Elemanı', category: 'Sanayi & Üretim', subText: 'Endüstriyel Boyama' },

  // ==========================================
  // 2. KAMU, MEMUR & İDARİ HİZMETLER
  // ==========================================
  { name: 'Büro Personeli (4/B Sözleşmeli)', category: 'Kamu & Memur', subText: 'Bakanlıklar, Üniversiteler, Valilikler' },
  { name: 'Memur (Genel İdare Hizmetleri - GİH)', category: 'Kamu & Memur', subText: 'Resmi Devlet Kurumları • KPSS' },
  { name: 'Veri Hazırlama ve Kontrol İşletmeni (VHKİ)', category: 'Kamu & Memur', subText: 'Bakanlıklar & Resmi Daireler' },
  { name: 'Zabıta Memuru', category: 'Kamu & Memur', subText: 'Belediyeler • KPSS P93/P3' },
  { name: 'İtfaiye Eri', category: 'Kamu & Memur', subText: 'Belediyeler • Ön/Lisans/Lise' },
  { name: 'İnfaz ve Koruma Memuru (Gardiyan)', category: 'Kamu & Memur', subText: 'Adalet Bakanlığı CTE' },
  { name: 'Zabıt Kâtibi', category: 'Kamu & Memur', subText: 'Adliyeler & Mahkemeler' },
  { name: 'Mübaşir', category: 'Kamu & Memur', subText: 'Adliyeler • En az Lise' },
  { name: 'İcra Müdür Yardımcısı / İcra Kâtibi', category: 'Kamu & Memur', subText: 'Adalet Bakanlığı İcra Daireleri' },
  { name: 'Gümrük Muhafaza Memuru', category: 'Kamu & Memur', subText: 'Ticaret Bakanlığı' },
  { name: 'Gümrük Muayene Memuru', category: 'Kamu & Memur', subText: 'Ticaret Bakanlığı • Lisans' },
  { name: 'Gelir Uzman Yardımcısı (GUY)', category: 'Kamu & Memur', subText: 'Gelir İdaresi Başkanlığı' },
  { name: 'Vergi Müfettiş Yardımcısı', category: 'Kamu & Memur', subText: 'Hazine ve Maliye Bakanlığı' },
  { name: 'Sosyal Güvenlik Denetmen Yardımcısı', category: 'Kamu & Memur', subText: 'Sosyal Güvenlik Kurumu (SGK)' },
  { name: 'KYK Yurt Yönetim Personeli', category: 'Kamu & Memur', subText: 'Gençlik ve Spor Bakanlığı (GSB)' },
  { name: 'Nüfus Memuru', category: 'Kamu & Memur', subText: 'Nüfus ve Vatandaşlık İşleri' },
  { name: 'Orman Muhafaza Memuru', category: 'Kamu & Memur', subText: 'Orman Genel Müdürlüğü (OGM)' },
  { name: 'Santral Memuru / Operatör', category: 'Kamu & Memur', subText: 'Kamu Kurumları & Belediyeler' },
  { name: 'Arşiv Memuru / Görevlisi', category: 'Kamu & Memur', subText: 'Kamu & Üniversite Kütüphaneleri' },
  { name: 'Rektörlük Personeli / Üniversite İdari Personeli', category: 'Kamu & Memur', subText: 'Üniversite Rektörlükleri' },

  // ==========================================
  // 3. MÜHENDİSLİK & MİMARLIK
  // ==========================================
  { name: 'Bilgisayar Mühendisi', category: 'Mühendislik', subText: 'Bilişim & Yazılım • Lisans' },
  { name: 'Yazılım Mühendisi', category: 'Mühendislik', subText: 'Yazılım & Ar-Ge • Lisans' },
  { name: 'Elektrik-Elektronik Mühendisi', category: 'Mühendislik', subText: 'Kamu (TEİAŞ, TEDAŞ) & Özel Sektör' },
  { name: 'Makine Mühendisi', category: 'Mühendislik', subText: 'Sanayi, İmalat & Kamu • Lisans' },
  { name: 'İnşaat Mühendisi', category: 'Mühendislik', subText: 'DSİ, KGM, Belediyeler & Şantiyeler' },
  { name: 'Endüstri Mühendisi', category: 'Mühendislik', subText: 'Planlama, Lojistik & Yönetim' },
  { name: 'Mekatronik Mühendisi', category: 'Mühendislik', subText: 'Savunma Sanayi, Otomasyon & Robotik' },
  { name: 'Ziraat Mühendisi', category: 'Mühendislik', subText: 'Tarım Bakanlığı & Özel Çiftlikler' },
  { name: 'Gıda Mühendisi', category: 'Mühendislik', subText: 'Denetim, Fabrikalar & Kamu' },
  { name: 'Çevre Mühendisi', category: 'Mühendislik', subText: 'Çevre Bakanlığı, Belediyeler & Arıtma' },
  { name: 'Harita / Geomatik Mühendisi', category: 'Mühendislik', subText: 'Tapu Kadastro, Belediyeler & Proje' },
  { name: 'Kimya Mühendisi', category: 'Mühendislik', subText: 'Petrokimya, İlaç & Sanayi' },
  { name: 'Biyomedikal Mühendisi', category: 'Mühendislik', subText: 'Hastaneler & Medikal Cihaz Şirketleri' },
  { name: 'Maden Mühendisi', category: 'Mühendislik', subText: 'MTA, TKİ & Madencilik Şirketleri' },
  { name: 'Jeoloji Mühendisi', category: 'Mühendislik', subText: 'MTA, AFAD, Sondaj & Zemin Etüdü' },
  { name: 'Orman Mühendisi', category: 'Mühendislik', subText: 'Orman Genel Müdürlüğü (OGM)' },
  { name: 'Uçak / Havacılık Mühendisi', category: 'Mühendislik', subText: 'TUSAŞ, Aselsan, Baykar, THY' },
  { name: 'Metalurji ve Malzeme Mühendisi', category: 'Mühendislik', subText: 'Savunma Sanayi & Ağır Metal' },
  { name: 'Otomotiv Mühendisi', category: 'Mühendislik', subText: 'Otomotiv Fabrikaları & Ar-Ge' },
  { name: 'Mimar', category: 'Mühendislik', subText: 'Kamu Projeleri & Mimarlık Ofisleri' },
  { name: 'İç Mimar', category: 'Mühendislik', subText: 'Tasarım Ofisleri & Şantiyeler' },
  { name: 'Peyzaj Mimarı', category: 'Mühendislik', subText: 'Belediyeler & Çevre Düzenleme' },
  { name: 'Şehir ve Bölge Plancısı', category: 'Mühendislik', subText: 'İmar & Şehircilik Daireleri' },

  // ==========================================
  // 4. SAĞLIK & TIP HİZMETLERİ
  // ==========================================
  { name: 'Tabip (Pratisyen Hekim / Uzman Doktor)', category: 'Sağlık', subText: 'Sağlık Bakanlığı & Özel Hastaneler' },
  { name: 'Hemşire (Lisans / Lise)', category: 'Sağlık', subText: 'Kamu Hastaneleri & Özel Sağlık' },
  { name: 'Ebe', category: 'Sağlık', subText: 'Doğumevleri & Aile Sağlığı Merkezleri' },
  { name: 'İlk ve Acil Yardım (Paramedik / ATT)', category: 'Sağlık', subText: '112 Acil Ambulans Servisi' },
  { name: 'Anestezi Teknikeri', category: 'Sağlık', subText: 'Ameliyathane & Yoğun Bakım' },
  { name: 'Radyoloji / Tıbbi Görüntüleme Teknikeri', category: 'Sağlık', subText: 'Röntgen, MR, Tomografi' },
  { name: 'Tıbbi Laboratuvar Teknikeri', category: 'Sağlık', subText: 'Kan & Biyokimya Laboratuvarı' },
  { name: 'Tıbbi Sekreter / Hasta Kabul Personeli', category: 'Sağlık', subText: 'Devlet & Şehir Hastaneleri' },
  { name: 'Fizyoterapist', category: 'Sağlık', subText: 'Fizik Tedavi & Rehabilitasyon' },
  { name: 'Diyetisyen / Beslenme Uzmanı', category: 'Sağlık', subText: 'Hastaneler & Özel Klinikler' },
  { name: 'Eczacı', category: 'Sağlık', subText: 'Eczaneler & Hastane Eczaneleri' },
  { name: 'Eczane Hizmetleri Teknikeri', category: 'Sağlık', subText: 'Eczaneler & İlaç Depoları' },
  { name: 'Diş Hekimi', category: 'Sağlık', subText: 'ADSM & Özel Diş Klinikleri' },
  { name: 'Ağız ve Diş Sağlığı Teknikeri', category: 'Sağlık', subText: 'Diş Hastaneleri & ADSM' },
  { name: 'Odyometri Teknikeri', category: 'Sağlık', subText: 'İşitme Testi Merkezleri' },
  { name: 'Optisyen', category: 'Sağlık', subText: 'Optik Müesseseleri' },
  { name: 'Diyaliz Teknikeri', category: 'Sağlık', subText: 'Diyaliz Merkezleri' },
  { name: 'Psikolog / Klinik Psikolog', category: 'Sağlık', subText: 'Sağlık, Adalet & Aile Bakanlığı' },
  { name: 'Sosyal Hizmet Uzmanı (Sosyal Çalışmacı)', category: 'Sağlık', subText: 'Aile ve Sosyal Hizmetler Bakanlığı' },
  { name: 'Hasta ve Yaşlı Bakım Elemanı', category: 'Sağlık', subText: 'Huzurevleri, Bakımevleri & Evde Bakım' },
  { name: 'Biyomedikal Cihaz Teknikeri', category: 'Sağlık', subText: 'Tıbbi Cihaz Teknik Servis' },
  { name: 'Veteriner Hekim', category: 'Sağlık', subText: 'Tarım Bakanlığı, Belediyeler & Klinik' },
  { name: 'Laborant ve Veteriner Sağlık Teknikeri', category: 'Sağlık', subText: 'Veteriner Klinikleri & Çiftlikler' },

  // ==========================================
  // 5. BİLİŞİM, YAZILIM & TEKNOLOJİ
  // ==========================================
  { name: 'Yazılım Geliştirici (Full Stack)', category: 'Bilişim & Yazılım', subText: 'Web & Bulut Teknolojileri' },
  { name: 'Frontend Geliştirici (React / Vue / Angular)', category: 'Bilişim & Yazılım', subText: 'Arayüz Yazılımları' },
  { name: 'Backend Geliştirici (Java / .NET / Node / Python)', category: 'Bilişim & Yazılım', subText: 'Sunucu & API Mimarisi' },
  { name: 'Mobil Uygulama Geliştirici (iOS / Android / Flutter)', category: 'Bilişim & Yazılım', subText: 'Mobil Yazılım Şirketleri' },
  { name: 'Yapay Zeka (AI) ve Makine Öğrenimi Uzmanı', category: 'Bilişim & Yazılım', subText: 'Ar-Ge & Veri Bilimi' },
  { name: 'Veri Bilimci / Veri Analisti', category: 'Bilişim & Yazılım', subText: 'Büyük Veri, Bankacılık & Telekom' },
  { name: 'DevOps & Bulut Mimarı (Cloud Engineer)', category: 'Bilişim & Yazılım', subText: 'AWS, Azure, Kubernetes, CI/CD' },
  { name: 'Siber Güvenlik Uzmanı / SOC Analisti', category: 'Bilişim & Yazılım', subText: 'BTK, Kamu & Özel Güvenlik' },
  { name: 'Yazılım Test Otomasyon Uzmanı (QA)', category: 'Bilişim & Yazılım', subText: 'Kalite Güvence & Otomasyon' },
  { name: 'Sistem ve Ağ Yöneticisi (Network Admin)', category: 'Bilişim & Yazılım', subText: 'Veri Merkezleri & Kurumsal Ağlar' },
  { name: 'Veritabanı Yöneticisi (DBA - SQL / Oracle)', category: 'Bilişim & Yazılım', subText: 'Veritabanı Yönetimi' },
  { name: 'Bilgi İşlem Destek Uzmanı', category: 'Bilişim & Yazılım', subText: 'Donanım, Ağ & Kullanıcı Desteği' },
  { name: 'UI / UX Tasarımcı', category: 'Bilişim & Yazılım', subText: 'Kullanıcı Deneyimi & Web Tasarım' },
  { name: 'Oyun Geliştirici (Unity / Unreal Engine)', category: 'Bilişim & Yazılım', subText: 'Oyun Stüdyoları' },
  { name: 'Bilişim Güvenliği Teknikeri', category: 'Bilişim & Yazılım', subText: 'Siber Tehdit İzleme' },

  // ==========================================
  // 6. ULAŞIM, LOJİSTİK & İŞ MAKİNESİ
  // ==========================================
  { name: 'Şoför (B Sınıfı - Makam / Binek / Hafif Ticari)', category: 'Lojistik & Ulaşım', subText: 'Kamu Makam, Şirket & Servis' },
  { name: 'Şoför (C/CE Sınıfı - Ağır Vasıta / Kamyon / Tır)', category: 'Lojistik & Ulaşım', subText: 'Lojistik, Taşımacılık & Hafriyat' },
  { name: 'Şoför (D Sınıfı - Otobüs / Yolcu Taşımacılığı)', category: 'Lojistik & Ulaşım', subText: 'Belediye Otobüsü & Turizm' },
  { name: 'Ambulans Şoförü', category: 'Lojistik & Ulaşım', subText: '112 Acil Sağlık Hizmetleri' },
  { name: 'Forklift Operatörü', category: 'Lojistik & Ulaşım', subText: 'Depo & Lojistik Merkezleri' },
  { name: 'Vinç Operatörü (Kule / Mobil / Tavan)', category: 'Lojistik & Ulaşım', subText: 'Liman, Şantiye & Fabrika' },
  { name: 'Ekskavatör / Beko Loder Operatörü (Kepçe)', category: 'Lojistik & Ulaşım', subText: 'DSİ, Karayolları, Belediye, Şantiye' },
  { name: 'Kurye (Motosikletli / Arabalı)', category: 'Lojistik & Ulaşım', subText: 'Hızlı Teslimat & E-Ticaret' },
  { name: 'Depo Görevlisi / Sevkiyat Sorumlusu', category: 'Lojistik & Ulaşım', subText: 'Lojistik Depoları & Antrepolar' },
  { name: 'Kargo Dağıtım Elemanı', category: 'Lojistik & Ulaşım', subText: 'PTT Kargo & Kargo Firmaları' },
  { name: 'Lojistik ve Tedarik Zinciri Uzmanı', category: 'Lojistik & Ulaşım', subText: 'Uluslararası Taşımacılık' },
  { name: 'Gümrük Operasyon Elemanı', category: 'Lojistik & Ulaşım', subText: 'Gümrük Müşavirlikleri' },
  { name: 'Liman İşçisi / Palamar Elemanı', category: 'Lojistik & Ulaşım', subText: 'Konteyner & Yük Limanları' },
  { name: 'Raylı Sistemler Makinist / Teknikeri', category: 'Lojistik & Ulaşım', subText: 'TCDD & Şehir İçi Metro / Tramvay' },
  { name: 'Pilot (Ticari / Kargo)', category: 'Lojistik & Ulaşım', subText: 'THY, Pegasus & Havayolları' },
  { name: 'Kabin Memuru (Hostes / Host)', category: 'Lojistik & Ulaşım', subText: 'Havayolu Şirketleri' },
  { name: 'Gemi Kaptanı / Güverte Zabiti', category: 'Lojistik & Ulaşım', subText: 'Ticaret Gemileri & Ro-Ro' },

  // ==========================================
  // 7. HİZMET, TEMİZLİK, BEDEN İŞÇİSİ & BAKIM
  // ==========================================
  { name: 'Temizlik Görevlisi / Destek Personeli', category: 'Hizmet & İşçi', subText: 'Hastaneler, Okullar & Kamu Kurumları' },
  { name: 'Beden İşçisi (Genel / Kamu / TYP)', category: 'Hizmet & İşçi', subText: 'İŞKUR TYP, Belediyeler & Şantiyeler' },
  { name: 'Park ve Bahçe Bakım Elemanı', category: 'Hizmet & İşçi', subText: 'Belediyeler & Park İşleri' },
  { name: 'Çöp Kamyonu Arkası Elemanı / Katı Atık İşçisi', category: 'Hizmet & İşçi', subText: 'Belediye Temizlik İşleri' },
  { name: 'Aşçı (Sıcak / Soğuk / Alakart)', category: 'Hizmet & İşçi', subText: 'Kamu Yemekhaneleri, Oteller, Restoranlar' },
  { name: 'Aşçı Yardımcısı / Bulaşıkçı', category: 'Hizmet & İşçi', subText: 'Mutfak Servis Elemanı' },
  { name: 'Garson / Servis Elemanı', category: 'Hizmet & İşçi', subText: 'Sosyal Tesisler, Oteller & Kafeler' },
  { name: 'Komi / Bar Boy', category: 'Hizmet & İşçi', subText: 'Restoran & Kafeler' },
  { name: 'Kat Hizmetleri Görevlisi (Housekeeping)', category: 'Hizmet & İşçi', subText: 'Öğretmenevleri, Misafirhaneler, Oteller' },
  { name: 'Bahçıvan', category: 'Hizmet & İşçi', subText: 'Peyzaj & Bahçe Bakımı' },
  { name: 'Hayvan Bakıcısı / Çoban', category: 'Hizmet & İşçi', subText: 'Belediye Barınakları & Çiftlikler' },
  { name: 'Engelli Bakım Elemanı', category: 'Hizmet & İşçi', subText: 'Bakım Merkezleri' },

  // ==========================================
  // 8. FİNANS, MUHASEBE, BÜRO & İK
  // ==========================================
  { name: 'Ön Muhasebe Elemanı', category: 'Finans & Büro', subText: 'Fatura, Cari Hesap & Stok' },
  { name: 'Genel Muhasebe Uzmanı', category: 'Finans & Büro', subText: 'Beyanname, Bordro & Bilanço' },
  { name: 'Mali Müşavir (SMMM)', category: 'Finans & Büro', subText: 'Mali Müşavirlik Ofisleri' },
  { name: 'İnsan Kaynakları (İK) Uzmanı', category: 'Finans & Büro', subText: 'İşe Alım, Özlük & Eğitim' },
  { name: 'Bordro ve Özlük İşleri Uzmanı', category: 'Finans & Büro', subText: 'Personel Yönetimi' },
  { name: 'Satın Alma Uzmanı', category: 'Finans & Büro', subText: 'Kamu İhale & Kurumsal Tedarik' },
  { name: 'Banka Gişe Yetkilisi / Memuru', category: 'Finans & Büro', subText: 'Kamu (Ziraat, Halk) & Özel Bankalar' },
  { name: 'Banka Bireysel / Ticari Müşteri Temsilcisi', category: 'Finans & Büro', subText: 'Bankacılık Şubeleri' },
  { name: 'Sigorta Acentesi Teknik Personeli', category: 'Finans & Büro', subText: 'SEGEM Belgeli Acenteler' },
  { name: 'Yönetici Asistanı / Sekreter', category: 'Finans & Büro', subText: 'Yönetim Desteği & Büro' },
  { name: 'Çağrı Merkezi Müşteri Temsilcisi', category: 'Finans & Büro', subText: '112, 182, Çağrı Merkezleri' },
  { name: 'Danışma Görevlisi / Resepsiyonist', category: 'Finans & Büro', subText: 'Hastaneler & Kurum Girişleri' },
  { name: 'Finansal Analist / Bütçe Uzmanı', category: 'Finans & Büro', subText: 'Holdingler & Şirketler' },

  // ==========================================
  // 9. EĞİTİM, AKADEMİ & SPOR
  // ==========================================
  { name: 'Öğretmen (MEB KPSS - Tüm Branşlar)', category: 'Eğitim & Akademi', subText: 'Milli Eğitim Bakanlığı' },
  { name: 'Okul Öncesi Öğretmeni / Çocuk Gelişimci', category: 'Eğitim & Akademi', subText: 'MEB, Kreşler & Anaokulları' },
  { name: 'Sınıf Öğretmeni', category: 'Eğitim & Akademi', subText: 'İlkokullar • Lisans' },
  { name: 'Özel Eğitim Öğretmeni', category: 'Eğitim & Akademi', subText: 'RAM & Özel Eğitim Merkezleri' },
  { name: 'İngilizce Öğretmeni', category: 'Eğitim & Akademi', subText: 'Devlet & Özel Kolejler' },
  { name: 'Matematik Öğretmeni', category: 'Eğitim & Akademi', subText: 'Ortaokul & Lise' },
  { name: 'Türkçe / Türk Dili ve Edebiyatı Öğretmeni', category: 'Eğitim & Akademi', subText: 'MEB & Kurslar' },
  { name: 'Rehber Öğretmen / Psikolojik Danışman (PDR)', category: 'Eğitim & Akademi', subText: 'Okullar & RAM' },
  { name: 'Usta Öğretici', category: 'Eğitim & Akademi', subText: 'Halk Eğitimi Merkezleri' },
  { name: 'Araştırma Görevlisi / Öğretim Görevlisi', category: 'Eğitim & Akademi', subText: 'Üniversiteler • ALES & YDS' },
  { name: 'Antrenör / Spor Eğitmeni', category: 'Eğitim & Akademi', subText: 'GSB, Belediyeler & Spor Kulüpleri' },

  // ==========================================
  // 10. TURİZM, OTELCİLİK & YEME-İÇME
  // ==========================================
  { name: 'Resepsiyonist / Ön Büro Elemanı', category: 'Turizm & Gıda', subText: 'Oteller & Tatil Köyleri' },
  { name: 'Barista / Barmen', category: 'Turizm & Gıda', subText: 'Kafeler, Oteller & Barlar' },
  { name: 'Pastacı / Fırıncı Ustası', category: 'Turizm & Gıda', subText: 'Pastaneler & Unlu Mamuller' },
  { name: 'Kasap / Şarküteri Elemanı', category: 'Turizm & Gıda', subText: 'Et Entegre, Market & Kasaplar' },
  { name: 'Turist Rehberi', category: 'Turizm & Gıda', subText: 'TUREB Ruhsatlı Seyahat Acenteleri' },
  { name: 'Otel Müdürü / Vardiya Şefi', category: 'Turizm & Gıda', subText: 'Konaklama Sektörü' },

  // ==========================================
  // 11. GÜVENLİK, KORUMA & SAVUNMA
  // ==========================================
  { name: 'Güvenlik Görevlisi (Silahsız)', category: 'Güvenlik', subText: 'Kamu & Özel • En az Lise' },
  { name: 'Güvenlik Görevlisi (Silahlı)', category: 'Güvenlik', subText: 'Banka, Tesis & Kamu • En az Lise' },
  { name: 'Özel Güvenlik Amiri / Vardiya Şefi', category: 'Güvenlik', subText: 'Tesis Güvenlik Yönetimi' },
  { name: 'Koruma ve Güvenlik Görevlisi (Kamu)', category: 'Güvenlik', subText: 'Resmi Daireler & Üniversiteler' },
  { name: 'Çarşı ve Mahalle Bekçisi', category: 'Güvenlik', subText: 'Emniyet Genel Müdürlüğü (EGM)' },
  { name: 'Cankurtaran (Gümüş / Bronz Bröveli)', category: 'Güvenlik', subText: 'Plajlar, Havuzlar & Tesisler' },
  { name: 'CCTV / Kamera İzleme Operatörü', category: 'Güvenlik', subText: 'AVM, Tesis & Güvenlik Merkezleri' },

  // ==========================================
  // 12. İNŞAAT, ENERJİ & TEKNİK ZANAAT
  // ==========================================
  { name: 'Elektronik Teknikeri', category: 'İnşaat & Teknik', subText: 'Kamu & Özel • Önlisans' },
  { name: 'Elektrik Teknikeri', category: 'İnşaat & Teknik', subText: 'Kamu & Özel • Önlisans' },
  { name: 'Mekatronik Teknikeri', category: 'İnşaat & Teknik', subText: 'Kamu & Özel • Önlisans' },
  { name: 'Makine Teknikeri', category: 'İnşaat & Teknik', subText: 'Kamu & Özel • Önlisans' },
  { name: 'İnşaat Teknikeri', category: 'İnşaat & Teknik', subText: 'Kamu & Özel • Önlisans' },
  { name: 'Güneş Enerjisi (GES) Kurulum & Bakım Elemanı', category: 'İnşaat & Teknik', subText: 'Yenilenebilir Enerji' },
  { name: 'Rüzgar Enerjisi (RES) Teknikeri', category: 'İnşaat & Teknik', subText: 'Rüzgar Santralleri' },
  { name: 'Elektrikçi (Bina / Sanayi Tesisat)', category: 'İnşaat & Teknik', subText: 'Usta / Teknisyen' },
  { name: 'Sıhhi Tesisatçı / Kalorifer Ustası', category: 'İnşaat & Teknik', subText: 'Bina & Tesis Altyapı' },
  { name: 'Doğalgaz İç Tesisat Ustası', category: 'İnşaat & Teknik', subText: 'Doğalgaz Firmaları' },
  { name: 'İnşaat Ustası / Kalıpçı / Demirci', category: 'İnşaat & Teknik', subText: 'Şantiye & Yapı İnşaatı' },
  { name: 'Boya ve Alçı Sıva Ustası', category: 'İnşaat & Teknik', subText: 'Bina İnşaat & Dekorasyon' },
  { name: 'İş Sağlığı ve Güvenliği (İSG) Uzmanı (A/B/C)', category: 'İnşaat & Teknik', subText: 'OSGB & Şantiyeler' },
  { name: 'İklimlendirme ve Soğutma Teknikeri', category: 'İnşaat & Teknik', subText: 'Klima & Havalandırma' },

  // ==========================================
  // 13. PAZARLAMA, SATIŞ & PERAKENDE
  // ==========================================
  { name: 'Kasiyer', category: 'Finans & Büro', subText: 'Market, AVM & Mağazacılık' },
  { name: 'Mağaza Satış Danışmanı / Reyon Görevlisi', category: 'Finans & Büro', subText: 'Perakende & Mağazalar' },
  { name: 'Mağaza Müdürü / Mağaza Şefi', category: 'Finans & Büro', subText: 'Perakende Mağaza Yönetimi' },
  { name: 'Saha Satış Temsilcisi / Plasiyer', category: 'Finans & Büro', subText: 'B2B & Dağıtım Satışı' },
  { name: 'E-Ticaret Yöneticisi / Ürün Yöneticisi', category: 'Bilişim & Yazılım', subText: 'Online Pazaryerleri' },
  { name: 'Dijital Pazarlama & Sosyal Medya Uzmanı', category: 'Bilişim & Yazılım', subText: 'Ajanslar & E-Ticaret' },

  // ==========================================
  // 14. HUKUK & ADALET
  // ==========================================
  { name: 'Avukat / Hukuk Müşaviri', category: 'Hukuk & Adalet', subText: 'Kamu Kurumları & Baro' },
  { name: 'Hâkim / Savcı Adayı', category: 'Hukuk & Adalet', subText: 'Adalet Bakanlığı' },
  { name: 'Noter Kâtibi', category: 'Hukuk & Adalet', subText: 'Noterlikler' },
  { name: 'Arabulucu', category: 'Hukuk & Adalet', subText: 'Adalet Bakanlığı Sicili' },

  // ==========================================
  // 15. DİYANET
  // ==========================================
  { name: 'İmam-Hatip', category: 'Kamu & Memur', subText: 'Diyanet İşleri Başkanlığı' },
  { name: 'Müezzin-Kayyım', category: 'Kamu & Memur', subText: 'Diyanet İşleri Başkanlığı' },
  { name: 'Kur’an Kursu Öğreticisi', category: 'Kamu & Memur', subText: 'Diyanet İşleri Başkanlığı' }
];

// ==========================================
// TÜM BÖLÜMLER (ÖSYM, YÖK, MYO, MESLEK LİSESİ)
// ==========================================
export const ALL_DEPARTMENTS: SuggestionItem[] = [
  // --- ÖNLİSANS (2 YILLIK) TEKNİK & SANAYİ PROGRAMLARI ---
  { name: 'Elektronik Teknolojisi', category: 'Önlisans (Teknik)', subText: 'MYO • 2 Yıllık' },
  { name: 'Elektrik', category: 'Önlisans (Teknik)', subText: 'MYO • 2 Yıllık' },
  { name: 'Elektronik ve Haberleşme', category: 'Önlisans (Teknik)', subText: 'MYO • 2 Yıllık' },
  { name: 'Mekatronik', category: 'Önlisans (Teknik)', subText: 'MYO • 2 Yıllık' },
  { name: 'Makine', category: 'Önlisans (Teknik)', subText: 'MYO • 2 Yıllık' },
  { name: 'CNC ve Talaşlı Üretim', category: 'Önlisans (Teknik)', subText: 'MYO • 2 Yıllık' },
  { name: 'Kaynak Teknolojisi', category: 'Önlisans (Teknik)', subText: 'MYO • 2 Yıllık' },
  { name: 'İnşaat Teknolojisi', category: 'Önlisans (Teknik)', subText: 'MYO • 2 Yıllık' },
  { name: 'Harita ve Kadastro', category: 'Önlisans (Teknik)', subText: 'MYO • 2 Yıllık' },
  { name: 'Otomotiv Teknolojisi', category: 'Önlisans (Teknik)', subText: 'MYO • 2 Yıllık' },
  { name: 'Biyomedikal Cihaz Teknolojisi', category: 'Önlisans (Sağlık/Teknik)', subText: 'MYO • 2 Yıllık' },
  { name: 'İklimlendirme ve Soğutma Teknolojisi', category: 'Önlisans (Teknik)', subText: 'MYO • 2 Yıllık' },
  { name: 'Kimya Teknolojisi', category: 'Önlisans (Teknik)', subText: 'MYO • 2 Yıllık' },
  { name: 'Laboratuvar Teknolojisi', category: 'Önlisans (Teknik)', subText: 'MYO • 2 Yıllık' },
  { name: 'Gıda Teknolojisi', category: 'Önlisans (Teknik)', subText: 'MYO • 2 Yıllık' },
  { name: 'Raylı Sistemler Makinistliği', category: 'Önlisans (Ulaşım)', subText: 'MYO • 2 Yıllık' },
  { name: 'Raylı Sistemler Elektrik ve Elektronik', category: 'Önlisans (Teknik)', subText: 'MYO • 2 Yıllık' },
  { name: 'Uçak Teknolojisi', category: 'Önlisans (Havacılık)', subText: 'MYO • 2 Yıllık' },
  { name: 'İnsansız Hava Aracı Teknolojisi ve Operatörlüğü', category: 'Önlisans (Havacılık)', subText: 'MYO • 2 Yıllık' },
  { name: 'İş Sağlığı ve Güvenliği', category: 'Önlisans / Lisans', subText: 'MYO • 2 Yıllık' },
  { name: 'Maden Teknolojisi', category: 'Önlisans (Teknik)', subText: 'MYO • 2 Yıllık' },
  { name: 'Doğalgaz ve Tesisatı Teknolojisi', category: 'Önlisans (Teknik)', subText: 'MYO • 2 Yıllık' },
  { name: 'Grafik Tasarımı', category: 'Önlisans (Sanat/Tasarım)', subText: 'MYO • 2 Yıllık' },
  { name: 'Moda Tasarımı', category: 'Önlisans (Tasarım)', subText: 'MYO • 2 Yıllık' },

  // --- ÖNLİSANS (2 YILLIK) BİLİŞİM PROGRAMLARI ---
  { name: 'Bilgisayar Programcılığı', category: 'Önlisans (Bilişim)', subText: 'MYO • 2 Yıllık' },
  { name: 'Bilişim Güvenliği Teknolojisi', category: 'Önlisans (Bilişim)', subText: 'MYO • 2 Yıllık' },
  { name: 'Web Tasarımı ve Kodlama', category: 'Önlisans (Bilişim)', subText: 'MYO / AÖF • 2 Yıllık' },
  { name: 'Mobil Teknolojileri', category: 'Önlisans (Bilişim)', subText: 'MYO • 2 Yıllık' },
  { name: 'Yapay Zeka Operatörlüğü', category: 'Önlisans (Bilişim)', subText: 'MYO • 2 Yıllık' },

  // --- ÖNLİSANS (2 YILLIK) SAĞLIK PROGRAMLARI ---
  { name: 'İlk ve Acil Yardım (Paramedik)', category: 'Önlisans (Sağlık)', subText: 'SHMYO • 2 Yıllık' },
  { name: 'Tıbbi Dokümantasyon ve Sekreterlik', category: 'Önlisans (Sağlık/Büro)', subText: 'SHMYO • 2 Yıllık' },
  { name: 'Anestezi', category: 'Önlisans (Sağlık)', subText: 'SHMYO • 2 Yıllık' },
  { name: 'Tıbbi Görüntüleme Teknikleri (Radyoloji)', category: 'Önlisans (Sağlık)', subText: 'SHMYO • 2 Yıllık' },
  { name: 'Tıbbi Laboratuvar Teknikleri', category: 'Önlisans (Sağlık)', subText: 'SHMYO • 2 Yıllık' },
  { name: 'Ağız ve Diş Sağlığı', category: 'Önlisans (Sağlık)', subText: 'SHMYO • 2 Yıllık' },
  { name: 'Diş Protez Teknolojisi', category: 'Önlisans (Sağlık)', subText: 'SHMYO • 2 Yıllık' },
  { name: 'Diyaliz', category: 'Önlisans (Sağlık)', subText: 'SHMYO • 2 Yıllık' },
  { name: 'Fizyoterapi (Teknikerlik)', category: 'Önlisans (Sağlık)', subText: 'SHMYO • 2 Yıllık' },
  { name: 'Odyometri', category: 'Önlisans (Sağlık)', subText: 'SHMYO • 2 Yıllık' },
  { name: 'Optisyenlik', category: 'Önlisans (Sağlık)', subText: 'SHMYO • 2 Yıllık' },
  { name: 'Eczane Hizmetleri', category: 'Önlisans (Sağlık)', subText: 'SHMYO • 2 Yıllık' },
  { name: 'Yaşlı Bakımı', category: 'Önlisans (Sağlık/Bakım)', subText: 'SHMYO • 2 Yıllık' },
  { name: 'Evde Hasta Bakımı', category: 'Önlisans (Sağlık/Bakım)', subText: 'SHMYO • 2 Yıllık' },
  { name: 'Çocuk Gelişimi', category: 'Önlisans / Lisans', subText: 'MYO • 2 Yıllık' },
  { name: 'Radyoterapi', category: 'Önlisans (Sağlık)', subText: 'SHMYO • 2 Yıllık' },
  { name: 'Ortopedik Protez ve Ortez', category: 'Önlisans (Sağlık)', subText: 'SHMYO • 2 Yıllık' },
  { name: 'Laborant ve Veteriner Sağlık', category: 'Önlisans (Tarım/Sağlık)', subText: 'MYO • 2 Yıllık' },

  // --- ÖNLİSANS (2 YILLIK) İDARİ, SOSYAL & HİZMET PROGRAMLARI ---
  { name: 'Büro Yönetimi ve Yönetici Asistanlığı', category: 'Önlisans (İdari)', subText: 'MYO • 2 Yıllık' },
  { name: 'Muhasebe ve Vergi Uygulamaları', category: 'Önlisans (İdari)', subText: 'MYO • 2 Yıllık' },
  { name: 'Adalet', category: 'Önlisans (Hukuk)', subText: 'Adalet MYO • 2 Yıllık' },
  { name: 'Ceza İnfaz ve Güvenlik Hizmetleri', category: 'Önlisans (Hukuk/Güvenlik)', subText: 'Adalet MYO • 2 Yıllık' },
  { name: 'Özel Güvenlik ve Koruma', category: 'Önlisans (Güvenlik)', subText: 'MYO • 2 Yıllık' },
  { name: 'Mülkiyet Koruma ve Güvenlik', category: 'Önlisans (Güvenlik)', subText: 'MYO • 2 Yıllık' },
  { name: 'Sivil Savunma ve İtfaiyecilik', category: 'Önlisans (Güvenlik)', subText: 'MYO • 2 Yıllık' },
  { name: 'Lojistik', category: 'Önlisans / Lisans', subText: 'MYO • 2 Yıllık' },
  { name: 'Dış Ticaret', category: 'Önlisans (İdari)', subText: 'MYO • 2 Yıllık' },
  { name: 'Bankacılık ve Sigortacılık', category: 'Önlisans (İdari)', subText: 'MYO • 2 Yıllık' },
  { name: 'Halkla İlişkiler ve Tanıtım', category: 'Önlisans / Lisans', subText: 'MYO • 2 Yıllık' },
  { name: 'İnsan Kaynakları Yönetimi', category: 'Önlisans / Lisans', subText: 'MYO • 2 Yıllık' },
  { name: 'Yerel Yönetimler', category: 'Önlisans / Lisans', subText: 'MYO • 2 Yıllık' },
  { name: 'Sosyal Hizmetler', category: 'Önlisans / Lisans', subText: 'MYO • 2 Yıllık' },
  { name: 'Turizm ve Otel İşletmeciliği', category: 'Önlisans (Turizm)', subText: 'MYO • 2 Yıllık' },
  { name: 'Aşçılık', category: 'Önlisans (Gastronomi)', subText: 'MYO • 2 Yıllık' },
  { name: 'Çağrı Merkezi Hizmetleri', category: 'Önlisans (İletişim)', subText: 'MYO • 2 Yıllık' },
  { name: 'Emlak Yönetimi', category: 'Önlisans (Ticaret)', subText: 'MYO • 2 Yıllık' },
  { name: 'Fotoğrafçılık ve Kameramanlık', category: 'Önlisans (Medya)', subText: 'MYO • 2 Yıllık' },
  { name: 'Ormancılık ve Orman Ürünleri', category: 'Önlisans (Orman)', subText: 'MYO • 2 Yıllık' },
  { name: 'Bahçe Tarımı', category: 'Önlisans (Ziraat)', subText: 'MYO • 2 Yıllık' },
  { name: 'Bitki Koruma', category: 'Önlisans / Lisans', subText: 'MYO • 2 Yıllık' },

  // --- LİSANS (4 YILLIK) MÜHENDİSLİK VE MİMARLIK FAKÜLTESİ ---
  { name: 'Bilgisayar Mühendisliği', category: 'Lisans (Mühendislik)', subText: 'Fakülte • 4 Yıllık' },
  { name: 'Yazılım Mühendisliği', category: 'Lisans (Mühendislik)', subText: 'Fakülte • 4 Yıllık' },
  { name: 'Elektrik-Elektronik Mühendisliği', category: 'Lisans (Mühendislik)', subText: 'Fakülte • 4 Yıllık' },
  { name: 'Makine Mühendisliği', category: 'Lisans (Mühendislik)', subText: 'Fakülte • 4 Yıllık' },
  { name: 'İnşaat Mühendisliği', category: 'Lisans (Mühendislik)', subText: 'Fakülte • 4 Yıllık' },
  { name: 'Endüstri Mühendisliği', category: 'Lisans (Mühendislik)', subText: 'Fakülte • 4 Yıllık' },
  { name: 'Mekatronik Mühendisliği', category: 'Lisans (Mühendislik)', subText: 'Fakülte • 4 Yıllık' },
  { name: 'Ziraat Mühendisliği (Tüm Programlar)', category: 'Lisans (Ziraat)', subText: 'Fakülte • 4 Yıllık' },
  { name: 'Tarla Bitkileri', category: 'Lisans (Ziraat)', subText: 'Fakülte • 4 Yıllık' },
  { name: 'Bahçe Bitkileri', category: 'Lisans (Ziraat)', subText: 'Fakülte • 4 Yıllık' },
  { name: 'Zootekni', category: 'Lisans (Ziraat)', subText: 'Fakülte • 4 Yıllık' },
  { name: 'Gıda Mühendisliği', category: 'Lisans (Mühendislik)', subText: 'Fakülte • 4 Yıllık' },
  { name: 'Çevre Mühendisliği', category: 'Lisans (Mühendislik)', subText: 'Fakülte • 4 Yıllık' },
  { name: 'Harita Mühendisliği (Geomatik)', category: 'Lisans (Mühendislik)', subText: 'Fakülte • 4 Yıllık' },
  { name: 'Kimya Mühendisliği', category: 'Lisans (Mühendislik)', subText: 'Fakülte • 4 Yıllık' },
  { name: 'Biyomedikal Mühendisliği', category: 'Lisans (Mühendislik)', subText: 'Fakülte • 4 Yıllık' },
  { name: 'Maden Mühendisliği', category: 'Lisans (Mühendislik)', subText: 'Fakülte • 4 Yıllık' },
  { name: 'Jeoloji Mühendisliği', category: 'Lisans (Mühendislik)', subText: 'Fakülte • 4 Yıllık' },
  { name: 'Orman Mühendisliği', category: 'Lisans (Mühendislik)', subText: 'Fakülte • 4 Yıllık' },
  { name: 'Orman Endüstri Mühendisliği', category: 'Lisans (Mühendislik)', subText: 'Fakülte • 4 Yıllık' },
  { name: 'Otomotiv Mühendisliği', category: 'Lisans (Mühendislik)', subText: 'Fakülte • 4 Yıllık' },
  { name: 'Havacılık ve Uzay Mühendisliği', category: 'Lisans (Mühendislik)', subText: 'Fakülte • 4 Yıllık' },
  { name: 'Metalurji ve Malzeme Mühendisliği', category: 'Lisans (Mühendislik)', subText: 'Fakülte • 4 Yıllık' },
  { name: 'Mimarlık', category: 'Lisans (Mimarlık)', subText: 'Fakülte • 4 Yıllık' },
  { name: 'İç Mimarlık ve Çevre Tasarımı', category: 'Lisans (Mimarlık)', subText: 'Fakülte • 4 Yıllık' },
  { name: 'Şehir ve Bölge Planlama', category: 'Lisans (Mimarlık)', subText: 'Fakülte • 4 Yıllık' },
  { name: 'Peyzaj Mimarlığı', category: 'Lisans (Mimarlık)', subText: 'Fakülte • 4 Yıllık' },

  // --- LİSANS (4 YILLIK) İKTİSADİ VE İDARİ BİLİMLER (İİBF) ---
  { name: 'İşletme', category: 'Lisans (İİBF)', subText: 'Fakülte • 4 Yıllık' },
  { name: 'İktisat (Ekonomi)', category: 'Lisans (İİBF)', subText: 'Fakülte • 4 Yıllık' },
  { name: 'Maliye', category: 'Lisans (İİBF)', subText: 'Fakülte • 4 Yıllık' },
  { name: 'Siyaset Bilimi ve Kamu Yönetimi', category: 'Lisans (İİBF)', subText: 'Fakülte • 4 Yıllık' },
  { name: 'Uluslararası İlişkiler', category: 'Lisans (İİBF)', subText: 'Fakülte • 4 Yıllık' },
  { name: 'Ekonometri', category: 'Lisans (İİBF)', subText: 'Fakülte • 4 Yıllık' },
  { name: 'Çalışma Ekonomisi ve Endüstri İlişkileri (ÇEEİ)', category: 'Lisans (İİBF)', subText: 'Fakülte • 4 Yıllık' },
  { name: 'Yönetim Bilişim Sistemleri (YBS)', category: 'Lisans (İİBF / Bilişim)', subText: 'Fakülte • 4 Yıllık' },
  { name: 'Uluslararası Ticaret ve Finansman', category: 'Lisans (İİBF)', subText: 'Fakülte • 4 Yıllık' },
  { name: 'Bankacılık ve Finans', category: 'Lisans (İİBF)', subText: 'Fakülte • 4 Yıllık' },
  { name: 'Lojistik Yönetimi', category: 'Lisans (İİBF)', subText: 'Fakülte • 4 Yıllık' },
  { name: 'Sağlık Yönetimi', category: 'Lisans (Sağlık Bilimleri)', subText: 'Fakülte • 4 Yıllık' },
  { name: 'Sosyal Hizmet', category: 'Lisans (Sağlık / Sosyal)', subText: 'Fakülte • 4 Yıllık' },

  // --- LİSANS SAĞLIK VE TIP BİLİMLERİ ---
  { name: 'Hemşirelik', category: 'Lisans (Sağlık)', subText: 'Fakülte • 4 Yıllık' },
  { name: 'Ebelik', category: 'Lisans (Sağlık)', subText: 'Fakülte • 4 Yıllık' },
  { name: 'Fizyoterapi ve Rehabilitasyon', category: 'Lisans (Sağlık)', subText: 'Fakülte • 4 Yıllık' },
  { name: 'Beslenme ve Diyetetik', category: 'Lisans (Sağlık)', subText: 'Fakülte • 4 Yıllık' },
  { name: 'Tıp', category: 'Lisans (Tıp)', subText: 'Fakülte • 6 Yıllık' },
  { name: 'Diş Hekimliği', category: 'Lisans (Diş)', subText: 'Fakülte • 5 Yıllık' },
  { name: 'Eczacılık', category: 'Lisans (Eczacılık)', subText: 'Fakülte • 5 Yıllık' },
  { name: 'Veteriner Hekimliği', category: 'Lisans (Veteriner)', subText: 'Fakülte • 5 Yıllık' },
  { name: 'Odyoloji', category: 'Lisans (Sağlık)', subText: 'Fakülte • 4 Yıllık' },
  { name: 'Dil ve Konuşma Terapisi', category: 'Lisans (Sağlık)', subText: 'Fakülte • 4 Yıllık' },
  { name: 'Ergoterapi', category: 'Lisans (Sağlık)', subText: 'Fakülte • 4 Yıllık' },

  // --- HUKUK, EĞİTİM & ÖĞRETMENLİK ---
  { name: 'Hukuk', category: 'Lisans (Hukuk)', subText: 'Fakülte • 4 Yıllık' },
  { name: 'Rehberlik ve Psikolojik Danışmanlık (PDR)', category: 'Lisans (Eğitim)', subText: 'Fakülte • 4 Yıllık' },
  { name: 'Sınıf Öğretmenliği', category: 'Lisans (Eğitim)', subText: 'Fakülte • 4 Yıllık' },
  { name: 'Okul Öncesi Öğretmenliği', category: 'Lisans (Eğitim)', subText: 'Fakülte • 4 Yıllık' },
  { name: 'Özel Eğitim Öğretmenliği', category: 'Lisans (Eğitim)', subText: 'Fakülte • 4 Yıllık' },
  { name: 'İngilizce Öğretmenliği', category: 'Lisans (Eğitim)', subText: 'Fakülte • 4 Yıllık' },
  { name: 'İlköğretim Matematik Öğretmenliği', category: 'Lisans (Eğitim)', subText: 'Fakülte • 4 Yıllık' },
  { name: 'Türkçe Öğretmenliği', category: 'Lisans (Eğitim)', subText: 'Fakülte • 4 Yıllık' },
  { name: 'Fen Bilgisi Öğretmenliği', category: 'Lisans (Eğitim)', subText: 'Fakülte • 4 Yıllık' },
  { name: 'Beden Eğitimi ve Spor Öğretmenliği', category: 'Lisans (Spor/Eğitim)', subText: 'Fakülte • 4 Yıllık' },

  // --- FEN-EDEBİYAT, İLETİŞİM & DİĞER ---
  { name: 'Psikoloji', category: 'Lisans (Fen-Edebiyat)', subText: 'Fakülte • 4 Yıllık' },
  { name: 'Sosyoloji', category: 'Lisans (Fen-Edebiyat)', subText: 'Fakülte • 4 Yıllık' },
  { name: 'Türk Dili ve Edebiyatı', category: 'Lisans (Fen-Edebiyat)', subText: 'Fakülte • 4 Yıllık' },
  { name: 'Tarih', category: 'Lisans (Fen-Edebiyat)', subText: 'Fakülte • 4 Yıllık' },
  { name: 'Matematik', category: 'Lisans (Fen Fakültesi)', subText: 'Fakülte • 4 Yıllık' },
  { name: 'İstatistik', category: 'Lisans (Fen Fakültesi)', subText: 'Fakülte • 4 Yıllık' },
  { name: 'Fizik', category: 'Lisans (Fen Fakültesi)', subText: 'Fakülte • 4 Yıllık' },
  { name: 'Kimya', category: 'Lisans (Fen Fakültesi)', subText: 'Fakülte • 4 Yıllık' },
  { name: 'Biyoloji / Moleküler Biyoloji ve Genetik', category: 'Lisans (Fen Fakültesi)', subText: 'Fakülte • 4 Yıllık' },
  { name: 'Halkla İlişkiler ve Reklamcılık', category: 'Lisans (İletişim)', subText: 'Fakülte • 4 Yıllık' },
  { name: 'Gazetecilik', category: 'Lisans (İletişim)', subText: 'Fakülte • 4 Yıllık' },
  { name: 'Radyo, Televizyon ve Sinema', category: 'Lisans (İletişim)', subText: 'Fakülte • 4 Yıllık' },
  { name: 'İlahiyat / İslami İlimler', category: 'Lisans (İlahiyat)', subText: 'Fakülte • 4-5 Yıllık' },
  { name: 'Gastronomi ve Mutfak Sanatları', category: 'Lisans (Gastronomi)', subText: 'Fakülte • 4 Yıllık' },
  { name: 'Beden Eğitimi / Antrenörlük Eğitimi', category: 'Lisans (BESYO)', subText: 'Fakülte • 4 Yıllık' },

  // --- LİSE / ORTAÖĞRETİM ALANLARI ---
  { name: 'Lise / Alan Ayrımı Olmaksızın (Tüm Liseler)', category: 'Ortaöğretim', subText: 'Genel Lise Mezunu' },
  { name: 'Anadolu Lisesi / Genel Lise (Fen / TM / Sosyal)', category: 'Ortaöğretim', subText: 'Düz & Anadolu Lisesi' },
  { name: 'Meslek Lisesi - Makine Teknolojisi (CNC / Torna)', category: 'Meslek Lisesi', subText: 'Teknik Lise' },
  { name: 'Meslek Lisesi - Metal Teknolojisi (Kaynak / Lazer / Sac)', category: 'Meslek Lisesi', subText: 'Teknik Lise' },
  { name: 'Meslek Lisesi - Elektrik-Elektronik Teknolojisi', category: 'Meslek Lisesi', subText: 'Teknik Lise' },
  { name: 'Meslek Lisesi - Bilişim Teknolojileri', category: 'Meslek Lisesi', subText: 'Teknik Lise' },
  { name: 'Meslek Lisesi - İnşaat Teknolojisi', category: 'Meslek Lisesi', subText: 'Teknik Lise' },
  { name: 'Meslek Lisesi - Muhasebe ve Finansman', category: 'Meslek Lisesi', subText: 'Ticaret Meslek' },
  { name: 'Meslek Lisesi - Büro Yönetimi', category: 'Meslek Lisesi', subText: 'Ticaret Meslek' },
  { name: 'Meslek Lisesi - Sağlık Hizmetleri (Hemşire / Ebe / Teknisyen Yardımcılığı)', category: 'Meslek Lisesi', subText: 'Sağlık Meslek Lisesi' },
  { name: 'Meslek Lisesi - Motorlu Araçlar Teknolojisi', category: 'Meslek Lisesi', subText: 'Teknik Lise' },
  { name: 'İmam Hatip Lisesi', category: 'Ortaöğretim', subText: 'İHL Mezunu' }
];
