export interface CityInfo {
  name: string;
  districts: string[];
}

export const TURKEY_CITIES: CityInfo[] = [
  {
    name: 'Aydın',
    districts: ['Efeler', 'Bozdoğan', 'Buharkent', 'Çine', 'Didim', 'Germencik', 'İncirliova', 'Karacasu', 'Karpuzlu', 'Koçarlı', 'Köşk', 'Kuşadası', 'Kuyucak', 'Nazilli', 'Söke', 'Sultanhisar', 'Yenipazar']
  },
  {
    name: 'Denizli',
    districts: ['Pamukkale', 'Merkezefendi', 'Acıpayam', 'Babadağ', 'Baklan', 'Bekilli', 'Beyağaç', 'Bozkurt', 'Buldan', 'Çal', 'Çameli', 'Çardak', 'Çivril', 'Güney', 'Honaz', 'Kale', 'Sarayköy', 'Serinhisar', 'Tavas']
  },
  {
    name: 'İzmir',
    districts: ['Konak', 'Bornova', 'Karşıyaka', 'Buca', 'Çiğli', 'Gaziemir', 'Bayraklı', 'Karabağlar', 'Balçova', 'Narlıdere', 'Aliağa', 'Menemen', 'Torbalı', 'Kemalpaşa', 'Menderes', 'Tire', 'Ödemiş', 'Bergama', 'Urla', 'Çeşme']
  },
  {
    name: 'Muğla',
    districts: ['Menteşe', 'Bodrum', 'Fethiye', 'Marmaris', 'Milas', 'Ortaca', 'Dalaman', 'Datça', 'Köyceğiz', 'Ula', 'Yatağan', 'Seydikemer', 'Kavaklıdere']
  },
  {
    name: 'Manisa',
    districts: ['Şehzadeler', 'Yunusemre', 'Akhisar', 'Turgutlu', 'Salihli', 'Soma', 'Alaşehir', 'Saruhanlı', 'Demirci', 'Kula', 'Kırkağaç']
  },
  {
    name: 'Ankara',
    districts: ['Çankaya', 'Keçiören', 'Yenimahalle', 'Mamak', 'Etimesgut', 'Sincan', 'Altındağ', 'Pursaklar', 'Gölbaşı', 'Polatlı', 'Kahramankazan', 'Beypazarı']
  },
  {
    name: 'İstanbul',
    districts: ['Kadıköy', 'Beşiktaş', 'Şişli', 'Üsküdar', 'Bakırköy', 'Maltepe', 'Ataşehir', 'Kartal', 'Pendik', 'Ümraniye', 'Fatih', 'Beyoğlu', 'Sarıyer', 'Başakşehir', 'Esenyurt', 'Beylikdüzü']
  },
  {
    name: 'Bursa',
    districts: ['Osmangazi', 'Nilüfer', 'Yıldırım', 'İnegöl', 'Gemlik', 'Mustafakemalpaşa', 'Mudanya', 'Gürsu', 'Kestel', 'Karacabey', 'Orhangazi']
  },
  {
    name: 'Antalya',
    districts: ['Muratpaşa', 'Kepez', 'Konyaaltı', 'Alanya', 'Manavgat', 'Serik', 'Kumluca', 'Kaş', 'Korkuteli', 'Gazipaşa', 'Finike', 'Kemer']
  },
  {
    name: 'Adana',
    districts: ['Seyhan', 'Yüreğir', 'Çukurova', 'Sarıçam', 'Ceyhan', 'Kozan', 'İmamoğlu', 'Karataş', 'Pozantı', 'Karaisalı']
  },
  {
    name: 'Konya',
    districts: ['Selçuklu', 'Meram', 'Karatay', 'Ereğli', 'Akşehir', 'Beyşehir', 'Cihanbeyli', 'Kulu', 'Seydişehir', 'Çumra']
  },
  {
    name: 'Gaziantep',
    districts: ['Şahinbey', 'Şehitkamil', 'Nizip', 'İslahiye', 'Nurdağı', 'Araban', 'Oğuzeli', 'Yavuzeli', 'Karkamış']
  },
  {
    name: 'Kayseri',
    districts: ['Melikgazi', 'Kocasinan', 'Talas', 'Develi', 'Yahyalı', 'Bünyan', 'İncesu', 'Pınarbaşı']
  },
  {
    name: 'Eskişehir',
    districts: ['Odunpazarı', 'Tepebaşı', 'Sivrihisar', 'Çifteler', 'Seyitgazi', 'Alpu', 'Mihalgazi', 'Mahmudiye']
  },
  {
    name: 'Trabzon',
    districts: ['Ortahisar', 'Akçaabat', 'Araklı', 'Of', 'Yomra', 'Arsin', 'Vakfıkebir', 'Sürmene', 'Beşikdüzü']
  },
  {
    name: 'Samsun',
    districts: ['İlkadım', 'Atakum', 'Canik', 'Bafra', 'Çarşamba', 'Terme', 'Tekkeköy', 'Vezirköprü', 'Havza']
  },
  {
    name: 'Diyarbakır',
    districts: ['Bağlar', 'Kayapınar', 'Yenişehir', 'Sur', 'Bismil', 'Ergani', 'Silvan', 'Çınar', 'Dicle']
  },
  {
    name: 'Şanlıurfa',
    districts: ['Eyyübiye', 'Haliliye', 'Karaköprü', 'Siverek', 'Viranşehir', 'Suruç', 'Birecik', 'Akçakale']
  },
  {
    name: 'Kocaeli',
    districts: ['İzmit', 'Gebze', 'Darıca', 'Körfez', 'Gölcük', 'Derince', 'Çayırova', 'Kartepe', 'Başiskele', 'Karamürsel']
  },
  {
    name: 'Balıkesir',
    districts: ['Karesi', 'Altıeylül', 'Bandırma', 'Edremit', 'Gönen', 'Ayvalık', 'Burhaniye', 'Bigadiç', 'Susurluk', 'Dursunbey']
  },
  {
    name: 'Çanakkale',
    districts: ['Merkez', 'Biga', 'Çan', 'Gelibolu', 'Yenice', 'Ayvacık', 'Ezine', 'Bayramiç', 'Lapseki', 'Eceabat']
  },
  {
    name: 'Sakarya',
    districts: ['Adapazarı', 'Serdivan', 'Akyazı', 'Erenler', 'Hendek', 'Karasu', 'Geyve', 'Arifiye', 'Sapanca', 'Pamukova']
  },
  {
    name: 'Afyonkarahisar',
    districts: ['Merkez', 'Sandıklı', 'Dinar', 'Bolvadin', 'Sinanpaşa', 'Emirdağ', 'Şuhut', 'Çay', 'İhsaniye']
  },
  {
    name: 'Uşak',
    districts: ['Merkez', 'Banaz', 'Eşme', 'Sivaslı', 'Ulubey', 'Karahallı']
  },
  {
    name: 'Mersin',
    districts: ['Akdeniz', 'Mezitli', 'Toroslar', 'Yenişehir', 'Tarsus', 'Erdemli', 'Silifke', 'Mut', 'Anamur']
  },
  {
    name: 'Hatay',
    districts: ['Antakya', 'İskenderun', 'Defne', 'Dörtyol', 'Samandağ', 'Kırıkhan', 'Reyhanlı', 'Arsuz', 'Payas']
  },
  {
    name: 'Tüm İller (Türkiye Geneli)',
    districts: ['Fark Etmez']
  }
];

