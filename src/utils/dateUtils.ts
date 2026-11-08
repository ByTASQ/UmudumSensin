/**
 * Tarih ve İlan Geçerlilik Yardımcıları
 * İlanların son başvuru tarihlerini (Türkçe metin, ISO, DD.MM.YYYY vb.) güvenle çözümler
 * ve süresi dolmuş ilanları tespit edip filtreler.
 */

import { JobPosting } from '../types/job';

const ACTIVE_JOB_CACHE = new WeakMap<JobPosting, { dayKey: number; active: boolean }>();

const TURKISH_MONTHS: Record<string, number> = {
  'ocak': 0,
  'subat': 1,
  'şubat': 1,
  'mart': 2,
  'nisan': 3,
  'mayis': 4,
  'mayıs': 4,
  'haziran': 5,
  'temmuz': 6,
  'agustos': 7,
  'ağustos': 7,
  'eylul': 8,
  'eylül': 8,
  'ekim': 9,
  'kasim': 10,
  'kasım': 10,
  'aralik': 11,
  'aralık': 11
};

/**
 * İlan son başvuru tarihi metnini Date nesnesine dönüştürür.
 * İlanın gün sonuna kadar (23:59:59) geçerli olduğunu kabul eder.
 */
export function parseJobDeadlineDate(deadlineStr: string): Date | null {
  if (!deadlineStr) return null;
  const clean = deadlineStr.trim().toLowerCase();

  // Kapatılmış veya süresi dolmuş belirteçleri doğrudan geçmiş tarih olarak işaretle
  if (
    clean.includes('kapandı') ||
    clean.includes('kapandi') ||
    clean.includes('kapatıldı') ||
    clean.includes('kapatildi') ||
    clean.includes('doldu') ||
    clean.includes('bitti') ||
    clean.includes('sona erdi') ||
    clean.includes('geçti') ||
    clean.includes('gecti') ||
    clean.includes('arşiv') ||
    clean.includes('arsiv')
  ) {
    return new Date(2020, 0, 1, 0, 0, 0); // Geçmiş tarih
  }

  // Sürekli / açık pozisyonlar her zaman aktiftir
  if (
    clean.includes('sürekli') || 
    clean.includes('surekli') || 
    clean.includes('açık') || 
    clean.includes('acik') || 
    clean.includes('devam') || 
    clean.includes('belirtilmedi') ||
    clean.includes('güncel') ||
    clean.includes('guncel') ||
    clean.includes('aktif')
  ) {
    return new Date(2099, 11, 31, 23, 59, 59); // Uzak gelecek
  }

  // 1. ISO formatı: 2026-09-26 veya 2026-09-26T...
  const isoMatch = clean.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoMatch) {
    const y = parseInt(isoMatch[1], 10);
    const m = parseInt(isoMatch[2], 10) - 1;
    const d = parseInt(isoMatch[3], 10);
    const date = new Date(y, m, d, 23, 59, 59, 999);
    return isNaN(date.getTime()) ? null : date;
  }

  // 2. Noktalı veya tireli gün formatı: DD.MM.YYYY veya DD/MM/YYYY
  const dotMatch = clean.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})/);
  if (dotMatch) {
    const d = parseInt(dotMatch[1], 10);
    const m = parseInt(dotMatch[2], 10) - 1;
    const y = parseInt(dotMatch[3], 10);
    const date = new Date(y, m, d, 23, 59, 59, 999);
    return isNaN(date.getTime()) ? null : date;
  }

  // 3. Türkçe metinli format: "24 Eylül 2026", "15 Ekim 2026", "06 Ekim 2026"
  const parts = clean.split(/\s+/);
  if (parts.length >= 3) {
    const day = parseInt(parts[0], 10);
    const monthWord = parts[1];
    const year = parseInt(parts[2], 10);

    if (!isNaN(day) && !isNaN(year) && TURKISH_MONTHS[monthWord] !== undefined) {
      const month = TURKISH_MONTHS[monthWord];
      const date = new Date(year, month, day, 23, 59, 59, 999);
      return isNaN(date.getTime()) ? null : date;
    }
  }

  // 4. Standart JS Date parse yedeği
  const parsed = Date.parse(deadlineStr);
  if (!isNaN(parsed)) {
    const d = new Date(parsed);
    d.setHours(23, 59, 59, 999);
    return d;
  }

  return null;
}

/**
 * İlanın son başvuru tarihinin geçip geçmediğini kontrol eder.
 * @param job Kontrol edilecek ilan nesnesi
 * @param referenceDate Karşılaştırma tarihi (Varsayılan: şu an)
 * @returns true ise ilan aktif, false ise süresi dolmuş
 */
