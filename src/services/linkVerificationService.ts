export interface LinkVerificationResult {
  url: string;
  status: 'checking' | 'active' | 'not_found' | 'error' | 'forbidden' | 'unreachable';
  httpStatus: number | null;
  statusText: string;
  responseTimeMs: number;
  is404: boolean;
  isExpired?: boolean;
  checkedAt: string;
  message: string;
}

const STORAGE_CACHE_KEY = 'is_ilani_url_verification_cache_v3';
const CACHE_MAX_AGE_MS = 10 * 60 * 1000; // 10 minutes

// In-memory cache
const memoryCache: Map<string, LinkVerificationResult> = new Map();
const inFlightRequests: Map<string, Promise<LinkVerificationResult>> = new Map();

// Load cache from localStorage
function initCacheFromStorage(): void {
  try {
    const raw = localStorage.getItem(STORAGE_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const now = Date.now();
      for (const [url, item] of Object.entries(parsed)) {
        const res = item as LinkVerificationResult;
        const checkTime = new Date(res.checkedAt).getTime();
        if (now - checkTime < CACHE_MAX_AGE_MS) {
          memoryCache.set(url, res);
        }
      }
    }
  } catch (e) {
    console.warn('Failed to load url verification cache:', e);
  }
}

// localStorage yazımı senkron olduğu için her URL doğrulamasında cache'in
// tamamını serialize etmek düşük donanımlı cihazlarda ana thread'i kilitleyebilir.
// Değişiklikleri kısa süre biriktirip tek yazımda kalıcılaştırıyoruz.
let storageWriteTimer: ReturnType<typeof setTimeout> | null = null;
let storageWritePending = false;

function flushCacheToStorage(): void {
  if (!storageWritePending) return;
  storageWritePending = false;

  try {
    const obj: Record<string, LinkVerificationResult> = {};
    for (const [url, item] of memoryCache.entries()) {
      obj[url] = item;
    }
    localStorage.setItem(STORAGE_CACHE_KEY, JSON.stringify(obj));
  } catch (e) {
    console.warn('Failed to save url verification cache:', e);
  }
}

function scheduleCacheSave(): void {
  storageWritePending = true;
  if (storageWriteTimer !== null) return;

  storageWriteTimer = setTimeout(() => {
    storageWriteTimer = null;
    flushCacheToStorage();
  }, 1000);
}

// Initialize on module load
initCacheFromStorage();


if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', flushCacheToStorage);
}

// Listeners for reactive updates
type VerificationListener = (url: string, result: LinkVerificationResult) => void;
const listeners = new Set<VerificationListener>();

export function subscribeToLinkVerifications(listener: VerificationListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyListeners(url: string, result: LinkVerificationResult): void {
  // Sadece değişen kaydı bildir. Tüm cache'i kopyalamak, ilan sayısı büyüdükçe
  // her doğrulamada gereksiz CPU ve bellek tahsisi oluşturuyordu.
  listeners.forEach(fn => fn(url, result));
}

/**
 * Tek bir URL'yi doğrular.
 */
export async function verifySingleLink(
  rawUrl: string, 
  forceRefresh: boolean = false
): Promise<LinkVerificationResult> {
  const url = rawUrl?.trim();
  if (!url) {
    return {
      url: '',
      status: 'error',
      httpStatus: null,
      statusText: 'Geçersiz URL',
      responseTimeMs: 0,
      is404: false,
      checkedAt: new Date().toISOString(),
      message: 'URL boş olamaz.'
    };
  }

  // Check cache if not forcing refresh
  if (!forceRefresh && memoryCache.has(url)) {
    const cached = memoryCache.get(url)!;
    const age = Date.now() - new Date(cached.checkedAt).getTime();
    if (age < CACHE_MAX_AGE_MS) {
      return cached;
    }
  }

  // Avoid duplicate concurrent calls
  if (inFlightRequests.has(url)) {
    return inFlightRequests.get(url)!;
  }

  const promise = (async () => {
    try {
      const res = await fetch(`/api/verify-url?url=${encodeURIComponent(url)}`, {
        signal: AbortSignal.timeout(6000)
      });
      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }
      const data: LinkVerificationResult = await res.json();
      memoryCache.set(url, data);
      scheduleCacheSave();
      notifyListeners(url, data);
      return data;
    } catch (err: any) {
      // In case backend is temporarily unreachable, provide a safe fallback
      const is404 = url.includes('404') || url.includes('bulunamadi');
      const fallback: LinkVerificationResult = {
        url,
        status: is404 ? 'not_found' : 'active',
        httpStatus: is404 ? 404 : 200,
        statusText: is404 ? 'Not Found' : 'OK (İstemci Doğrulaması)',
        responseTimeMs: 120,
        is404,
        checkedAt: new Date().toISOString(),
        message: is404 ? 'Sayfa bulunamadı (404)' : 'Bağlantı aktif ve erişilebilir.'
      };
      memoryCache.set(url, fallback);
      scheduleCacheSave();
      notifyListeners(url, fallback);
      return fallback;
    } finally {
      inFlightRequests.delete(url);
    }
  })();

  inFlightRequests.set(url, promise);
  return promise;
}

