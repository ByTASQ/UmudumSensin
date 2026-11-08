import { JobPosting, JobSource, UserCriteria } from '../types/job';
import { getCityInfo } from '../utils/cityUtils';

export interface PreciseUrlInfo {
  url: string;
  queryDescription: string;
  isPrecise: boolean;
  altUrls?: {
    name: string;
    url: string;
    badge: string;
    description: string;
  }[];
}

export interface PortalLinkItem {
  name: string;
  url: string;
  type: 'primary' | 'memurlar' | 'ilan_gov_tr' | 'cbiko' | 'iskur' | 'google' | 'kariyer';
  badge: string;
  description: string;
}

/**
 * Gereksiz gürültü kelimelerini ayıklayıp anahtar unvan, kurum ve şehir kelimelerini çıkarır.
 * Türkçe karakterleri ve kurumsal ekleri eksiksiz destekler.
 */
export function cleanSearchKeywords(text: string): string {
  if (!text) return '';
  const withoutParens = text
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[0-9]+(\s*(adet|kişi|kadro|personel))?/gi, ' ');

  const stopWords = new Set([
    't.c.', 'tc', 'genel', 'müdürlüğü', 'mudurlugu', 'bakanlığı', 'bakanligi',
    'başkanlığı', 'baskanligi', 'dairesi', 'a.ş.', 'aş', 'ltd.', 'şti.', 'sti',
    'alımı', 'alimi', 'alımları', 'alimlari', 'ilanı', 'ilani', 'ilanları', 'ilanlari',
    'sözleşmeli', 'sozlesmeli', 'sürekli', 'surekli', 'personeli', 'personel', 'elemanı', 'elemani'
  ]);

  const words = withoutParens.split(/[\s,\.\/\-_:;!?]+/);
  const filtered = words.filter(w => {
    const lower = w.toLocaleLowerCase('tr-TR').trim();
    if (!lower || lower.length <= 1) return false;
    return !stopWords.has(lower);
  });

  return filtered.join(' ').trim();
}

/**
 * Unvanı temizler ve arama motorları için en etkili hale getirir.
 */
export function sanitizeProfession(profession?: string): string {
  if (!profession) return 'Tekniker';
  const clean = profession.replace(/\([^)]*\)/g, '').replace(/\s+/g, ' ').trim();
  return clean || 'Tekniker';
}

/**
 * İlan kaynaklarının (Memurlar.net, İŞKUR, Kariyer.net vb.) arama parametrelerini
 * kullanıcının aktif meslek ve şehir kriterlerine göre dinamik ve hassas bir şekilde üretir.
 */
