import React, { useState, useEffect } from 'react';
import { MatchResult, UserCriteria } from '../types/job';
import { analyzeJobWithAI, AIAnalysisResult } from '../services/geminiAnalyzer';
import { getJobPortalLinks, getSafeJobUrl, getMemurlarSearchUrl } from '../utils/navigation';
import { 
  X, 
  MapPin, 
  Calendar, 
  ExternalLink, 
  Building2, 
  FileText, 
  Sparkles, 
  Loader2, 
  Share2, 
  Bookmark, 
  BookmarkCheck, 
  Award, 
  Hash, 
  Search, 
  Copy, 
  CheckCircle2, 
  Globe, 
  Link2, 
  AlertCircle, 
  AlertTriangle,
  Check, 
  GraduationCap, 
  Briefcase, 
  ShieldCheck, 
  RefreshCw,
  ArrowLeft,
  Users
} from 'lucide-react';
import { 
  verifySingleLink, 
  getCachedVerification, 
  LinkVerificationResult 
} from '../services/linkVerificationService';

interface JobDetailPaneProps {
  result: MatchResult | null;
  criteria: UserCriteria;
  isSaved?: boolean;
  verification?: LinkVerificationResult | null;
  onClose?: () => void;
  onToggleSave?: (jobId: string) => void;
}

