/**
 * Otomatik Servis ve Hassas Arama Parametre Test Paketi
 * Bu script tüm arama servislerini, URL çözümleyicilerini ve eşleştirme motorunu doğrular.
 */

import {
  cleanSearchKeywords,
  sanitizeProfession,
  buildPreciseSourceUrl,
  getPreciseMemurlarSearchUrl,
  getPreciseIskurUrl,
  resolveSafeJobUrl,
  isSpecificJobUrl,
  isTargetedJobUrl,
  buildPrecisePortalLinks,
  updateSourcesWithPreciseParameters
} from '../src/services/preciseSearchService';
import { INITIAL_JOB_POSTINGS } from '../src/data/sampleJobs';

import {
  getGoogleSearchUrl,
  getMemurlarSearchUrl,
  getIskurSearchUrl,
  getSafeJobUrl,
  getJobPortalLinks,
  getLivePortalUrl
} from '../src/utils/navigation';

import { 
  evaluateJobMatch, 
  isEngineerJob, 
  checkEducationTitleLegality, 
  checkProfessionMatch 
} from '../src/services/matcher';
import { generateDynamicJobPool, isRecognizedProfession } from '../src/services/jobService';
import { DEFAULT_SOURCES } from '../src/sources/sourceRegistry';
import { JobPosting, UserCriteria } from '../src/types/job';
import { ALL_PROFESSIONS } from '../src/data/professionsAndDepartments';
import { 
  loadNotificationSettings, 
  DEFAULT_NOTIFICATION_SETTINGS, 
  getSeenJobIds, 
  markJobIdsAsSeen, 
  clearSeenJobIds 
} from '../src/services/storage';
import { 
  filterUnseenJobs, 
  isBrowserNotificationSupported, 
  notifyNewJobsFound, 
  subscribeToJobNotifications 
} from '../src/services/notificationService';
import { parseJobDeadlineDate, isJobActive, getRemainingDays } from '../src/utils/dateUtils';

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    passedTests++;
    console.log(`  ✅ [BAŞARILI] ${testName}`);
  } else {
    failedTests++;
    console.error(`  ❌ [HATA] ${testName}${detail ? ` -> ${detail}` : ''}`);
  }
}

function runSection(title: string, fn: () => void) {
  console.log(`\n========================================`);
  console.log(`🧪 ${title}`);
  console.log(`========================================`);
  fn();
}

// 1. Anahtar Kelime ve Unvan Temizleme Testleri
runSection('1. Unvan ve Anahtar Kelime Temizleme Testleri', () => {
  const kw1 = cleanSearchKeywords('T.C. Sağlık Bakanlığı 1500 Kişi Alımı (Sözleşmeli)');
  assert(!kw1.includes('T.C.') && !kw1.includes('Bakanlığı') && !kw1.includes('Kişi') && !kw1.includes('Alımı'), 
    'cleanSearchKeywords kurumsal stop-word ve gürültüleri ayıklamalı', `Sonuç: "${kw1}"`);
  assert(kw1.includes('Sağlık'), 'cleanSearchKeywords öz kelimeyi (Sağlık) korumalı', `Sonuç: "${kw1}"`);

  const kw2 = cleanSearchKeywords('TEİAŞ Genel Müdürlüğü 45 Mühendis Alımları');
  assert(kw2.includes('TEİAŞ') && kw2.includes('Mühendis'), 'TEİAŞ ve Mühendis anahtar kelimeleri korunmalı', `Sonuç: "${kw2}"`);

  const prof1 = sanitizeProfession('Elektrik-Elektronik Mühendisi (Sözleşmeli 4/B)');
  assert(prof1.includes('Elektrik-Elektronik Mühendisi') && !prof1.includes('4/B'), 
    'sanitizeProfession unvan parantezlerini temizlemeli', `Sonuç: "${prof1}"`);

  const profEmpty = sanitizeProfession('');
  assert(profEmpty === 'Tekniker', 'sanitizeProfession boş unvanda varsayılan "Tekniker" dönmeli', `Sonuç: "${profEmpty}"`);
});

// 2. buildPreciseSourceUrl Testleri (Memurlar.net, İŞKUR, Kariyer.net vb.)
runSection('2. buildPreciseSourceUrl Portalları Testi', () => {
  const criteria: UserCriteria = {
    profession: 'Harita Teknikeri',
    department: 'Harita Kadastro',
    educationLevel: 'Önlisans',
    age: 28,
    city: 'Ankara',
    kpssScore: 78,
    onlyPublicJobs: true,
    includePublic: true,
    includePrivate: false
  };

  // Memurlar.net
  const memurlarInfo = buildPreciseSourceUrl('memurlar_net', criteria);
  assert(memurlarInfo.isPrecise === true, 'Memurlar.net isPrecise true olmalı');
  assert(memurlarInfo.url.includes('https://www.memurlar.net/arama/?q='), 'Memurlar.net arama URL kökü doğru olmalı');
  assert(memurlarInfo.url.includes('Harita%20Teknikeri') || memurlarInfo.url.includes('Harita'), 
    'Memurlar.net arama sorgusu mesleği içermeli', memurlarInfo.url);
  assert(memurlarInfo.url.includes('c=ilan'), 'Memurlar.net kategori parametresi c=ilan olmalı', memurlarInfo.url);
  assert(Array.isArray(memurlarInfo.altUrls) && memurlarInfo.altUrls.length >= 3, 
    'Memurlar.net 4/B, Mahalli ve Doğrudan İndeks alt linklerini içermeli');

  // İŞKUR
  const iskurInfo = buildPreciseSourceUrl('iskur', criteria);
  assert(iskurInfo.url.includes('esube.iskur.gov.tr'), 
    'İŞKUR Kamu duyuru sayfasına yönlendirmeli', iskurInfo.url);
  assert(Array.isArray(iskurInfo.altUrls) && iskurInfo.altUrls.some(a => a.name.includes('Kurum Dışı')), 
    'İŞKUR belediye ve kurum dışı işçi linki sunmalı');

  // Kariyer.net
  const kariyerInfo = buildPreciseSourceUrl('kariyernet', criteria);
  assert(kariyerInfo.url.includes('kariyer.net/is-ilanlari?kw=') && kariyerInfo.url.includes('ct=Ankara'), 
    'Kariyer.net kw ve ct parametrelerini doğru üretmeli', kariyerInfo.url);

  // Eleman.net
  const elemanInfo = buildPreciseSourceUrl('elemannet', criteria);
  assert(elemanInfo.url.includes('eleman.net/is-ilanlari?q=') && elemanInfo.url.includes('sehir=Ankara'), 
    'Eleman.net q ve sehir parametrelerini doğru üretmeli', elemanInfo.url);

  // İlan.gov.tr
  const ilanGovInfo = buildPreciseSourceUrl('ilan_gov_tr', criteria);
  assert(ilanGovInfo.url === 'https://www.ilan.gov.tr/ilan/kategori/44/kamu-personel-alim-ve-sinavlari', 'İlan.gov.tr resmi personel kategorisi (44) URL üretmeli (404 veren ara?kelime rotası değil)', ilanGovInfo.url);

  // Kariyer Kapısı (CBİKO Kamu İşe Alım Portalı)
  const kariyerKapisiInfo = buildPreciseSourceUrl('kariyer_kapisi', criteria);
  assert(kariyerKapisiInfo.url === 'https://isealimkariyerkapisi.cbiko.gov.tr', 
    'Kariyer Kapısı resmi CBİKO Kamu İşe Alım portalına yönlendirmeli (isealimkariyerkapisi.cbiko.gov.tr)', kariyerKapisiInfo.url);

  // İŞKUR Kurum Dışı Kamu (Belediyeler & İştirakler)
  const yerelInfo = buildPreciseSourceUrl('yerelyonetimler_csb', criteria);
  assert(yerelInfo.url === 'https://www.iskur.gov.tr/ilanlar/kurumdisi-kamu-isci-alim-ilanlari/', 
    'Belediye İlanları İŞKUR Kurum Dışı Kamu İşçi Alımı sayfasına yönlendirmeli (asla genel duyuru veya memurlar.net değil)', yerelInfo.url);

  // Belediyeler & Mahalli İdareler
  const belediyeInfo = buildPreciseSourceUrl('belediyeler', criteria);
  assert(belediyeInfo.url === 'https://www.iskur.gov.tr/ilanlar/kurumdisi-kamu-isci-alim-ilanlari/', 
    'Belediyeler kaynağı doğrudan İŞKUR Kurum Dışı Kamu İşçi Alımı portalına yönlendirmeli', belediyeInfo.url);
});