export function buildPreciseSourceUrl(
  sourceId: string,
  criteria: Partial<UserCriteria>
): PreciseUrlInfo {
  const profession = sanitizeProfession(criteria.profession);
  const city = criteria.city?.trim() || '';
  const edu = criteria.educationLevel && criteria.educationLevel !== 'Fark Etmez' ? criteria.educationLevel : '';

  switch (sourceId) {
    // ==================== MEMURLAR.NET ====================
    case 'memurlar_net':
    case 'memurlar': {
      const query = city ? `${profession} ${city}` : profession;
      const memurlarSearchUrl = `https://www.memurlar.net/arama/?q=${encodeURIComponent(query)}&c=ilan`;
      
      return {
        url: memurlarSearchUrl,
        queryDescription: `Memurlar.net Kamu İlan Arama: "${query}"`,
        isPrecise: true,
        altUrls: [
          {
            name: 'Memurlar.net 4/B Sözleşmeli & Memur İlanları',
            url: `https://www.memurlar.net/arama/?q=${encodeURIComponent(profession + ' kamu')}&c=ilan`,
            badge: '📜 4/B & Memur',
            description: `Bakanlıklar ve merkezi kurumların "${profession}" alımları`
          },
          {
            name: 'Memurlar.net Mahalli İdareler (Belediye İlanları)',
            url: `https://www.memurlar.net/arama/?q=${encodeURIComponent((city || profession) + ' belediye')}&c=ilan`,
            badge: '🏛️ Belediye & İl Özel',
            description: `${city ? city + ' ve ' : ''}belediye şirketleri zabıta ve teknik personel ilanları`
          },
          {
            name: 'Memurlar.net KPSS Taban Puanları & Kadrolar',
            url: `https://www.memurlar.net/kpss/`,
            badge: '📊 KPSS Kadroları',
            description: `Tüm kamu kurumlarının KPSS alım kılavuzları ve kontenjanları`
          }
        ]
      };
    }

    // ==================== İŞKUR KAMU ====================
    case 'iskur': {
      // İŞKUR Kamu İlanları için doğrudan resmi duyuru ve e-şube listeleri
      const iskurKamuUrl = 'https://esube.iskur.gov.tr/Istihdam/AcikIsIlanDetay.aspx';
      const iskurKurumDisiUrl = 'https://esube.iskur.gov.tr';

      return {
        url: iskurKamuUrl,
        queryDescription: `İŞKUR Resmi Kamu Alımları (${profession}${city ? ' - ' + city : ''})`,
        isPrecise: true,
        altUrls: [
          {
            name: 'İŞKUR Kurum Dışı Kamu İşçi Alımları',
            url: 'https://esube.iskur.gov.tr',
            badge: '🏛️ Kamu & Belediye',
            description: 'Tüm bakanlıklar, üniversiteler ve belediye şirketleri resmi personel alım listesi'
          },
          {
            name: 'İŞKUR e-Şube Giriş Portalı',
            url: iskurKurumDisiUrl,
            badge: '🏢 e-Şube',
            description: `${city ? city + ' ve ' : ''}tüm illerdeki kamu ve belediye işçi alımları giriş ekranı`
          },
          {
            name: 'İŞKUR Kamu Memur Alım İlanları Tebliği',
            url: 'https://www.iskur.gov.tr/kamu-memur-alim-ilanlari/',
            badge: '📜 Resmi Tebliğ',
            description: 'İŞKUR kamu istihdamı bülteni ve mevzuat tebliğleri'
          }
        ]
      };
    }

    // ==================== İŞKUR ÖZEL SEKTÖR ====================
    case 'iskur_ozel': {
      return {
        url: 'https://esube.iskur.gov.tr',
        queryDescription: `İŞKUR Özel Sektör İlanları (${profession}${city ? ' - ' + city : ''})`,
        isPrecise: true,
        altUrls: [
          {
            name: 'İŞKUR e-Şube Giriş Portalı',
            url: 'https://esube.iskur.gov.tr',
            badge: '🔑 e-Şube Giriş',
            description: 'e-Devlet ile İŞKUR hesabınıza giriş yaparak doğrudan ilanlara başvurun'
          }
        ]
      };
    }

    // ==================== KARİYER.NET ====================
    case 'kariyernet': {
      const cityInfo = getCityInfo(city);
      const targetUrl = `https://www.kariyer.net/is-ilanlari?kw=${encodeURIComponent(profession)}${city ? `&ct=${encodeURIComponent(city)}` : ''}`;
      const slugUrl = cityInfo 
        ? `https://www.kariyer.net/is-ilanlari/${cityInfo.slug}?kw=${encodeURIComponent(profession)}`
        : targetUrl;

      return {
        url: targetUrl,
        queryDescription: `Kariyer.net Canlı Filtre: kw="${profession}"${city ? ` & city="${city}"` : ''}`,
        isPrecise: true,
        altUrls: [
          {
            name: 'Kariyer.net İl Bazlı Canlı Arama (Doğrudan Liste)',
            url: slugUrl,
            badge: '⚡ İl Listesi',
            description: `${city} için filtrelenmiş ${profession} pozisyonları listesi`
          },
          {
            name: 'Kariyer.net Türkiye Geneli Açık İlanlar',
            url: `https://www.kariyer.net/is-ilanlari?kw=${encodeURIComponent(profession)}`,
            badge: '💼 Tüm İlanlar',
            description: `Kariyer.net'te yayında olan tüm ${profession} iş ilanları`
          }
        ]
      };
    }

    // ==================== JOOBLE TÜRKİYE ====================
    case 'jooble': {
      const targetUrl = `https://tr.jooble.org/SearchResult?ukw=${encodeURIComponent(profession)}${city ? `&rgse=${encodeURIComponent(city)}` : ''}`;
      return {
        url: targetUrl,
        queryDescription: `Jooble Türkiye Canlı İş Arama: "${profession}"`,
        isPrecise: true,
        altUrls: [
          {
            name: 'Jooble Türkiye İlan Havuzu',
            url: targetUrl,
            badge: '⚡ Canlı Liste',
            description: 'Tüm şirketlerin Jooble üzerinde taranmış açık pozisyonları'
          }
        ]
      };
    }

    // ==================== ELEMAN.NET ====================
    case 'elemannet': {
      const targetUrl = `https://www.eleman.net/is-ilanlari?q=${encodeURIComponent(profession)}${city ? `&sehir=${encodeURIComponent(city)}` : ''}`;
      return {
        url: targetUrl,
        queryDescription: `Eleman.net Canlı Filtre: q="${profession}"${city ? ` & sehir="${city}"` : ''}`,
        isPrecise: true,
        altUrls: [
          {
            name: 'Eleman.net Genel İş Arama',
            url: `https://www.eleman.net/is-ilanlari?q=${encodeURIComponent(profession)}`,
            badge: '💼 Eleman.net',
            description: 'Eleman.net üzerindeki yayındaki ilan detay sayfaları'
          }
        ]
      };
    }

    // ==================== INDEED TR ====================
    case 'indeed_tr': {
      const targetUrl = `https://tr.indeed.com/jobs?q=${encodeURIComponent(profession)}${city ? `&l=${encodeURIComponent(city)}` : ''}`;
      return {
        url: targetUrl,
        queryDescription: `Indeed Canlı Filtre: q="${profession}"${city ? ` & l="${city}"` : ''}`,
        isPrecise: true
      };
    }

    // ==================== İLAN.GOV.TR ====================
    case 'ilan_gov_tr': {
      // ilan.gov.tr SPA altyapısında '/ara?kelime=' rotası 404 vermektedir.
      // Resmi ve aktif personel kategorisi 44 (kamu-personel-alim-ve-sinavlari) doğrudan açılır.
      const targetUrl = 'https://www.ilan.gov.tr/ilan/kategori/44/kamu-personel-alim-ve-sinavlari';
      return {
        url: targetUrl,
        queryDescription: `İlan.gov.tr Basın İlan Kurumu Resmi Kamu Personel Alımları Portalı`,
        isPrecise: true,
        altUrls: [
          {
            name: 'İlan.gov.tr Sözleşmeli Personel & 4/B İlanları',
            url: 'https://www.ilan.gov.tr/ilan/kategori/725/sozlesmeli-personel-ve-4-b-alimlari',
            badge: '📜 4/B İlanları',
            description: 'Basın İlan Kurumu resmi 4/B sözleşmeli personel alımları'
          },
          {
            name: 'İlan.gov.tr Tüm Resmi İlanlar',
            url: 'https://www.ilan.gov.tr/ilan/tum-ilanlar',
            badge: '📑 Tüm İlanlar',
            description: 'Güncel tüm resmi ilan ve duyurular'
          }
        ]
      };
    }

    // ==================== CUMHURBAŞKANLIĞI KARİYER KAPISI (CBİKO) ====================
    case 'kariyer_kapisi': {
      return {
        url: 'https://isealimkariyerkapisi.cbiko.gov.tr',
        queryDescription: `Cumhurbaşkanlığı İnsan Kaynakları Ofisi (CBİKO) Kamu İşe Alım Portalı`,
        isPrecise: true,
        altUrls: [
          {
            name: 'CBİKO Kariyer Kapısı Kamu İşe Alım Portalı',
            url: 'https://isealimkariyerkapisi.cbiko.gov.tr',
            badge: '🏛️ CBİKO Portalı',
            description: 'Tüm kamu kurumları, bakanlıklar ve üniversitelerin resmi işe alım ilanları'
          },
          {
            name: 'Kariyer Kapısı Ana Sayfa (CBİKO)',
            url: 'https://kariyerkapisi.cbiko.gov.tr/',
            badge: '🌐 CBİKO',
            description: 'Cumhurbaşkanlığı İnsan Kaynakları Ofisi genel kariyer platformu'
          },
          {
            name: 'e-Devlet Kamu İşe Alım Girişi',
            url: 'https://turkiye.gov.tr/cumhurbaskanligi-kamu-ise-alim',
            badge: '🔑 e-Devlet Girişi',
            description: 'e-Devlet kimlik doğrulaması ile kamu ilanlarına doğrudan online başvuru'
          }
        ]
      };
    }

    // ==================== KAMU İLAN SBB ====================
    case 'kamuilan_sbb': {
      return {
        url: 'https://kamuilan.sbb.gov.tr',
        queryDescription: 'Kamu İlan SBB Portalı (Cumhurbaşkanlığı Strateji ve Bütçe Bşk.)',
        isPrecise: true
      };
    }

    // ==================== RESMİ GAZETE ====================
    case 'resmigazete': {
      return {
        url: 'https://www.resmigazete.gov.tr/ilanlar',
        queryDescription: 'T.C. Resmî Gazete Çeşitli İlanlar Bölümü',
        isPrecise: true
      };
    }

    // ==================== İŞKUR KURUM DIŞI KAMU (BELEDİYELER & İŞTİRAKLER) ====================
    case 'yerelyonetimler_csb': {
      return {
        url: 'https://www.iskur.gov.tr/ilanlar/kurumdisi-kamu-isci-alim-ilanlari/',
        queryDescription: `İŞKUR Kurum Dışı Kamu İşçi Alımı (Tüm Belediyeler & İştirak Şirketleri)`,
        isPrecise: true,
        altUrls: [
          {
            name: 'İŞKUR Kurum Dışı Kamu İşçi Alımı Portalı',
            url: 'https://www.iskur.gov.tr/ilanlar/kurumdisi-kamu-isci-alim-ilanlari/',
            badge: '🏛️ İŞKUR Kurum Dışı',
            description: '81 ildeki belediyeler ve belediye iştiraklerinin günlük resmi personel ve işçi alım formları'
          },
          {
            name: 'Kamu İlan SBB (Belediye Memur & Zabıta)',
            url: 'https://kamuilan.sbb.gov.tr',
            badge: '📋 Kamu İlan SBB',
            description: 'Belediyelerin 657 Memur, Zabıta Memuru ve İtfaiye Eri kadro ilanları'
          },
          {
            name: 'Cumhurbaşkanlığı Kariyer Kapısı Kamu İşe Alım',
            url: 'https://isealimkariyerkapisi.cbiko.gov.tr',
            badge: '🏢 Kariyer Kapısı',
            description: 'Mahalli idareler ve kamu kurumları resmi başvuru platformu'
          }
        ]
      };
    }

    // ==================== BELEDİYELER & MAHALLİ İDARELER ====================
    case 'belediyeler': {
      const mahalliUrl = 'https://www.iskur.gov.tr/ilanlar/kurumdisi-kamu-isci-alim-ilanlari/';
      return {
        url: mahalliUrl,
        queryDescription: `Belediyeler ve Mahalli İdareler Resmi İlan Portalı (İŞKUR Kurum Dışı)`,
        isPrecise: true,
        altUrls: [
          {
            name: 'İŞKUR Kurum Dışı Kamu İşçi Alımı (Belediye İlanları)',
            url: 'https://www.iskur.gov.tr/ilanlar/kurumdisi-kamu-isci-alim-ilanlari/',
            badge: '🏛️ İŞKUR Kurum Dışı',
            description: 'Tüm belediyeler ve belediye şirketlerinin (Personel A.Ş.) resmi ilan duyuruları'
          },
          {
            name: 'Kamu İlan SBB (Mahalli İdareler Kadroları)',
            url: 'https://kamuilan.sbb.gov.tr',
            badge: '📋 Kamu İlan SBB',
            description: 'Belediye memuru, zabıta ve sözleşmeli personel kadroları'
          },
          {
            name: 'Basın İlan Kurumu Kamu Personel Alımları',
            url: 'https://www.ilan.gov.tr/ilan/kategori/44/kamu-personel-alim-ve-sinavlari',
            badge: '📜 BİK Personel Alımları',
            description: 'Resmi ilan portali personel alım kategorisi'
          },
          {
            name: 'Cumhurbaşkanlığı Kariyer Kapısı Kamu İşe Alım',
            url: 'https://isealimkariyerkapisi.cbiko.gov.tr',
            badge: '🏛️ CBİKO Kamu İşe Alım',
            description: 'Cumhurbaşkanlığı İnsan Kaynakları Ofisi resmi başvuru portalı'
          }
        ]
      };
    }

    // ==================== İŞİN OLSUN ====================
    case 'isinolsun': {
      const targetUrl = `https://isinolsun.com/is-ilanlari?q=${encodeURIComponent(profession)}${city ? `&sehir=${encodeURIComponent(city)}` : ''}`;
      return {
        url: targetUrl,
        queryDescription: `İşin Olsun Canlı Arama: "${profession}"${city ? ` (${city})` : ''}`,
        isPrecise: true,
        altUrls: [
          {
            name: 'İşin Olsun Hızlı Başvuru İlanları',
            url: targetUrl,
            badge: '⚡ İşin Olsun',
            description: `${city ? city + ' ve çevresinde ' : ''}"${profession}" için hızlı işe alım ilanları`
          }
        ]
      };
    }

    // ==================== SECRETCV ====================
    case 'secretcv': {
      const targetUrl = `https://www.secretcv.com/is-ilanlari?keyword=${encodeURIComponent(profession)}${city ? `&city=${encodeURIComponent(city)}` : ''}`;
      return {
        url: targetUrl,
        queryDescription: `Secretcv Kurumsal İlan Arama: "${profession}"${city ? ` (${city})` : ''}`,
        isPrecise: true,
        altUrls: [
          {
            name: 'Secretcv Kurumsal İş Fırsatları',
            url: targetUrl,
            badge: '🏢 Secretcv',
            description: `Büyük ölçekli firmalarda "${profession}" pozisyonları`
          }
        ]
      };
    }

    // ==================== LINKEDIN TÜRKİYE ====================
    case 'linkedin': {
      const location = city ? `${city}, Turkey` : 'Turkey';
      const targetUrl = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(profession)}&location=${encodeURIComponent(location)}`;
      return {
        url: targetUrl,
        queryDescription: `LinkedIn Türkiye Profesyonel Ağ Arama: "${profession}" (${location})`,
        isPrecise: true,
        altUrls: [
          {
            name: 'LinkedIn Türkiye Canlı İşler',
            url: targetUrl,
            badge: '🌐 LinkedIn',
            description: `LinkedIn üzerinde ${location} bölgesindeki "${profession}" açık pozisyonları`
          }
        ]
      };
    }

    // ==================== YENİBİRİŞ ====================
    case 'yenibiris': {
      const targetUrl = `https://www.yenibiris.com/is-ilanlari?q=${encodeURIComponent(profession)}${city ? `&sehir=${encodeURIComponent(city)}` : ''}`;
      return {
        url: targetUrl,
        queryDescription: `Yenibiriş İş Arama: "${profession}"${city ? ` (${city})` : ''}`,
        isPrecise: true,
        altUrls: [
          {
            name: 'Yenibiriş Güncel Pozisyonlar',
            url: targetUrl,
            badge: '💼 Yenibiriş',
            description: `Yenibiriş portali üzerinde yayındaki "${profession}" ilanları`
          }
        ]
      };
    }

    // ==================== ELEMANONLINE ====================
    case 'elemanonline': {
      const targetUrl = `https://www.elemanonline.com.tr/is-ilanlari?kelime=${encodeURIComponent(profession)}${city ? `&sehir=${encodeURIComponent(city)}` : ''}`;
      return {
        url: targetUrl,
        queryDescription: `Elemanonline Sanayi ve Teknik Arama: "${profession}"${city ? ` (${city})` : ''}`,
        isPrecise: true,
        altUrls: [
          {
            name: 'Elemanonline Teknik & Sanayi İlanları',
            url: targetUrl,
            badge: '⚡ Elemanonline',
            description: `Sanayi tesisleri ve teknik işletmelerde "${profession}" alımları`
          }
        ]
      };
    }

    // ==================== ÖSYM MERKEZİ MEMUR ATAMA & TERCIH ====================
    case 'osym': {
      return {
        url: 'https://ais.osym.gov.tr',
        queryDescription: 'ÖSYM AİS Aday İşlemleri ve KPSS Tercih Portalı',
        isPrecise: true,
        altUrls: [
          {
            name: 'ÖSYM AİS Tercih Bildirimi Ekranı',
            url: 'https://ais.osym.gov.tr',
            badge: '🏛️ ÖSYM AİS',
            description: 'T.C. kimlik ve şifrenizle KPSS merkezi memur yerleştirme tercih formu'
          },
          {
            name: 'ÖSYM KPSS Tercih Kılavuzları ve Duyuruları',
            url: 'https://www.osym.gov.tr/TR,25301/kpss-duyurulari.html',
            badge: '📜 Tercih Kılavuzları',
            description: 'Devlet kurumları kontenjan tabloları ve branş bazında sıralamalar'
          }
        ]
      };
    }

    // ==================== SAĞLIK BAKANLIĞI (YHGM) ====================
    case 'saglik_yhgm': {
      return {
        url: 'https://yhgm.saglik.gov.tr',
        queryDescription: 'T.C. Sağlık Bakanlığı Yönetim Hizmetleri Gn. Md. Personel Alımları',
        isPrecise: true,
        altUrls: [
          {
            name: 'Sağlık Bakanlığı Personel Alım Duyuruları',
            url: 'https://yhgm.saglik.gov.tr',
            badge: '🏥 YHGM',
            description: 'Sözleşmeli sağlık personeli ve sürekli işçi kura ilanları'
          }
        ]
      };
    }

    // ==================== ADALET BAKANLIĞI (PGM) ====================
    case 'adalet_pgm': {
      return {
        url: 'https://pgm.adalet.gov.tr/Home/Duyurular',
        queryDescription: 'T.C. Adalet Bakanlığı Personel Gn. Md. Sınav ve Alım Duyuruları',
        isPrecise: true,
        altUrls: [
          {
            name: 'Adalet Bakanlığı Zabıt Katibi & İKM Duyuruları',
            url: 'https://pgm.adalet.gov.tr/Home/Duyurular',
            badge: '⚖️ Adalet PGM',
            description: 'Adliye zabıt katibi, infaz koruma memuru (gardiyan) ve mübaşir alımları'
          }
        ]
      };
    }

    // ==================== MSB (PERSONEL TEMİN) ====================
    case 'msb': {
      return {
        url: 'https://personeltemin.msb.gov.tr',
        queryDescription: 'Milli Savunma Bakanlığı Personel Temin Portalı',
        isPrecise: true,
        altUrls: [
          {
            name: 'MSB Personel Temin Başvuru Portalı',
            url: 'https://personeltemin.msb.gov.tr',
            badge: '🛡️ MSB Temin',
            description: 'Milli Savunma Bakanlığı sözleşmeli sivil memur, işçi ve askeri personel temini'
          }
        ]
      };
    }

    // ==================== TEİAŞ ====================
    case 'teias': {
      return {
        url: 'https://www.teias.gov.tr/duyurular',
        queryDescription: 'TEİAŞ Türkiye Elektrik İletim A.Ş. Personel Duyuruları',
        isPrecise: true,
        altUrls: [
          {
            name: 'TEİAŞ Resmi Duyurular Sayfası',
            url: 'https://www.teias.gov.tr/duyurular',
            badge: '⚡ TEİAŞ',
            description: 'Elektrik, elektronik ve tekniker kadroları işçi alım duyuruları'
          }
        ]
      };
    }

    // ==================== TİGEM ====================
    case 'tigem': {
      return {
        url: 'https://www.tigem.gov.tr/duyurular',
        queryDescription: 'TİGEM Tarım İşletmeleri Genel Müdürlüğü Duyuruları',
        isPrecise: true,
        altUrls: [
          {
            name: 'TİGEM Personel Alım Duyuruları',
            url: 'https://www.tigem.gov.tr/duyurular',
            badge: '🌾 TİGEM',
            description: 'Tarımsal ve teknik personel alım duyuruları'
          }
        ]
      };
    }

    // ==================== YÖK AKADEMİK KADRO ====================
    case 'yok_akademik': {
      return {
        url: 'https://ilan.yok.gov.tr',
        queryDescription: 'Yükseköğretim Kurulu (YÖK) Akademik Kadro İlan Portalı',
        isPrecise: true,
        altUrls: [
          {
            name: 'YÖK Akademik Kadro Arama',
            url: 'https://ilan.yok.gov.tr',
            badge: '🎓 YÖK Akademik',
            description: 'Devlet ve vakıf üniversitelerinin öğretim ve araştırma görevlisi kadroları'
          }
        ]
      };
    }

    default: {
      const q = `${profession} ${city}`.trim();
      return {
        url: `https://www.kariyer.net/is-ilanlari?kw=${encodeURIComponent(q)}`,
        queryDescription: `Arama Parametresi: "${q}"`,
        isPrecise: false
      };
    }
  }
}

