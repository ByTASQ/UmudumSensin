export type EducationLevel = 
  | 'İlköğretim'
  | 'Lise (Ortaöğretim)'
  | 'Önlisans'
  | 'Lisans'
  | 'Yüksek Lisans'
  | 'Doktora'
  | 'Fark Etmez';

export interface UserCriteria {
  profession: string;       // Meslek (örn: Elektronik Teknikeri)
  educationLevel: string;   // Mezuniyet Seviyesi (örn: Önlisans)
  department: string;       // Bölüm (örn: Elektronik Teknolojisi)
  age: number | '';         // Yaş (örn: 40)
  city: string;             // İl (örn: Aydın)
  district?: string;        // İlçe (isteğe bağlı, örn: Efeler)
  kpssScore?: number | '';  // KPSS Puanı (örn: 75.5, isteğe bağlı)
  noKpss?: boolean;         // KPSS puanı yok / girilmedi işareti
  includePublic?: boolean;  // Kamu İlanları seçeneği
  includePrivate?: boolean; // Özel Sektör seçeneği
  onlyPublicJobs?: boolean; // Geriye dönük uyumluluk için
}

export type ScrapeMethod = 'API' | 'RSS' | 'HTML' | 'JSON' | 'PDF' | 'Resmi ilan sayfası';

export interface JobSource {
  id: string;
  name: string;
  shortName: string;
  domain: string;           // Resmi kaynak alan adı (örn: kamuilan.sbb.gov.tr)
  isOfficialGov: boolean;   // Resmi .gov.tr kamu portalı mı?
  sector: 'kamu' | 'ozel' | 'haber';   // 'kamu' = Kamu İlanı Sitesi, 'ozel' = Özel Sektör Sitesi, 'haber' = İlan Haberleri Sitesi
  category: 'kamu' | 'ozel' | 'resmi_gazete' | 'belediye' | 'haber' | 'diger';
  method: ScrapeMethod;
  url: string;
  enabled: boolean;
  status: 'online' | 'checking' | 'offline';
  lastChecked: string;
  pingMs: number;
  isCustom?: boolean;
  description: string;
  badgeColor: string;
}

export interface JobPosting {
  id: string;
  title: string;
  company: string;
  city: string;
  district?: string;
  isNationwide?: boolean;
  sourceId: string;
  sourceName: string;
  sourceDomain?: string;    // e.g. kamuilan.sbb.gov.tr
  isPublicSector: boolean;  // Kamu kuruluşu mu?
  sourceBadgeColor?: string;
  originalUrl: string;
  referenceCode: string;
  publishDate: string;
  deadlineDate: string;
  requiredEducation: string[]; // ['Önlisans', 'Lisans']
  allowedDepartments: string[]; // ['Elektronik Teknolojisi', 'Elektrik-Elektronik', ...]
  minAge: number;
  maxAge: number;
  quota?: number;
  minKpssScore?: number;    // Minimum KPSS puanı (örn: 60, 65, 70)
  kpssScoreType?: string;   // Puan türü: 'P3' (Lisans), 'P93' (Önlisans), 'P94' (Ortaöğretim)
  requiresKpss?: boolean;   // KPSS şartı aranıyor mu?
  employmentType: 'Kamu Sürekli İşçi' | 'Kamu Sözleşmeli' | 'Memur' | 'Özel Sektör' | 'Mahalli İdareler Personeli';
  description: string;
  additionalRequirements?: string[];
}

export interface RequirementCheck {
  category: 'education' | 'department' | 'age' | 'location' | 'kpss' | 'profession';
  title: string;
  isSatisfied: boolean;
  userValue: string;
  requiredValue: string;
  reason: string;
}

export type EligibilityStatus = 'eligible' | 'partial' | 'ineligible';

export interface MatchResult {
  job: JobPosting;
  status: EligibilityStatus;
  matchPercentage: number;
  checks: RequirementCheck[];
  ineligibilityReason?: string;
  summaryNote: string;
}

export interface ScanStats {
  totalSources: number;
  activeSources: number;
  totalJobsFound: number;
  eligibleJobsCount: number;
  partialJobsCount: number;
  ineligibleJobsCount: number;
  scanDurationMs: number;
}
