/**
 * Tarayıcı Bildirim Servisi (Browser Notification Service)
 * Yeni iş ilanları tespit edildiğinde tarayıcı bildirimleri (HTML5 Notification API),
 * sesli ikaz ve uygulama içi anlık bildirim (toast) gönderimini yönetir.
 */

import { JobPosting } from '../types/job';
import { 
  loadNotificationSettings, 
  getSeenJobIds, 
  markJobIdsAsSeen 
} from './storage';

export interface JobNotificationPayload {
  id: string;
  title: string;
  body: string;
  jobCount: number;
  jobs?: JobPosting[];
  timestamp: number;
  type: 'new_jobs' | 'test' | 'info';
  onClick?: () => void;
}

type NotificationSubscriber = (notification: JobNotificationPayload) => void;

const subscribers: Set<NotificationSubscriber> = new Set();

/**
 * Uygulama içi bildirim dinleyicisi ekler (Toast bileşeni için)
 */
export function subscribeToJobNotifications(callback: NotificationSubscriber): () => void {
  subscribers.add(callback);
  return () => {
    subscribers.delete(callback);
  };
}

/**
 * Dinleyicilere bildirim yayınlar
 */
function emitInAppNotification(payload: JobNotificationPayload): void {
  subscribers.forEach(cb => {
    try {
      cb(payload);
    } catch (e) {
      console.error('Notification subscriber error:', e);
    }
  });
}

/**
 * Tarayıcının HTML5 Notification API'sini destekleyip desteklemediğini kontrol eder
 */
export function isBrowserNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Mevcut bildirim izin durumunu döndürür ('granted', 'denied', 'default')
 */
export function getNotificationPermission(): NotificationPermission {
  if (!isBrowserNotificationSupported()) {
    return 'denied';
  }
  return Notification.permission;
}

/**
 * Kullanıcıdan tarayıcı bildirim izni talep eder
 */
export async function requestBrowserNotificationPermission(): Promise<NotificationPermission> {
  if (!isBrowserNotificationSupported()) {
    return 'denied';
  }
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (e) {
    console.warn('Bildirim izni istenirken hata oluştu:', e);
    return 'denied';
  }
}

/**
 * Web Audio API ile hoş, zarif bir bildirim sesi çalar (harici dosya indirme gerektirmez)
 */
export function playNotificationChime(): void {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.connect(gain);
    gain.connect(ctx.destination);

    // İki tonlu melodik yumuşak çan sesi (587Hz -> 880Hz)
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.setValueAtTime(880.00, now + 0.1); // A5

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.48);

    osc.start(now);
    osc.stop(now + 0.5);

    // Audio context'i bellekten serbest bırak
    setTimeout(() => {
      ctx.close().catch(() => {});
    }, 600);
  } catch {
    // Ses engeli veya desteklenmeyen ortamda sessizce devam et
  }
}

/**
 * Tarayıcı yerel işletim sistemi bildirimini (Desktop / Android Chrome vb.) tetikler
 */
export function dispatchBrowserNotification(title: string, options?: {
  body?: string;
  tag?: string;
  icon?: string;
  onClick?: () => void;
}): boolean {
  if (!isBrowserNotificationSupported() || Notification.permission !== 'granted') {
    return false;
  }

  try {
    const notification = new Notification(title, {
      body: options?.body || '',
      icon: options?.icon || 'https://raw.githubusercontent.com/google/material-design-icons/master/png/action/work/materialicons/48dp/2x/baseline_work_black_48dp.png',
      badge: options?.icon || 'https://raw.githubusercontent.com/google/material-design-icons/master/png/action/work/materialicons/48dp/2x/baseline_work_black_48dp.png',
      tag: options?.tag || `job-alert-${Date.now()}`,
      silent: false
    });

    notification.onclick = () => {
      try {
        window.focus();
      } catch {}
      if (options?.onClick) {
        options.onClick();
      }
      notification.close();
    };

    // 8 saniye sonra otomatik kapat
    setTimeout(() => {
      try {
        notification.close();
      } catch {}
    }, 8000);

    return true;
  } catch (err) {
    console.warn('Native notification creation error:', err);
    return false;
  }
}