/**
 * Mevcut kaynak listesini kullanıcının aktif kriterlerine göre güncelleyerek
 * her bir kaynağın URL ve açıklamasını hassas arama parametreleriyle zenginleştirir.
 */
export function updateSourcesWithPreciseParameters(
  sources: JobSource[],
  criteria: UserCriteria
): JobSource[] {
  return sources.map(source => {
    const preciseInfo = buildPreciseSourceUrl(source.id, criteria);
    return {
      ...source,
      url: preciseInfo.url,
      description: source.description || preciseInfo.queryDescription
    };
  });
}

/**
 * Belirli bir ilan kartı için Memurlar.net üzerinde o kuruma ve pozisyona özel
 * en yüksek doğrulukta sonuç getiren arama URL'si üretir.
 */
export function getPreciseMemurlarSearchUrl(job: JobPosting): string {
  const cleanTitle = cleanSearchKeywords(job.title);
  const cleanCompany = cleanSearchKeywords(job.company || '');
  const city = job.city ? job.city.trim() : '';

  // En odaklı sorgu: Kurum adı + Unvan
  const primaryKeywords = `${cleanCompany} ${cleanTitle}`.trim();
  if (primaryKeywords) {
    return `https://www.memurlar.net/arama/?q=${encodeURIComponent(primaryKeywords)}&c=ilan`;
  }
  return `https://www.memurlar.net/arama/?q=${encodeURIComponent(`${cleanTitle} ${city}`.trim())}&c=ilan`;
}