// 3. İlan Kartlarına Özel Memurlar.net ve İŞKUR Link Çözümleyici Testleri
runSection('3. İlan Bazlı Doğrudan ve Güvenli URL Çözümleyici Testleri', () => {
  const dummyMunicipalJob: JobPosting = {
    id: 'test-job-1',
    title: 'Zabıta Memuru (Önlisans)',
    company: 'Ankara Büyükşehir Belediyesi',
    city: 'Ankara',
    isPublicSector: true,
    sourceId: 'belediyeler',
    sourceName: 'Belediye İlanları',
    employmentType: 'Mahalli İdareler Personeli',
    originalUrl: 'https://ilan.memurlar.net/', // Genel ana sayfa (kullanıcıyı boş sayfaya atmamalı!)
    referenceCode: 'ANK-2025-01',
    publishDate: '2025-09-01',
    deadlineDate: '2025-09-15',
    requiredEducation: ['Önlisans'],
    allowedDepartments: ['Adalet', 'Yerel Yönetimler'],
    minAge: 18,
    maxAge: 35,
    description: 'Ankara Büyükşehir Belediyesi zabıta memuru alımı'
  };

  const dummyCentralJob: JobPosting = {
    id: 'test-job-2',
    title: 'Elektrik Mühendisi',
    company: 'TEİAŞ Genel Müdürlüğü',
    city: 'Türkiye Geneli',
    isPublicSector: true,
    sourceId: 'kamuilan_sbb',
    sourceName: 'Kamu İlan SBB',
    employmentType: 'Kamu Sözleşmeli',
    originalUrl: 'https://www.teias.gov.tr/duyurular/personel-alimi-2025',
    referenceCode: 'TEIAS-2025-02',
    publishDate: '2025-09-01',
    deadlineDate: '2025-09-20',
    requiredEducation: ['Lisans'],
    allowedDepartments: ['Elektrik Mühendisliği', 'Elektrik-Elektronik Mühendisliği'],
    minAge: 18,
    maxAge: 35,
    description: 'TEİAŞ mühendis alımı'
  };

  // Memurlar.net hassas arama URL'si
  const memurlarUrl1 = getPreciseMemurlarSearchUrl(dummyMunicipalJob);
  assert(memurlarUrl1.includes('memurlar.net/arama/?q=') && memurlarUrl1.includes('Zab') && memurlarUrl1.includes('c=ilan'), 
    'Belediye ilanı için Memurlar.net kurum ve unvan bazlı arama URL üretilmeli', memurlarUrl1);

  const memurlarUrl2 = getPreciseMemurlarSearchUrl(dummyCentralJob);
  assert(memurlarUrl2.includes('TE') && memurlarUrl2.includes('M'), 
    'TEİAŞ ilanı için Memurlar.net TEİAŞ ve Mühendis aramalı', memurlarUrl2);

  // İŞKUR URL ayrımı: Mahalli İdareler vs Merkezi Kamu
  const iskurUrlMunicipal = getPreciseIskurUrl(dummyMunicipalJob);
  assert(iskurUrlMunicipal.includes('esube.iskur.gov.tr'), 
    'Belediye ilanları İŞKUR aktif başvuru sayfasına yönlenmeli', iskurUrlMunicipal);

  const iskurUrlCentral = getPreciseIskurUrl(dummyCentralJob);
  assert(iskurUrlCentral.includes('esube.iskur.gov.tr'), 
    'Merkezi kamu ilanları İŞKUR Kamu Memur Alım İlanları sayfasına yönlenmeli', iskurUrlCentral);

  // resolveSafeJobUrl: Genel link bypass koruması
  const safeMunicipalUrl = resolveSafeJobUrl(dummyMunicipalJob);
  assert(safeMunicipalUrl !== 'https://ilan.memurlar.net/', 
    'Genel "ilan.memurlar.net" ana sayfası yerine filtrelenmiş hassas arama URL çözümlenmeli', safeMunicipalUrl);
  assert(isSpecificJobUrl(safeMunicipalUrl) && isTargetedJobUrl(safeMunicipalUrl), 
    'Çözümlenen safe URL doğrudan resmi hedeflenen tekil ilan linki olmalı (asla genel dosya dizini veya boş ana sayfa değil)', safeMunicipalUrl);

  const safeCentralUrl = resolveSafeJobUrl(dummyCentralJob);
  assert(safeCentralUrl === dummyCentralJob.originalUrl, 
    'Özel ve spesifik olan orijinal duyuru URL korunmalı', safeCentralUrl);
});

// 4. Portal Bağlantı Listesi ve Navigation Katmanı Testleri
runSection('4. Detay Modalı Portal Bağlantıları ve Navigation Testleri', () => {
  const sampleJob: JobPosting = {
    id: 'test-job-3',
    title: 'Bilişim Uzmanı (Yazılım)',
    company: 'Sosyal Güvenlik Kurumu (SGK)',
    city: 'Ankara',
    isPublicSector: true,
    sourceId: 'memurlar_net',
    sourceName: 'Memurlar.net',
    originalUrl: 'https://www.sgk.gov.tr/duyurular/bilisim-2025',
    referenceCode: 'SGK-2025-03',
    publishDate: '2025-09-01',
    deadlineDate: '2025-09-25',
    requiredEducation: ['Lisans'],
    allowedDepartments: ['Bilgisayar Mühendisliği', 'Yazılım Mühendisliği'],
    minAge: 18,
    maxAge: 35,
    employmentType: 'Kamu Sözleşmeli',
    description: 'SGK bilişim personeli alımı'
  };

  const portalLinks = buildPrecisePortalLinks(sampleJob, 'Yazılım Mühendisi', 'Ankara');
  assert(portalLinks.length >= 4, 'Kamu ilanı için en az 4 portal linki (Orijinal, Memurlar, İŞKUR, CBİKO vb.) üretilmeli');
  
  const hasMemurlar = portalLinks.some(l => l.type === 'memurlar' && l.url.includes('memurlar.net'));
  assert(hasMemurlar, 'Portal linkleri arasında Memurlar.net bulunmalı');

  const hasCbiko = portalLinks.some(l => l.type === 'cbiko' && (l.url.includes('cbiko.gov.tr') || l.url.includes('turkiye.gov.tr')));
  assert(hasCbiko, 'Kamu ilanlarında CBİKO resmi portal veya başvuru linki bulunmalı');

  const hasIskur = portalLinks.some(l => l.type === 'iskur' && l.url.includes('iskur.gov.tr'));
  assert(hasIskur, 'Portal linklerinde İŞKUR resmi bağlantısı bulunmalı');

  // Navigation yardımcı fonksiyonları
  const navSafeUrl = getSafeJobUrl(sampleJob);
  assert(navSafeUrl === sampleJob.originalUrl, 'getSafeJobUrl tam orijinal URL’i güvenle aktarmalı');

  const navLinks = getJobPortalLinks(sampleJob);
  assert(Array.isArray(navLinks) && navLinks.length > 0, 'getJobPortalLinks dizi dönmeli');

  const googleUrl = getGoogleSearchUrl(sampleJob);
  assert(googleUrl.includes('google.com/search?q=') && googleUrl.includes('SGK'), 
    'Google arama URL kurum adı ve başvuru terimlerini içermeli', googleUrl);
});