export const JobDetailPane: React.FC<JobDetailPaneProps> = ({
  result,
  criteria,
  isSaved = false,
  verification: propVerification,
  onClose,
  onToggleSave
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'official_notice' | 'guide' | 'links'>('details');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const safeOriginalUrl = result ? getSafeJobUrl(result.job) : '';
  const [verification, setVerification] = useState<LinkVerificationResult | null>(() => 
    propVerification || (safeOriginalUrl ? getCachedVerification(safeOriginalUrl) : null)
  );
  const [isCheckingLink, setIsCheckingLink] = useState(false);

  useEffect(() => {
    if (propVerification) {
      setVerification(propVerification);
      return;
    }
    if (!safeOriginalUrl) return;
    const cached = getCachedVerification(safeOriginalUrl);
    if (cached) {
      setVerification(cached);
    } else {
      setIsCheckingLink(true);
      verifySingleLink(safeOriginalUrl).then(res => {
        setVerification(res);
        setIsCheckingLink(false);
      });
    }
  }, [safeOriginalUrl, propVerification]);

  const handleRecheckLink = async () => {
    if (!safeOriginalUrl) return;
    setIsCheckingLink(true);
    try {
      const res = await verifySingleLink(safeOriginalUrl, true);
      setVerification(res);
    } finally {
      setIsCheckingLink(false);
    }
  };

  if (!result) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-500 dark:text-slate-400">
        <Briefcase className="w-12 h-12 text-purple-300 dark:text-purple-900/60 mb-3" />
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
          İncelemek İstediğiniz İlanı Seçin
        </h3>
        <p className="text-xs max-w-xs mt-1 text-slate-500 dark:text-slate-400">
          Soldaki listeden bir ilana tıkladığınızda başvuru şartları, kadro kontenjanı ve doğrudan resmi linkleri burada görüntülenir.
        </p>
      </div>
    );
  }

  const { job, status, matchPercentage, checks, ineligibilityReason } = result;
  const portalLinks = getJobPortalLinks(job, criteria.profession, criteria.city);
  const memurlarSearchUrl = getMemurlarSearchUrl(job);

  const handleCopy = (url: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2500);
    }
  };

  const handleShare = () => {
    const text = `${job.title} - ${job.company} (${job.city})\nSon Başvuru: ${job.deadlineDate}\nİlan Kodu: ${job.referenceCode}\nİlan: ${safeOriginalUrl || job.originalUrl}`;
    handleCopy(text);
  };

  const runAiAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const res = await analyzeJobWithAI(job, criteria);
      setAiAnalysis(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white/70 dark:bg-slate-900/70 backdrop-blur-md overflow-hidden select-none">
      
      {/* 1. Üst Bar: Geri/Kapat, Sektör Rozeti, Kaydet ve Paylaş Butonları (İnce Çizgiyle Ayrılmış) */}
      <div className="px-4 py-3 border-b border-purple-200/50 dark:border-purple-900/40 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="lg:hidden p-1.5 -ml-1 text-slate-600 dark:text-slate-300 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/40 rounded-lg transition cursor-pointer"
              title="Listeye Dön"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          <span className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-lg border ${
            job.isPublicSector
              ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900/60'
              : 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900/60'
          }`}>
            <span>{job.isPublicSector ? '🏛️ Kamu' : '🏢 Özel Sektör'}</span>
            <span>·</span>
            <span>{job.sourceName || job.sourceDomain}</span>
          </span>

          <span className="text-xs text-slate-400 dark:text-slate-500 font-mono flex items-center gap-1 truncate">
            <Hash className="w-3 h-3 shrink-0" />
            <span className="truncate">{job.referenceCode}</span>
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {onToggleSave && (
            <button
              type="button"
              onClick={() => onToggleSave(job.id)}
              className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition cursor-pointer"
              title={isSaved ? "Kaydedilenlerden Çıkar" : "İlanı Kaydet"}
            >
              {isSaved ? (
                <BookmarkCheck className="w-4 h-4 text-purple-600 fill-purple-600/20" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </button>
          )}

          <button
            type="button"
            onClick={handleShare}
            title="İlanı Kopyala"
            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="hidden lg:inline-flex p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition cursor-pointer"
              title="Paneli Kapat"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Sekme Butonları (İnce Çizgiyle Ayrılmış) */}
      <div className="flex items-center border-b border-purple-200/50 dark:border-purple-900/40 bg-purple-50/40 dark:bg-slate-900/40 px-3 pt-2 gap-1 text-xs shrink-0 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('details')}
          className={`px-3 py-2 font-bold rounded-t-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'details'
              ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 border-t-2 border-purple-600 shadow-2xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-300 hover:bg-purple-100/40'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Şartlar & Uygunluk</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('official_notice')}
          className={`px-3 py-2 font-bold rounded-t-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'official_notice'
              ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 border-t-2 border-purple-600 shadow-2xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-300 hover:bg-purple-100/40'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Resmi İlan Metni</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('guide')}
          className={`px-3 py-2 font-bold rounded-t-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'guide'
              ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 border-t-2 border-purple-600 shadow-2xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-300 hover:bg-purple-100/40'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Başvuru Kılavuzu</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('links')}
          className={`px-3 py-2 font-bold rounded-t-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'links'
              ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 border-t-2 border-purple-600 shadow-2xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-300 hover:bg-purple-100/40'
          }`}
        >
          <Link2 className="w-3.5 h-3.5" />
          <span>Portallar ({portalLinks.length})</span>
        </button>
      </div>

      {/* 3. Ana İçerik Kaydırma Alanı */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs">
        
        {/* İlan Başlığı & Kurum */}
        <div className="pb-3 border-b border-purple-100 dark:border-purple-950">
          <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-50 leading-snug">
            {job.title}
          </h2>
          <div className="flex items-center gap-2 mt-1 text-slate-600 dark:text-slate-400 flex-wrap">
            <span className="font-bold text-slate-800 dark:text-slate-200">{job.company}</span>
            <span>·</span>
            <span className="inline-flex items-center gap-1 font-medium">
              <MapPin className="w-3 h-3 text-slate-400" />
              <span>{job.city}{job.district ? ` / ${job.district}` : ''}</span>
            </span>
            <span>·</span>
            <span className="inline-flex items-center gap-1 font-medium">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>Son: {job.deadlineDate}</span>
              {(verification?.is404 || verification?.status === 'not_found' || verification?.isExpired) ? (
                <span className="ml-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/60">
                  <span className="w-1 h-1 rounded-full bg-rose-500"></span>
                  Süresi Dolmuş
                </span>
              ) : (
                <span className="ml-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                  <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
                  Başvuruya Açık
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Canlı İlan Geçerlilik Durumu Uyarısı */}
        {(verification?.is404 || verification?.status === 'not_found' || verification?.isExpired) && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-xs block">İlanın Başvuru Süresi Sona Ermiştir</span>
              <p className="text-[11px] text-rose-700 dark:text-rose-400 mt-0.5">
                {verification.message || 'Yayıncı kurum portalında bu ilanın başvuru süresinin sona erdiği veya ilanın yayından kaldırıldığı doğrulanmıştır.'}
              </p>
            </div>
          </div>
        )}

        {/* ================= TAB 1: DETAYLAR & ŞARTLAR ================= */}
        {activeTab === 'details' && (
          <div className="space-y-4">
            
            {/* Uyum Durum Kartı (İnce Çizgili) */}
            <div className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
              status === 'eligible'
                ? 'bg-purple-50/70 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-200'
                : status === 'partial'
                ? 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                : 'bg-rose-50/70 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
            }`}>
              <div className="flex items-center gap-2.5">
                {status === 'eligible' ? (
                  <CheckCircle2 className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0" />
                ) : status === 'partial' ? (
                  <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                ) : (
                  <X className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
                )}
                <div>
                  <span className="font-extrabold text-sm block">
                    {status === 'eligible' ? 'Tam Uyumlu Profil' : status === 'partial' ? 'Kısmi Uyum' : 'Şartlar Karşılanmıyor'}
                  </span>
                  <span className="text-[11px] opacity-80">
                    {status === 'eligible'
                      ? 'Girdiğiniz mezuniyet, yaş ve bölüm kriterleri ilanla tam uyuşmaktadır.'
                      : ineligibilityReason || 'Bazı zorunlu başvuru koşulları profilinizle uyuşmamaktadır.'}
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xl font-black">%{matchPercentage}</span>
                <span className="block text-[10px] uppercase font-bold opacity-75">Uyum Skoru</span>
              </div>
            </div>

            {/* Kriter Değerlendirme Listesi (İnce Çizgilerle Ayrılmış) */}
            <div className="rounded-xl border border-purple-200/60 dark:border-purple-900/40 divide-y divide-purple-100 dark:divide-purple-950 overflow-hidden bg-white/40 dark:bg-slate-900/40">
              {checks.map((c, i) => (
                <div key={i} className="p-3 flex items-start justify-between gap-3 text-xs">
                  <div className="flex items-start gap-2 min-w-0">
                    {c.isSatisfied ? (
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <X className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    )}
                    <div className="min-w-0">
                      <span className="font-bold text-slate-800 dark:text-slate-200 block truncate">{c.title}</span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{c.reason}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0 text-[11px]">
                    <span className="font-medium text-slate-700 dark:text-slate-300 block">{c.userValue}</span>
                    <span className="text-slate-400 dark:text-slate-500 text-[10px] block">İlan: {c.requiredValue}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* İlan Açıklaması ve Ek Şartlar */}
            <div className="p-3.5 rounded-xl border border-purple-200/60 dark:border-purple-900/40 bg-white/40 dark:bg-slate-900/40 space-y-2">
              <span className="font-bold text-slate-900 dark:text-slate-100 block">İlan Özeti</span>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {job.description}
              </p>
              {job.additionalRequirements && job.additionalRequirements.length > 0 && (
                <div className="pt-2 border-t border-purple-100 dark:border-purple-950 space-y-1">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block text-[11px]">Özel Şartlar:</span>
                  <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-0.5 text-[11px]">
                    {job.additionalRequirements.map((req, idx) => (
                      <li key={idx}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ================= TAB 2: RESMİ İLAN METNİ ================= */}
        {activeTab === 'official_notice' && (
          <div className="space-y-3">
            <div className="p-3.5 rounded-xl border border-purple-200/60 dark:border-purple-900/40 bg-white/40 dark:bg-slate-900/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-slate-100">Doğrulanmış İlan Bağlantısı</span>
                <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400">{job.sourceDomain}</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                {job.isPublicSector
                  ? 'Bu kamu alım duyurusu ilgili kamu kurumunun resmi internet sitesi ve Resmi Gazete / Memurlar.net indekslerinde doğrulanmıştır.'
                  : 'Bu özel sektör iş ilanı İŞKUR ve doğrulanmış işveren istihdam portallarında yayındadır.'}
              </p>
              <div className="p-2.5 rounded-lg bg-purple-50/60 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-900/40 font-mono text-[11px] text-purple-800 dark:text-purple-300 break-all">
                {safeOriginalUrl || job.originalUrl}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: BAŞVURU KILAVUZU ================= */}
        {activeTab === 'guide' && (
          <div className="space-y-3">
            <div className="p-3.5 rounded-xl border border-purple-200/60 dark:border-purple-900/40 bg-white/40 dark:bg-slate-900/40 space-y-2.5">
              <span className="font-bold text-slate-900 dark:text-slate-100 block">Başvuru Adımları</span>
              <ol className="list-decimal list-inside text-slate-600 dark:text-slate-300 space-y-1.5 leading-relaxed">
                <li>Aşağıdaki <strong>"Doğrudan İlana Git"</strong> butonuyla resmi duyuru veya başvuru formunu açın.</li>
                <li>{job.isPublicSector ? 'Kamu ilanlarında e-Devlet şifrenizle Kariyer Kapısı veya kurumun başvuru portalına giriş yapın.' : 'İŞKUR veya kariyer portalı üzerinden online özgeçmişinizle başvurunuzu iletin.'}</li>
                <li>Son başvuru tarihi (<strong className="text-purple-700 dark:text-purple-300">{job.deadlineDate}</strong>) mesai bitimine kadar formunuzu onaylayın.</li>
              </ol>
            </div>
          </div>
        )}

        {/* ================= TAB 4: PORTALLAR ================= */}
        {activeTab === 'links' && (
          <div className="space-y-2">
            {portalLinks.map((p, i) => (
              <a
                key={i}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl border border-purple-200/60 dark:border-purple-900/40 bg-white/40 dark:bg-slate-900/40 hover:bg-purple-50/60 dark:hover:bg-purple-950/40 transition flex items-center justify-between gap-3 group cursor-pointer"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition truncate">
                      {p.name}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 shrink-0">
                      {p.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {p.description}
                  </p>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-purple-600 shrink-0 transition" />
              </a>
            ))}
          </div>
        )}

      </div>

      {/* 4. Alt Eylem Çubuğu (Doğrudan İlana Git Butonu) - İnce Çizgiyle Ayrılmış */}
      <div className="p-3.5 border-t border-purple-200/50 dark:border-purple-900/40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md shrink-0 flex items-center justify-between gap-3">
        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
          <span>Son: <strong className="text-slate-700 dark:text-slate-300">{job.deadlineDate}</strong></span>
          {job.quota && (
            <span className="ml-2">· {job.quota} Kontenjan</span>
          )}
        </div>

        <a
          href={safeOriginalUrl || job.originalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-5 py-2.5 text-xs font-black text-white bg-purple-600 hover:bg-purple-700 active:scale-95 shadow-md shadow-purple-950/20 rounded-xl transition flex items-center gap-2 cursor-pointer shrink-0"
        >
          <span>{job.isPublicSector ? 'Resmi İlanı Aç' : 'Direkt İlana Git'}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

    </div>
  );
};
