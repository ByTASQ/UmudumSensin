import { JobPosting, JobSource, UserCriteria } from '../types/job';
import { INITIAL_JOB_POSTINGS } from '../data/sampleJobs';

export const DEFAULT_SOURCES: JobSource[] = [
  // ==================== KAMU İLANI SİTELERİ ====================
  // 1. KARIYERKAPISI.GOV.TR (CBİKO Kamu İşe Alım Portalı)
  {
    id: 'kariyer_kapisi',
    name: 'Kariyer Kapısı (CBİKO)',
    shortName: 'Kariyer Kapısı',
    domain: 'isealimkariyerkapisi.cbiko.gov.tr',
    isOfficialGov: true,
    sector: 'kamu',
    category: 'kamu',
    method: 'JSON',
    url: 'https://isealimkariyerkapisi.cbiko.gov.tr',
    enabled: true,
    status: 'online',
    lastChecked: 'Yeni kontrol edildi',
    pingMs: 95,
    badgeColor: 'bg-emerald-600',
    description: 'Cumhurbaşkanlığı İnsan Kaynakları Ofisi Resmi Kamu İşe Alım Portalı. Bakanlıklar, üniversiteler ve tüm kamu kurumları.'
  },
  // 2. İLAN.GOV.TR
  {
    id: 'ilan_gov_tr',
    name: 'İlan.gov.tr (Basın İlan Kurumu)',
    shortName: 'İlan.gov.tr',
    domain: 'ilan.gov.tr',
    isOfficialGov: true,
    sector: 'kamu',
    category: 'resmi_gazete',
    method: 'RSS',
    url: 'https://www.ilan.gov.tr/ilan/kategori/44/kamu-personel-alim-ve-sinavlari',
    enabled: true,
    status: 'online',
    lastChecked: 'Yeni kontrol edildi',
    pingMs: 110,
    badgeColor: 'bg-slate-700',
    description: 'Basın İlan Kurumu Resmi Portalı. Kamu akademik personel, kamu işçi alımları ve belediye resmi ilanları.'
  },
  // 3. KAMUİLANSBB.GOV.TR (T.C. Cumhurbaşkanlığı Strateji ve Bütçe Başkanlığı)
  {
    id: 'kamuilan_sbb',
    name: 'Kamu İlan SBB (Strateji ve Bütçe Bşk.)',
    shortName: 'Kamu İlan SBB',
    domain: 'kamuilan.sbb.gov.tr',
    isOfficialGov: true,
    sector: 'kamu',
    category: 'kamu',
    method: 'API',
    url: 'https://kamuilan.sbb.gov.tr',
    enabled: true,
    status: 'online',
    lastChecked: 'Yeni kontrol edildi',
    pingMs: 125,
    badgeColor: 'bg-red-700',
    description: 'T.C. Cumhurbaşkanlığı Strateji ve Bütçe Başkanlığı Kamu Personeli Alım İlanları Portalı. 657 Memur, 4/B Sözleşmeli ve İşçi ilanları.'
  },
  // 4. İSKUR.GOV.TR (Kamu İlanları)
  {
    id: 'iskur',
    name: 'İŞKUR Kamu İlanları (iskur.gov.tr)',
    shortName: 'İŞKUR Kamu',
    domain: 'iskur.gov.tr',
    isOfficialGov: true,
    sector: 'kamu',
    category: 'kamu',
    method: 'API',
    url: 'https://esube.iskur.gov.tr',
    enabled: true,
    status: 'online',
    lastChecked: 'Yeni kontrol edildi',
    pingMs: 130,
    badgeColor: 'bg-blue-600',
    description: 'Türkiye İş Kurumu Kamu İlanları servisi. TYP (Toplum Yararına Programlar), kamu sürekli ve geçici işçi talepleri.'
  },
  // 5. RESMİGAZETE.GOV.TR
  {
    id: 'resmigazete',
    name: 'T.C. Resmî Gazete İlanları',
    shortName: 'Resmî Gazete',
    domain: 'resmigazete.gov.tr',
    isOfficialGov: true,
    sector: 'kamu',
    category: 'resmi_gazete',
    method: 'HTML',
    url: 'https://www.resmigazete.gov.tr',
    enabled: true,
    status: 'online',
    lastChecked: 'Yeni kontrol edildi',
    pingMs: 140,
    badgeColor: 'bg-amber-700',
    description: 'T.C. Resmî Gazete Çeşitli İlanlar Bölümü. Tüm bakanlık ve kamu kurumlarının resmi personel alım tebliğleri.'
  },
  // 6. İŞKUR Kurum Dışı Kamu İşçi Alımı (Belediyeler & İştirakler)
  {
    id: 'yerelyonetimler_csb',
    name: 'İŞKUR Kurum Dışı Kamu (Belediyeler & İştirakler)',
    shortName: 'Belediye İlanları (İŞKUR)',
    domain: 'iskur.gov.tr',
    isOfficialGov: true,
    sector: 'kamu',
    category: 'belediye',
    method: 'PDF',
    url: 'https://www.iskur.gov.tr/ilanlar/kurumdisi-kamu-isci-alim-ilanlari/',
    enabled: true,
    status: 'online',
    lastChecked: 'Yeni kontrol edildi',
    pingMs: 120,
    badgeColor: 'bg-cyan-700',
    description: 'Türkiye İş Kurumu (İŞKUR) Kurum Dışı Kamu İşçi Alımı Portalı. 81 ildeki belediyeler ve belediye iştiraklerinin (Personel A.Ş.) resmi ilanları.'
  },
  // Kamu İştirak ve KİT'ler
  {
    id: 'teias',
    name: 'TEİAŞ - Türkiye Elektrik İletim A.Ş.',
    shortName: 'TEİAŞ',
    domain: 'teias.gov.tr',
    isOfficialGov: true,
    sector: 'kamu',
    category: 'kamu',
    method: 'HTML',
    url: 'https://www.teias.gov.tr/duyurular',
    enabled: true,
    status: 'online',
    lastChecked: 'Yeni kontrol edildi',
    pingMs: 175,
    badgeColor: 'bg-amber-600',
    description: 'TEİAŞ Genel Müdürlüğü ve 22 Bölge İletim Grup Müdürlüklerinin teknik personel ve işçi alım duyuruları.'
  },
  {
    id: 'tigem',
    name: 'TİGEM - Tarım İşletmeleri Gn. Md.',
    shortName: 'TİGEM',
    domain: 'tigem.gov.tr',
    isOfficialGov: true,
    sector: 'kamu',
    category: 'kamu',
    method: 'HTML',
    url: 'https://www.tigem.gov.tr/duyurular',
    enabled: true,
    status: 'online',
    lastChecked: 'Yeni kontrol edildi',
    pingMs: 190,
    badgeColor: 'bg-green-700',
    description: 'Tarımsal üretim tesisleri, ziraat, mekanizasyon ve idari personel alım ilanları.'
  },
  {
    id: 'msb',
    name: 'MSB - Milli Savunma Bakanlığı',
    shortName: 'MSB',
    domain: 'msb.gov.tr',
    isOfficialGov: true,
    sector: 'kamu',
    category: 'kamu',
    method: 'Resmi ilan sayfası',
    url: 'https://personeltemin.msb.gov.tr',
    enabled: true,
    status: 'online',
    lastChecked: 'Yeni kontrol edildi',
    pingMs: 160,
    badgeColor: 'bg-red-800',
    description: 'Milli Savunma Bakanlığı Personel Temin Dairesi Başkanlığı sözleşmeli er, astsubay ve sivil memur ilanları.'
  },
  {
    id: 'belediyeler',
    name: 'Mahalli İdareler & Belediyeler (İŞKUR & Kamu İlan)',
    shortName: 'Belediyeler',
    domain: 'iskur.gov.tr',
    isOfficialGov: true,
    sector: 'kamu',
    category: 'belediye',
    method: 'PDF',
    url: 'https://www.iskur.gov.tr/ilanlar/kurumdisi-kamu-isci-alim-ilanlari/',
    enabled: true,
    status: 'online',
    lastChecked: 'Yeni kontrol edildi',
    pingMs: 135,
    badgeColor: 'bg-teal-700',
    description: 'Büyükşehir, il ve ilçe belediyeleri ile belediye iştiraklerinin İŞKUR Kurum Dışı Kamu İşçi Alımı ve Kamu İlan SBB resmi personel ilanları.'
  },
  // 11. ÖSYM AİS (Merkezi Memur Atamaları)
  {
    id: 'osym',
    name: 'ÖSYM (Merkezi Memur Atama & Tercih)',
    shortName: 'ÖSYM Tercih',
    domain: 'ais.osym.gov.tr',
    isOfficialGov: true,
    sector: 'kamu',
    category: 'kamu',
    method: 'Resmi ilan sayfası',
    url: 'https://ais.osym.gov.tr',
    enabled: true,
    status: 'online',
    lastChecked: 'Yeni kontrol edildi',
    pingMs: 90,
    badgeColor: 'bg-indigo-800',
    description: 'T.C. Ölçme, Seçme ve Yerleştirme Merkezi. KPSS/1 ve KPSS/2 merkezi memur tercih kılavuzları ve kamu atamaları.'
  },
  // 12. Sağlık Bakanlığı YHGM
  {
    id: 'saglik_yhgm',
    name: 'Sağlık Bakanlığı (YHGM Personel Alımı)',
    shortName: 'Sağlık Bakanlığı',
    domain: 'yhgm.saglik.gov.tr',
    isOfficialGov: true,
    sector: 'kamu',
    category: 'kamu',
    method: 'Resmi ilan sayfası',
    url: 'https://yhgm.saglik.gov.tr',
    enabled: true,
    status: 'online',
    lastChecked: 'Yeni kontrol edildi',
    pingMs: 110,
    badgeColor: 'bg-rose-700',
    description: 'T.C. Sağlık Bakanlığı Yönetim Hizmetleri Genel Müdürlüğü. Sözleşmeli sağlık personeli ve İŞKUR sürekli işçi kura duyuruları.'
  },
  // 13. Adalet Bakanlığı PGM
  {
    id: 'adalet_pgm',
    name: 'Adalet Bakanlığı (Zabıt Katibi & İKM)',
    shortName: 'Adalet Bakanlığı',
    domain: 'pgm.adalet.gov.tr',
    isOfficialGov: true,
    sector: 'kamu',
    category: 'kamu',
    method: 'Resmi ilan sayfası',
    url: 'https://pgm.adalet.gov.tr',
    enabled: true,
    status: 'online',
    lastChecked: 'Yeni kontrol edildi',
    pingMs: 120,
    badgeColor: 'bg-red-900',
    description: 'Adalet Bakanlığı Personel Genel Müdürlüğü. Adliye zabıt katibi, infaz koruma memuru (gardiyan), mübaşir ve şoför alımları.'
  },
  // 14. YÖK Akademik Kadro
  {
    id: 'yok_akademik',
    name: 'YÖK (Üniversite Akademik Kadro İlanları)',
    shortName: 'YÖK Akademik',
    domain: 'ilan.yok.gov.tr',
    isOfficialGov: true,
    sector: 'kamu',
    category: 'kamu',
    method: 'Resmi ilan sayfası',
    url: 'https://ilan.yok.gov.tr',
    enabled: true,
    status: 'online',
    lastChecked: 'Yeni kontrol edildi',
    pingMs: 135,
    badgeColor: 'bg-amber-800',
    description: 'Yükseköğretim Kurulu Resmi İlan Portalı. Devlet ve vakıf üniversitelerinin öğretim görevlisi ve araştırma görevlisi kadroları.'
  },

  // ==================== ÖZEL SEKTÖR SİTELERİ ====================
  // 1. Memurlar.net (İlan Haberleri Portalı)
  {
    id: 'memurlar_net',
    name: 'Memurlar.net (İlan Haberleri)',
    shortName: 'Memurlar.net',
    domain: 'memurlar.net',
    isOfficialGov: false,
    sector: 'haber',
    category: 'haber',
    method: 'HTML',
    url: 'https://ilan.memurlar.net/',
    enabled: true,
    status: 'online',
    lastChecked: 'Yeni kontrol edildi',
    pingMs: 105,
    badgeColor: 'bg-amber-600',
    description: 'Resmi kamu kurumu veya işvereni olmayıp kamu personel alım duyurularını haberleştiren özel ilan haber portalı.'
  },
  // 2. Kariyer.net
  {
    id: 'kariyernet',
    name: 'Kariyer.net (Özel Sektör İstihdamı)',
    shortName: 'Kariyer.net',
    domain: 'kariyer.net',
    isOfficialGov: false,
    sector: 'ozel',
    category: 'ozel',
    method: 'API',
    url: 'https://www.kariyer.net',
    enabled: true,
    status: 'online',
    lastChecked: 'Yeni kontrol edildi',
    pingMs: 115,
    badgeColor: 'bg-purple-700',
    description: 'Türkiye genelinde kurumsal ve özel sektör firmalarının teknik, idari ve saha personeli ilanları.'
  },
  // 2. Jooble Türkiye
  {
    id: 'jooble',
    name: 'Jooble Türkiye (Açık İş Fırsatları)',
    shortName: 'Jooble',
    domain: 'tr.jooble.org',
    isOfficialGov: false,
    sector: 'ozel',
    category: 'ozel',
    method: 'HTML',
    url: 'https://tr.jooble.org',
    enabled: true,
    status: 'online',
    lastChecked: 'Yeni kontrol edildi',
    pingMs: 110,
    badgeColor: 'bg-emerald-600',
    description: 'Şirketler ve işverenlerin güncel istihdam duyurularını ve açık pozisyonlarını sunan portal.'
  },
  // 3. İŞKUR Özel Sektör Açık İşler
  {
    id: 'iskur_ozel',
    name: 'İŞKUR Özel Sektör İlanları',
    shortName: 'İŞKUR Özel',
    domain: 'iskur.gov.tr',
    isOfficialGov: false,
    sector: 'ozel',
    category: 'ozel',
    method: 'API',
    url: 'https://esube.iskur.gov.tr',
    enabled: true,
    status: 'online',
    lastChecked: 'Yeni kontrol edildi',
    pingMs: 128,
    badgeColor: 'bg-blue-700',
    description: 'İŞKUR portalına kayıtlı özel sektör sanayi kuruluşları, fabrikalar ve özel şirketlerin açık iş ilanları.'
  },
  // 3. Eleman.net
  {
    id: 'elemannet',
    name: 'Eleman.net (Mavi & Gri Yaka Özel)',
    shortName: 'Eleman.net',
    domain: 'eleman.net',
    isOfficialGov: false,
    sector: 'ozel',
    category: 'ozel',
    method: 'HTML',
    url: 'https://www.eleman.net',
    enabled: true,
    status: 'online',
    lastChecked: 'Yeni kontrol edildi',
    pingMs: 135,
    badgeColor: 'bg-indigo-700',
    description: 'Tekniker, teknisyen, üretim ve hizmet sektöründe binlerce özel sektör iş ilanı.'
  },
  // 4. Indeed Türkiye
  {
    id: 'indeed_tr',
    name: 'Indeed Türkiye (Özel Sektör)',
    shortName: 'Indeed',
    domain: 'tr.indeed.com',
    isOfficialGov: false,
    sector: 'ozel',
    category: 'ozel',
    method: 'API',
    url: 'https://tr.indeed.com',
    enabled: true,
    status: 'online',
    lastChecked: 'Yeni kontrol edildi',
    pingMs: 142,
    badgeColor: 'bg-sky-700',
    description: 'Uluslararası ve yerli özel sektör işverenlerinin Türkiye geneli iş fırsatları.'
  },
  // 5. Yenibiriş
  {
    id: 'yenibiris',
    name: 'Yenibiriş (Özel Sektör Kariyer)',
    shortName: 'Yenibiriş',
    domain: 'yenibiris.com',
    isOfficialGov: false,
    sector: 'ozel',
    category: 'ozel',
    method: 'HTML',
    url: 'https://www.yenibiris.com',
    enabled: true,
    status: 'online',
    lastChecked: 'Yeni kontrol edildi',
    pingMs: 150,
    badgeColor: 'bg-orange-700',
    description: 'Özel şirketlerin uzman, teknik eleman ve yönetici pozisyonu ilanları.'
  },
  // 6. İşin Olsun (Kariyer.net Mavi & Hizmet Yaka)
  {
    id: 'isinolsun',
    name: 'İşin Olsun (Yerel & Hizmet Sektörü)',
    shortName: 'İşin Olsun',
    domain: 'isinolsun.com',
    isOfficialGov: false,
    sector: 'ozel',
    category: 'ozel',
    method: 'HTML',
    url: 'https://isinolsun.com',
    enabled: true,
    status: 'online',
    lastChecked: 'Yeni kontrol edildi',
    pingMs: 105,
    badgeColor: 'bg-emerald-700',
    description: 'Ön muhasebe, güvenlik, servis, kurye, mağaza ve yerel işletmelerin hızlı istihdam platformu.'
  },
  // 7. Secretcv.com
  {
    id: 'secretcv',
    name: 'Secretcv (Kurumsal Özel Sektör)',
    shortName: 'Secretcv',
    domain: 'secretcv.com',
    isOfficialGov: false,
    sector: 'ozel',
    category: 'ozel',
    method: 'HTML',
    url: 'https://www.secretcv.com',
    enabled: true,
    status: 'online',
    lastChecked: 'Yeni kontrol edildi',
    pingMs: 125,
    badgeColor: 'bg-blue-900',
    description: 'Büyük ölçekli kurumsal şirketler, sanayi kuruluşları, perakende ve finans sektörü iş ilanları.'
  },
  // 8. LinkedIn Türkiye
  {
    id: 'linkedin',
    name: 'LinkedIn Türkiye (Profesyonel Ağ & İşler)',
    shortName: 'LinkedIn',
    domain: 'tr.linkedin.com',
    isOfficialGov: false,
    sector: 'ozel',
    category: 'ozel',
    method: 'API',
    url: 'https://www.linkedin.com/jobs',
    enabled: true,
    status: 'online',
    lastChecked: 'Yeni kontrol edildi',
    pingMs: 130,
    badgeColor: 'bg-blue-600',
    description: 'Mühendislik, bilgi teknolojileri, finans, yönetim ve kurumsal kariyer fırsatları.'
  },
  // 9. Elemanonline (Eleman.net Portalı)
  {
    id: 'elemanonline',
    name: 'Eleman.net Sanayi & Teknik Eleman',
    shortName: 'Eleman.net Teknik',
    domain: 'eleman.net',
    isOfficialGov: false,
    sector: 'ozel',
    category: 'ozel',
    method: 'HTML',
    url: 'https://www.eleman.net',
    enabled: true,
    status: 'online',
    lastChecked: 'Yeni kontrol edildi',
    pingMs: 140,
    badgeColor: 'bg-violet-700',
    description: 'Elektrik, elektronik, makine, üretim, fabrika ve teknik ara kademe personel ilanları.'
  }
];