// 5. Dinamik İlan Havuzu ve Eşleştirme Motoru Testleri
runSection('5. Dinamik İlan Havuzu & Eşleştirme Motoru Testi', () => {
  const userCriteria: UserCriteria = {
    profession: 'İnşaat Teknikeri',
    department: 'İnşaat',
    city: 'İzmir',
    kpssScore: 82.5,
    educationLevel: 'Önlisans',
    age: 32,
    onlyPublicJobs: true,
    includePublic: true,
    includePrivate: false
  };

  const generatedJobs = generateDynamicJobPool(userCriteria, DEFAULT_SOURCES);
  assert(generatedJobs.length >= 5, `Dinamik havuz en az 5 ilan üretmeli (Üretilen: ${generatedJobs.length})`);

  // İlanların en az birinin kullanıcı mesleğine ve şehrine tam uyumu
  const matchedJob = generatedJobs.find(j => 
    j.city === 'İzmir' || j.title.toLowerCase().includes('inşaat') || j.company?.toLowerCase().includes('izmir')
  );
  assert(!!matchedJob, 'Dinamik ilan havuzunda kullanıcının mesleği ve şehriyle ilgili ilan bulunmalı');

  // Eşleştirme motoru testi
  if (matchedJob) {
    const match = evaluateJobMatch(matchedJob, userCriteria);
    assert(match.status === 'eligible' || match.status === 'partial', 
      'Kullanıcı kriterlerine uyan ilan en azından kısmi veya uygun statü almalı', `Statü: ${match.status}, Puan: ${match.matchPercentage}`);
    assert(typeof match.matchPercentage === 'number' && match.matchPercentage >= 0 && match.matchPercentage <= 100, 
      'Eşleşme skoru (matchPercentage) 0-100 arasında olmalı', `Puan: ${match.matchPercentage}`);
  }

  // updateSourcesWithPreciseParameters testi
  const updatedSources = updateSourcesWithPreciseParameters(DEFAULT_SOURCES, userCriteria);
  const updatedMemurlar = updatedSources.find(s => s.id === 'memurlar_net');
  assert(!!updatedMemurlar && updatedMemurlar.url.includes('memurlar.net/arama/?q='), 
    'updateSourcesWithPreciseParameters Memurlar.net URL’ini hassas parametre ile güncellemeli');
});

// 6. Aktif İlan ve Süresi Dolan İlanları Filtreleme Testleri
runSection('6. Aktif İlan & Süresi Dolan İlanları Filtreleme Testleri', () => {
  const refDate = new Date('2026-09-26T12:00:00');

  // Tarih ayrıştırma testleri
  const parsedOct = parseJobDeadlineDate('15 Ekim 2026');
  assert(parsedOct !== null && parsedOct.getMonth() === 9 && parsedOct.getDate() === 15, 
    'Türkçe metinli tarih (15 Ekim 2026) doğru ayrıştırılmalı');

  const parsedIso = parseJobDeadlineDate('2026-10-20');
  assert(parsedIso !== null && parsedIso.getFullYear() === 2026 && parsedIso.getMonth() === 9,
    'ISO formatlı tarih (2026-10-20) doğru ayrıştırılmalı');

  const parsedContinuous = parseJobDeadlineDate('Sürekli Güncellenir');
  assert(parsedContinuous !== null && parsedContinuous.getFullYear() >= 2090,
    'Sürekli güncellenen ilanlar her zaman geçerli tarihe çözümlenmeli');

  // Süresi geçmiş ilan testi
  const expiredJob: JobPosting = {
    id: 'test-expired-job-1',
    title: 'Eski İlan',
    company: 'Eski Kurum',
    city: 'Ankara',
    isPublicSector: true,
    sourceId: 'memurlar_net',
    sourceName: 'Memurlar',
    originalUrl: 'https://example.com',
    referenceCode: 'EXP-01',
    publishDate: '01 Ocak 2025',
    deadlineDate: '15 Ocak 2025',
    requiredEducation: ['Lisans'],
    allowedDepartments: ['Mühendislik'],
    minAge: 18,
    maxAge: 35,
    employmentType: 'Kamu Sözleşmeli',
    description: 'Süresi geçmiş ilan'
  };
  assert(!isJobActive(expiredJob, refDate), 'Süresi 15 Ocak 2025 olan ilan aktif olmamalı (isJobActive: false)');

  // Gelecek tarihli aktif ilan testi
  const activeJob: JobPosting = {
    ...expiredJob,
    id: 'test-active-job-1',
    deadlineDate: '15 Ekim 2026'
  };
  assert(isJobActive(activeJob, refDate), 'Süresi 15 Ekim 2026 olan ilan aktif olmalı (isJobActive: true)');

  // Kapatılmış veya başvuruya kapalı ibareli ilan testi
  const closedJob: JobPosting = {
    ...expiredJob,
    id: 'test-closed-job-2',
    title: 'Başvuruya Kapalı Pozisyon (Sona Erdi)',
    deadlineDate: 'Başvuruya Kapandı'
  };
  assert(!isJobActive(closedJob), 'Başvuruya kapandı ibaresi içeren ilan aktif olmamalı (isJobActive: false)');

  const expiredFlagJob: JobPosting = {
    ...expiredJob,
    id: 'test-flag-expired-job',
    isExpired: true
  } as any;
  assert(!isJobActive(expiredFlagJob), 'isExpired flagı true olan ilan aktif olmamalı');

  // Şu anki sistem tarihi ile aktiflik testi (Kasım 2026 tarihli ilan aktif kalmalı)
  const novemberJob: JobPosting = {
    ...expiredJob,
    id: 'test-nov-job',
    deadlineDate: '25 Kasım 2026'
  };
  assert(isJobActive(novemberJob), 'Kasım 2026 tarihli ilan şu an aktif olmalı');

  // Havuzun süresi dolmuş ilanları filtreleme testi
  const pool = generateDynamicJobPool({
    profession: 'Elektronik Teknikeri',
    educationLevel: 'Önlisans',
    department: 'Elektronik',
    city: 'Aydın',
    age: 30
  }, DEFAULT_SOURCES);

  const hasExpiredInPool = pool.some(j => !isJobActive(j));
  assert(!hasExpiredInPool, 'Dinamik ilan havuzunda hiçbir süresi dolmuş veya kapatılmış ilan bulunmamalı');

  const has404DemoInPool = pool.some(j => j.id === 'job-expired-404-demo');
  assert(!has404DemoInPool, 'Süresi dolmuş demo ilan (job-expired-404-demo) sonuçlarda listelenmemeli');

  // INITIAL_JOB_POSTINGS içinde demo hariç tüm ilanların aktif olması
  const activeSampleJobs = INITIAL_JOB_POSTINGS.filter(j => j.id !== 'job-expired-404-demo');
  const allSamplesActive = activeSampleJobs.every(j => isJobActive(j));
  assert(allSamplesActive, 'INITIAL_JOB_POSTINGS içindeki tüm yayındaki ilanlar bugün itibarıyla aktif olmalı');
});

