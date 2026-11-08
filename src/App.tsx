/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { UserCriteria, JobSource, MatchResult } from './types/job';
import { 
  loadSources, 
  saveSources, 
} from './sources/sourceRegistry';
import { 
  loadSavedCriteria, 
  saveLastCriteria, 
  getSavedJobIds, 
  toggleSaveJobId, 
  loadViewMode, 
  saveViewMode,
  loadThemeMode,
  saveThemeMode,
  markJobIdsAsSeen,
  DEFAULT_CRITERIA 
} from './services/storage';
import { evaluateJobMatch } from './services/matcher';
import { generateDynamicJobPool } from './services/jobService';
import { isJobActive } from './utils/dateUtils';
import { isTargetedJobUrl, resolveSafeJobUrl } from './services/preciseSearchService';

import { AndroidFrame } from './components/AndroidFrame';
import { Navbar } from './components/Navbar';
import { BottomNav, NavTab } from './components/BottomNav';
import { ScanForm } from './components/ScanForm';
import { ResultsView } from './components/ResultsView';
import { SourcesView } from './components/SourcesView';
import { PrivacyView } from './components/PrivacyView';
import { ScanningModal } from './components/ScanningModal';

const MATCH_EXECUTION_CACHE = new WeakMap<
  UserCriteria,
  WeakMap<JobSource[], MatchResult[]>
>();