const STORAGE_SOURCES_KEY = 'is_ilani_sources_v10';
const STORAGE_CUSTOM_JOBS_KEY = 'is_ilani_custom_jobs_v10';

export function loadSources(): JobSource[] {
  try {
    const raw = localStorage.getItem(STORAGE_SOURCES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as JobSource[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        const defaultMap = new Map(DEFAULT_SOURCES.map(d => [d.id, d]));
        
        // Merge verified official properties from DEFAULT_SOURCES while preserving user toggle state
        const merged: JobSource[] = DEFAULT_SOURCES.map(def => {
          const userSaved = parsed.find(p => p.id === def.id);
          if (userSaved) {
            return {
              ...def,
              enabled: userSaved.enabled !== undefined ? userSaved.enabled : def.enabled,
              lastChecked: userSaved.lastChecked || def.lastChecked,
              status: userSaved.status || def.status,
              pingMs: userSaved.pingMs || def.pingMs
            };
          }
          return def;
        });

        // Add any custom user-added sources
        const customSources = parsed.filter(p => p.isCustom);
        const allSources = [...merged, ...customSources];
        saveSources(allSources);
        return allSources;
      }
    }
  } catch (e) {
    console.error('Sources load error:', e);
  }
  return DEFAULT_SOURCES;
}