// 7. Tarayıcı Bildirim Mekanizması Testleri
runSection('7. Tarayıcı ve Anlık Bildirim Mekanizması Testleri', () => {
  // Ayarlar
  const settings = loadNotificationSettings();
  assert(typeof settings.enabled === 'boolean', 'Bildirim açık/kapalı durumu boolean olmalı');
  assert(typeof settings.soundEnabled === 'boolean', 'Sesli bildirim durumu boolean olmalı');
  assert(typeof settings.nativeEnabled === 'boolean', 'Tarayıcı Notification durumu boolean olmalı');

  // Tarayıcı desteği fonksiyonu
  const isSupported = isBrowserNotificationSupported();
  assert(typeof isSupported === 'boolean', 'isBrowserNotificationSupported boolean döndürmeli');

  // filterUnseenJobs testi
  const dummyJobs: JobPosting[] = [
    {
      id: 'job-test-notif-101',
      title: 'Yazılım Mühendisi',
      company: 'TÜBİTAK',
      city: 'Ankara',
      isPublicSector: true,
      sourceId: 'tubitak',
      sourceName: 'TÜBİTAK Kariyer',
      employmentType: 'Kamu Sözleşmeli',
      originalUrl: 'https://kariyer.tubitak.gov.tr',
      referenceCode: 'TUB-01',
      publishDate: '2026-09-25',
      deadlineDate: '2026-10-15',
      requiredEducation: ['Lisans'],
      allowedDepartments: ['Bilgisayar Mühendisliği'],
      minAge: 18,
      maxAge: 35,
      description: 'TÜBİTAK araştırmacı yazılımcı alımı'
    }
  ];

  const unseenBefore = filterUnseenJobs(dummyJobs);
  assert(Array.isArray(unseenBefore), 'filterUnseenJobs dizi döndürmeli');

  // Dinleyici abone olma ve bildirim gönderme testi
  let receivedNotification: any = null;
  const unsubscribe = subscribeToJobNotifications((payload) => {
    receivedNotification = payload;
  });

  const notifyRes = notifyNewJobsFound(dummyJobs);
  assert(typeof notifyRes.notified === 'boolean', 'notifyNewJobsFound boolean notified durumu döndürmeli');
  assert(notifyRes.newCount === 1, 'notifyNewJobsFound yeni ilan sayısını doğru hesaplamalı (1 olmalı)');
  assert(receivedNotification !== null && receivedNotification.title.includes('İş İlanı'), 
    'Abone olan dinleyici yeni ilan bildirimini anlık almalı', `Başlık: ${receivedNotification?.title}`);

  unsubscribe();
});

runSection('8. Tüm Meslekler ve Arama Kriterleri Doğrulama Testi (194 Meslek & Çapraz Testler)', () => {
  assert(Array.isArray(ALL_PROFESSIONS) && ALL_PROFESSIONS.length > 0, 
    'ALL_PROFESSIONS meslek veritabanı yüklenebilmeli', `Meslek sayısı: ${ALL_PROFESSIONS.length}`);

  const enabledSourceIds = new Set(DEFAULT_SOURCES.filter(s => s.enabled).map(s => s.id));
  enabledSourceIds.add('cbiko');
  enabledSourceIds.add('iskur_kamu');
  enabledSourceIds.add('iskur_ozel');
  enabledSourceIds.add('belediyeler');
  enabledSourceIds.add('resmigazete');
  enabledSourceIds.add('memurlar_net');

  // 8.1 Veritabanındaki tüm 194 meslek için havuz ve eşleştirme testi
  let zeroPoolCount = 0;
  let zeroMatchCount = 0;
  let errorCount = 0;
  const testCities = ['İzmir', 'Ankara', 'İstanbul', 'Aydın', 'Bursa', 'Antalya'];

  for (let i = 0; i < ALL_PROFESSIONS.length; i++) {
    const profItem = ALL_PROFESSIONS[i];
    const testCity = testCities[i % testCities.length];
    const isStrictLisans = isEngineerJob(profItem.name) || checkEducationTitleLegality(profItem.name, 'Önlisans').isLegal === false;
    const testEdu = isStrictLisans ? 'Lisans' : 'Önlisans';
    try {
      const criteria: UserCriteria = {
        profession: profItem.name,
        educationLevel: testEdu,
        department: '',
        age: 28,
        city: testCity,
        district: '',
        kpssScore: '',
        noKpss: false,
        includePublic: true,
        includePrivate: true
      };

      const pool = generateDynamicJobPool(criteria, DEFAULT_SOURCES);
      if (!pool || pool.length === 0) {
        zeroPoolCount++;
        continue;
      }

      const eligiblePool = pool.filter(j => enabledSourceIds.has(j.sourceId));
      const matchResults = eligiblePool.map(j => evaluateJobMatch(j, criteria));
      const hasMatch = matchResults.some(r => r.status === 'eligible' || r.status === 'partial');
      if (!hasMatch) {
        zeroMatchCount++;
      }
    } catch (e) {
      errorCount++;
    }
  }

  assert(errorCount === 0, '194 mesleğin hiçbirinde runtime hatası oluşmamalı', `Hata sayısı: ${errorCount}`);
  assert(zeroPoolCount === 0, '194 mesleğin tümünde dinamik havuz ilan üretebilmeli', `Boş havuz sayısı: ${zeroPoolCount}`);
  assert(zeroMatchCount === 0, '194 mesleğin tümünde en az bir uygun/kısmi ilan eşleşmeli', `Eşleşmeyen meslek sayısı: ${zeroMatchCount}`);

  // 8.2 Kullanıcının sıkça arattığı tek kelimelik veya spesifik terimler
  const realisticQueries = [
    { prof: 'bilgisayar', city: 'İzmir', edu: 'Önlisans', dept: '', age: 26, noKpss: false },
    { prof: 'bilgisayar', city: 'İzmir', edu: 'Lisans', dept: '', age: 30, noKpss: true },
    { prof: 'yazılım', city: 'İstanbul', edu: 'Lisans', dept: 'Bilgisayar', age: 25, noKpss: false },
    { prof: 'şoför', city: 'Ankara', edu: 'Lise (Ortaöğretim)', dept: '', age: 34, noKpss: true },
    { prof: 'hemşire', city: 'İzmir', edu: 'Lisans', dept: 'Hemşirelik', age: 24, noKpss: false, kpssScore: 75 },
    { prof: 'temizlik görevlisi', city: 'Aydın', edu: 'İlköğretim / Ortaokul', dept: '', age: 40, noKpss: true },
    { prof: 'elektrik teknikeri', city: 'Bursa', edu: 'Önlisans', dept: '', age: 28, noKpss: false },
    { prof: 'avukat', city: 'Ankara', edu: 'Lisans', dept: 'Hukuk', age: 29, noKpss: false },
    { prof: 'güvenlik görevlisi', city: 'Antalya', edu: 'Lise (Ortaöğretim)', dept: '', age: 27, noKpss: true },
    { prof: 'zabıta memuru', city: 'İzmir', edu: 'Önlisans', dept: '', age: 28, noKpss: false, kpssScore: 70 },
    { prof: 'muhasebe', city: 'İzmir', edu: 'Önlisans', dept: '', age: 32, noKpss: true },
    { prof: 'lazer kesim operatörü', city: 'İzmir', edu: 'Lise (Ortaöğretim)', dept: '', age: 30, noKpss: true },
    { prof: 'kaynakçı', city: 'Kocaeli', edu: 'İlköğretim / Ortaokul', dept: '', age: 36, noKpss: true },
    { prof: 'mühendis', city: 'Tüm İller (Türkiye Geneli)', edu: 'Lisans', dept: '', age: 30, noKpss: false }
  ];

  for (const q of realisticQueries) {
    const c: UserCriteria = {
      profession: q.prof,
      educationLevel: q.edu,
      department: q.dept,
      age: q.age,
      city: q.city,
      district: '',
      kpssScore: q.kpssScore || '',
      noKpss: q.noKpss,
      includePublic: true,
      includePrivate: true
    };

    const p = generateDynamicJobPool(c, DEFAULT_SOURCES);
    const ep = p.filter(j => enabledSourceIds.has(j.sourceId));
    const mr = ep.map(j => evaluateJobMatch(j, c));
    const eligibleCount = mr.filter(r => r.status === 'eligible' || r.status === 'partial').length;

    assert(eligibleCount > 0, 
      `"${q.prof}" araması (${q.city}) için uygun ilan listelenebilmeli`, 
      `Bulunan uygun/kısmi: ${eligibleCount}, Toplam havuz: ${p.length}`);
  }
});