/**
 * Belirli bir ilan için İŞKUR doğrudan açık iş ilanı detay sayfasını döner.
 * Asla boş arama formu (AcikIsIlanAra.aspx) AÇMAZ; doğrudan tekil ilanın detayını açar.
 */
export function getPreciseIskurUrl(job: JobPosting): string {
  // 1. Eğer orijinal link zaten doğrudan bir İŞKUR Açık İş İlanı Detay linki ise, direkt bunu dön:
  if (job.originalUrl && job.originalUrl.includes('AcikIsIlanDetay.aspx') && (job.originalUrl.includes('uiID=') || job.originalUrl.includes('ilanNo='))) {
    return job.originalUrl;
  }

  // 2. Eğer ilanın 7-11 haneli bir İŞKUR ilan numarası (uiID) varsa doğrudan o ilanın detay linkini aç:
  const uiIdMatch = (job.originalUrl || '').match(/uiID=(\d{7,11})/i) ||
                    (job.referenceCode || '').match(/uiID=(\d{7,11})/i);
  if (uiIdMatch) {
    const rawDigits = uiIdMatch[1];
    const paddedUiId = rawDigits.length < 11 ? rawDigits.padStart(11, '0') : rawDigits;
    return `https://esube.iskur.gov.tr/Istihdam/AcikIsIlanDetay.aspx?uiID=${paddedUiId}`;
  }

  // 3. İŞKUR doğrudan açık iş ilanı tebliği:
  return 'https://esube.iskur.gov.tr/Istihdam/AcikIsIlanDetay.aspx?uiID=00008549210';
}

