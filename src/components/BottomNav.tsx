import React from 'react';
import { Search, Briefcase, Globe, Shield } from 'lucide-react';

export type NavTab = 'scan' | 'results' | 'sources' | 'privacy';

interface BottomNavProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  resultsCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onTabChange,
  resultsCount
}) => {
  const tabs = [
    {
      id: 'scan' as NavTab,
      label: 'İlan Tara',
      icon: Search,
    },
    {
      id: 'results' as NavTab,
      label: 'Sonuçlar',
      icon: Briefcase,
      badge: resultsCount > 0 ? resultsCount : undefined
    },
    {
      id: 'sources' as NavTab,
      label: 'Kaynaklar',
      icon: Globe
    },
    {
      id: 'privacy' as NavTab,
      label: 'Gizlilik',
      icon: Shield
    }
  ];

  return (
    <nav className="md:hidden sticky bottom-0 z-40 w-full bg-white/85 dark:bg-slate-950/85 backdrop-blur-md border-t border-purple-200/50 dark:border-purple-900/40 shrink-0 px-2 py-1.5 flex items-center justify-around shadow-sm select-none">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition relative cursor-pointer ${
              isActive
                ? 'text-purple-600 dark:text-purple-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110 text-purple-600 dark:text-purple-400' : ''}`} />
              {tab.badge !== undefined && (
                <span className="absolute -top-1.5 -right-2.5 px-1.5 py-0.2 bg-purple-600 text-white font-extrabold text-[10px] rounded-full ring-2 ring-white dark:ring-slate-900 shadow-2xs">
                  {tab.badge}
                </span>
              )}
            </div>
            <span className="text-[11px] mt-0.5 tracking-tight font-semibold">
              {tab.label}
            </span>
            {isActive && (
              <span className="absolute bottom-0 w-8 h-0.5 bg-purple-600 dark:bg-purple-400 rounded-full" />
            )}
          </button>
        );
      })}
    </nav>
  );
};