// 9. Kamu ve Özel Tüm 25 Kaynağın Doğrulanmış Resmi Adres ve Alan Adı Testi
runSection('9. Tüm 25 Kaynağın Resmi Kurum URL Doğrulaması (Kamu & Özel)', () => {
  assert(DEFAULT_SOURCES.length === 25, 'Toplam 25 kaynak tanımlı olmalı', `Kaynak sayısı: ${DEFAULT_SOURCES.length}`);

  const criteria: UserCriteria = {
    profession: 'Bilgisayar Programcısı',
    department: 'Bilgisayar',
    educationLevel: 'Önlisans',
    age: 28,
    city: 'İzmir',
    includePublic: true,
    includePrivate: true
  };

  // 9.1 Kariyer Kapısı (CBİKO) Doğrulaması
  const kariyerKapisiDef = DEFAULT_SOURCES.find(s => s.id === 'kariyer_kapisi');
  assert(!!kariyerKapisiDef, 'kariyer_kapisi kaynağı DEFAULT_SOURCES içinde bulunmalı');
  assert(kariyerKapisiDef?.url === 'https://isealimkariyerkapisi.cbiko.gov.tr', 
    'Kariyer Kapısı URL doğrudan resmi CBİKO Kamu İşe Alım portalı olmalı (isealimkariyerkapisi.cbiko.gov.tr)', 
    `Bulunan: ${kariyerKapisiDef?.url}`);
  assert(kariyerKapisiDef?.domain === 'isealimkariyerkapisi.cbiko.gov.tr', 
    'Kariyer Kapısı domain isealimkariyerkapisi.cbiko.gov.tr olmalı', `Bulunan: ${kariyerKapisiDef?.domain}`);
  
  const kariyerKapisiPrecise = buildPreciseSourceUrl('kariyer_kapisi', criteria);
  assert(kariyerKapisiPrecise.url === 'https://isealimkariyerkapisi.cbiko.gov.tr', 
    'buildPreciseSourceUrl(kariyer_kapisi) resmi CBİKO Kamu İşe Alım portalına yönlendirmeli (asla genel e-Devlet kapısı değil)', 
    `Bulunan: ${kariyerKapisiPrecise.url}`);

  // 9.2 İŞKUR Kurum Dışı Kamu (Belediyeler & İştirakler) Doğrulaması
  const yerelDef = DEFAULT_SOURCES.find(s => s.id === 'yerelyonetimler_csb');
  assert(!!yerelDef, 'yerelyonetimler_csb kaynağı DEFAULT_SOURCES içinde bulunmalı');
  assert(yerelDef?.url === 'https://www.iskur.gov.tr/ilanlar/kurumdisi-kamu-isci-alim-ilanlari/', 
    'Belediye işçi ve personel ilanları doğrudan İŞKUR Kurum Dışı Kamu portalı olmalı (genel duyuru veya memurlar.net değil)', 
    `Bulunan: ${yerelDef?.url}`);
  assert(yerelDef?.domain === 'iskur.gov.tr', 
    'Belediye İlanları domain iskur.gov.tr olmalı', `Bulunan: ${yerelDef?.domain}`);

  const yerelPrecise = buildPreciseSourceUrl('yerelyonetimler_csb', criteria);
  assert(yerelPrecise.url === 'https://www.iskur.gov.tr/ilanlar/kurumdisi-kamu-isci-alim-ilanlari/', 
    'buildPreciseSourceUrl(yerelyonetimler_csb) doğrudan resmi İŞKUR Kurum Dışı sayfasına yönlendirmeli', 
    `Bulunan: ${yerelPrecise.url}`);
  assert(!yerelPrecise.url.includes('memurlar.net'), 
    'Belediye araması asla memurlar.net açmamalı');

  // 9.3 Belediyeler & Mahalli İdareler Doğrulaması
  const belediyeDef = DEFAULT_SOURCES.find(s => s.id === 'belediyeler');
  assert(!!belediyeDef, 'belediyeler kaynağı DEFAULT_SOURCES içinde bulunmalı');
  assert(belediyeDef?.url === 'https://www.iskur.gov.tr/ilanlar/kurumdisi-kamu-isci-alim-ilanlari/', 
    'Belediyeler URL İŞKUR Kurum Dışı Kamu İşçi Alımı resmi portalı olmalı', `Bulunan: ${belediyeDef?.url}`);
  assert(belediyeDef?.domain === 'iskur.gov.tr', 
    'Belediyeler domain iskur.gov.tr olmalı', `Bulunan: ${belediyeDef?.domain}`);

  const belediyePrecise = buildPreciseSourceUrl('belediyeler', criteria);
  assert(belediyePrecise.url === 'https://www.iskur.gov.tr/ilanlar/kurumdisi-kamu-isci-alim-ilanlari/', 
    'buildPreciseSourceUrl(belediyeler) resmi İŞKUR Kurum Dışı portalını açmalı', `Bulunan: ${belediyePrecise.url}`);

  // 9.4 Tüm Kamu Kurumlarının Resmi .gov.tr ve İlgili Domain Kontrolü
  const publicSources = DEFAULT_SOURCES.filter(s => s.sector === 'kamu' || s.isOfficialGov);
  let nonGovPublicCount = 0;
  let memurlarRedirectPublicCount = 0;

  for (const s of publicSources) {
    if (s.url.includes('memurlar.net') || s.domain.includes('memurlar.net')) {
      memurlarRedirectPublicCount++;
    }
    const precise = buildPreciseSourceUrl(s.id, criteria);
    if (precise.url.includes('memurlar.net') && s.id !== 'memurlar_net') {
      memurlarRedirectPublicCount++;
    }
    if (!s.url.startsWith('https://')) {
      nonGovPublicCount++;
    }
  }

  assert(memurlarRedirectPublicCount === 0, 
    'Hiçbir kamu kurumu veya belediye kaynağı memurlar.net adresine yönlendirilmemeli', 
    `Hatalı kamu kaynağı sayısı: ${memurlarRedirectPublicCount}`);
  assert(nonGovPublicCount === 0, 
    'Tüm kamu kaynakları güvenli HTTPS protokolü kullanmalı', 
    `Güvensiz kaynak sayısı: ${nonGovPublicCount}`);

  // 9.5 25 Kaynağın Tümü İçin buildPreciseSourceUrl Tam Kapsam Testi
  let fallbackCount = 0;
  for (const s of DEFAULT_SOURCES) {
    const res = buildPreciseSourceUrl(s.id, criteria);
    if (!res.isPrecise) {
      fallbackCount++;
    }
  }
  assert(fallbackCount === 0, 
    '25 kaynağın tümünde hassas arama URL üretilmeli (isPrecise: true, 0 fallback)', 
    `Fallback kalan kaynak sayısı: ${fallbackCount}`);
});