export function isJobActive(job: JobPosting, referenceDate: Date = new Date()): boolean {
  if (!job) return false;

  // İlanın aktiflik sonucu aynı gün içinde değişmez. Özellikle ResultsView
  // filtre zincirinde aynı ilanı tekrar tekrar parse etmeyi önler.
  const dayKey = Math.floor(referenceDate.getTime() / 86400000);
  const cached = ACTIVE_JOB_CACHE.get(job);
  if (cached?.dayKey === dayKey) return cached.active;

  // Açıkça süresi dolmuş veya kapatılmış bayrakları
  if ((job as any).isExpired === true || (job as any).isClosed === true) {
    return false;
  }
  if ((job as any).status === 'expired' || (job as any).status === 'closed') {
    return false;
  }

  // Başlık veya açıklamada "süresi dolmuş / yayından kaldırılmış / kapandı" ibaresi varsa doğrudan süresi dolmuş say
  const lowerText = `${job.title || ''} ${job.description || ''} ${job.deadlineDate || ''}`.toLowerCase();
  if (
    lowerText.includes('süresi dolmuş') || 
    lowerText.includes('yayından kaldırılmış') || 
    lowerText.includes('suresi dolmus') ||
    lowerText.includes('yayindan kaldirilmis') ||
    lowerText.includes('arşivlenmiş') ||
    lowerText.includes('arsivlenmis') ||
    lowerText.includes('başvuruya kapandı') ||
    lowerText.includes('basvuruya kapandi') ||
    lowerText.includes('başvuruya kapalı') ||
    lowerText.includes('basvuruya kapali') ||
    lowerText.includes('ilan kapatılmıştır') ||
    lowerText.includes('ilan kapatilmistir') ||
    lowerText.includes('süresi doldu') ||
    lowerText.includes('suresi doldu')
  ) {
    return false;
  }

  // URL içinde 404, suresi-dolmus, silinmis veya expired ibaresi varsa geçersiz say
  const urlLower = (job.originalUrl || '').toLowerCase();
  if (
    urlLower.includes('404') ||
    urlLower.includes('suresi-dolmus') ||
    urlLower.includes('yayindan-kalkmis') ||
    urlLower.includes('silinmis-ilan')
  ) {
    return false;
  }

  // Süresi dolmuş demo ilanları id kontrolü
  if (job.id.includes('expired') || job.referenceCode?.includes('EXPIRED')) {
    return false;
  }

  const deadline = parseJobDeadlineDate(job.deadlineDate);
  if (!deadline) {
    // Son başvuru tarihi ayrıştırılamıyorsa varsayılan olarak aktif kabul et
    ACTIVE_JOB_CACHE.set(job, { dayKey, active: true });
    return true;
  }

  // Son başvuru günü 23:59:59'a kadar aktif kalır
  const active = deadline.getTime() >= referenceDate.getTime();
  ACTIVE_JOB_CACHE.set(job, { dayKey, active });
  return active;
}

/**
 * İlanın son başvuru tarihine kaç gün kaldığını hesaplar
 */
export function getRemainingDays(deadlineStr: string, referenceDate: Date = new Date()): number | null {
  const deadline = parseJobDeadlineDate(deadlineStr);
  if (!deadline) return null;

  const diffMs = deadline.getTime() - referenceDate.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * İlanın son başvuru durumu hakkında kullanıcı dostu etiket metni üretir
 */
export function getDeadlineStatusBadge(deadlineStr: string, referenceDate: Date = new Date()): {
  text: string;
  isUrgent: boolean;
  isExpired: boolean;
} {
  const clean = (deadlineStr || '').trim().toLowerCase();
  if (clean.includes('sürekli') || clean.includes('açık') || clean.includes('güncel')) {
    return { text: 'Sürekli Açık', isUrgent: false, isExpired: false };
  }

  const days = getRemainingDays(deadlineStr, referenceDate);
  if (days === null) {
    return { text: 'Aktif İlan', isUrgent: false, isExpired: false };
  }

  if (days < 0) {
    return { text: 'Süresi Doldu', isUrgent: false, isExpired: true };
  }

  if (days === 0) {
    return { text: 'Bugün Son Gün!', isUrgent: true, isExpired: false };
  }

  if (days <= 3) {
    return { text: `Son ${days} gün!`, isUrgent: true, isExpired: false };
  }

  return { text: `Kalan: ${days} gün`, isUrgent: false, isExpired: false };
}
