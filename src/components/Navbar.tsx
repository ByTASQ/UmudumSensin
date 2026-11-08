import React from 'react';
import { Moon, Sun, Search, Briefcase, Globe, Shield } from 'lucide-react';
import { NavTab } from './BottomNav';

interface NavbarProps {
  activeSourcesCount?: number;
  viewMode?: 'android' | 'full';
  includePublic?: boolean;
  includePrivate?: boolean;
  isDarkMode?: boolean;
  currentTab?: NavTab;
  onTabChange?: (tab: NavTab) => void;
  resultsCount?: number;
  onToggleDarkMode?: () => void;
  onToggleViewMode?: () => void;
  onNavigateToSources?: () => void;
  onToggleSector?: (sector: 'kamu' | 'ozel') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isDarkMode = false,
  currentTab = 'scan',
  onTabChange,
  resultsCount = 0,
  onToggleDarkMode
}) => {
  const tabs = [
    { id: 'scan' as NavTab, label: 'İlan Tara', icon: Search },
    { id: 'results' as NavTab, label: 'Sonuçlar', icon: Briefcase, badge: resultsCount > 0 ? resultsCount : undefined },
    { id: 'sources' as NavTab, label: 'Kaynaklar', icon: Globe },
    { id: 'privacy' as NavTab, label: 'Gizlilik', icon: Shield }
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-purple-200/50 dark:border-purple-900/40 transition-colors select-none">
      <div className="w-full px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        
        {/* Sol Bölüm: Logo */}
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500 dark:bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.6)] animate-pulse" />
          <span className="text-sm sm:text-base font-black tracking-wider text-slate-900 dark:text-slate-100 uppercase">
            İLAN BULUCU
          </span>
        </div>

        {/* Orta Bölüm: İnce Çizgiyle Ayrılmış Tam Ekran Menü Sekmeleri (Desktop / Tablet) */}
        {onTabChange && (
          <nav className="hidden md:flex items-center gap-1 p-1 bg-purple-50/50 dark:bg-slate-900/60 rounded-xl border border-purple-200/50 dark:border-purple-900/40">
            {tabs.map((tab, idx) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <React.Fragment key={tab.id}>
                  {idx > 0 && <div className="h-4 w-px bg-purple-200/70 dark:bg-purple-900/40" />}
                  <button
                    type="button"
                    onClick={() => onTabChange(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer relative ${
                      isActive
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-100/50 dark:hover:bg-purple-950/30'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                    {tab.badge !== undefined && (
                      <span className={`px-1.5 py-0.2 text-[10px] font-extrabold rounded-full ${
                        isActive 
                          ? 'bg-white text-purple-700' 
                          : 'bg-purple-200 dark:bg-purple-950 text-purple-800 dark:text-purple-300'
                      }`}>
                        {tab.badge}
                      </span>
                    )}
                  </button>
                </React.Fragment>
              );
            })}
          </nav>
        )}

        {/* Sağ Bölüm: Gündüz / Gece Modu */}
        <div className="flex items-center gap-2">
          {onToggleDarkMode && (
            <button
              type="button"
              onClick={onToggleDarkMode}
              title={isDarkMode ? 'Gündüz moduna geç' : 'Gece moduna geç'}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 border border-purple-200/60 dark:border-purple-900/40 transition cursor-pointer active:scale-95 shadow-2xs"
            >
              {isDarkMode ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400 fill-amber-400/20" />
                  <span className="hidden sm:inline text-xs font-bold text-amber-300">Gündüz</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-purple-600 fill-purple-600/20" />
                  <span className="hidden sm:inline text-xs font-bold text-purple-700">Gece</span>
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