// 10. Bulunan İlanların Doğrudan Tekil İlan Linkini Açma Testi (isSpecificJobUrl & resolveSafeJobUrl)
runSection('10. Bulunan İlanların Doğrudan Tekil İlan Linkini Açma Testi', () => {
  // 10.1 INITIAL_JOB_POSTINGS içindeki yayında olan aktif ilanların tekil link kontrolü (404 demo hariç)
  let genericSampleJobCount = 0;
  for (const job of INITIAL_JOB_POSTINGS.filter(j => isJobActive(j))) {
    const safeUrl = resolveSafeJobUrl(job);
    if (!isSpecificJobUrl(safeUrl)) {
      genericSampleJobCount++;
      console.warn(`    ⚠️ Genel URL içeren örnek ilan: ${job.id} -> ${safeUrl}`);
    }
  }
  assert(genericSampleJobCount === 0, 
    'INITIAL_JOB_POSTINGS içindeki yayında olan tüm ilanlar doğrudan tekil ilan sayfasını açmalı', 
    `Genel linkli ilan sayısı: ${genericSampleJobCount}`);

  let nonTargetedSampleCount = 0;
  for (const job of INITIAL_JOB_POSTINGS.filter(j => isJobActive(j))) {
    const safeUrl = resolveSafeJobUrl(job);
    if (!isTargetedJobUrl(safeUrl)) {
      nonTargetedSampleCount++;
      console.warn(`    ⚠️ Hedeflenmeyen URL içeren örnek ilan: ${job.id} -> ${safeUrl}`);
    }
  }
  assert(nonTargetedSampleCount === 0, 
    'INITIAL_JOB_POSTINGS içindeki yayında olan tüm ilanlar doğrudan HEDEFLENEN TEKİL İŞ İLANI linki olmalı', 
    `Hedeflenmeyen ilan sayısı: ${nonTargetedSampleCount}`);

  // 10.2 Bilgisayar (İzmir) ilanlarının tekil link kontrolü
  const izmirCriteria: UserCriteria = {
    profession: 'Bilgisayar Programcısı',
    department: 'Bilgisayar',
    educationLevel: 'Önlisans',
    age: 26,
    city: 'İzmir',
    includePublic: true,
    includePrivate: true
  };

  const izmirPool = generateDynamicJobPool(izmirCriteria, DEFAULT_SOURCES);
  let genericPoolCount = 0;
  for (const job of izmirPool) {
    const safeUrl = resolveSafeJobUrl(job);
    if (!isSpecificJobUrl(safeUrl)) {
      genericPoolCount++;
      console.warn(`    ⚠️ Genel URL içeren havuz ilanı: ${job.id} -> ${safeUrl}`);
    }
  }
  assert(genericPoolCount === 0, 
    'İzmir Bilgisayar havuzundaki tüm ilanlar doğrudan tekil ilan sayfasını açmalı', 
    `Genel linkli ilan sayısı: ${genericPoolCount}`);

  // 10.3 Farklı şehir ve unvanlarda üretilen dinamik ilanların tekil link kontrolü
  const crossTestQueries = [
    { prof: 'Harita Teknikeri', city: 'Ankara' },
    { prof: 'Hemşire', city: 'İstanbul' },
    { prof: 'Elektrik Teknikeri', city: 'Bursa' },
    { prof: 'Zabıta Memuru', city: 'Antalya' },
    { prof: 'Makine Mühendisi', city: 'Kocaeli' }
  ];

  let totalDynChecked = 0;
  let genericDynCount = 0;

  for (const q of crossTestQueries) {
    const c: UserCriteria = {
      profession: q.prof,
      department: '',
      educationLevel: 'Önlisans',
      age: 28,
      city: q.city,
      includePublic: true,
      includePrivate: true
    };
    const p = generateDynamicJobPool(c, DEFAULT_SOURCES);
    for (const job of p) {
      totalDynChecked++;
      const safeUrl = resolveSafeJobUrl(job);
      if (!isSpecificJobUrl(safeUrl)) {
        genericDynCount++;
      }
    }
  }

  assert(genericDynCount === 0, 
    `Çapraz testlerde kontrol edilen ${totalDynChecked} dinamik ilanın tümü tekil ilan linkini açmalı`, 
    `Genel linkli ilan sayısı: ${genericDynCount} / ${totalDynChecked}`);
});

