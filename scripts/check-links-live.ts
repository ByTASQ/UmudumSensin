/**
 * Canlı URL Doğrulama Scripti
 * Sistemdeki tüm kaynak ve arama bağlantılarının HTTP durumlarını test eder.
 */

import { DEFAULT_SOURCES } from '../src/sources/sourceRegistry';
import { INITIAL_JOB_POSTINGS } from '../src/data/sampleJobs';
import { 
  getPreciseMemurlarSearchUrl, 
  getPreciseIskurUrl, 
  buildPreciseSourceUrl,
  resolveSafeJobUrl 
} from '../src/services/preciseSearchService';

interface CheckItem {
  name: string;
  url: string;
  type: 'source' | 'job' | 'search';
}

async function checkUrl(url: string): Promise<{ status: number | null; ok: boolean; error?: string; redirectUrl?: string }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7'
      },
      redirect: 'follow',
      signal: controller.signal
    }).catch(async () => {
      // Fallback to HEAD
      return await fetch(url, {
        method: 'HEAD',
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(4000)
      });
    });

    clearTimeout(timeout);
    return {
      status: response.status,
      ok: response.status >= 200 && response.status < 400,
      redirectUrl: response.url !== url ? response.url : undefined
    };
  } catch (e: any) {
    return {
      status: null,
      ok: false,
      error: e.name === 'AbortError' || e.name === 'TimeoutError' ? 'Zaman Aşımı' : (e.message || 'Ağ Hatası')
    };
  }
}

async function main() {
  console.log('🌐 CANLI LİNK DOĞRULAMA BAŞLATILIYOR...\n');

  const itemsToCheck: CheckItem[] = [];

  // 1. DEFAULT_SOURCES
  for (const s of DEFAULT_SOURCES) {
    itemsToCheck.push({
      name: `Kaynak: ${s.name}`,
      url: s.url,
      type: 'source'
    });
  }

  // 2. Sample Job Postings
  for (const j of INITIAL_JOB_POSTINGS.slice(0, 10)) {
    itemsToCheck.push({
      name: `İlan: ${j.company} (${j.title.slice(0, 30)}...)`,
      url: resolveSafeJobUrl(j),
      type: 'job'
    });
  }

  // 3. Precise Search URLs
  const sampleCriteria = { profession: 'Elektrik Teknikeri', city: 'Ankara' };
  const memurlarUrl = buildPreciseSourceUrl('memurlar_net', sampleCriteria).url;
  const iskurUrl = buildPreciseSourceUrl('iskur', sampleCriteria).url;

  itemsToCheck.push({
    name: 'Arama Motoru: Memurlar.net Filtreli Arama',
    url: memurlarUrl,
    type: 'search'
  });

  itemsToCheck.push({
    name: 'Arama Motoru: İŞKUR Kamu İlanları Tebliği',
    url: iskurUrl,
    type: 'search'
  });

  console.log(`Toplam ${itemsToCheck.length} bağlantı taranıyor...\n`);

  let activeCount = 0;
  let warnCount = 0;
  let brokenCount = 0;

  for (const item of itemsToCheck) {
    process.stdout.write(`Kontrol ediliyor: ${item.name.slice(0, 45).padEnd(45)} `);
    const res = await checkUrl(item.url);

    if (res.ok) {
      activeCount++;
      console.log(`✅ [${res.status}] Aktif ${res.redirectUrl ? `(Yönlendirme)` : ''}`);
    } else if (res.status === 403) {
      warnCount++;
      console.log(`⚠️  [403] Güvenlik Duvarı Korumalı (WAF/Cloudflare - Alan adı aktif)`);
    } else if (res.status === 404 || res.status === 410) {
      brokenCount++;
      console.log(`❌ [${res.status}] SAYFA BULUNAMADI! Link: ${item.url}`);
    } else {
      warnCount++;
      console.log(`⚠️  [${res.status || 'HATA'}] ${res.error || 'Ulaşılamadı'} - ${item.url}`);
    }
  }

  console.log('\n========================================');
  console.log('📊 DOĞRULAMA RAPORU:');
  console.log(`   Aktif & Erişilebilir: ${activeCount}`);
  console.log(`   WAF / Zaman Aşımı  : ${warnCount}`);
  console.log(`   Kırık Link (404)    : ${brokenCount}`);
  console.log('========================================\n');
}

main().catch(console.error);
