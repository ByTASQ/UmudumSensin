import React, { useState, useMemo, useEffect } from 'react';
import { MatchResult, UserCriteria, JobSource, JobPosting } from '../types/job';
import { JobCard } from './JobCard';
import { evaluateJobMatch, normalizeTurkish } from '../services/matcher';
import { 
  Search, 
  CheckCircle2, 
  Bookmark, 
  Briefcase, 
  Landmark, 
  Building2, 
  Newspaper,
  Sparkles,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { useLinkVerification } from '../hooks/useLinkVerification';
import { isJobActive } from '../utils/dateUtils';
import { isSpecificJobUrl } from '../services/preciseSearchService';

const JOB_CITY_NORMALIZED_CACHE = new WeakMap<JobPosting, string>();

interface ResultsViewProps {
  results: MatchResult[];
  criteria: UserCriteria;
  sources: JobSource[];
  savedJobIds: string[];
  onOpenDetail?: (result: MatchResult) => void;
  onToggleSave: (jobId: string) => void;
  onNewScan: () => void;
  onToggleSector?: (sector: 'kamu' | 'ozel') => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  results,
  criteria,
  sources,
  savedJobIds,
  onToggleSave,
  onNewScan
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'eligible' | 'partial' | 'ineligible' | 'saved' | 'public' | 'private' | 'news' | 'kpss_free' | 'kpss_required'>('eligible');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [liveResults, setLiveResults] = useState<MatchResult[]>([]);

  // Dynamically fetch fresh live individual jobs from backend
  useEffect(() => {
    if (!criteria.profession) return;
    const controller = new AbortController();
    fetch(`/api/live-search-jobs?profession=${encodeURIComponent(criteria.profession)}&city=${encodeURIComponent(criteria.city || '')}`, {
      signal: controller.signal
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.jobs) && data.jobs.length > 0) {
          const mapped = data.jobs.map((j: JobPosting) => evaluateJobMatch(j, criteria));
          setLiveResults(mapped);
        }
      })
      .catch(() => {});

    return () => controller.abort();
  }, [criteria.profession, criteria.city]);

  // Merge live jobs with initial pool
  const allMergedResults = useMemo(() => {
    const existingUrls = new Set(results.map(r => r.job.originalUrl));
    const newItems = liveResults.filter(lr => !existingUrls.has(lr.job.originalUrl));
    return [...newItems, ...results];
  }, [results, liveResults]);

  // Extract jobs for status handling on cards
  const allInitialJobs = useMemo(() => allMergedResults.map(r => r.job), [allMergedResults]);
  const { getJobStatus } = useLinkVerification(allInitialJobs);

  // Bir ilanın linkinin 404/kırık veya başvuru süresi dolmuş/yayından kaldırılmış olup olmadığını denetle
  const isJobLinkBroken = (job: JobPosting): boolean => {
    const status = getJobStatus(job);
    return status?.is404 === true || status?.status === 'not_found' || status?.isExpired === true;
  };

  // Kullanıcının seçtiği il filtresini denetle
  const userCityNorm = normalizeTurkish(criteria.city || '');
  const isCityFilterActive = Boolean(
    userCityNorm && 
    !userCityNorm.includes('tum') && 
    !userCityNorm.includes('genel')
  );

  const isJobCityMatching = (job: JobPosting): boolean => {
    if (!isCityFilterActive) return true;
    let jobCityNorm = JOB_CITY_NORMALIZED_CACHE.get(job);
    if (jobCityNorm === undefined) {
      jobCityNorm = normalizeTurkish(job.city || '');
      JOB_CITY_NORMALIZED_CACHE.set(job, jobCityNorm);
    }
    const isNationwide = job.isNationwide === true ||
                         jobCityNorm.includes('tum') ||
                         jobCityNorm.includes('genel') ||
                         jobCityNorm.includes('turkiye');
    const isCityExact = jobCityNorm === userCityNorm || 
                        jobCityNorm.includes(userCityNorm) || 
                        userCityNorm.includes(jobCityNorm);
    return isNationwide || isCityExact;
  };

  // Sadece süresi dolmamış, linki 404 olmayan, boş arama formu/genel sayfa OLMAYAN ve aranan ille uyuşan tekil ilanları listele
  const activeResults = useMemo(() => {
    return allMergedResults.filter(r => 
      isJobActive(r.job) && 
      !isJobLinkBroken(r.job) && 
      isSpecificJobUrl(r.job.originalUrl) &&
      isJobCityMatching(r.job)
    );
  }, [allMergedResults, getJobStatus, isCityFilterActive, userCityNorm]);

  // Memurlar.net ve tüm haber bülteni/rehber içeriklerini kesin olarak haber tanımla
  const isNewsJob = (job: JobPosting): boolean => {
    const domainLower = (job.sourceDomain || '').toLowerCase();
    const urlLower = (job.originalUrl || '').toLowerCase();
    const sourceIdLower = (job.sourceId || '').toLowerCase();
    const sourceNameLower = (job.sourceName || '').toLowerCase();
    const titleLower = (job.title || '').toLowerCase();

    const isMemurlar = 
      sourceIdLower === 'memurlar' ||
      sourceIdLower === 'memurlar_net' ||
      domainLower.includes('memurlar.net') ||
      urlLower.includes('memurlar.net') ||
      sourceNameLower.includes('memurlar');

    const isPureInformational = 
      job.id === 'job-memurlar-portal-001' ||
      titleLower.includes('rehberi') ||
      titleLower.includes('tarihleri belli oldu') ||
      titleLower.includes('haber bülteni') ||
      titleLower.includes('son dakika:');

    return isMemurlar || isPureInformational;
  };

  const savedJobIdSet = useMemo(() => new Set(savedJobIds), [savedJobIds]);

  // Tüm kategori sayaçlarını tek geçişte hesapla. Böylece her render'da
  // activeResults üzerinde 7 ayrı filter() taraması yapılmaz.
  const activeStats = useMemo(() => {
    const newsJobs = new WeakSet<JobPosting>();
    let eligibleCount = 0;
    let savedCount = 0;
    let newsCount = 0;
    let publicCount = 0;
    let privateCount = 0;
    let kpssFreeCount = 0;
    let allJobsCount = 0;

    for (const result of activeResults) {
      const job = result.job;
      const news = isNewsJob(job);

      if (news) {
        newsJobs.add(job);
        newsCount++;
        continue;
      }

      if (result.status === 'eligible') {
        eligibleCount++;
        allJobsCount++;

        if (savedJobIdSet.has(job.id)) savedCount++;
        if (job.isPublicSector) publicCount++;
        else privateCount++;

        if (!job.requiresKpss && (!job.minKpssScore || job.minKpssScore === 0)) {
          kpssFreeCount++;
        }
      } else if (savedJobIdSet.has(job.id)) {
        savedCount++;
      }
    }

    return {
      newsJobs,
      eligibleCount,
      savedCount,
      newsCount,
      publicCount,
      privateCount,
      kpssFreeCount,
      allJobsCount
    };
  }, [activeResults, savedJobIdSet]);

  const {
    newsJobs,
    eligibleCount,
    savedCount,
    newsCount,
    publicCount,
    privateCount,
    kpssFreeCount,
    allJobsCount
  } = activeStats;

  const normalizedSearchQuery = searchQuery.trim().toLocaleLowerCase('tr-TR');

  const filteredResults = useMemo(() => {
    return activeResults.filter((res) => {
      // KULLANICI KURALI: Memurlar.net kesinlikle uygun ilanlar veya kamu/özel listesinde olamaz!
      // SADECE "Haberler" sekmesinde görünebilir!
      const isNews = newsJobs.has(res.job);
      if (statusFilter !== 'news' && isNews) {
        return false;
      }
      if (statusFilter === 'news' && !isNews) {
        return false;
      }

      // KULLANICI KURALI: Sadece şartlara uygun açık ilanları listele (şartlara uymayan ilanları süz)
      if (statusFilter !== 'news' && statusFilter !== 'saved' && res.status !== 'eligible') {
        return false;
      }

      // Sector filters (şartlara uygun kamu/özel)
      if (statusFilter === 'public' && !res.job.isPublicSector) return false;
      if (statusFilter === 'private' && res.job.isPublicSector) return false;

      // KPSS filters
      if (statusFilter === 'kpss_free' && (res.job.requiresKpss || (res.job.minKpssScore && res.job.minKpssScore > 0))) return false;
      if (statusFilter === 'kpss_required' && (!res.job.requiresKpss && (!res.job.minKpssScore || res.job.minKpssScore === 0))) return false;

      // Status filter
      if (statusFilter === 'eligible' && res.status !== 'eligible') return false;
      if (statusFilter === 'saved' && !savedJobIdSet.has(res.job.id)) return false;

      // Source filter
      if (sourceFilter !== 'all' && res.job.sourceId !== sourceFilter) return false;

      // Search query
      if (normalizedSearchQuery) {
        const q = normalizedSearchQuery;
        const matchTitle = res.job.title.toLowerCase().includes(q);
        const matchCompany = res.job.company.toLowerCase().includes(q);
        const matchCity = res.job.city.toLowerCase().includes(q);
        const matchDomain = res.job.sourceDomain ? res.job.sourceDomain.toLowerCase().includes(q) : false;
        if (!matchTitle && !matchCompany && !matchCity && !matchDomain) return false;
      }

      return true;
    }).sort((a, b) => b.matchPercentage - a.matchPercentage);
  }, [activeResults, statusFilter, sourceFilter, normalizedSearchQuery, savedJobIdSet]);

  // Sector display text
  const sectorSummary = criteria.includePublic && criteria.includePrivate
    ? 'Kamu & Özel Sektör'
    : criteria.includePublic
    ? 'Sadece Kamu'
    : 'Sadece Özel Sektör';

  return (
    <div className="w-full flex-1 flex flex-col min-h-0 bg-transparent">
      
      {/* 1. ÜST KRİTER VE FİLTRE ÇUBUĞU */}
      <div className="w-full px-4 sm:px-8 py-3 border-b border-purple-200/50 dark:border-purple-900/40 bg-white/40 dark:bg-slate-950/40 backdrop-blur-xs shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-slate-50 truncate">
              {criteria.profession || 'Tüm Meslekler'}
            </h2>
            <span className="px-2.5 py-0.5 text-[11px] font-extrabold rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80 shrink-0 flex items-center gap-1.5 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{activeResults.length} Aktif İlan</span>
            </span>
          </div>
          
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate font-medium">
            <span>{criteria.city || 'Tüm İller'}</span>
            <span className="mx-1.5 opacity-40">·</span>
            <span>{criteria.educationLevel || 'Mezuniyet'}</span>
            <span className="mx-1.5 opacity-40">·</span>
            <span>{sectorSummary}</span>
            {criteria.noKpss && (
              <>
                <span className="mx-1.5 opacity-40">·</span>
                <span className="text-teal-600 dark:text-teal-400 font-semibold">KPSS Şartsız</span>
              </>
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={onNewScan}
          className="self-start md:self-auto flex items-center gap-1.5 px-3.5 py-1.5 bg-white/80 dark:bg-slate-900/80 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer border border-purple-200/60 dark:border-purple-900/40"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
          <span>Kriterleri Değiştir</span>
        </button>
      </div>

      {/* 2. KATEGORİ VE ARAMA PANELİ */}
      <div className="p-3 sm:px-8 border-b border-purple-200/50 dark:border-purple-900/40 bg-white/30 dark:bg-slate-950/30 backdrop-blur-xs space-y-2.5 shrink-0">
        {/* Sekme Düğmeleri */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
          <button
            onClick={() => setStatusFilter('eligible')}
            className={`px-3 py-1.5 rounded-lg font-extrabold whitespace-nowrap transition cursor-pointer ${
              statusFilter === 'eligible'
                ? 'bg-purple-600 text-white shadow-xs ring-1 ring-purple-400/50'
                : 'bg-white dark:bg-slate-800/95 text-slate-800 dark:text-slate-100 border border-purple-200/80 dark:border-purple-800/80 hover:bg-purple-50 dark:hover:bg-slate-700/80'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Uygun ({eligibleCount})</span>
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('public')}
            className={`px-3 py-1.5 rounded-lg font-extrabold whitespace-nowrap transition cursor-pointer ${
              statusFilter === 'public'
                ? 'bg-purple-600 text-white shadow-xs ring-1 ring-purple-400/50'
                : 'bg-white dark:bg-slate-800/95 text-slate-800 dark:text-slate-100 border border-purple-200/80 dark:border-purple-800/80 hover:bg-purple-50 dark:hover:bg-slate-700/80'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Landmark className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>Kamu ({publicCount})</span>
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('private')}
            className={`px-3 py-1.5 rounded-lg font-extrabold whitespace-nowrap transition cursor-pointer ${
              statusFilter === 'private'
                ? 'bg-purple-600 text-white shadow-xs ring-1 ring-purple-400/50'
                : 'bg-white dark:bg-slate-800/95 text-slate-800 dark:text-slate-100 border border-purple-200/80 dark:border-purple-800/80 hover:bg-purple-50 dark:hover:bg-slate-700/80'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>Özel ({privateCount})</span>
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('news')}
            className={`px-3 py-1.5 rounded-lg font-extrabold whitespace-nowrap transition cursor-pointer ${
              statusFilter === 'news'
                ? 'bg-amber-600 text-white shadow-xs ring-1 ring-amber-400/50'
                : 'bg-white dark:bg-slate-800/95 text-slate-800 dark:text-slate-100 border border-purple-200/80 dark:border-purple-800/80 hover:bg-amber-50 dark:hover:bg-slate-700/80'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Newspaper className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Haberler ({newsCount})</span>
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('kpss_free')}
            className={`px-3 py-1.5 rounded-lg font-extrabold whitespace-nowrap transition cursor-pointer ${
              statusFilter === 'kpss_free'
                ? 'bg-teal-600 text-white shadow-xs ring-1 ring-teal-400/50'
                : 'bg-white dark:bg-slate-800/95 text-slate-800 dark:text-slate-100 border border-purple-200/80 dark:border-purple-800/80 hover:bg-purple-50 dark:hover:bg-slate-700/80'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-500" />
              <span>Şartsız ({kpssFreeCount})</span>
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-extrabold whitespace-nowrap transition cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs'
                : 'bg-white dark:bg-slate-800/95 text-slate-800 dark:text-slate-100 border border-purple-200/80 dark:border-purple-800/80 hover:bg-purple-50 dark:hover:bg-slate-700/80'
            }`}
          >
            <span>Tüm İlanlar ({allJobsCount})</span>
          </button>

          {savedCount > 0 && (
            <button
              onClick={() => setStatusFilter('saved')}
              className={`px-3 py-1.5 rounded-lg font-extrabold whitespace-nowrap transition cursor-pointer ${
                statusFilter === 'saved'
                  ? 'bg-purple-900 text-white shadow-xs ring-1 ring-purple-400/50'
                  : 'bg-white dark:bg-slate-800/95 text-slate-800 dark:text-slate-100 border border-purple-200/80 dark:border-purple-800/80 hover:bg-purple-50 dark:hover:bg-slate-700/80'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5 text-purple-400 fill-current" />
                <span>Kayıtlı ({savedCount})</span>
              </span>
            </button>
          )}
        </div>

        {/* Arama Kutusu ve Kaynak Dropdown */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="İlan unvanı veya kurum filtrele..."
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-white/80 dark:bg-slate-900/80 border border-purple-200/70 dark:border-purple-900/50 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-purple-500 font-medium placeholder:text-slate-400 text-slate-900 dark:text-slate-100"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="px-2 py-1.5 text-xs bg-white/80 dark:bg-slate-900/80 border border-purple-200/70 dark:border-purple-900/50 rounded-lg focus:outline-hidden font-medium text-slate-700 dark:text-slate-200 shrink-0 cursor-pointer"
          >
            <option value="all">Tüm Kaynaklar</option>
            {sources.map(s => (
              <option key={s.id} value={s.id}>{s.shortName}</option>
            ))}
          </select>
        </div>

        {/* Aktif ve Geçerli İlan Filtre Rozeti */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-emerald-800 dark:text-emerald-300 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/50 rounded-lg">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Süresi dolmuş veya kapatılmış ilanlar süzüldü. Yalnızca şartlara uygun açık ilanlar listeleniyor.</span>
        </div>
      </div>

      {/* 3. İLAN LİSTESİ - Sade, Tam Genişlik ve Doğrudan İlana Geçiş */}
      <div className="flex-1 overflow-y-auto">
        {filteredResults.length === 0 ? (
          <div className="p-8 max-w-lg mx-auto text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/70 border border-purple-200 dark:border-purple-800 flex items-center justify-center mx-auto text-purple-600 dark:text-purple-400">
              <Briefcase className="w-6 h-6" />
            </div>

            <div>
              <p className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                {criteria.profession 
                  ? `"${criteria.profession}" kriterine uygun açık ilan bulunamadı` 
                  : 'Kriterlerinize uygun açık ilan bulunamadı'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                {criteria.profession 
                  ? `Girdiğiniz "${criteria.profession}" unvanı resmi meslek veritabanında yer almıyor veya şu anda bu unvana ait yayında açık bir ilan bulunmuyor.`
                  : 'Seçili filtrelerde şu anda yayında olan açık bir ilan bulunmuyor.'}
              </p>
              <div className="pt-3">
                <button
                  type="button"
                  onClick={onNewScan}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Kriterleri Değiştir / Geçerli Meslek Ara</span>
                </button>
              </div>

              {statusFilter === 'eligible' && (Number(criteria.age) > 35 || criteria.noKpss) && (
                <div className="mt-3 p-3.5 rounded-xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 text-left text-xs space-y-2">
                  <p className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                    <span>💡</span>
                    <span>Bu Durum Neden Normal?</span>
                  </p>
                  <ul className="space-y-1 text-amber-800 dark:text-amber-300/90 list-disc list-inside">
                    {Number(criteria.age) > 35 && (
                      <li>
                        Resmi kamu (657/4B) alımlarında azami <strong>35 yaş sınırı</strong> aranmaktadır (Girdiğiniz yaş: <strong>{criteria.age}</strong>).
                      </li>
                    )}
                    {criteria.noKpss && (
                      <li>
                        Resmi kamu tekniker alımlarında <strong>KPSS taban puanı (P93)</strong> zorunludur (Seçiminiz: <strong>KPSS Şartsız</strong>).
                      </li>
                    )}
                  </ul>
                  <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium pt-1">
                    Kamu sürekli işçi (İŞKUR) veya özel sektör ilanlarını görmek için aşağıdaki butonları kullanabilirsiniz:
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              {kpssFreeCount > 0 && statusFilter !== 'kpss_free' && (
                <button
                  type="button"
                  onClick={() => setStatusFilter('kpss_free')}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white transition cursor-pointer shadow-xs"
                >
                  Şartsız İlanları Gör ({kpssFreeCount})
                </button>
              )}
              {activeResults.length > 0 && statusFilter !== 'all' && (
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition cursor-pointer shadow-xs"
                >
                  Tüm İlanları İncele ({activeResults.length})
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('all');
                  setSourceFilter('all');
                  setSearchQuery('');
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition cursor-pointer"
              >
                Filtreleri Sıfırla
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-purple-100/70 dark:divide-purple-950/40">
            {filteredResults.map((result, idx) => (
              <JobCard
                key={`${result.job.id}-${result.job.sourceId || idx}`}
                result={result}
                isSaved={savedJobIdSet.has(result.job.id)}
                onToggleSave={onToggleSave}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