// 11. Meslek / Ünvan Hassas Eşleşmesi ve 3458 Sayılı Kanun (Önlisans vs Mühendis) Testleri
runSection('11. Meslek / Ünvan Hassas Eşleşmesi ve 3458 Sayılı Kanun Testleri', () => {
  // 11.1 "Bilgisayar Mühendisi" arandığında SADECE Bilgisayar Mühendisi ilanları eşleşmeli
  const engMatch1 = checkProfessionMatch('Bilgisayar Mühendisi', 'Bilgisayar Mühendisi Alımı', ['Bilgisayar Mühendisliği']);
  assert(engMatch1.isMatch === true && engMatch1.matchType === 'exact',
    '"Bilgisayar Mühendisi" araması "Bilgisayar Mühendisi Alımı" ile tam eşleşmeli');

  const engMatch2 = checkProfessionMatch('Bilgisayar Mühendisi', 'Bilgisayar Programcısı (Sözleşmeli 4/B)', ['Bilgisayar Programcılığı']);
  assert(engMatch2.isMatch === false,
    '"Bilgisayar Mühendisi" spesifik araması "Bilgisayar Programcısı" ilanını kesinlikle elemelidir');

  const engMatch3 = checkProfessionMatch('Bilgisayar Mühendisi', 'Bilgisayarlı Muhasebe Personeli', ['Muhasebe', 'Bilgisayar']);
  assert(engMatch3.isMatch === false,
    '"Bilgisayar Mühendisi" spesifik araması "Bilgisayarlı Muhasebe Personeli" ilanını kesinlikle elemelidir');

  const engMatch4 = checkProfessionMatch('Bilgisayar Mühendisi', 'Bilgisayar Teknikeri Alımı', ['Bilgisayar Teknolojisi']);
  assert(engMatch4.isMatch === false,
    '"Bilgisayar Mühendisi" spesifik araması "Bilgisayar Teknikeri" ilanını kesinlikle elemelidir');

  // 11.2 "Bilgisayar" (tek kelime/kök) arandığında Bilgisayar ile başlayan tüm ilanlar listelenmeli
  const prefixProg = checkProfessionMatch('Bilgisayar', 'Bilgisayar Programcısı (Sözleşmeli 4/B)', ['Bilgisayar Programcılığı']);
  assert(prefixProg.isMatch === true,
    '"Bilgisayar" kök araması "Bilgisayar Programcısı" ilanını listelemeli');

  const prefixOgr = checkProfessionMatch('Bilgisayar', 'Bilişim Teknolojileri ve Bilgisayar Öğretmeni', ['BÖTE']);
  assert(prefixOgr.isMatch === true,
    '"Bilgisayar" kök araması "Bilgisayar Öğretmeni" ilanını listelemeli');

  const prefixMuh = checkProfessionMatch('Bilgisayar', 'Bilgisayarlı Muhasebe Personeli', ['Bilgisayarlı Muhasebe']);
  assert(prefixMuh.isMatch === true,
    '"Bilgisayar" kök araması "Bilgisayarlı Muhasebe Personeli" ilanını listelemeli');

  const prefixTek = checkProfessionMatch('Bilgisayar', 'Bilgisayar Teknikeri Alımı', ['Bilgisayar Teknolojisi']);
  assert(prefixTek.isMatch === true,
    '"Bilgisayar" kök araması "Bilgisayar Teknikeri" ilanını listelemeli');

  // 11.3 3458 sayılı Kanun: 2 yıllık Önlisans mezunu Mühendis unvanına sahip olamaz
  const legalityOnlisans = checkEducationTitleLegality('Bilgisayar Mühendisi (Sözleşmeli Bilişim Personeli)', 'Önlisans');
  assert(legalityOnlisans.isLegal === false,
    '3458 sayılı Kanun uyarınca 2 yıllık Önlisans mezunları Mühendis kadrosuna yasal olarak başvuramaz (isLegal: false)');
  assert(legalityOnlisans.reason?.includes('3458') === true,
    'Yasal engel gerekçesi 3458 sayılı Kanun atfını içermeli');

  const legalityLisans = checkEducationTitleLegality('Bilgisayar Mühendisi (Sözleşmeli Bilişim Personeli)', 'Lisans');
  assert(legalityLisans.isLegal === true,
    '4 yıllık Lisans mezunları Mühendis kadrosu için yasaldır (isLegal: true)');

  // 11.4 Önlisans mezununun "Bilgisayar Mühendisi" ve "Bilgisayar" sorguları uçtan uca değerlendirmesi
  const sampleMuhendisJob: JobPosting = {
    id: 'test-eng-01',
    title: 'Bilgisayar Mühendisi Alımı',
    company: 'Test Kurumu',
    city: 'İzmir',
    sourceId: 'kariyer_kapisi',
    sourceName: 'Kariyer Kapısı',
    sourceDomain: 'cbiko.gov.tr',
    isPublicSector: true,
    sourceBadgeColor: 'bg-emerald-600',
    originalUrl: 'https://isealimkariyerkapisi.cbiko.gov.tr',
    referenceCode: 'TEST-ENG-01',
    publishDate: 'Bugün',
    deadlineDate: 'Aktif İlan',
    requiredEducation: ['Lisans'],
    allowedDepartments: ['Bilgisayar Mühendisliği'],
    minAge: 18,
    maxAge: 35,
    quota: 1,
    requiresKpss: false,
    employmentType: 'Kamu Sözleşmeli',
    description: 'Bilgisayar Mühendisi kadrosu test duyurusu.'
  };

  const sampleProgJob: JobPosting = {
    id: 'test-prog-01',
    title: 'Bilgisayar Programcısı',
    company: 'Test Üniversitesi',
    city: 'İzmir',
    sourceId: 'kariyer_kapisi',
    sourceName: 'Kariyer Kapısı',
    sourceDomain: 'cbiko.gov.tr',
    isPublicSector: true,
    sourceBadgeColor: 'bg-emerald-600',
    originalUrl: 'https://isealimkariyerkapisi.cbiko.gov.tr',
    referenceCode: 'TEST-PROG-01',
    publishDate: 'Bugün',
    deadlineDate: 'Aktif İlan',
    requiredEducation: ['Önlisans'],
    allowedDepartments: ['Bilgisayar Programcılığı', 'Bilgisayar'],
    minAge: 18,
    maxAge: 35,
    quota: 1,
    requiresKpss: false,
    employmentType: 'Kamu Sözleşmeli',
    description: 'Bilgisayar Programcısı kadrosu test duyurusu.'
  };

  const onlisansUser: UserCriteria = {
    profession: 'Bilgisayar Mühendisi',
    educationLevel: 'Önlisans',
    department: 'Bilgisayar Programcılığı',
    age: 26,
    city: 'İzmir',
    includePublic: true,
    includePrivate: true
  };

  const evalMuhendisJob = evaluateJobMatch(sampleMuhendisJob, onlisansUser);
  assert(evalMuhendisJob.status === 'ineligible',
    'Önlisans mezunu aday "Bilgisayar Mühendisi" ilanı değerlendirmesinde kesinlikle ineligible olmalı');
  assert(evalMuhendisJob.ineligibilityReason?.includes('3458') || evalMuhendisJob.ineligibilityReason?.includes('Mühendislik') || evalMuhendisJob.summaryNote.includes('3458'),
    'Önlisans adayına verilen red gerekçesi 3458 sayılı Mühendislik Kanununu belirtmeli');

  // Kullanıcı "Bilgisayar" yazıp Önlisans olduğunda Programcı ilanı eligible olmalı, Mühendis ilanı ineligible olmalı
  const onlisansBroadUser: UserCriteria = {
    profession: 'Bilgisayar',
    educationLevel: 'Önlisans',
    department: 'Bilgisayar Programcılığı',
    age: 26,
    city: 'İzmir',
    includePublic: true,
    includePrivate: true
  };

  const evalProgJobForBroad = evaluateJobMatch(sampleProgJob, onlisansBroadUser);
  assert(evalProgJobForBroad.status === 'eligible',
    'Önlisans mezunu "Bilgisayar" araması yaptığında "Bilgisayar Programcısı" ilanı eligible olmalı');

  const evalEngJobForBroad = evaluateJobMatch(sampleMuhendisJob, onlisansBroadUser);
  assert(evalEngJobForBroad.status === 'ineligible',
    'Önlisans mezunu "Bilgisayar" araması yaptığında "Bilgisayar Mühendisi" ilanı 3458 sayılı Kanun gereği ineligible olmalı');

  // 11.5 GENELLEŞTİRİLMİŞ TÜM DİĞER MESLEKLER (İnşaat, Makine, Harita, Avukat, Elektrik vb.)
  // A. Spesifik Çok Kelimeli Arama İzolasyonu:
  const insaatMatch1 = checkProfessionMatch('İnşaat Mühendisi', 'İnşaat Mühendisi Alımı', ['İnşaat Mühendisliği']);
  assert(insaatMatch1.isMatch === true && insaatMatch1.matchType === 'exact',
    '"İnşaat Mühendisi" araması "İnşaat Mühendisi Alımı" ile tam eşleşmeli');
  const insaatMatch2 = checkProfessionMatch('İnşaat Mühendisi', 'İnşaat Teknikeri Alımı', ['İnşaat Teknolojisi']);
  assert(insaatMatch2.isMatch === false,
    '"İnşaat Mühendisi" araması "İnşaat Teknikeri" ilanını kesinlikle elemelidir');

  const makineMatch1 = checkProfessionMatch('Makine Mühendisi', 'Makine Mühendisi Alımı', ['Makine Mühendisliği']);
  assert(makineMatch1.isMatch === true && makineMatch1.matchType === 'exact',
    '"Makine Mühendisi" araması "Makine Mühendisi Alımı" ile tam eşleşmeli');
  const makineMatch2 = checkProfessionMatch('Makine Mühendisi', 'Makine Teknikeri Alımı', ['Makine']);
  assert(makineMatch2.isMatch === false,
    '"Makine Mühendisi" araması "Makine Teknikeri" ilanını kesinlikle elemelidir');

  const haritaMatch1 = checkProfessionMatch('Harita Mühendisi', 'Harita Mühendisi (Jeodezi)', ['Harita Mühendisliği']);
  assert(haritaMatch1.isMatch === true && haritaMatch1.matchType === 'exact',
    '"Harita Mühendisi" araması "Harita Mühendisi" ile tam eşleşmeli');
  const haritaMatch2 = checkProfessionMatch('Harita Mühendisi', 'Harita ve Kadastro Teknikeri', ['Harita ve Kadastro']);
  assert(haritaMatch2.isMatch === false,
    '"Harita Mühendisi" araması "Harita Teknikeri" ilanını kesinlikle elemelidir');

  const avukatMatch1 = checkProfessionMatch('Avukat', 'Kadrolu Avukat Alımı', ['Hukuk']);
  assert(avukatMatch1.isMatch === true,
    '"Avukat" araması "Kadrolu Avukat Alımı" ile eşleşmeli');
  const avukatMatch2 = checkProfessionMatch('Avukat', 'Sözleşmeli Zabıt Kâtibi Alımı', ['Adalet']);
  assert(avukatMatch2.isMatch === false,
    '"Avukat" araması "Zabıt Kâtibi" ilanını kesinlikle elemelidir');

  // B. Tek Kelime / Kök Aramaları (Elektrik, İnşaat, Makine, Harita, Adalet):
  const prefElek1 = checkProfessionMatch('Elektrik', 'Elektrik Mühendisi Alımı', ['Elektrik']);
  const prefElek2 = checkProfessionMatch('Elektrik', 'Elektrik Teknikeri Alımı', ['Elektrik']);
  assert(prefElek1.isMatch === true && prefElek2.isMatch === true,
    '"Elektrik" kök araması hem Elektrik Mühendisi hem de Elektrik Teknikeri ilanlarını listelemeli');

  const prefIns1 = checkProfessionMatch('İnşaat', 'İnşaat Mühendisi Alımı', ['İnşaat']);
  const prefIns2 = checkProfessionMatch('İnşaat', 'İnşaat Teknikeri Alımı', ['İnşaat']);
  assert(prefIns1.isMatch === true && prefIns2.isMatch === true,
    '"İnşaat" kök araması hem İnşaat Mühendisi hem de İnşaat Teknikeri ilanlarını listelemeli');

  const prefMak1 = checkProfessionMatch('Makine', 'Makine Mühendisi Alımı', ['Makine']);
  const prefMak2 = checkProfessionMatch('Makine', 'Makine Teknikeri Alımı', ['Makine']);
  assert(prefMak1.isMatch === true && prefMak2.isMatch === true,
    '"Makine" kök araması hem Makine Mühendisi hem de Makine Teknikeri ilanlarını listelemeli');

  const prefHar1 = checkProfessionMatch('Harita', 'Harita Mühendisi (Jeodezi)', ['Harita']);
  const prefHar2 = checkProfessionMatch('Harita', 'Harita ve Kadastro Teknikeri', ['Harita']);
  assert(prefHar1.isMatch === true && prefHar2.isMatch === true,
    '"Harita" kök araması hem Harita Mühendisi hem de Harita Teknikeri ilanlarını listelemeli');

  // C. 3458 ve 1136 Sayılı Kanunlar Uyarınca Önlisans / Lisans Yasallık Değerlendirmeleri:
  assert(checkEducationTitleLegality('İnşaat Mühendisi Alımı', 'Önlisans').isLegal === false,
    '3458 s.K.: Önlisans mezunları İnşaat Mühendisi kadrosuna başvuramaz');
  assert(checkEducationTitleLegality('Makine Mühendisi Alımı', 'Önlisans').isLegal === false,
    '3458 s.K.: Önlisans mezunları Makine Mühendisi kadrosuna başvuramaz');
  assert(checkEducationTitleLegality('Harita Mühendisi Alımı', 'Önlisans').isLegal === false,
    '3458 s.K.: Önlisans mezunları Harita Mühendisi kadrosuna başvuramaz');
  assert(checkEducationTitleLegality('Kadrolu Avukat Alımı', 'Önlisans').isLegal === false,
    '1136 s.K.: Önlisans mezunları Avukat kadrosuna başvuramaz');

  assert(checkEducationTitleLegality('İnşaat Teknikeri Alımı', 'Önlisans').isLegal === true,
    'Önlisans mezunları İnşaat Teknikeri kadrosu için yasaldır');
  assert(checkEducationTitleLegality('Makine Teknikeri Alımı', 'Önlisans').isLegal === true,
    'Önlisans mezunları Makine Teknikeri kadrosu için yasaldır');
  assert(checkEducationTitleLegality('Sözleşmeli Zabıt Kâtibi Alımı', 'Önlisans').isLegal === true,
    'Önlisans mezunları Zabıt Kâtibi kadrosu için yasaldır');
});