/**
 * Yeni iş ilanları tespit edildiğinde bildirim zincirini başlatır
 */
export function notifyNewJobsFound(
  newJobs: JobPosting[],
  options?: {
    onClickJob?: (job: JobPosting) => void;
    onViewResults?: () => void;
  }
): { notified: boolean; newCount: number } {
  if (!newJobs || newJobs.length === 0) {
    return { notified: false, newCount: 0 };
  }

  const settings = loadNotificationSettings();
  if (!settings.enabled) {
    return { notified: false, newCount: newJobs.length };
  }

  const newCount = newJobs.length;
  const topJob = newJobs[0];
  
  const title = newCount === 1 
    ? `🔔 1 Yeni İş İlanı Bulundu!` 
    : `🔔 ${newCount} Yeni İş İlanı Bulundu!`;

  const body = newCount === 1
    ? `${topJob.company} • ${topJob.title} (${topJob.city})`
    : `${topJob.title} ve ${newCount - 1} yeni ilan profilinize uygun olarak tespit edildi.`;

  const notificationPayload: JobNotificationPayload = {
    id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title,
    body,
    jobCount: newCount,
    jobs: newJobs,
    timestamp: Date.now(),
    type: 'new_jobs',
    onClick: () => {
      if (options?.onClickJob && topJob) {
        options.onClickJob(topJob);
      } else if (options?.onViewResults) {
        options.onViewResults();
      }
    }
  };

  // 1. Ses Çal
  if (settings.soundEnabled) {
    playNotificationChime();
  }

  // 2. Tarayıcı Yerel Bildirimi Gönder (İzin verilmişse ve ayar açıksa)
  if (settings.nativeEnabled) {
    dispatchBrowserNotification(title, {
      body,
      tag: `new-jobs-${topJob.id}`,
      onClick: notificationPayload.onClick
    });
  }

  // 3. Tarayıcı İçi Anlık Bildirim (Toast) Gönder
  emitInAppNotification(notificationPayload);

  // 4. İlanları görüldü olarak işaretle
  markJobIdsAsSeen(newJobs.map(j => j.id));

  return { notified: true, newCount };
}

/**
 * Kullanıcının bildirim mekanizmasını test edebilmesi için anlık örnek bildirim gönderir
 */
export function triggerTestNotification(options?: {
  onSuccess?: () => void;
  onClick?: () => void;
}): void {
  const settings = loadNotificationSettings();
  
  const title = '🔔 Test Bildirimi: Yeni İlan Bildirim Sistemi Aktif!';
  const body = 'Kriterlerinize uygun yeni kamu veya özel sektör ilanları yayınlandığında bu şekilde anlık haberdar edileceksiniz.';

  const payload: JobNotificationPayload = {
    id: `test-${Date.now()}`,
    title,
    body,
    jobCount: 1,
    timestamp: Date.now(),
    type: 'test',
    onClick: options?.onClick
  };

  // Ses çal
  if (settings.soundEnabled) {
    playNotificationChime();
  }

  // Tarayıcı yerel bildirimi dene
  if (settings.nativeEnabled) {
    dispatchBrowserNotification(title, {
      body,
      tag: 'test-notification',
      onClick: options?.onClick
    });
  }

  // Uygulama içi toast fırlat
  emitInAppNotification(payload);

  if (options?.onSuccess) {
    options.onSuccess();
  }
}

/**
 * Gelen ilan listesinden henüz bildirim gönderilmemiş yeni ilanları ayıklar
 */
export function filterUnseenJobs(jobs: JobPosting[]): JobPosting[] {
  const seenIds = new Set(getSeenJobIds());
  return jobs.filter(job => !seenIds.has(job.id));
}