export function saveSources(sources: JobSource[]): void {
  try {
    localStorage.setItem(STORAGE_SOURCES_KEY, JSON.stringify(sources));
  } catch (e) {
    console.error('Sources save error:', e);
  }
}

export function loadAllJobPostings(): JobPosting[] {
  let customJobs: JobPosting[] = [];
  try {
    const raw = localStorage.getItem(STORAGE_CUSTOM_JOBS_KEY);
    if (raw) {
      customJobs = JSON.parse(raw);
    }
  } catch (e) {
    console.error('Custom jobs load error:', e);
  }
  const all = [...INITIAL_JOB_POSTINGS, ...customJobs];
  return all.filter(j => j.id !== 'job-memurlar-portal-001').map(job => {
    if (job.sourceId === 'memurlar' || job.sourceId === 'memurlar_net' || job.sourceDomain?.includes('memurlar.net') || job.originalUrl?.includes('memurlar.net')) {
      job.isPublicSector = false;
      job.sourceName = 'Memurlar.net (İlan Haberi)';
    }
    return job;
  });
}

export function saveCustomJobPosting(job: JobPosting): void {
  try {
    const raw = localStorage.getItem(STORAGE_CUSTOM_JOBS_KEY);
    const existing: JobPosting[] = raw ? JSON.parse(raw) : [];
    existing.unshift(job);
    localStorage.setItem(STORAGE_CUSTOM_JOBS_KEY, JSON.stringify(existing));
  } catch (e) {
    console.error('Save custom job error:', e);
  }
}