export const POPULAR_PROFESSIONS = [
  'Elektronik Teknikeri',
  'Elektrik Teknikeri',
  'Bilgisayar Programcısı / Yazılımcı',
  'Büro Personeli / Memur',
  'Ziraat Mühendisi / Teknikeri',
  'Güvenlik Görevlisi',
  'Hemşire / Sağlık Teknikeri',
  'Mekatronik Teknikeri',
  'Makine Teknikeri',
  'İnşaat Teknikeri',
  'Temizlik Personeli',
  'Şoför',
  'Harita Teknikeri',
  'Laborant ve Veteriner Sağlık'
];

export const POPULAR_DEPARTMENTS = [
  'Elektronik Teknolojisi',
  'Elektrik-Elektronik',
  'Elektronik ve Haberleşme',
  'Mekatronik',
  'Bilgisayar Programcılığı',
  'Bilişim Sistemleri',
  'Büro Yönetimi ve Yönetici Asistanlığı',
  'İktisat / İşletme',
  'Ziraat / Tarla Bitkileri',
  'Özel Güvenlik ve Koruma',
  'Hemşirelik',
  'İlk ve Acil Yardım (Paramedik)',
  'Makine',
  'İnşaat Teknolojisi',
  'Lise / Alan Ayrımı Olmaksızın'
];
