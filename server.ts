import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface UrlCheckResult {
  url: string;
  status: 'active' | 'not_found' | 'error' | 'forbidden' | 'unreachable';
  httpStatus: number | null;
  statusText: string;
  responseTimeMs: number;
  is404: boolean;
  isExpired?: boolean;
  checkedAt: string;
  message: string;
}

// In-memory cache for fast repeat requests
const urlCache = new Map<string, { result: UrlCheckResult; timestamp: number }>();
const CACHE_TTL_MS = 60 * 1000; // 1 minute in memory
const URL_CHECK_CONCURRENCY = 4;

// Cache completed live-search responses briefly to avoid repeating expensive upstream scraping.
const LIVE_SEARCH_CACHE_TTL_MS = 30 * 1000;
const LIVE_SEARCH_CACHE_LIMIT = 32;
const liveSearchCache = new Map<string, { jobs: any[]; timestamp: number }>();

async function mapWithConcurrency<T, R>(
  items: T[],
  worker: (item: T) => Promise<R>,
  concurrency = URL_CHECK_CONCURRENCY
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let nextIndex = 0;

  const runWorker = async () => {
    while (true) {
      const index = nextIndex++;
      if (index >= items.length) return;
      results[index] = await worker(items[index]);
    }
  };

  await Promise.all(
    Array.from(
      { length: Math.min(Math.max(1, concurrency), items.length) },
      () => runWorker()
    )
  );

  return results;
}

// Turkish-aware string normalizer for accurate detection of expired job notices
function normalizeForDetection(text: string): string {
  if (!text) return '';
  return text
    .replace(/İ/g, 'i')
    .replace(/I/g, 'i')
    .replace(/ı/g, 'i')
    .replace(/Ğ/g, 'g')
    .replace(/ğ/g, 'g')
    .replace(/Ü/g, 'u')
    .replace(/ü/g, 'u')
    .replace(/Ş/g, 's')
    .replace(/ş/g, 's')
    .replace(/Ö/g, 'o')
    .replace(/ö/g, 'o')
    .replace(/Ç/g, 'c')
    .replace(/ç/g, 'c')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');
}

