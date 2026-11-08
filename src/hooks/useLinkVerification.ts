import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  LinkVerificationResult, 
  getAllCachedVerifications, 
  subscribeToLinkVerifications,
  subscribeToLinkVerificationBatches,
  verifyBatchLinks, 
  verifySingleLink 
} from '../services/linkVerificationService';
import { JobPosting } from '../types/job';
import { getSafeJobUrl } from '../utils/navigation';

export function useLinkVerification(jobs: JobPosting[]) {
  const [isVerifying, setIsVerifying] = useState(false);
  const verificationsRef = useRef<Record<string, LinkVerificationResult>>(
    getAllCachedVerifications()
  );
  const [verificationVersion, setVerificationVersion] = useState(0);
  const safeUrlCacheRef = useRef(new WeakMap<JobPosting, string>());

  const getCachedSafeJobUrl = useCallback((job: JobPosting): string => {
    const cached = safeUrlCacheRef.current.get(job);
    if (cached !== undefined) return cached;

    const url = getSafeJobUrl(job);
    safeUrlCacheRef.current.set(job, url);
    return url;
  }, []);

  // Extract all URLs from current jobs without re-resolving safe URLs
  // when verification state changes.
  const urls = useMemo(() => {
    return Array.from(new Set(
      jobs
        .map(getCachedSafeJobUrl)
        .filter(u => !!u && (u.startsWith('http://') || u.startsWith('https://')))
    ));
  }, [jobs, getCachedSafeJobUrl]);

  // Subscribe to changes from verification service
  useEffect(() => {
    const notifyVersionChange = (changed: boolean) => {
      if (changed) setVerificationVersion(version => version + 1);
    };

    const unsubscribeSingle = subscribeToLinkVerifications((url, result) => {
      const current = verificationsRef.current;
      if (current[url] === result) return;

      verificationsRef.current = { ...current, [url]: result };
      notifyVersionChange(true);
    });

    const unsubscribeBatch = subscribeToLinkVerificationBatches((results) => {
      if (results.length === 0) return;

      const current = verificationsRef.current;
      let changed = false;
      const next = { ...current };

      for (const result of results) {
        if (next[result.url] !== result) {
          next[result.url] = result;
          changed = true;
        }
      }

      if (changed) {
        verificationsRef.current = next;
        notifyVersionChange(true);
      }
    });

    return () => {
      unsubscribeSingle();
      unsubscribeBatch();
    };
  }, []);

  // Trigger batch verification when job URLs change
  useEffect(() => {
    if (urls.length === 0) return;
    let isCancelled = false;

    const runBatch = async () => {
      if (isCancelled) return;

      setIsVerifying(true);
      try {
        await verifyBatchLinks(urls, false);
      } catch (e) {
        console.warn('Batch verification error:', e);
      } finally {
        if (!isCancelled) {
          setIsVerifying(false);
        }
      }
    };

    // Link checks are network-bound but their completion can still trigger
    // React work. On low-end devices, start them while the browser is idle so
    // opening/filtering the results screen gets priority.
    let idleHandle: number | ReturnType<typeof setTimeout>;
    const scheduleIdle = () => {
      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        idleHandle = (window as Window & {
          requestIdleCallback: (callback: () => void, options?: { timeout: number }) => number;
        }).requestIdleCallback(runBatch, { timeout: 1200 });
      } else {
        idleHandle = window.setTimeout(runBatch, 250);
      }
    };

    scheduleIdle();

    return () => {
      isCancelled = true;
      if (typeof window !== 'undefined' && 'cancelIdleCallback' in window && typeof idleHandle === 'number') {
        (window as Window & { cancelIdleCallback: (handle: number) => void }).cancelIdleCallback(idleHandle);
      } else {
        window.clearTimeout(idleHandle as number);
      }
    };
  }, [urls]);

  // Force re-verification of all current job URLs
  const verifyAll = useCallback(async () => {
    if (urls.length === 0) return;
    setIsVerifying(true);
    try {
      await verifyBatchLinks(urls, true);
    } finally {
      setIsVerifying(false);
    }
  }, [urls]);

  // Force re-verify a specific URL
  const verifyUrl = useCallback(async (url: string) => {
    return await verifySingleLink(url, true);
  }, []);

  // Resolve the safe URL once per job, then do an O(1) verification lookup.
  // This avoids rebuilding a WeakMap for every single verification update.
  const getJobStatus = useCallback((job: JobPosting): LinkVerificationResult | null => {
    const url = getCachedSafeJobUrl(job);
    const verifications = verificationsRef.current;
    return verifications[url] || (job.originalUrl ? verifications[job.originalUrl] : null) || null;
  }, [getCachedSafeJobUrl]);

  // Check if a job is confirmed expired / deadline reached
  const isJobExpired = useCallback((job: JobPosting): boolean => {
    const status = getJobStatus(job);
    return status?.isExpired === true || status?.status === 'not_found' || status?.is404 === true;
  }, [getJobStatus]);

  // Check if a job is confirmed active and live
  const isJobVerifiedActive = useCallback((job: JobPosting): boolean => {
    const status = getJobStatus(job);
    return status?.status === 'active' && !status?.is404 && !status?.isExpired;
  }, [getJobStatus]);

  return {
    verifications: verificationsRef.current,
    verificationVersion,
    isVerifying,
    verifyAll,
    verifyUrl,
    getJobStatus,
    isJobExpired,
    isJobVerifiedActive
  };
}
