import React from 'react';
import { MatchResult } from '../types/job';
import { ExternalLink, Bookmark, BookmarkCheck } from 'lucide-react';
import { getSafeJobUrl } from '../utils/navigation';

interface CachedJobCardFields {
  cityLower: string;
  titleLower: string;
  descLower: string;
  companyLower: string;
  sourceIdLower: string;
  sourceDomainLower: string;
  originalUrlLower: string;
}

const JOB_CARD_FIELDS_CACHE = new WeakMap<MatchResult['job'], CachedJobCardFields>();

const SAFE_JOB_URL_CACHE = new WeakMap<MatchResult['job'], string>();

const getCachedSafeJobUrl = (job: MatchResult['job']): string => {
  const cached = SAFE_JOB_URL_CACHE.get(job);
  if (cached !== undefined) return cached;
  const url = getSafeJobUrl(job);
  SAFE_JOB_URL_CACHE.set(job, url);
  return url;
};



const getCachedJobCardFields = (job: MatchResult['job']): CachedJobCardFields => {
  const cached = JOB_CARD_FIELDS_CACHE.get(job);
  if (cached) return cached;

  const fields: CachedJobCardFields = {
    cityLower: (job.city || '').toLocaleLowerCase('tr-TR'),
    titleLower: (job.title || '').toLocaleLowerCase('tr-TR'),
    descLower: (job.description || '').toLocaleLowerCase('tr-TR'),
    companyLower: (job.company || '').toLocaleLowerCase('tr-TR'),
    sourceIdLower: (job.sourceId || '').toLocaleLowerCase('tr-TR'),
    sourceDomainLower: (job.sourceDomain || '').toLocaleLowerCase('tr-TR'),
    originalUrlLower: (job.originalUrl || '').toLocaleLowerCase('tr-TR')
  };

  JOB_CARD_FIELDS_CACHE.set(job, fields);
  return fields;
};

  result: MatchResult;
  isSelected?: boolean;
  isSaved?: boolean;
  verification?: any;
  onOpenDetail?: (result: MatchResult) => void;
  onToggleSave?: (jobId: string) => void;
  onRecheck?: (url: string) => void;
}