export async function checkSingleUrl(rawUrl: string): Promise<UrlCheckResult> {
  const checkedAt = new Date().toISOString();
  
  if (!rawUrl || typeof rawUrl !== 'string') {
    return {
      url: rawUrl || '',
      status: 'error',
      httpStatus: null,
      statusText: 'Geçersiz URL',
      responseTimeMs: 0,
      is404: false,
      isExpired: false,
      checkedAt,
      message: 'URL parametresi boş veya geçersiz.'
    };
  }

  // Check cache
  const cached = urlCache.get(rawUrl);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.result;
  }

  const startTime = Date.now();
  let normalizedUrl = rawUrl.trim();
  if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
    normalizedUrl = 'https://' + normalizedUrl;
  }

  try {
    // Attempt request with 6 second timeout and standard desktop browser headers
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(normalizedUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7'
      },
      redirect: 'follow',
      signal: controller.signal
    }).catch(async (fetchErr) => {
      // If GET fails or timed out, try HEAD
      try {
        return await fetch(normalizedUrl, {
          method: 'HEAD',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
          signal: AbortSignal.timeout(3000)
        });
      } catch {
        throw fetchErr;
      }
    });

    clearTimeout(timeoutId);
    const responseTimeMs = Date.now() - startTime;
    const httpStatus = response.status;

    // Inspect HTML body to detect if the portal states the application deadline has expired:
    let bodyText = '';
    try {
      const ctype = response.headers?.get?.('content-type') || '';
      const arrayBuf = await response.arrayBuffer();
      let charset = 'utf-8';
      if (ctype.includes('windows-1254') || ctype.includes('iso-8859-9')) {
        charset = 'windows-1254';
      } else {
        const headerSnippet = Buffer.from(arrayBuf.slice(0, 1024)).toString('latin1');
        if (/charset=["']?(windows-1254|iso-8859-9)/i.test(headerSnippet)) {
          charset = 'windows-1254';
        }
      }
      try {
        const decoder = new TextDecoder(charset);
        bodyText = decoder.decode(arrayBuf);
      } catch {
        bodyText = Buffer.from(arrayBuf).toString('utf8');
      }
    } catch {
      bodyText = '';
    }

    const normBody = normalizeForDetection(bodyText);

    // Specific detector for expired/closed job announcements (İŞKUR, Kariyer.net, Memurlar.net, Kamu İlan vb.)
    // Detects both "başvuru süresi sonra ermiştir" and "sona ermiştir" and all variations
    const hasExpiredNoticeText = 
      normBody.includes('goruntulemekte oldugunuz ilanin basvuru suresi') ||
      normBody.includes('basvuru suresi sona ermistir') ||
      normBody.includes('basvuru suresi sonra ermistir') ||
      normBody.includes('bu ilanin suresi dolmustur') ||
      normBody.includes('bu ilanin yayini sona ermistir') ||
      normBody.includes('ilan yayindan kaldirilmistir') ||
      normBody.includes('aradiginiz sayfa bulunamadi') ||
      normBody.includes('link hatali') ||
      normBody.includes('yayindan kaldirilmis veya suresi dolmus olabilir') ||
      normBody.includes('suresi dolmus olabilir') ||
      normBody.includes('yayindan kaldirilmis olabilir') ||
      normBody.includes('bu ilana artik basvuru yapilamamaktadir') ||
      normBody.includes('artik basvuru kabul etmiyor') ||
      normBody.includes('artik ilan kabul etmiyor') ||
      normBody.includes('ilan kabul etmiyor') ||
      normBody.includes('basvuruya kapalidir') ||
      normBody.includes('basvuruya kapatilmistir') ||
      normBody.includes('bu pozisyon icin basvuru suresi dolmustur') ||
      normBody.includes('pozisyonun ihtiyaci karsilanmis') ||
      normBody.includes('arama kriterlerinize uygun acik is ilani bulunamamistir') ||
      normBody.includes('boyle bir ilan bulunamadi') ||
      normBody.includes('aradiginiz ilan yayinda degildir') ||
      normBody.includes('aradiginiz ilan bulunamadi') ||
      normBody.includes('ilan bulunamadi') ||
      normBody.includes('ilan pasif') ||
      normBody.includes('ilan kapatilmistir') ||
      normBody.includes('yapilmaya calisilan istek reddedildi') ||
      normBody.includes('request rejected');

    // İŞKUR webforms: boş gelen veya sadece sisteme giriş yapınız diyen ve iş tanımı/kontenjanı olmayan ölü veya süresi bitmiş sayfalar
    const isIskurEmptyLoginOnly = rawUrl.includes('iskur.gov.tr') && 
      (normBody.includes('sisteme giris yapiniz') || normBody.includes('isgucu istemi')) && 
      (!normBody.includes('is tanimi') && !normBody.includes('calisma adresi') && !normBody.includes('alincak kisi sayisi') && !normBody.includes('meslek bilgileri'));

    const isExpiredNotice = hasExpiredNoticeText || isIskurEmptyLoginOnly;

    const is404 = 
      httpStatus === 404 || 
      httpStatus === 410 || 
      rawUrl.includes('404') || 
      rawUrl.includes('suresi-dolmus') || 
      rawUrl.includes('yayindan-kalkmis') || 
      isExpiredNotice;

    let status: UrlCheckResult['status'] = 'active';
    let message = 'Bağlantı aktif ve erişilebilir.';

    if (isExpiredNotice) {
      status = 'not_found';
      message = 'Görüntülemekte olduğunuz ilanın başvuru süresi sona ermiştir veya ilan sistemden kaldırılmıştır.';
    } else if (is404) {
      status = 'not_found';
      message = `Sayfa Bulunamadı (${httpStatus} Not Found). İlan yayından kalkmış veya link silinmiş olabilir.`;
    } else if (httpStatus === 403) {
      status = 'forbidden';
      message = 'Erişim güvenlik duvarı (403) tarafından sınırlandırılmış ancak alan adı ve servis aktiftir.';
    } else if (httpStatus >= 500) {
      status = 'error';
      message = `Sunucu hatası (${httpStatus}). Kurum portalı şu an yanıt veremiyor.`;
    } else if (httpStatus >= 200 && httpStatus < 400) {
      status = 'active';
      message = `Bağlantı geçerli, yayında ve sorunsuz açılıyor (${httpStatus} ${response.statusText || 'OK'}).`;
    }

    const result: UrlCheckResult = {
      url: rawUrl,
      status,
      httpStatus: isExpiredNotice ? 410 : httpStatus,
      statusText: isExpiredNotice ? 'İlan Süresi Sona Ermiş' : (response.statusText || `${httpStatus}`),
      responseTimeMs,
      is404,
      isExpired: isExpiredNotice,
      checkedAt,
      message
    };

    urlCache.set(rawUrl, { result, timestamp: Date.now() });
    return result;

  } catch (err: any) {
    const responseTimeMs = Date.now() - startTime;
    const isAbort = err.name === 'AbortError' || err.name === 'TimeoutError';
    
    // Check if DNS error or general unreachable
    const isNotFoundDns = err.code === 'ENOTFOUND' || err.message?.includes('ENOTFOUND');
    const is404 = isNotFoundDns;

    const result: UrlCheckResult = {
      url: rawUrl,
      status: is404 ? 'not_found' : 'unreachable',
      httpStatus: is404 ? 404 : null,
      statusText: is404 ? 'Alan Adı Bulunamadı' : (isAbort ? 'Zaman Aşımı' : 'Ağ Hatası'),
      responseTimeMs,
      is404,
      isExpired: false,
      checkedAt,
      message: is404
        ? 'Hedef sunucu bulunamadı (Geçersiz veya sahte alan adı).'
        : (isAbort ? 'Sunucu 5 saniye içinde yanıt vermedi (Ağ yavaşlığı veya erişim engeli).' : 'Ağ bağlantısı kurulamadı.')
    };

    urlCache.set(rawUrl, { result, timestamp: Date.now() });
    return result;
  }
}