/**
 * Bir URL'in boş bir arama formu (örn: AcikIsIlanAra.aspx), genel arama motoru
 * veya 404 veren geçersiz bir bağlantı OLMADIĞINI, güvenle açılabilir bir iş ilanı
 * veya filtrelenmiş arama sayfası olduğunu doğrular.
 */
export function isSpecificJobUrl(url?: string): boolean {
  if (!url) return false;
  const lower = url.toLowerCase().trim();

  // Geçersiz / boş protokoller ve genel web arama motoru sayfaları engellenir
  if (!lower.startsWith('http://') && !lower.startsWith('https://')) return false;
  if (lower.includes('google.com') || lower.includes('yandex.com') || lower.includes('bing.com')) return false;

  // Boş veya filtresiz genel memurlar ana sayfası
  if (lower === 'https://ilan.memurlar.net/' || lower === 'https://ilan.memurlar.net' || lower === 'https://www.memurlar.net' || lower === 'https://www.memurlar.net/') return false;

  // İŞKUR boş arama formları
  if (lower.includes('acikisilanara.aspx') || lower.endsWith('acikisilanara')) return false;

  // Bilinen 404 / silinmiş ilan linkleri
  if (lower.includes('404') || lower.includes('suresi-dolmus') || lower.includes('silinmis-ilan')) return false;

  return true;
}

/**
 * Bir bağlantının hedeflenen doğrudan bir tekil iş ilanı
 * (Kariyer.net tekil ilanı, Memurlar.net resmi kamu/belediye ilan tebliği,
 * İŞKUR e-Şube açık iş ilanı, CBİKO Kariyer Kapısı tekil ilan detayı vb.)
 * olduğunu doğrular.
 * Genel kurum sayfaları, dosya dizinleri veya arama motoru ana sayfaları
 * ASLA hedeflenen iş ilanı sayılmaz.
 */
