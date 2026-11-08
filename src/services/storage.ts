import { UserCriteria } from '../types/job';

const CRITERIA_STORAGE_KEY = 'is_ilani_last_criteria_v1';
const SAVED_JOBS_KEY = 'is_ilani_saved_jobs_v1';
const VIEW_MODE_KEY = 'is_ilani_view_mode_v1';

export const DEFAULT_CRITERIA: UserCriteria = {
  profession: 'Bilgisayar',
  educationLevel: 'Önlisans',
  department: '',
  age: 30,
  city: 'İzmir',
  district: '',
  kpssScore: '',
  noKpss: false,
  includePublic: true,  // Kamu ilanları
  includePrivate: true, // Özel sektör ilanları
  onlyPublicJobs: false
};

export function loadSavedCriteria(): UserCriteria {
  try {
    const raw = localStorage.getItem(CRITERIA_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        profession: parsed.profession || '',
        educationLevel: parsed.educationLevel || 'Önlisans',
        department: parsed.department || '',
        age: parsed.age !== undefined && parsed.age !== null ? parsed.age : '',
        city: parsed.city || 'Aydın',
        district: parsed.district || '',
        kpssScore: parsed.kpssScore !== undefined && parsed.kpssScore !== null ? parsed.kpssScore : '',
        noKpss: Boolean(parsed.noKpss),
        includePublic: parsed.includePublic !== undefined ? parsed.includePublic : true,
        includePrivate: parsed.includePrivate !== undefined ? parsed.includePrivate : true,
        onlyPublicJobs: parsed.onlyPublicJobs !== undefined ? parsed.onlyPublicJobs : false
      };
    }
  } catch (e) {
    console.error('Criteria load error:', e);
  }
  return DEFAULT_CRITERIA;
}

export function saveLastCriteria(criteria: UserCriteria): void {
  try {
    localStorage.setItem(CRITERIA_STORAGE_KEY, JSON.stringify(criteria));
  } catch (e) {
    console.error('Criteria save error:', e);
  }
}

export function clearSavedCriteria(): void {
  try {
    localStorage.removeItem(CRITERIA_STORAGE_KEY);
  } catch (e) {
    console.error('Criteria clear error:', e);
  }
}

export function getSavedJobIds(): string[] {
  try {
    const raw = localStorage.getItem(SAVED_JOBS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function toggleSaveJobId(id: string): string[] {
  try {
    const ids = getSavedJobIds();
    const index = ids.indexOf(id);
    if (index > -1) {
      ids.splice(index, 1);
    } else {
      ids.push(id);
    }
    localStorage.setItem(SAVED_JOBS_KEY, JSON.stringify(ids));
    return ids;
  } catch (e) {
    return [];
  }
}

export function loadViewMode(): 'android' | 'full' {
  try {
    const val = localStorage.getItem(VIEW_MODE_KEY);
    if (val === 'full' || val === 'android') return val;
  } catch (e) {}
  return 'android';
}

export function saveViewMode(mode: 'android' | 'full'): void {
  try {
    localStorage.setItem(VIEW_MODE_KEY, mode);
  } catch (e) {}
}

export const THEME_MODE_KEY = 'ilan_bulucu_theme_mode';

export function loadThemeMode(): 'light' | 'dark' {
  try {
    const val = localStorage.getItem(THEME_MODE_KEY);
    if (val === 'dark' || val === 'light') return val;
  } catch (e) {}
  return 'light';
}

export function saveThemeMode(mode: 'light' | 'dark'): void {
  try {
    localStorage.setItem(THEME_MODE_KEY, mode);
  } catch (e) {}
}

// ==================== BİLDİRİM AYARLARI VE GÖRÜLEN İLANLAR ====================
export const NOTIFICATION_SETTINGS_KEY = 'ilan_bulucu_notification_settings_v1';
export const SEEN_JOB_IDS_KEY = 'ilan_bulucu_seen_job_ids_v1';

export interface NotificationSettings {
  enabled: boolean;          // Bildirimler genel olarak açık mı?
  soundEnabled: boolean;     // Sesli uyarı çalsın mı?
  nativeEnabled: boolean;    // Tarayıcı yerel Notification API kullanılsın mı?
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: true,
  soundEnabled: true,
  nativeEnabled: true
};

export function loadNotificationSettings(): NotificationSettings {
  try {
    if (typeof localStorage === 'undefined') return DEFAULT_NOTIFICATION_SETTINGS;
    const raw = localStorage.getItem(NOTIFICATION_SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        enabled: parsed.enabled !== undefined ? Boolean(parsed.enabled) : true,
        soundEnabled: parsed.soundEnabled !== undefined ? Boolean(parsed.soundEnabled) : true,
        nativeEnabled: parsed.nativeEnabled !== undefined ? Boolean(parsed.nativeEnabled) : true
      };
    }
  } catch (e) {
    console.error('Notification settings load error:', e);
  }
  return DEFAULT_NOTIFICATION_SETTINGS;
}

export function saveNotificationSettings(settings: NotificationSettings): void {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Notification settings save error:', e);
  }
}

export function getSeenJobIds(): string[] {
  try {
    if (typeof localStorage === 'undefined') return [];
    const raw = localStorage.getItem(SEEN_JOB_IDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function markJobIdsAsSeen(jobIds: string[]): string[] {
  try {
    if (typeof localStorage === 'undefined') return jobIds;
    const existing = new Set(getSeenJobIds());
    jobIds.forEach(id => existing.add(id));
    const updated = Array.from(existing);
    localStorage.setItem(SEEN_JOB_IDS_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    return [];
  }
}

export function clearSeenJobIds(): void {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.removeItem(SEEN_JOB_IDS_KEY);
  } catch (e) {
    console.error('Clear seen jobs error:', e);
  }
}