async function startServer() {
  const app = express();
  const port = process.env.PORT || 3000;

  app.use(express.json());

  // Single URL verification endpoint
  app.get('/api/verify-url', async (req: Request, res: Response) => {
    const targetUrl = req.query.url as string;
    if (!targetUrl) {
      return res.status(400).json({ error: 'url query parameter is required' });
    }
    const result = await checkSingleUrl(targetUrl);
    return res.json(result);
  });

  // Live Job Search API: Fetches real individual job postings from Kariyer.net with verified URLs
  app.get('/api/live-search-jobs', async (req: Request, res: Response) => {
    const profession = (req.query.profession as string || '').trim();
    const city = (req.query.city as string || '').trim();
    if (!profession) {
      return res.json({ jobs: [] });
    }

    try {
      const normUserCity = (city || '').toLocaleLowerCase('tr-TR').trim();
      const liveSearchCacheKey = JSON.stringify({ profession: profession.toLocaleLowerCase('tr-TR'), city: normUserCity });
      const cachedLiveSearch = liveSearchCache.get(liveSearchCacheKey);
      if (cachedLiveSearch && Date.now() - cachedLiveSearch.timestamp < LIVE_SEARCH_CACHE_TTL_MS) {
        return res.json({ jobs: cachedLiveSearch.jobs });
      }

      const { execSync } = await import('child_process');
      const isUserCityFilterActive = Boolean(
        normUserCity && 
        !normUserCity.includes('tüm') && 
        !normUserCity.includes('tum') && 
        !normUserCity.includes('genel')
      );

      const normCity = (city || '').toLocaleLowerCase('tr-TR')
        .replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u')
        .replace(/ş/g, 's').replace(/ö/g, 'o').replace(/ç/g, 'c').trim();
      
      const path = normCity ? `/is-ilanlari/${normCity}?kw=${encodeURIComponent(profession)}` : `/is-ilanlari?kw=${encodeURIComponent(profession)}`;
      const kariyerUrl = `https://www.kariyer.net${path}`;
      
      let html = '';
      try {
        const kariyerRes = await fetch(kariyerUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'tr-TR,tr;q=0.9'
          },
          signal: AbortSignal.timeout(6000)
        });
        html = await kariyerRes.text();
      } catch {
        // Fallback for environments where Kariyer.net blocks Node fetch.
        const cmd = `curl -s -L --max-time 6 "${kariyerUrl}"`;
        try {
          html = execSync(cmd, { encoding: 'utf8' });
        } catch {}
      }

      const cardRegex = /<a\s+href="(\/is-ilani\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
      let match;
      const jobs: any[] = [];

      while ((match = cardRegex.exec(html)) !== null && jobs.length < 8) {
        const url = 'https://www.kariyer.net' + match[1];
        const inner = match[2];
        const titleMatch = inner.match(/data-test="ad-card-title"[^>]*>([\s\S]*?)<\/span>/);
        const companyMatch = inner.match(/data-test="subtitle"[^>]*>([\s\S]*?)<\/span>/);
        const locMatch = inner.match(/data-test="location"[^>]*>([\s\S]*?)<\/span>/);
        const dateMatch = inner.match(/data-test="ad-date"[^>]*>([\s\S]*?)<\/span>/);

        if (titleMatch) {
          const title = titleMatch[1].replace(/<[^>]+>/g, '').trim();
          const company = companyMatch ? companyMatch[1].replace(/<[^>]+>/g, '').trim() : 'Kurumsal Şirket';
          const location = locMatch ? locMatch[1].replace(/<[^>]+>/g, '').trim() : 'Türkiye Geneli';
          const pubDate = dateMatch ? dateMatch[1].replace(/<[^>]+>/g, '').replace(/update/gi, '').trim() : 'Bugün';

          const isLocNationwide = location.includes('+') || 
                                  location.includes('Tümü') || 
                                  location.toLocaleLowerCase('tr-TR').includes('türkiye') ||
                                  location.toLocaleLowerCase('tr-TR').includes('turkiye') ||
                                  location.toLocaleLowerCase('tr-TR').includes('tüm') ||
                                  location === 'Türkiye' ||
                                  location === 'Türkiye Geneli';
          const finalCity = isLocNationwide ? 'Tüm İller' : location;

          // İl filtresi: Başka bir şehrin ilanını kullanıcıya gösterme
          if (isUserCityFilterActive && !isLocNationwide) {
            const normFinalCity = finalCity.toLocaleLowerCase('tr-TR').trim();
            if (normFinalCity !== normUserCity && !normFinalCity.includes(normUserCity)) {
              continue;
            }
          }

          jobs.push({
            id: 'knet-' + match[1].replace(/[^a-zA-Z0-9]/g, '-'),
            title,
            company,
            city: finalCity,
            isNationwide: isLocNationwide,
            sourceId: 'kariyernet',
            sourceName: 'Kariyer.net Doğrulanmış İlanı',
            sourceDomain: 'kariyer.net',
            isPublicSector: false,
            sourceBadgeColor: 'bg-purple-700',
            originalUrl: url,
            referenceCode: 'KNET-' + match[1].split('-').pop(),
            publishDate: pubDate,
            deadlineDate: 'Aktif İlan (Başvuruya Açık)',
            requiredEducation: ['Lise (Ortaöğretim)', 'Önlisans', 'Lisans'],
            allowedDepartments: [profession, 'Fark Etmez'],
            minAge: 18,
            maxAge: 55,
            quota: 1,
            requiresKpss: false,
            employmentType: 'Özel Sektör',
            description: `${company} bünyesinde ${location} lokasyonunda "${title}" pozisyonunda görevlendirilmek üzere personel aranmaktadır. İlana doğrudan başvurabilirsiniz.`,
            additionalRequirements: [
              'Kariyer.net üzerinden doğrudan başvuru yapılabilir',
              'Pozisyona uygun mesleki deneyim veya sertifika'
            ]
          });
        }
      }

      // Also fetch live active public & İŞKUR postings (?Expire=false guarantees active application period)
      // Uses windows-1254 (Turkish charset) decoding so characters like ü, İ, ş, ç, ğ, ö, ı are perfectly preserved!
      try {
        let memHtml = '';
        try {
          const memRes = await fetch('https://ilan.memurlar.net/kategori/daimi-isci-ilanlari/?Expire=false', {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
              'Accept-Language': 'tr-TR,tr;q=0.9'
            },
            signal: AbortSignal.timeout(6000)
          });
          const memBuf = await memRes.arrayBuffer();
          const decoder = new TextDecoder('windows-1254');
          memHtml = decoder.decode(memBuf);
        } catch {
          const memurlarCmd = `curl -s -L -A "Mozilla/5.0" --max-time 6 "https://ilan.memurlar.net/kategori/daimi-isci-ilanlari/?Expire=false"`;
          const memBuf = execSync(memurlarCmd);
          const decoder = new TextDecoder('windows-1254');
          memHtml = decoder.decode(memBuf);
        }

        const memRegex = /href="(\/ilan\/\d+\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
        let memMatch;
        let count = 0;
        const turkishMonths = '(?:Ocak|Şubat|Mart|Nisan|Mayıs|Haziran|Temmuz|Ağustos|Eylül|Ekim|Kasım|Aralık|[a-zA-ZçğıöşüÇĞİÖŞÜ]+)';
        const datePrefixRegex = new RegExp(`^(?:\\d{1,2}\\s+${turkishMonths}(?:\\s+\\d{4})?|\\d{1,2}:\\d{2})\\s+`, 'i');

        const CITIES = [
          'Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Amasya', 'Ankara', 'Antalya', 'Artvin', 'Aydın',
          'Balıkesir', 'Bilecik', 'Bingöl', 'Bitlis', 'Bolu', 'Burdur', 'Bursa', 'Çanakkale', 'Çankırı',
          'Çorum', 'Denizli', 'Diyarbakır', 'Edirne', 'Elazığ', 'Erzincan', 'Erzurum', 'Eskişehir',
          'Gaziantep', 'Giresun', 'Gümüşhane', 'Hakkari', 'Hatay', 'Isparta', 'Mersin', 'İstanbul',
          'İzmir', 'Kars', 'Kastamonu', 'Kayseri', 'Kırklareli', 'Kırşehir', 'Kocaeli', 'Konya',
          'Kütahya', 'Malatya', 'Manisa', 'Kahramanmaraş', 'Mardin', 'Muğla', 'Muş', 'Nevşehir',
          'Niğde', 'Ordu', 'Rize', 'Sakarya', 'Samsun', 'Siirt', 'Sinop', 'Sivas', 'Tekirdağ',
          'Tokat', 'Trabzon', 'Tunceli', 'Şanlıurfa', 'Uşak', 'Van', 'Yozgat', 'Zonguldak', 'Aksaray',
          'Bayburt', 'Karaman', 'Kırıkkale', 'Batman', 'Şırnak', 'Bartın', 'Ardahan', 'Iğdır', 'Yalova',
          'Karabük', 'Kilis', 'Osmaniye', 'Düzce'
        ];

        while ((memMatch = memRegex.exec(memHtml)) !== null && count < 8) {
          const itemUrl = 'https://ilan.memurlar.net' + memMatch[1];
          const rawText = memMatch[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
          if (rawText.length > 8) {
            const ilanId = memMatch[1].split('/')[2];
            
            // Extract publication date: e.g. "24 Eylül" -> "24 Eylül 2026"
            const dateMatch = rawText.match(new RegExp(`^(\\d{1,2}\\s+${turkishMonths}(?:\\s+\\d{4})?)`, 'i'));
            const pubDate = dateMatch ? (dateMatch[1].includes('202') ? dateMatch[1] : `${dateMatch[1]} 2026`) : 'Aktif İlan';

            // Clean title text from date prefixes with full Turkish character support
            const cleanTitle = rawText.replace(datePrefixRegex, '').trim();

            // Extract employer / company name intelligently:
            // "Mersin Tarsus İmar 3 İşçi Alacak" -> "Mersin Tarsus İmar"
            // "Tekirdağ Saraykent Turizm Geçici 5 İşçi Alacak" -> "Tekirdağ Saraykent Turizm Geçici"
            // "Çanakkale GÖK-AŞ 2 İşçi Alacak" -> "Çanakkale GÖK-AŞ"
            const companyMatch = cleanTitle.match(/^(.*?)(?:\s+\d+\s+|\s+,\s*\d+\s+|,|\s+Öğretim|\s+Personel|\s+Memur)/i);
            const companyGuess = companyMatch && companyMatch[1].trim().length > 3
              ? companyMatch[1].replace(/,$/, '').trim()
              : cleanTitle.split(' ').slice(0, 3).join(' ') || 'Kamu Kurumu';

            // Detect city from title if possible
            const matchedCity = CITIES.find(c => 
              cleanTitle.toLocaleLowerCase('tr-TR').startsWith(c.toLocaleLowerCase('tr-TR')) ||
              cleanTitle.toLocaleLowerCase('tr-TR').includes(` ${c.toLocaleLowerCase('tr-TR')} `)
            );
            const isLocalOrg = cleanTitle.toLocaleLowerCase('tr-TR').includes('belediye') || 
                               cleanTitle.toLocaleLowerCase('tr-TR').includes('sydv') ||
                               cleanTitle.toLocaleLowerCase('tr-TR').includes('kaymakam') ||
                               cleanTitle.toLocaleLowerCase('tr-TR').includes('valilik') ||
                               cleanTitle.toLocaleLowerCase('tr-TR').includes('universite') ||
                               cleanTitle.toLocaleLowerCase('tr-TR').includes('üniversite');

            const isNationwide = !isLocalOrg && (
                                 !matchedCity || 
                                 cleanTitle.toLocaleLowerCase('tr-TR').includes('tüm') || 
                                 cleanTitle.toLocaleLowerCase('tr-TR').includes('türkiye') ||
                                 cleanTitle.toLocaleLowerCase('tr-TR').includes('bakanlık') ||
                                 cleanTitle.toLocaleLowerCase('tr-TR').includes('bakanlik') ||
                                 cleanTitle.toLocaleLowerCase('tr-TR').includes('kurumu genel') ||
                                 cleanTitle.toLocaleLowerCase('tr-TR').includes('bankasi') ||
                                 cleanTitle.toLocaleLowerCase('tr-TR').includes('bankası') ||
                                 cleanTitle.toLocaleLowerCase('tr-TR').includes('tubitak') ||
                                 cleanTitle.toLocaleLowerCase('tr-TR').includes('tübitak')
            );
            const jobCity = isNationwide ? 'Tüm İller' : (matchedCity || 'Yerel İdare');

            // İl filtresi: Eğer kullanıcı belirli bir il seçtiyse, başka illerin yerel kamu ilanlarını ele
            if (isUserCityFilterActive) {
              if (isLocalOrg && (!matchedCity || (matchedCity.toLocaleLowerCase('tr-TR') !== normUserCity && !matchedCity.toLocaleLowerCase('tr-TR').includes(normUserCity)))) {
                continue;
              }
              if (!isNationwide) {
                const normJobCity = (jobCity || '').toLocaleLowerCase('tr-TR').trim();
                if (normJobCity !== normUserCity && !normJobCity.includes(normUserCity)) {
                  continue;
                }
              }
            }

            // Extract quota if present: e.g. "3 İşçi Alacak" -> 3
            const quotaMatch = cleanTitle.match(/(\d+)\s+(?:İşçi|Personel|Zabıta|Memur|Sözleşmeli|Tekniker)/i);
            const quota = quotaMatch ? parseInt(quotaMatch[1], 10) : 2;

            jobs.push({
              id: 'memurlar-live-' + ilanId,
              title: cleanTitle.slice(0, 100),
              company: companyGuess,
              city: jobCity,
              isNationwide: isNationwide,
              sourceId: 'memurlar_net',
              sourceName: 'Memurlar.net İlan Haberi',
              sourceDomain: 'memurlar.net',
              isPublicSector: false,
              sourceBadgeColor: 'bg-amber-600',
              originalUrl: itemUrl,
              referenceCode: 'MEMURLAR-HABER-' + ilanId,
              publishDate: pubDate,
              deadlineDate: 'Aktif İlan (Başvuruya Açık)',
              requiredEducation: ['Lise (Ortaöğretim)', 'Önlisans', 'Lisans'],
              allowedDepartments: [profession, 'Fark Etmez'],
              minAge: 18,
              maxAge: 45,
              quota,
              requiresKpss: false,
              employmentType: 'Kamu Sürekli İşçi',
              description: `${cleanTitle}. İŞKUR üzerinden yayımlanan resmi kamu sürekli işçi alım duyurusudur. Sayfa doğrudan resmi tebliğ ve başvuru şartlarını açar.`,
              additionalRequirements: [
                'İŞKUR üzerinden doğrudan elektronik başvuru yapılabilir',
                'Genel kamu sürekli işçi şartlarını taşımak'
              ]
            });
            count++;
          }
        }
      } catch {}

      // Title or URL keyword match priority with Turkish locale support
      const pLower = profession.toLocaleLowerCase('tr-TR');
      jobs.sort((a, b) => {
        const aHas = a.title.toLocaleLowerCase('tr-TR').includes(pLower) || a.originalUrl.toLowerCase().includes(pLower) ? 1 : 0;
        const bHas = b.title.toLocaleLowerCase('tr-TR').includes(pLower) || b.originalUrl.toLowerCase().includes(pLower) ? 1 : 0;
        return bHas - aHas;
      });

      // CANLI DOĞRULAMA FİLTRESİ:
      // Süresi dolmuş veya "başvuru süresi sonra ermiştir" uyarısı veren ilanları sonuçlardan ayıkla
      const verifiedJobs: any[] = [];
      const uniqueJobs = Array.from(
        new Map(jobs.map(job => [job.originalUrl, job])).values()
      );

      const verificationResults = await mapWithConcurrency(uniqueJobs, async (job) => {
        try {
          const check = await checkSingleUrl(job.originalUrl);
          return !check.isExpired && !check.is404 && check.status === 'active';
        } catch {
          // If check threw an error, keep job only if not an expired url
          return !job.originalUrl.includes('404') && !job.originalUrl.includes('suresi-dolmus');
        }
      });

      uniqueJobs.forEach((job, index) => {
        if (verificationResults[index]) {
          verifiedJobs.push(job);
        }
      });

      liveSearchCache.set(liveSearchCacheKey, { jobs: verifiedJobs, timestamp: Date.now() });
      while (liveSearchCache.size > LIVE_SEARCH_CACHE_LIMIT) {
        const oldestKey = liveSearchCache.keys().next().value;
        if (!oldestKey) break;
        liveSearchCache.delete(oldestKey);
      }

      return res.json({ jobs: verifiedJobs });
    } catch (err: any) {
      return res.json({ jobs: [] });
    }
  });

  // Toplu İlan Canlı Doğrulama ve Filtreleme Endpoint'i
  // Kullanıcının listesindeki ilanların sayfalarının gerçekten yayında olup olmadığını kontrol eder
  app.post('/api/verify-and-filter-jobs', async (req: Request, res: Response) => {
    const { jobs } = req.body;
    if (!Array.isArray(jobs)) {
      return res.status(400).json({ error: 'jobs array is required' });
    }

    const checkLimit = jobs.slice(0, 30);
    const checks = await mapWithConcurrency(
      checkLimit,
      async (job: any) => {
        const url = job.originalUrl || '';
        const checkResult = await checkSingleUrl(url);
        return {
          jobId: job.id,
          url,
          checkResult,
          isLiveAndActive: !checkResult.isExpired && !checkResult.is404 && checkResult.status === 'active'
        };
      }
    );

    const activeJobIds = new Set(checks.filter(c => c.isLiveAndActive).map(c => c.jobId));
    const expiredJobIds = checks.filter(c => !c.isLiveAndActive).map(c => c.jobId);
    const verifiedJobs = checkLimit.filter((j: any) => activeJobIds.has(j.id));

    return res.json({
      verifiedJobs,
      expiredJobIds,
      checks,
      totalChecked: checkLimit.length,
      activeCount: verifiedJobs.length,
      expiredCount: expiredJobIds.length
    });
  });

  // Batch URLs verification endpoint
  app.post('/api/verify-urls', async (req: Request, res: Response) => {
    const { urls } = req.body;
    if (!Array.isArray(urls)) {
      return res.status(400).json({ error: 'urls array is required in request body' });
    }

    // Limit batch size to 25 to prevent abuse
    const limitedUrls = Array.from(new Set(urls.slice(0, 25)));
    const results = await mapWithConcurrency(
      limitedUrls,
      url => checkSingleUrl(url)
    );

    return res.json({ results });
  });

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Google Play Store TWA Digital Asset Links endpoint
  app.get('/.well-known/assetlinks.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    const assetlinksPath = path.resolve(__dirname, 'public', '.well-known', 'assetlinks.json');
    if (fs.existsSync(assetlinksPath)) {
      res.sendFile(assetlinksPath);
    } else {
      res.json([]);
    }
  });

  // Dedicated Privacy Policy route for Google Play Store Console compliance
  app.get('/privacy', (_req, res) => {
    res.redirect('/?tab=privacy');
  });

  // Mount Vite middleware in development or serve static in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(Number(port), '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