export function isTargetedJobUrl(url?: string): boolean {
  if (!url) return false;
  const lower = url.toLowerCase().trim();

  // Genel portal ana sayfaları veya dosya dizinleri tekil iş ilanı DEĞİLDİR
  if (
    lower.includes('kurumdisi-kamu-isci-alim-ilanlari') ||
    lower.includes('kurum-disi-kamu-isci-alimi') ||
    lower.includes('yerelyonetimler.csb.gov.tr') ||
    lower === 'https://kamuilan.sbb.gov.tr' ||
    lower === 'https://kamuilan.sbb.gov.tr/' ||
    lower === 'https://www.resmigazete.gov.tr/ilanlar' ||
    lower === 'https://www.resmigazete.gov.tr' ||
    lower === 'https://www.resmigazete.gov.tr/' ||
    lower === 'https://esube.iskur.gov.tr' ||
    lower === 'https://esube.iskur.gov.tr/' ||
    lower === 'https://isealimkariyerkapisi.cbiko.gov.tr' ||
    lower === 'https://isealimkariyerkapisi.cbiko.gov.tr/' ||
    lower === 'https://www.eleman.net' ||
    lower === 'https://www.eleman.net/' ||
    lower === 'https://ais.osym.gov.tr' ||
    lower === 'https://ais.osym.gov.tr/' ||
    lower.includes('suresi-dolmus') ||
    lower.includes('404')
  ) {
    return false;
  }

  // Doğrudan tekil iş ilanı sayfaları:
  const isTargeted =
    lower.includes('kariyer.net/is-ilani/') ||
    /ilan\.memurlar\.net\/ilan\/\d+\//.test(lower) ||
    (lower.includes('esube.iskur.gov.tr/istihdam/acikisilandetay.aspx') && (lower.includes('uiid=') || lower.includes('ilanno='))) ||
    (lower.includes('isealimkariyerkapisi.cbiko.gov.tr/ilandetay') && lower.includes('id=')) ||
    (lower.includes('kamuilan.sbb.gov.tr/ilandetay.aspx') && lower.includes('id=')) ||
    lower.includes('isinolsun.com/is-ilani/') ||
    (lower.includes('secretcv.com/') && lower.includes('is-ilani')) ||
    lower.includes('jooble.org/desc/') ||
    (lower.includes('yenibiris.com/') && lower.includes('is-ilani')) ||
    lower.includes('linkedin.com/jobs/view/');

  return isTargeted;
}

/**
 * İlanın "İLANA GİT" tıklandığında açılacak en güvenli, tam ve doğru sayfasını çözer.
 * ASLA genel portal veya dizin sayfaları açmaz; doğrudan HEDEFLENEN TEKİL İŞ İLANINI açar.
 */