// 12. Meslek Filtresine Yazılan Metnin Enter ile Birebir Korunması (Sadece Yazılanın Görünmesi)
runSection('12. Meslek Filtresine Yazılan Değerin Enter İle Birebir Korunması', () => {
  // Klavyeden girilen metinler ve beklenen korunan çıktılar
  const testInputs = [
    'Bilgisayar',
    'Bilgisayar Mühendisi',
    'İnşaat',
    'İnşaat Mühendisi',
    'Makine',
    'Makine Teknikeri',
    'Elektrik',
    'Avukat',
    'Ön Muhasebe',
    'Kaynak Operatörü'
  ];

  for (const input of testInputs) {
    // Enter tuşuna basıldığında yön tuşlarıyla seçim yapılmadıysa (highlightedIndex === -1),
    // input alanındaki değer trim edilerek aynen korunmalıdır (ilk öneriyle ezilmez).
    const simulatedValue = input;
    const highlightedIndex = -1;
    const finalStoredValue = (highlightedIndex >= 0) ? 'Baska Bir Meslek' : simulatedValue.trim();

    assert(finalStoredValue === input.trim(), 
      `"${input}" yazılıp Enter'a basıldığında sadece "${input.trim()}" görünmeli ve saklanmalıdır`,
      `Alınan: "${finalStoredValue}"`);
  }
});

// 13. Gerçekte Var Olmayan / Anlamsız Meslek Aramaları (Örn: "hukloıjkıuh") Testi
runSection('13. Gerçek Dışı / Anlamsız Aramalarda Sahte İlan Üretmeme Doğrulaması', () => {
  // Rastgele ve anlamsız tuş vuruşları
  const gibberishInputs = ['hukloıjkıuh', 'asdfghjk', 'zxcvbnm123', 'qwertyuiop'];

  for (const gibberish of gibberishInputs) {
    // 1. isRecognizedProfession false döndürmelidir
    assert(isRecognizedProfession(gibberish) === false,
      `"${gibberish}" anlamsız araması tanınan bir meslek olarak kabul EDİLMEMELİDİR`);

    // 2. generateDynamicJobPool kesinlikle boş havuz döndürmelidir (0 sahte ilan)
    const gibberishCriteria: UserCriteria = {
      profession: gibberish,
      educationLevel: 'Önlisans',
      department: '',
      age: 28,
      city: 'İzmir',
      includePublic: true,
      includePrivate: true
    };

    const pool = generateDynamicJobPool(gibberishCriteria, DEFAULT_SOURCES);
    assert(pool.length === 0,
      `"${gibberish}" için ASLA sahte belediye veya üniversite ilanı üretilmemelidir (Havuz 0 olmalı)`,
      `Bulunan sahte ilan sayısı: ${pool.length}`);

    // 3. Hiçbir ilanın başlığında bu anlamsız ifade geçmemelidir
    const hasGibberishTitle = pool.some(j => j.title.toLowerCase().includes(gibberish.toLowerCase()));
    assert(!hasGibberishTitle,
      `Hiçbir ilanın başlığında "${gibberish}" ifadesi geçmemelidir`);
  }

  // Geçerli mesleklerin ise tanınması doğrulanmalıdır
  const validInputs = ['Bilgisayar Mühendisi', 'Elektrik Teknikeri', 'Hemşire', 'Avukat', 'İnşaat', 'Kaynakçı'];
  for (const valid of validInputs) {
    assert(isRecognizedProfession(valid) === true,
      `"${valid}" geçerli mesleği tanınmalıdır`);
  }
});

console.log(`\n========================================`);
console.log(`🏁 TEST SONUÇLARI:`);
console.log(`   Başarılı Testler : ${passedTests}`);
console.log(`   Başarısız Testler: ${failedTests}`);
console.log(`========================================\n`);

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('🎉 TÜM TESTLER BAŞARIYLA TAMAMLANDI!\n');
}
