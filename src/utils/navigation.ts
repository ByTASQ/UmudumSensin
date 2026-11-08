import { JobPosting } from '../types/job';
import {
  PortalLinkItem,
  getPreciseMemurlarSearchUrl,
  getPreciseIskurUrl,
  resolveSafeJobUrl,
  buildPrecisePortalLinks,
  buildPreciseSourceUrl
} from '../services/preciseSearchService';

export type { PortalLinkItem };

/**
 * Güvenli ve doğrulanmış URL açma fonksiyonu.
 * İframe kısıtlamalarını aşmak için native tarayıcı sekmesini tetikler.
 */
export function openExternalUrl(url: string) {
  if (!url) return;
  try {
    const win = window.open(url, '_blank', 'noopener,noreferrer');
    if (!win || win.closed || typeof win.closed === 'undefined') {
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => document.body.removeChild(a), 300);
    }
  } catch {
    window.location.href = url;
  }
}

/**
 * Google'da kurumun resmi duyuru ve başvuru metnini aratan güvenilir arama URL'si üretir.
 * Katı tırnak işaretleri kaldırılmıştır, böylece her zaman ilgili resmi duyuru ve PDF bulunur.
 */
export function getGoogleSearchUrl(job: JobPosting): string {
  const cleanTitle = job.title.replace(/\([^)]*\)/g, '').trim();
  const cleanCompany = (job.company || '').split('/')[0].replace('T.C.', '').trim();
  const city = job.city ? job.city.trim() : '';
  const query = `${cleanCompany} ${cleanTitle} ${city} personel alımı başvuru duyuru`;
  return `https://www.google.com/search?q=${encodeURIComponent(query.replace(/\s+/g, ' ').trim())}`;
}

/**
 * Memurlar.net üzerinde kurumun ilgili ilanını doğrudan aratan hassas arama URL'si.
 */
export function getMemurlarSearchUrl(job: JobPosting): string {
  return getPreciseMemurlarSearchUrl(job);
}

/**
 * İŞKUR üzerinde ilgili ilanın resmi duyurusuna yönlendiren hassas URL.
 */
export function getIskurSearchUrl(job: JobPosting): string {
  return getPreciseIskurUrl(job);
}

/**
 * Kullanıcı "İLANA GİT" dediğinde ilanın orijinal, doğrulanmış ve tam linkini açar.
 * Asla araya sahte URL veya boş ana sayfa yönlendirmesi koymaz.
 */
export function getSafeJobUrl(job: JobPosting): string {
  return resolveSafeJobUrl(job);
}

/**
 * Bir iş ilanı için doğrulanmış ve %100 açılan portal bağlantılarını üretir.
 */
export function getJobPortalLinks(job: JobPosting, criteriaProfession?: string, criteriaCity?: string): PortalLinkItem[] {
  return buildPrecisePortalLinks(job, criteriaProfession, criteriaCity);
}

/**
 * İlgili kaynağın GERÇEK ve ÇALIŞAN başvuru veya portal URL'sini hassas parametrelerle döner.
 */
export function getLivePortalUrl(sourceId: string, profession: string, city: string): string {
  return buildPreciseSourceUrl(sourceId, { profession, city }).url;
}