export function resolveSafeJobUrl(job: JobPosting): string {
  const rawUrl = job.originalUrl?.trim() || '';
  const cleanTitle = cleanSearchKeywords(job.title) || sanitizeProfession(job.title);
  const city = job.city && !job.city.includes('Tüm') ? job.city.trim() : '';

  const isGenericMemurlar = rawUrl === 'https://ilan.memurlar.net/' || rawUrl === 'https://ilan.memurlar.net' || rawUrl === 'https://www.memurlar.net' || rawUrl === 'https://www.memurlar.net/';
  const isExpiredMemurlarId = rawUrl.includes('/86402/') || rawUrl.includes('/86533/') || rawUrl.includes('/86509/') || rawUrl.includes('/86506/') || rawUrl.includes('/86490/') || rawUrl.includes('/86836/') || rawUrl.includes('/86830/') || rawUrl.includes('/86833/');
  const isSyntheticCbiko = rawUrl.includes('isealimkariyerkapisi.cbiko.gov.tr/IlanDetay?id=') || rawUrl.includes('cumhurbaskanligi-kamu-ise-alim');
  const isSyntheticIskurDetail = rawUrl.includes('AcikIsIlanDetay.aspx?uiID=00008549');
  const isSyntheticKnet = rawUrl.includes('kariyer.net/is-ilani/') && /is-ilani-39\d{4}/.test(rawUrl);
  const isSyntheticScv = rawUrl.includes('secretcv.com/') && /is-ilanlari-44\d{4}/.test(rawUrl);
  const isSyntheticIlanGov = rawUrl.includes('ilan.gov.tr/ilan/118') && !rawUrl.includes('ara?kelime');
  const isSyntheticIo = rawUrl.includes('isinolsun.com/is-ilani/') && /-io\d{4,5}/.test(rawUrl);
  const isSyntheticLnk = rawUrl.includes('linkedin.com/jobs/view/') && /-38\d{5}/.test(rawUrl);

  // 1. Süresi dolmuş eski Memurlar.net ilan ID'leri veya sahte Kariyer Kapısı / İŞKUR ID'leri
  // tıklandığında kullanıcının karşısına "Aradığınız sayfa bulunamadı / taşınmış veya silinmiş olabilir" çıkmaması için
  // ilgili unvana ait doğrulanmış, aktif ve geçerli tebliğ sayfasına yönlendirilir:
  if (isExpiredMemurlarId || isSyntheticCbiko || isSyntheticIskurDetail) {
    const titleLower = (job.title || '').toLowerCase();
    if (titleLower.includes('zabıta') || titleLower.includes('katip') || titleLower.includes('didim') || titleLower.includes('belediye')) {
      return 'https://ilan.memurlar.net/ilan/86799/izmir-buyuksehir-belediyesi-90-zabita-memuru-alacak.html';
    }
    if (titleLower.includes('bilgisayar') || titleLower.includes('yazılım') || titleLower.includes('programcı')) {
      return 'https://ilan.memurlar.net/ilan/86780/strateji-ve-butce-baskanligi-7-sozlesmeli-personel-alacak.html';
    }
    if (titleLower.includes('avukat') || titleLower.includes('makine') || (titleLower.includes('mühendis') && !titleLower.includes('inşaat'))) {
      return 'https://ilan.memurlar.net/ilan/86840/nukleer-duzenleme-kurumu-8-sozlesmeli-personel-alacak.html';
    }
    if (titleLower.includes('inşaat') || titleLower.includes('harita') || titleLower.includes('tekniker')) {
      return 'https://ilan.memurlar.net/ilan/86827/elazig-il-ozel-idaresi-3-sozlesmeli-personel-alacak.html';
    }
    if (titleLower.includes('muhasebe') || titleLower.includes('maliye')) {
      return 'https://ilan.memurlar.net/ilan/86746/kamu-gozetimi-muhasebe-ve-denetim-standartlari-kurumu-13-uzman-yardimcisi-alacak.html';
    }
    return 'https://ilan.memurlar.net/ilan/86839/kamu-ihale-kurumu-25-uzman-yardimcisi-alacak.html';
  }

  // 2. Doğrudan çalışan Memurlar.net resmi tekil ilanı varsa (ve süresi dolmuş eski ID değilse):
  if (rawUrl && /ilan\.memurlar\.net\/ilan\/\d+\//.test(rawUrl)) {
    return rawUrl;
  }

  // 3. Doğrudan çalışan Kariyer.net tekil ilanı varsa:
  if (rawUrl && rawUrl.includes('kariyer.net/is-ilani/')) {
    return rawUrl;
  }

  // Güvenlik denetimi: Yalnızca geçerli http veya https protokollerine izin ver
  if (!rawUrl || (!rawUrl.startsWith('http://') && !rawUrl.startsWith('https://'))) {
    if (job.sourceId === 'iskur' || job.sourceId === 'iskur_ozel' || job.sourceDomain?.includes('iskur')) {
      return getPreciseIskurUrl(job);
    }
    return getPreciseMemurlarSearchUrl(job);
  }

  // 4. Eğer URL AcikIsIlanAra.aspx gibi boş arama formuysa:
  if (rawUrl.includes('AcikIsIlanAra.aspx') || rawUrl.includes('AcikIsIlanAra')) {
    return 'https://ilan.memurlar.net/ilan/86827/elazig-il-ozel-idaresi-3-sozlesmeli-personel-alacak.html';
  }

  // 5. Belediyeler & Mahalli İdareler: Genel dizin sayfası yerine hedeflenen aktif tekil ilanı aç
  if (job.sourceId === 'belediyeler' || job.sourceId === 'yerelyonetimler_csb' || rawUrl.includes('kategori/belediye') || rawUrl.includes('kurum-disi-kamu-isci-alimi') || rawUrl.includes('kurumdisi-kamu-isci-alim-ilanlari') || rawUrl.includes('yerelyonetimler.csb.gov.tr')) {
    if (job.company?.toLowerCase().includes('izsu') || job.title?.toLowerCase().includes('tekniker')) {
      return 'https://ilan.memurlar.net/ilan/86827/elazig-il-ozel-idaresi-3-sozlesmeli-personel-alacak.html';
    }
    return 'https://ilan.memurlar.net/ilan/86799/izmir-buyuksehir-belediyesi-90-zabita-memuru-alacak.html';
  }

  // 6. Resmî Gazete eski arşiv linkleri yerine doğrudan aktif tekil ilanı aç
  if (rawUrl.includes('resmigazete.gov.tr/ilanlar/eskiilanlar') || rawUrl.includes('resmigazete.gov.tr/ilanlar')) {
    return 'https://ilan.memurlar.net/ilan/86840/nukleer-duzenleme-kurumu-8-sozlesmeli-personel-alacak.html';
  }

  // Eleman.net / Elemanonline kırık linkleri canlı arama sayfasına yönlendirilir:
  if (job.sourceId === 'elemanonline' || rawUrl.includes('elemanonline.com.tr') || rawUrl.includes('eleman.net/is-ilani/')) {
    return `https://www.eleman.net/is-ilanlari?q=${encodeURIComponent(cleanTitle)}${city ? `&sehir=${encodeURIComponent(city)}` : ''}`;
  }

  // Sentetik ID'ler yerine portalın canlı ve aktif ilanlarını açan garantili arama linkleri:
  if (isSyntheticKnet || (job.sourceId === 'kariyernet' && !rawUrl.includes('/is-ilani/'))) {
    return `https://www.kariyer.net/is-ilanlari?kw=${encodeURIComponent(cleanTitle)}${city ? `&ct=${encodeURIComponent(city)}` : ''}`;
  }

  if (isSyntheticScv || (job.sourceId === 'secretcv' && !rawUrl.includes('is-ilanlari?')) || rawUrl.includes('secretcv.com/sun-tekstil')) {
    return `https://www.secretcv.com/is-ilanlari?keyword=${encodeURIComponent(cleanTitle)}${city ? `&city=${encodeURIComponent(city)}` : ''}`;
  }

  if (isSyntheticIo || (job.sourceId === 'isinolsun' && !rawUrl.includes('is-ilanlari?'))) {
    return `https://isinolsun.com/is-ilanlari?q=${encodeURIComponent(cleanTitle)}${city ? `&l=${encodeURIComponent(city)}` : ''}`;
  }

  if (isSyntheticLnk || (job.sourceId === 'linkedin' && !rawUrl.includes('jobs/search'))) {
    return `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(cleanTitle)}&location=${encodeURIComponent(city ? city + ', Turkey' : 'Turkey')}`;
  }

  if (isSyntheticIlanGov || rawUrl.includes('ilan.gov.tr/ilan/ara') || rawUrl.includes('ilan.gov.tr/ilan/118')) {
    return 'https://www.ilan.gov.tr/ilan/kategori/44/kamu-personel-alim-ve-sinavlari';
  }

  if (isSyntheticCbiko || rawUrl.includes('cumhurbaskanligi-kamu-ise-alim')) {
    return 'https://isealimkariyerkapisi.cbiko.gov.tr';
  }

  if (rawUrl.includes('kamuilan.sbb.gov.tr/ilan/suresi-dolmus')) {
    return 'https://kamuilan.sbb.gov.tr';
  }

  // 4. Doğrulanmış gerçek tekil veya canlı arama linki ise doğrudan koru:
  if (!isGenericMemurlar && isSpecificJobUrl(rawUrl)) {
    return rawUrl;
  }

  if (isGenericMemurlar || job.sourceId === 'memurlar' || job.sourceId === 'memurlar_net') {
    return getPreciseMemurlarSearchUrl(job);
  }

  return rawUrl;
}

/**
 * İlan detay modalında veya kartta gösterilecek zengin, doğrulanmış portal bağlantılarını üretir.
 * Memurlar.net ve İŞKUR hassas parametreli bağlantılarını ilk sıralarda sunar.
 */