const JobCardComponent: React.FC<JobCardProps> = ({
  result,
  isSaved = false,
  onToggleSave
}) => {
  const { job, matchPercentage } = result;
  const safeUrl = getCachedSafeJobUrl(job);
  const { cityLower, titleLower, descLower, companyLower, sourceIdLower, sourceDomainLower, originalUrlLower } = getCachedJobCardFields(job);

  // Memurlar.net bir kamu kurumu değil, ilan haberleri yapan bir haber sitesidir.
  const isMemurlarNews =
    sourceIdLower === 'memurlar_net' ||
    sourceIdLower === 'memurlar' ||
    sourceDomainLower.includes('memurlar.net') ||
    originalUrlLower.includes('memurlar.net');

  // Konum: Eğer ilan tüm iller / tüm Türkiye şeklinde girilmişse,
  // kullanıcının aradığı il (örn: Aydın) yerine "Tüm İller" olarak gösterilir.

  const isNationwide = job.isNationwide === true || 
                       cityLower.includes('tüm') || 
                       cityLower.includes('tum') || 
                       cityLower.includes('genel') || 
                       cityLower.includes('türkiye') || 
                       cityLower.includes('turkiye') ||
                       titleLower.includes('tüm iller') ||
                       titleLower.includes('tum iller') ||
                       titleLower.includes('türkiye geneli') ||
                       titleLower.includes('turkiye geneli') ||
                       titleLower.includes('81 il') ||
                       descLower.includes('tüm iller') ||
                       descLower.includes('türkiye geneli');

  const locationText = isNationwide
    ? 'Tüm İller'
    : (job.district && job.district !== 'Merkez'
        ? `${job.city} / ${job.district}`
        : job.city || 'Tüm İller');

  // Kontenjan
  const quotaText = job.quota ? `${job.quota} Kişi` : '1 Kişi';

  // Son Başvuru Tarihi
  const deadlineText = job.deadlineDate || 'Belirtilmemiş';

  // Şirket / Kurum metni
  const isTitleRedundant = Boolean(job.title && (
    titleLower.includes(companyLower) ||
    companyLower.includes(titleLower)
  ));
  const companyDisplayText = !isTitleRedundant && job.title
    ? `${job.company} · ${job.title}`
    : job.company || job.title || 'Belirtilmemiş Kurum';

  const handleCardClick = () => {
    window.open(safeUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <article 
      onClick={handleCardClick}
      style={{ contentVisibility: 'auto', containIntrinsicSize: '0 112px' }}
      className="w-full px-4 sm:px-6 py-3 border-b border-purple-100/70 dark:border-purple-950/40 hover:bg-purple-50/30 dark:hover:bg-purple-950/20 transition-colors cursor-pointer"
    >
      <div className="w-full space-y-1.5 min-w-0">
        
        {/* 1. Satır: Uyum Yüzdesi - İlana Git / Habere Git Butonu - Memurlar.net Belirteci - En Sağda Favori İkonu */}
        <div className="flex items-center justify-between gap-2 w-full min-w-0">
          <div className="flex items-center gap-2 min-w-0 shrink-0">
            {/* Uyum Yüzdesi */}
            <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-md border shrink-0 ${
              matchPercentage >= 80
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                : matchPercentage >= 50
                ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
            }`}>
              %{matchPercentage} Uyum
            </span>

            {/* İlana Git / Habere Git Butonu */}
            <a
              href={safeUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold text-white transition-colors shadow-2xs shrink-0 cursor-pointer ${
                isMemurlarNews 
                  ? 'bg-amber-600 hover:bg-amber-700' 
                  : 'bg-purple-600 hover:bg-purple-700'
              }`}
              title={isMemurlarNews ? "Memurlar.net ilan haberine git" : "Resmi ilana git"}
            >
              <span>{isMemurlarNews ? 'Habere Git' : 'İlana Git'}</span>
              <ExternalLink className="w-3 h-3 stroke-[2.5]" />
            </a>

            {/* Memurlar.net Haber Belirteci */}
            {isMemurlarNews && (
              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-amber-100/90 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800 shrink-0">
                Memurlar.net Haberi
              </span>
            )}
          </div>

          {/* En Sağda Favori İkonu */}
          {onToggleSave && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave(job.id);
              }}
              title={isSaved ? "Kaydedilenlerden Çıkar" : "İlanı Kaydet"}
              className={`p-1 rounded-md transition cursor-pointer shrink-0 ${
                isSaved 
                  ? 'text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40' 
                  : 'text-slate-400 hover:text-purple-600 dark:hover:text-purple-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {isSaved ? (
                <BookmarkCheck className="w-4 h-4 fill-purple-600/20" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        {/* 2. Satır: İlana ait şirket veya kurum */}
        <div className="w-full min-w-0">
          <h3 
            className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate"
            title={companyDisplayText}
          >
            {companyDisplayText}
          </h3>
        </div>

        {/* 3. Satır: Kontenjan ve Konum */}
        <div className="w-full min-w-0 text-xs text-slate-600 dark:text-slate-400 truncate font-medium">
          <span>Kontenjan: <strong className="font-semibold text-slate-700 dark:text-slate-300">{quotaText}</strong></span>
          <span className="mx-1.5 text-slate-300 dark:text-slate-600">·</span>
          <span>Konum: <strong className="font-semibold text-slate-700 dark:text-slate-300">{locationText}</strong></span>
        </div>

        {/* 4. Satır: Son Başvuru Tarihi */}
        <div className="w-full min-w-0 text-xs text-slate-500 dark:text-slate-400 truncate font-medium">
          <span>Son Başvuru Tarihi: <strong className="font-semibold text-slate-700 dark:text-slate-300">{deadlineText}</strong></span>
        </div>

      </div>
    </article>
  );
};

export const JobCard = React.memo(JobCardComponent);
