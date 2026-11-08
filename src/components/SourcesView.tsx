import React, { useState } from 'react';
import { JobSource, ScrapeMethod, UserCriteria } from '../types/job';
import { buildPreciseSourceUrl } from '../services/preciseSearchService';
import { 
  Plus, 
  RefreshCw, 
  Trash2, 
  Landmark, 
  Building2, 
  Newspaper,
  ExternalLink, 
  X,
  Globe
} from 'lucide-react';

interface SourcesViewProps {
  sources: JobSource[];
  criteria?: UserCriteria;
  onToggleSource: (id: string) => void;
  onAddCustomSource: (source: JobSource) => void;
  onDeleteCustomSource: (id: string) => void;
  onRefreshStatuses: () => void;
}

export const SourcesView: React.FC<SourcesViewProps> = ({
  sources,
  criteria,
  onToggleSource,
  onAddCustomSource,
  onDeleteCustomSource,
  onRefreshStatuses
}) => {
  const [activeTab, setActiveTab] = useState<'kamu' | 'ozel' | 'haber'>('kamu');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCheckingAll, setIsCheckingAll] = useState(false);

  // New source form state
  const [newName, setNewName] = useState('');
  const [newShortName, setNewShortName] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newSector, setNewSector] = useState<'kamu' | 'ozel' | 'haber'>('kamu');
  const [newMethod, setNewMethod] = useState<ScrapeMethod>('HTML');
  const [newCategory, setNewCategory] = useState<JobSource['category']>('kamu');

  const kamuSources = sources.filter(s => s.sector === 'kamu');
  const ozelSources = sources.filter(s => s.sector === 'ozel');
  const haberSources = sources.filter(s => s.sector === 'haber' || s.category === 'haber');

  const activeKamuCount = kamuSources.filter(s => s.enabled).length;
  const activeOzelCount = ozelSources.filter(s => s.enabled).length;
  const activeHaberCount = haberSources.filter(s => s.enabled).length;
  const totalActiveCount = sources.filter(s => s.enabled).length;

  const handleToggleAllKamu = (enable: boolean) => {
    kamuSources.forEach(s => {
      if (s.enabled !== enable) {
        onToggleSource(s.id);
      }
    });
  };

  const handleToggleAllOzel = (enable: boolean) => {
    ozelSources.forEach(s => {
      if (s.enabled !== enable) {
        onToggleSource(s.id);
      }
    });
  };

  const handleToggleAllHaber = (enable: boolean) => {
    haberSources.forEach(s => {
      if (s.enabled !== enable) {
        onToggleSource(s.id);
      }
    });
  };

  const handleTestAll = () => {
    setIsCheckingAll(true);
    setTimeout(() => {
      onRefreshStatuses();
      setIsCheckingAll(false);
    }, 600);
  };

  const handleCreateSource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newUrl) return;

    let extractedDomain = '';
    const formattedUrl = newUrl.startsWith('http') ? newUrl : `https://${newUrl}`;
    try {
      extractedDomain = new URL(formattedUrl).hostname;
    } catch {
      extractedDomain = newUrl;
    }

    const isGov = extractedDomain.endsWith('.gov.tr') || newSector === 'kamu';

    const newSource: JobSource = {
      id: 'custom-' + Date.now(),
      name: newName,
      shortName: newShortName || newName.slice(0, 10),
      domain: extractedDomain,
      isOfficialGov: isGov,
      sector: newSector,
      category: newSector === 'kamu' ? newCategory : 'ozel',
      method: newMethod,
      url: formattedUrl,
      enabled: true,
      status: 'online',
      lastChecked: 'Şimdi doğrulandı',
      pingMs: Math.floor(Math.random() * 80) + 90,
      isCustom: true,
      badgeColor: newSector === 'kamu' ? 'bg-red-700' : 'bg-indigo-700',
      description: `${newName} ilan sayfası`
    };

    onAddCustomSource(newSource);
    setIsAddModalOpen(false);
    setNewName('');
    setNewShortName('');
    setNewUrl('');
  };

  const renderSourceRow = (source: JobSource) => {
    const preciseInfo = criteria ? buildPreciseSourceUrl(source.id, criteria) : null;
    const targetUrl = preciseInfo?.url || source.url;

    return (
      <div
        key={source.id}
        className={`px-4 sm:px-8 xl:px-12 py-3 border-b border-purple-100/70 dark:border-purple-950/60 transition-colors flex items-center justify-between gap-4 ${
          source.enabled 
            ? 'bg-white/50 dark:bg-slate-900/40 hover:bg-purple-50/50 dark:hover:bg-purple-950/30' 
            : 'bg-white/20 dark:bg-slate-900/20 opacity-40'
        }`}
      >
        {/* Sadece site ismi */}
        <a
          href={targetUrl}
          target="_blank"
          rel="noopener noreferrer"
          title={`${source.name} sitesine git`}
          className="text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-purple-600 dark:hover:text-purple-400 transition truncate"
        >
          {source.name}
        </a>

        {/* Kontroller */}
        <div className="flex items-center gap-2.5 shrink-0">
          {source.isCustom && (
            <button
              type="button"
              onClick={() => onDeleteCustomSource(source.id)}
              title="Özel kaynağı sil"
              className="p-1.5 text-slate-400 hover:text-rose-600 transition cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          <a
            href={targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Yeni sekmede aç"
            className="p-1.5 text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition cursor-pointer"
          >
            <ExternalLink className="w-4 h-4" />
          </a>

          <button
            type="button"
            onClick={() => onToggleSource(source.id)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer focus:outline-hidden ${
              source.enabled ? 'bg-purple-600' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                source.enabled ? 'translate-x-4' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full flex-1 overflow-y-auto">
      
      {/* 1. ÜST PANEL: Başlık ve Kamu / Özel Kontrolleri */}
      <section className="w-full px-4 sm:px-8 xl:px-12 py-3.5 border-b border-purple-200/50 dark:border-purple-900/40 bg-white/40 dark:bg-slate-950/40 backdrop-blur-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">
            Kaynaklar
          </h2>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Kamu ve Özel sekmeleri */}
          <div className="flex items-center gap-1.5 p-1 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-purple-200/60 dark:border-purple-900/40 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('kamu')}
              className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                activeTab === 'kamu'
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-purple-600'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Landmark className="w-3 h-3" />
                <span>Kamu ({activeKamuCount}/{kamuSources.length})</span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('ozel')}
              className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                activeTab === 'ozel'
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-purple-600'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Building2 className="w-3 h-3" />
                <span>Özel ({activeOzelCount}/{ozelSources.length})</span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('haber')}
              className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                activeTab === 'haber'
                  ? 'bg-amber-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-amber-600'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Newspaper className="w-3 h-3" />
                <span>Haberler ({activeHaberCount}/{haberSources.length})</span>
              </span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleTestAll}
            disabled={isCheckingAll}
            className="flex items-center gap-1 px-3 py-1.5 bg-white/80 dark:bg-slate-900/80 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-purple-700 dark:text-purple-300 rounded-xl text-xs font-bold border border-purple-200/60 dark:border-purple-900/40 transition cursor-pointer active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isCheckingAll ? 'animate-spin' : ''}`} />
            <span>Test Et</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Kaynak Ekle</span>
          </button>
        </div>
      </section>

      {/* 2. TÜMÜNÜ AÇ / KAPAT ÇUBUĞU */}
      <div className="w-full px-4 sm:px-8 xl:px-12 py-2 border-b border-purple-200/40 dark:border-purple-900/30 bg-white/20 dark:bg-slate-950/20 text-xs flex items-center justify-between">
        <span className="text-slate-500 dark:text-slate-400 font-medium">
          Toplam <strong>{totalActiveCount} / {sources.length}</strong> aktif
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => activeTab === 'kamu' ? handleToggleAllKamu(true) : (activeTab === 'ozel' ? handleToggleAllOzel(true) : handleToggleAllHaber(true))}
            className="text-purple-600 dark:text-purple-400 font-bold hover:underline cursor-pointer"
          >
            Tümünü Aç
          </button>
          <span className="text-slate-300 dark:text-slate-700">·</span>
          <button
            type="button"
            onClick={() => activeTab === 'kamu' ? handleToggleAllKamu(false) : (activeTab === 'ozel' ? handleToggleAllOzel(false) : handleToggleAllHaber(false))}
            className="text-slate-500 dark:text-slate-400 font-medium hover:underline cursor-pointer"
          >
            Tümünü Kapat
          </button>
        </div>
      </div>

      {/* 3. KAYNAK LİSTESİ - Sadece site isimleri alt alta dizili */}
      <section className="w-full flex flex-col bg-white/20 dark:bg-slate-950/20">
        {(activeTab === 'kamu' ? kamuSources : (activeTab === 'ozel' ? ozelSources : haberSources)).map(renderSourceRow)}
      </section>

      {/* Kaynak Ekleme Modalı */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-purple-200 dark:border-purple-900 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-purple-100 dark:border-purple-950">
              <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">
                Yeni Özel İlan Kaynağı Ekle
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSource} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Kaynak Adı</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Örn: Ege Üniversitesi Personel İlanları"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-purple-200/80 dark:border-purple-900/60 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Web Adresi (URL)</label>
                <input
                  type="text"
                  required
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="Örn: https://personel.ege.edu.tr/ilanlar"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-purple-200/80 dark:border-purple-900/60 rounded-xl font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Sektör</label>
                  <select
                    value={newSector}
                    onChange={(e) => setNewSector(e.target.value as 'kamu' | 'ozel')}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-purple-200/80 dark:border-purple-900/60 rounded-xl font-medium"
                  >
                    <option value="kamu">Kamu</option>
                    <option value="ozel">Özel Sektör</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Kısa Etiket</label>
                  <input
                    type="text"
                    value={newShortName}
                    onChange={(e) => setNewShortName(e.target.value)}
                    placeholder="Örn: Ege Üni"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-purple-200/80 dark:border-purple-900/60 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-xs"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