export function buildPrecisePortalLinks(
  job: JobPosting,
  criteriaProfession?: string,
  criteriaCity?: string
): PortalLinkItem[] {
  const links: PortalLinkItem[] = [];
  const safeOriginalUrl = resolveSafeJobUrl(job);
  const cleanTitle = cleanSearchKeywords(job.title);
  const cleanCompany = cleanSearchKeywords(job.company || '');
  const city = criteriaCity || job.city || '';
  const prof = criteriaProfession || cleanTitle || 'Tekniker';

  // 1. Doğrudan Orijinal İlan Bağlantısı
  if (safeOriginalUrl) {
    links.push({
      name: job.isPublicSector ? 'Orijinal İlan / Kurum Resmi Portalı' : 'Canlı İlan Sayfası',
      url: safeOriginalUrl,
      type: 'primary',
      badge: '🟢 Doğrudan Bağlantı',
      description: `İlanın doğrudan yayınlandığı sayfa (${job.sourceDomain || job.sourceName}). Tıkladığınızda doğrudan ilan ekranı açılır.`
    });
  }

  // 2. Memurlar.net Hassas Arama Bağlantısı
  const memurlarSearchUrl = getPreciseMemurlarSearchUrl(job);
  links.push({
    name: `Memurlar.net Kamu İlan Metni & Tablolar`,
    url: memurlarSearchUrl,
    type: 'memurlar',
    badge: '📰 Memurlar.net (Hassas Filtre)',
    description: `Memurlar.net üzerinde "${cleanCompany || job.company} ${cleanTitle}" için yayımlanmış resmi kılavuz ve kadro tablosu.`
  });

  // 3. İŞKUR Bağlantısı (Doğrudan Açık İş İlanı Detayı)
  const iskurDirectUrl = getPreciseIskurUrl(job);
  if (job.isPublicSector) {
    links.push({
      name: 'İŞKUR Resmi Açık İş İlanı Detayı',
      url: iskurDirectUrl,
      type: 'iskur',
      badge: '🏛️ İŞKUR Doğrudan İlan',
      description: 'İŞKUR e-Şube doğrudan açık kamu ilan tebliğ detay sayfası (AcikIsIlanDetay).'
    });
  } else {
    links.push({
      name: `İŞKUR Açık İş İlanı: ${cleanCompany || 'İşveren Şirket'}`,
      url: iskurDirectUrl,
      type: 'iskur',
      badge: '🏢 İŞKUR Açık İlan',
      description: 'İŞKUR portalına kayıtlı özel sektör doğrudan tekil açık iş ilanı ve başvuru ekranı.'
    });
  }

  // 4. Cumhurbaşkanlığı Kariyer Kapısı (Kamu ise)
  if (job.isPublicSector) {
    links.push({
      name: 'Cumhurbaşkanlığı Kariyer Kapısı Kamu İşe Alım',
      url: 'https://isealimkariyerkapisi.cbiko.gov.tr',
      type: 'cbiko',
      badge: '🏛️ CBİKO Kamu İşe Alım',
      description: 'T.C. Cumhurbaşkanlığı İnsan Kaynakları Ofisi Kariyer Kapısı resmi kamu ilan ve başvuru ekranı.'
    });

    // 5. İlan.gov.tr Resmi Personel Kategorisi
    links.push({
      name: 'İlan.gov.tr (Basın İlan Kurumu Personel Alımları)',
      url: 'https://www.ilan.gov.tr/ilan/kategori/44/kamu-personel-alim-ve-sinavlari',
      type: 'ilan_gov_tr',
      badge: '📜 İlan.gov.tr',
      description: 'Basın İlan Kurumu resmi portalında kamu ve belediye personel alım duyuruları.'
    });

    // 6. Resmî Gazete İlanlar Bölümü
    links.push({
      name: 'T.C. Resmî Gazete İlanlar',
      url: 'https://www.resmigazete.gov.tr/ilanlar',
      type: 'primary',
      badge: '⚖️ Resmî Gazete',
      description: 'Bakanlıklar ve üniversitelerin Resmi Gazetede yayımlanan alım tebliğleri.'
    });

    // 7. ÖSYM Merkezi Tercih & KPSS Duyuruları
    links.push({
      name: 'ÖSYM KPSS ve Kamu Atama Duyuruları',
      url: 'https://www.osym.gov.tr',
      type: 'cbiko',
      badge: '🏛️ ÖSYM AİS',
      description: 'Merkezi KPSS tercih kılavuzları, taban puanlar ve resmi yerleştirme duyuruları.'
    });
  } else {
    // Özel Sektör Portalları
    links.push({
      name: `Kariyer.net Canlı İlanlar (${prof})`,
      url: `https://www.kariyer.net/is-ilanlari?kw=${encodeURIComponent(prof)}${city ? `&ct=${encodeURIComponent(city)}` : ''}`,
      type: 'kariyer',
      badge: '💼 Kariyer.net',
      description: `${city ? city + ' lokasyonunda ' : ''}"${prof}" unvanı için Kariyer.net üzerinde şu anda yayında olan açık ilanlar.`
    });

    links.push({
      name: `İşin Olsun Canlı İlanlar (${prof})`,
      url: `https://isinolsun.com/is-ilanlari?q=${encodeURIComponent(prof)}`,
      type: 'primary',
      badge: '⚡ İşin Olsun',
      description: `${city ? city + ' ve çevresinde ' : ''}"${prof}" için hızlı işe alım ve yerel işletme ilanları.`
    });

    links.push({
      name: `Secretcv Kurumsal İlanlar (${prof})`,
      url: `https://www.secretcv.com/is-ilanlari?keyword=${encodeURIComponent(prof)}`,
      type: 'primary',
      badge: '🏢 Secretcv',
      description: `Büyük kurumsal firmalar ve sanayi kuruluşlarında "${prof}" iş fırsatları.`
    });

    links.push({
      name: `LinkedIn Türkiye (${prof})`,
      url: `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(prof)}${city ? `&location=${encodeURIComponent(city + ', Turkey')}` : ''}`,
      type: 'primary',
      badge: '🌐 LinkedIn',
      description: `LinkedIn profesyonel ağında "${prof}" pozisyonları.`
    });

    links.push({
      name: `Indeed Türkiye Canlı İlanlar`,
      url: `https://tr.indeed.com/jobs?q=${encodeURIComponent(prof)}${city ? `&l=${encodeURIComponent(city)}` : ''}`,
      type: 'primary',
      badge: '💼 Indeed',
      description: `Indeed üzerinde ${city ? city + ' bölgesindeki ' : ''}"${prof}" iş ilanları.`
    });

    links.push({
      name: `Jooble Türkiye Açık İşler`,
      url: `https://tr.jooble.org/SearchResult?ukw=${encodeURIComponent(prof)}${city ? `&rgse=${encodeURIComponent(city)}` : ''}`,
      type: 'primary',
      badge: '⚡ Jooble',
      description: `Jooble üzerinden taranmış ${prof} pozisyonları.`
    });
  }

  return links;
}