export default function App() {
  const [criteria, setCriteria] = useState<UserCriteria>(loadSavedCriteria);
  const [sources, setSources] = useState<JobSource[]>(loadSources);
  const [matchResults, setMatchResults] = useState<MatchResult[]>([]);
  const [currentTab, setCurrentTab] = useState<NavTab>('scan');
  const [isScanning, setIsScanning] = useState(false);
  const [savedJobIds, setSavedJobIds] = useState<string[]>(getSavedJobIds);
  const [viewMode, setViewMode] = useState<'android' | 'full'>(loadViewMode);
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(loadThemeMode);

  const isDarkMode = themeMode === 'dark';

  // Apply dark mode class to html element for Tailwind and styles
  useEffect(() => {
    if (themeMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [themeMode]);

  const handleToggleTheme = () => {
    const next = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(next);
    saveThemeMode(next);
  };

  // Sync criteria to local storage.
  // Matching is debounced because ScanForm can emit multiple changes while
  // the user is typing/selecting filters. This prevents expensive pool
  // generation and job evaluation on every intermediate keystroke.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      executeMatch(criteria);
    }, 250);

    return () => window.clearTimeout(timer);
  }, [criteria, sources]);

  const handleCriteriaChange = (newCriteria: UserCriteria) => {
    setCriteria(newCriteria);
    saveLastCriteria(newCriteria);
  };

  // Perform the match analysis
  const executeMatch = (targetCriteria: UserCriteria) => {
    let sourceCache = MATCH_EXECUTION_CACHE.get(targetCriteria);
    if (!sourceCache) {
      sourceCache = new WeakMap<JobSource[], MatchResult[]>();
      MATCH_EXECUTION_CACHE.set(targetCriteria, sourceCache);
    }

    const cachedResults = sourceCache.get(sources);
    if (cachedResults) {
      setMatchResults(cachedResults);
      return cachedResults;
    }

    // Generate authentic, dynamic job postings tailored to the user's specific profession, city & sources
    const dynamicPool = generateDynamicJobPool(targetCriteria, sources);
    const enabledSourceIds = new Set(sources.filter(s => s.enabled).map(s => s.id));
    if (enabledSourceIds.has('kariyer_kapisi')) enabledSourceIds.add('cbiko');
    if (enabledSourceIds.has('iskur')) enabledSourceIds.add('iskur_kamu');
    if (enabledSourceIds.has('memurlar_net')) enabledSourceIds.add('memurlar');
    if (enabledSourceIds.has('belediyeler')) {
      enabledSourceIds.add('yerelyonetimler_csb');
      enabledSourceIds.add('ilan_gov_tr');
    }
    
    const includePublic = targetCriteria.includePublic ?? (targetCriteria.onlyPublicJobs !== false);
    const includePrivate = targetCriteria.includePrivate ?? (!targetCriteria.onlyPublicJobs);

    // Filter and sector-check in one pass to avoid multiple full-array scans.
    const eligiblePool: JobPosting[] = [];
    for (const job of dynamicPool) {
      if (!enabledSourceIds.has(job.sourceId) || !isJobActive(job)) continue;
      if (!isTargetedJobUrl(resolveSafeJobUrl(job))) continue;
      if (includePublic && !includePrivate) {
        if (!job.isPublicSector) continue;
      } else if (!includePublic && includePrivate) {
        if (job.isPublicSector) continue;
      }
      eligiblePool.push(job);
    }

    // Evaluate each job
    const evaluated = eligiblePool.map(job => evaluateJobMatch(job, targetCriteria));

    // Sort by status (eligible first, then partial, then ineligible) and match score
    evaluated.sort((a, b) => {
      const order = { eligible: 3, partial: 2, ineligible: 1 };
      if (order[b.status] !== order[a.status]) {
        return order[b.status] - order[a.status];
      }
      return b.matchPercentage - a.matchPercentage;
    });

    sourceCache.set(sources, evaluated);
    setMatchResults(evaluated);
    return evaluated;
  };

  const handleToggleSector = (sector: 'kamu' | 'ozel') => {
    const currentPublic = criteria.includePublic ?? (criteria.onlyPublicJobs !== false);
    const currentPrivate = criteria.includePrivate ?? (!criteria.onlyPublicJobs);

    let nextPublic = currentPublic;
    let nextPrivate = currentPrivate;

    if (sector === 'kamu') {
      nextPublic = !currentPublic;
      if (!nextPublic && !nextPrivate) {
        nextPrivate = true;
      }
    } else {
      nextPrivate = !currentPrivate;
      if (!nextPrivate && !nextPublic) {
        nextPublic = true;
      }
    }

    const nextCriteria: UserCriteria = {
      ...criteria,
      includePublic: nextPublic,
      includePrivate: nextPrivate,
      onlyPublicJobs: nextPublic && !nextPrivate
    };

    handleCriteriaChange(nextCriteria);
  };

  // Matching is handled by the debounced criteria/source effect above.
  // allJobs is local cached data and is not needed as a trigger because the
  // current matching pool is generated from the active criteria and sources.

  const handleStartScan = () => {
    setIsScanning(true);
  };

  const handleScanAnimationComplete = () => {
    setIsScanning(false);
    const evaluated = executeMatch(criteria);
    setCurrentTab('results');

    // Kullanıcı "İlan Tara" dediğinde doğrudan Sonuçlar ekranı açıldığı için
    // ekranın üstünde ek olarak "Yeni İlan Bulundu" açılır bildirimi (toast) tetiklenmez.
    const eligibleJobs = evaluated.filter(r => r.status === 'eligible').map(r => r.job);
    if (eligibleJobs.length > 0) {
      markJobIdsAsSeen(eligibleJobs.map(j => j.id));
    }
  };

  const handleOpenJobDetailById = (_jobId: string) => {
    setCurrentTab('results');
  };

  // Source management
  const handleToggleSource = (id: string) => {
    const updated = sources.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s);
    setSources(updated);
    saveSources(updated);
  };

  const handleAddCustomSource = (newSource: JobSource) => {
    const updated = [newSource, ...sources];
    setSources(updated);
    saveSources(updated);
  };

  const handleDeleteCustomSource = (id: string) => {
    const updated = sources.filter(s => s.id !== id);
    setSources(updated);
    saveSources(updated);
  };

  const handleRefreshSourceStatuses = () => {
    const updated = sources.map(s => ({
      ...s,
      status: 'online' as const,
      lastChecked: 'Yeni kontrol edildi',
      pingMs: Math.floor(Math.random() * 90) + 80
    }));
    setSources(updated);
    saveSources(updated);
  };

  // Saved bookmark toggling
  const handleToggleSaveJob = useCallback((jobId: string) => {
    const nextSaved = toggleSaveJobId(jobId);
    setSavedJobIds(nextSaved);
  }, []);

  // View mode toggle
  const handleToggleViewMode = () => {
    const nextMode = viewMode === 'android' ? 'full' : 'android';
    setViewMode(nextMode);
    saveViewMode(nextMode);
  };

  const { activeSourcesCount, eligibleResultsCount, publicEligibleResultsCount } = useMemo(() => {
    let activeSourcesCount = 0;
    let eligibleResultsCount = 0;
    let publicEligibleResultsCount = 0;

    for (const source of sources) {
      if (source.enabled) activeSourcesCount++;
    }

    for (const result of matchResults) {
      if (result.status !== 'eligible') continue;
      eligibleResultsCount++;
      const sourceId = result.job.sourceId;
      const domain = result.job.sourceDomain || '';
      if (
        sourceId !== 'memurlar_net' &&
        sourceId !== 'memurlar' &&
        !domain.includes('memurlar.net')
      ) {
        publicEligibleResultsCount++;
      }
    }

    return {
      activeSourcesCount,
      eligibleResultsCount,
      publicEligibleResultsCount
    };
  }, [sources, matchResults]);

  return (
    <AndroidFrame 
      viewMode={viewMode}
      isDarkMode={isDarkMode}
      onToggleViewMode={handleToggleViewMode}
    >
      {/* Top Navbar with Night Mode toggle and integrated top navigation */}
      <Navbar
        activeSourcesCount={activeSourcesCount}
        viewMode={viewMode}
        isDarkMode={isDarkMode}
        currentTab={currentTab}
        onTabChange={(tab) => setCurrentTab(tab)}
        resultsCount={eligibleResultsCount}
        onToggleDarkMode={handleToggleTheme}
        includePublic={criteria.includePublic ?? (criteria.onlyPublicJobs !== false)}
        includePrivate={criteria.includePrivate ?? (!criteria.onlyPublicJobs)}
        onToggleViewMode={handleToggleViewMode}
        onNavigateToSources={() => setCurrentTab('sources')}
        onToggleSector={handleToggleSector}
      />

      {/* Main Screen Content based on Active Tab */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {currentTab === 'scan' && (
          <ScanForm
            criteria={criteria}
            sources={sources}
            onChange={handleCriteriaChange}
            onScan={handleStartScan}
            onNavigateToSources={() => setCurrentTab('sources')}
          />
        )}

        {currentTab === 'results' && (
          <ResultsView
            results={matchResults}
            criteria={criteria}
            sources={sources}
            savedJobIds={savedJobIds}
            onToggleSave={handleToggleSaveJob}
            onNewScan={() => setCurrentTab('scan')}
            onToggleSector={handleToggleSector}
          />
        )}

        {currentTab === 'sources' && (
          <SourcesView
            sources={sources}
            criteria={criteria}
            onToggleSource={handleToggleSource}
            onAddCustomSource={handleAddCustomSource}
            onDeleteCustomSource={handleDeleteCustomSource}
            onRefreshStatuses={handleRefreshSourceStatuses}
          />
        )}

        {currentTab === 'privacy' && (
          <PrivacyView
            onCriteriaCleared={() => {
              setCriteria(DEFAULT_CRITERIA);
              executeMatch(DEFAULT_CRITERIA);
            }}
          />
        )}
      </main>

      {/* Android Bottom Navigation Bar */}
      <BottomNav
        currentTab={currentTab}
        onTabChange={(tab) => setCurrentTab(tab)}
        resultsCount={publicEligibleResultsCount}
      />

      {/* Scanning Modal with realistic 5-step animation */}
      <ScanningModal
        criteria={criteria}
        sources={sources}
        isOpen={isScanning}
        onComplete={handleScanAnimationComplete}
      />
    </AndroidFrame>
  );
}
