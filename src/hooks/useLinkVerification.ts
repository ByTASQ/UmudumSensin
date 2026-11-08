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
  const [verifications, setVerifications] = useState<Record<string, LinkVerificationResult>>(() => 
    getAllCachedVerifications()
  );
  const [isVerifying, setIsVerifying] = useState(false);
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
    const unsubscribeSingle = subscribeToLinkVerifications((url, result) => {
      setVerifications(current => {
        if (current[url] === result) return current;
        return { ...current, [url]: result };
      });
    });

    const unsubscribeBatch = subscribeToLinkVerificationBatches((results) => {
      if (results.length === 0) return;
      setVerifications(current => {
        let changed = false;
        const next = { ...current };

        for (const result of results) {
          if (next[result.url] !== result) {
            next[result.url] = result;
            changed = true;
          }
        }

        return changed ? next : current;
      });
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

    runBatch();

    return () => {
      isCancelled = true;
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
    return verifications[url] || (job.originalUrl ? verifications[job.originalUrl] : null) || null;
  }, [getCachedSafeJobUrl, verifications]);

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
    verifications,
    isVerifying,
    verifyAll,
    verifyUrl,
    getJobStatus,
    isJobExpired,
    isJobVerifiedActive
  };
}