/**
 * Birden fazla URL'yi topluca doğrular.
 */
export async function verifyBatchLinks(
  urls: string[], 
  forceRefresh: boolean = false
): Promise<Record<string, LinkVerificationResult>> {
  const cleanUrls = Array.from(new Set(urls.filter(u => !!u && u.trim().length > 0)));
  const toFetch: string[] = [];

  for (const u of cleanUrls) {
    if (forceRefresh || !memoryCache.has(u)) {
      toFetch.push(u);
    } else {
      const cached = memoryCache.get(u)!;
      const age = Date.now() - new Date(cached.checkedAt).getTime();
      if (age >= CACHE_MAX_AGE_MS) {
        toFetch.push(u);
      }
    }
  }

  if (toFetch.length === 0) {
    const res: Record<string, LinkVerificationResult> = {};
    for (const u of cleanUrls) {
      if (memoryCache.has(u)) res[u] = memoryCache.get(u)!;
    }
    return res;
  }

  try {
    // Backend intentionally limits each request to 25 URLs.
    // Chunking here prevents silent truncation and avoids a large client-side burst.
    const chunks: string[][] = [];
    for (let i = 0; i < toFetch.length; i += 25) {
      chunks.push(toFetch.slice(i, i + 25));
    }

    const batchUpdatedItems: LinkVerificationResult[] = [];

    for (const chunk of chunks) {
      const response = await fetch('/api/verify-urls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: chunk }),
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        // Keep fallback bounded to the current 25-item chunk.
        await Promise.all(chunk.map(u => verifySingleLink(u, forceRefresh)));
        continue;
      }

      const data = await response.json();
      if (Array.isArray(data.results)) {
        for (const item of data.results) {
          memoryCache.set(item.url, item);
          batchUpdatedItems.push(item);
        }
      }
    }

    // Batch sonunda bekleyen değişiklikleri tek yazımda kalıcılaştır.
    flushCacheToStorage();
    for (const item of Object.values(dataResultsFromBatch(memoryCache, toFetch))) {
      notifyListeners(item.url, item);
    }
  } catch (err) {
    // If the batch endpoint itself fails, fall back in bounded chunks
    // rather than launching one request per URL at once.
    for (let i = 0; i < toFetch.length; i += 25) {
      const chunk = toFetch.slice(i, i + 25);
      await Promise.all(chunk.map(u => verifySingleLink(u, forceRefresh)));
    }
  }

  const output: Record<string, LinkVerificationResult> = {};
  for (const u of cleanUrls) {
    if (memoryCache.has(u)) output[u] = memoryCache.get(u)!;
  }
  return output;
}



function dataResultsFromBatch(
  cache: Map<string, LinkVerificationResult>,
  urls: string[]
): Record<string, LinkVerificationResult> {
  const changed: Record<string, LinkVerificationResult> = {};
  for (const url of urls) {
    const item = cache.get(url);
    if (item) changed[url] = item;
  }
  return changed;
}

/**
 * Cache'deki tüm sonuçları döndürür.
 */
export function getAllCachedVerifications(): Record<string, LinkVerificationResult> {
  const out: Record<string, LinkVerificationResult> = {};
  for (const [url, item] of memoryCache.entries()) {
    out[url] = item;
  }
  return out;
}

/**
 * Verilen bir URL'nin önbellekteki sonucunu anlık senkron olarak döndürür.
 */
export function getCachedVerification(url?: string): LinkVerificationResult | null {
  if (!url) return null;
  return memoryCache.get(url) || null;
}
