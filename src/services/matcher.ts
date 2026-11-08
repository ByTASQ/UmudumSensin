import { JobPosting, MatchResult, RequirementCheck, UserCriteria } from '../types/job';

// Normalizes Turkish characters to ASCII lowercase for forgiving, cross-keyboard comparisons.
// Matching evaluates the same job/user strings repeatedly, so keep a small bounded
// cache to avoid repeating the same Unicode/string transformations.
const NORMALIZE_CACHE = new Map<string, string>();
const NORMALIZE_CACHE_LIMIT = 4096;

interface ProfessionContext {
  cleanUserProf: string;
  userTokens: string[];
  isMultiWordSpecific: boolean;
  stems: string[];
}

const PROFESSION_CONTEXT_CACHE = new Map<string, ProfessionContext>();
const PROFESSION_CONTEXT_CACHE_LIMIT = 256;

interface NormalizedJobFields {
  city: string;
  title: string;
  allowedDepartments: string[];
  requiredEducation: string[];
  hasEducationFlexible: boolean;
  hasLiseEducation: boolean;
  hasOnlisansEducation: boolean;
  hasLisansEducation: boolean;
  description: string;
  isElectronics: boolean;
  isCs: boolean;
}

interface EvaluationContext {
  userAge: number;
  userCityNorm: string;
  userDeptNorm: string;
  userEduNorm: string;
  userProfNorm: string;
  professionContext: ReturnType<typeof getProfessionContext>;
  userDeptAndProfTokens: string[];
  isUserElectronics: boolean;
  isUserCs: boolean;
  isEducationFlexible: boolean;
  userIsLise: boolean;
  userIsOnlisans: boolean;
  userIsLisans: boolean;
  userIsYuksek: boolean;
  isAllCities: boolean;
  isNoKpssChecked: boolean;
  userKpss: number | null;
}

const EVALUATION_CONTEXT_CACHE = new WeakMap<UserCriteria, EvaluationContext>();

// A criteria object is reused while the results list is re-rendered.
// Cache the complete per-job evaluation to avoid rebuilding checks/reasons
// when the same job is evaluated again for the same immutable criteria.
const MATCH_RESULT_CACHE = new WeakMap<UserCriteria, WeakMap<JobPosting, MatchResult>>();

const JOB_FIELDS_CACHE = new WeakMap<JobPosting, NormalizedJobFields>();

const ELECTRONICS_KEYWORDS = ['elektronik', 'elektrik', 'mekatronik', 'otomasyon', 'haberlesme'];
const CS_KEYWORDS = ['bilgisayar', 'bilisim', 'yazilim', 'programcilik', 'donanim'];

function getProfessionContext(userProfession: string): ProfessionContext {
  const cached = PROFESSION_CONTEXT_CACHE.get(userProfession);
  if (cached) return cached;

  const cleanUserProf = normalizeTurkish(userProfession).replace(/\([^)]*\)/g, '').trim();
  const userTokens = cleanUserProf.split(/[\s,/-]+/).filter(t => t.length > 1);
  const context: ProfessionContext = {
    cleanUserProf,
    userTokens,
    isMultiWordSpecific: userTokens.length >= 2,
    stems: userTokens.map(getStem)
  };

  if (PROFESSION_CONTEXT_CACHE.size >= PROFESSION_CONTEXT_CACHE_LIMIT) {
    const oldestKey = PROFESSION_CONTEXT_CACHE.keys().next().value;
    if (oldestKey !== undefined) PROFESSION_CONTEXT_CACHE.delete(oldestKey);
  }
  PROFESSION_CONTEXT_CACHE.set(userProfession, context);
  return context;
}

function getNormalizedJobFields(job: JobPosting): NormalizedJobFields {
  const cached = JOB_FIELDS_CACHE.get(job);
  if (cached) return cached;

  const allowedDepartments = (job.allowedDepartments || []).map(normalizeTurkish);
  const requiredEducation = (job.requiredEducation || []).map(normalizeTurkish);
  const fields: NormalizedJobFields = {
    city: normalizeTurkish(job.city),
    title: normalizeTurkish(job.title),
    allowedDepartments,
    requiredEducation,
    hasEducationFlexible: requiredEducation.some(e => e === 'fark etmez' || e.includes('fark etmez')),
    hasLiseEducation: requiredEducation.some(e => e.includes('lise') || e.includes('ortaogretim')),
    hasOnlisansEducation: requiredEducation.some(e => e.includes('onlisans')),
    hasLisansEducation: requiredEducation.some(e => !e.includes('onlisans') && e.includes('lisans')),
    description: normalizeTurkish(job.description),
    isElectronics: allowedDepartments.some(allowedNorm =>
      ELECTRONICS_KEYWORDS.some(k => allowedNorm.includes(k))
    ),
    isCs: allowedDepartments.some(allowedNorm => {
      const jobTokens = allowedNorm.split(/[\s,/-]+/);
      return CS_KEYWORDS.some(k => allowedNorm.includes(k)) ||
             jobTokens.some(t => t === 'it' || t === 'bt');
    })
  };
  JOB_FIELDS_CACHE.set(job, fields);
  return fields;
}

export function normalizeTurkish(text?: string | null): string {
  if (!text) return '';

  const cached = NORMALIZE_CACHE.get(text);
  if (cached !== undefined) return cached;

  const normalized = text
    .trim()
    .replace(/İ/g, 'i')
    .replace(/I/g, 'i')
    .replace(/ı/g, 'i')
    .replace(/Ğ/g, 'g')
    .replace(/ğ/g, 'g')
    .replace(/Ü/g, 'u')
    .replace(/ü/g, 'u')
    .replace(/Ş/g, 's')
    .replace(/ş/g, 's')
    .replace(/Ö/g, 'o')
    .replace(/ö/g, 'o')
    .replace(/Ç/g, 'c')
    .replace(/ç/g, 'c')
    .toLowerCase();

  if (NORMALIZE_CACHE.size >= NORMALIZE_CACHE_LIMIT) {
    const oldestKey = NORMALIZE_CACHE.keys().next().value;
    if (oldestKey !== undefined) NORMALIZE_CACHE.delete(oldestKey);
  }
  NORMALIZE_CACHE.set(text, normalized);
  return normalized;
}

// Neighboring or regional pairs in Turkey (e.g. Aydın and Denizli/İzmir/Muğla)
const REGIONAL_PROXIMITY: Record<string, string[]> = {
  'aydın': ['denizli', 'izmir', 'muğla', 'manisa'],
  'denizli': ['aydın', 'muğla', 'uşak', 'afyonkarahisar', 'burdur'],
  'izmir': ['manisa', 'aydın', 'balıkesir'],
  'ankara': ['eskişehir', 'kırıkkale', 'çankırı', 'bolu', 'konya'],
  'istanbul': ['kocaeli', 'tekirdağ', 'yalova', 'bursa'],
  'kocaeli': ['istanbul', 'sakarya', 'yalova', 'bursa']
};

/**
 * Bir ilanın Mühendis unvanı gerektirip gerektirmediğini tespit eder.
 */
export function isEngineerJob(title?: string, allowedDepartments?: string[]): boolean {
  if (!title) return false;
  const normTitle = normalizeTurkish(title);
  if (normTitle.includes('muhendis') || normTitle.includes('muhendislig')) {
    return true;
  }
  if (allowedDepartments && allowedDepartments.length > 0) {
    const allEng = allowedDepartments.every(d => {
      const nd = normalizeTurkish(d);
      return nd.includes('muhendis') && !nd.includes('tekniker') && !nd.includes('programci');
    });
    if (allEng && allowedDepartments.length > 0) return true;
  }
  return false;
}

/**
 * Türk Mevzuatı Uyarınca Unvan ve Eğitim Seviyesi Yasallık Kontrolü:
 * 1. 3458 sayılı Mühendislik ve Mimarlık Kanunu:
 *    Mühendis ve Mimar unvanları en az 4 yıllık Lisans (Fakülte) diploması gerektirir.
 *    2 yıllık Önlisans (MYO), Lise veya İlköğretim mezunları bu unvanı taşıyamaz ve kadrolara başvuramaz.
 * 2. 1136 sayılı Avukatlık Kanunu:
 *    Avukat ve Hukuk Müşaviri kadroları 4 yıllık Hukuk Fakültesi lisans diploması ve staj gerektirir.
 * 3. 1219 sayılı Tababet Kanunu:
 *    Hekim/Tabip kadroları Tıp Fakültesi diploması gerektirir.
 * 4. 6197 sayılı Eczacılar Kanunu:
 *    Eczacı unvanı 5 yıllık Eczacılık Fakültesi lisans diploması gerektirir.
 * 5. 7354 sayılı Öğretmenlik Meslek Kanunu:
 *    Kadrolu öğretmenlik 4 yıllık Lisans (Eğitim Fakültesi veya Pedagojik Formasyon) gerektirir.
 * 6. Tekniker Unvanı:
 *    Tekniker unvanı 2 yıllık Meslek Yüksekokulu (Önlisans) gerektirir; lise mezunları Teknisyen olabilir, Tekniker olamaz.
 */
function checkEducationTitleLegalityNormalized(
  normTitle: string,
  userEduNorm: string
): { isLegal: boolean; reason?: string } {

  const isUserUndergradOrBelow = 
    userEduNorm.includes('onlisans') || 
    userEduNorm.includes('lise') || 
    userEduNorm.includes('ortaogretim') || 
    userEduNorm.includes('ilkogretim');

  const isUserLiseOrBelow =
    userEduNorm.includes('lise') || 
    userEduNorm.includes('ortaogretim') || 
    userEduNorm.includes('ilkogretim');

  if (isUserUndergradOrBelow) {
    // 1. Mühendislik ve Mimarlık (3458 sayılı Mühendislik ve Mimarlık Hakkında Kanun)
    const isArchitect = (normTitle.includes('mimar') || normTitle.includes('mimarlig')) &&
                        !normTitle.includes('tekniker') && !normTitle.includes('yardimci') && !normTitle.includes('restorasyon');
    if (normTitle.includes('muhendis') || normTitle.includes('muhendislig') || isArchitect) {
      return {
        isLegal: false,
        reason: '3458 sayılı Mühendislik ve Mimarlık Kanunu gereği Mühendis ve Mimar kadroları en az 4 yıllık lisans diploması gerektirir. 2 yıllık önlisans mezunları bu unvanı taşıyamaz ve mühendis kadrolarına başvuramaz.'
      };
    }

    // 2. Avukatlık ve Hukuk Müşavirliği (1136 sayılı Avukatlık Kanunu)
    if (normTitle.includes('avukat') || (normTitle.includes('hukuk') && normTitle.includes('musavir'))) {
      return {
        isLegal: false,
        reason: '1136 sayılı Avukatlık Kanunu gereği Avukatlık ve Hukuk Müşavirliği 4 yıllık Hukuk Fakültesi lisans diploması gerektirir. Önlisans mezunları avukat kadrolarına başvuramaz.'
      };
    }

    // 3. Hekimlik / Tabip (1219 sayılı Tababet Kanunu)
    const isDoctor = (normTitle.includes('tabip') || normTitle.includes('doktor') || normTitle.includes('hekim')) &&
                     !normTitle.includes('dis') && !normTitle.includes('veteriner') && !normTitle.includes('laboratuvar');
    if (isDoctor) {
      return {
        isLegal: false,
        reason: '1219 sayılı Tababet Kanunu gereği Tabip/Hekim kadroları 6 yıllık Tıp Fakültesi diploması gerektirir. Önlisans mezunları hekim kadrolarına başvuramaz.'
      };
    }

    // 4. Eczacı (6197 sayılı Eczacılar Kanunu)
    if (normTitle.includes('eczaci') && !normTitle.includes('tekniker')) {
      return {
        isLegal: false,
        reason: '6197 sayılı Eczacılar Kanunu gereği Eczacı unvanı 5 yıllık Eczacılık lisans diploması gerektirir. Önlisans mezunları eczacı kadrolarına başvuramaz (Eczane Teknikeri kadrolarına başvurabilir).'
      };
    }

    // 5. Kadrolu Öğretmenlik (7354 sayılı Öğretmenlik Meslek Kanunu)
    if (normTitle.includes('ogretmen') && !normTitle.includes('usta ogretici') && !normTitle.includes('egitici')) {
      return {
        isLegal: false,
        reason: '7354 sayılı Öğretmenlik Meslek Kanunu gereği öğretmen kadroları en az 4 yıllık lisans (Eğitim Fakültesi / Formasyon) diploması gerektirir. Önlisans mezunları kadrolu öğretmenliğe başvuramaz.'
      };
    }
  }

  // 6. Tekniker Unvanı (Lise mezunları Tekniker olamaz, Teknisyen olur)
  if (isUserLiseOrBelow && normTitle.includes('tekniker')) {
    return {
      isLegal: false,
      reason: 'Tekniker unvanı 2 yıllık Meslek Yüksekokulu (Önlisans) diploması gerektirir. Lise mezunları Teknisyen kadrolarına başvurabilir, Tekniker kadrolarına başvuramaz.'
    };
  }

  return { isLegal: true };
}

export function checkEducationTitleLegality(
  jobTitle: string,
  userEduLevel?: string
): { isLegal: boolean; reason?: string } {
  if (!userEduLevel || userEduLevel === 'Fark Etmez') return { isLegal: true };
  return checkEducationTitleLegalityNormalized(
    normalizeTurkish(jobTitle),
    normalizeTurkish(userEduLevel)
  );
}

/**
 * Türkçe ek temizleme ve kök/gövde bulma yardımcısı (i, ı, si, leri, lığı vb.)
 */
function getStem(tok: string): string {
  if (!tok || tok.length <= 3) return tok;
  return tok
    .replace(/(i|ı|u|ü|si|sı|su|sü|ler|lar|leri|ları)$/g, '')
    .replace(/(ligi|lığı|lugu|lüğü|lik|lık|luk|lük)$/g, '');
}

/**
 * Meslek / Unvan filtreleme motoru:
 * 1. Eğer kullanıcı "Bilgisayar Mühendisi" gibi spesifik çok kelimeli unvan yazmışsa:
 *    SADECE "Bilgisayar Mühendisi" arayan ilanlar eşleşir.
 *    "Bilgisayar Programcısı", "Bilgisayar Teknikeri", "Bilgisayarlı Muhasebe" gibi alt unvanlar filtrelenir.
 * 2. Eğer kullanıcı sadece "Bilgisayar" yazmışsa:
 *    Meslek şartlarında "Bilgisayar" ile başlayan veya içeren tüm unvanlar
 *    (Programcı, Öğretmen, Bilgisayarlı Muhasebe, Tekniker vb.) listelenir.
 */
function checkProfessionMatchNormalized(
  userProfession: string,
  normUserProf: string,
  normTitle: string,
  normDepts: string[],
  normDesc: string,
  context: ReturnType<typeof getProfessionContext>
): {
  isMatch: boolean;
  matchType: 'exact' | 'prefix' | 'none';
  reason: string;
} {
  if (!normUserProf) {
    return { isMatch: true, matchType: 'exact', reason: 'Unvan filtresi belirtilmedi' };
  }
  const { cleanUserProf, userTokens, isMultiWordSpecific, stems } = context;
  if (userTokens.length === 0) {
    return { isMatch: true, matchType: 'exact', reason: 'Unvan kriteri boş' };
  }

  // KULLANICI KURALI 1: Çok kelimeli spesifik unvan (Örn: "Bilgisayar Mühendisi")

  if (isMultiWordSpecific) {
    const isUserEngineer = cleanUserProf.includes('muhendis');
    const isJobEngineer = normTitle.includes('muhendis') || normDepts.some(d => d.includes('muhendis'));

    const isUserTechnician = cleanUserProf.includes('tekniker') || cleanUserProf.includes('teknisyen');
    const isJobTechnician = normTitle.includes('tekniker') || normTitle.includes('teknisyen');

    const isUserProgrammer = cleanUserProf.includes('programci');
    const isJobProgrammer = normTitle.includes('programci') || normDepts.some(d => d.includes('programci'));

    const isUserTeacher = cleanUserProf.includes('ogretmen');
    const isJobTeacher = normTitle.includes('ogretmen') || normDepts.some(d => d.includes('ogretmen'));

    const isUserAccountant = cleanUserProf.includes('muhasebe');
    const isJobAccountant = normTitle.includes('muhasebe') || normDepts.some(d => d.includes('muhasebe'));

    // Çapraz unvan uyuşmazlığı kontrolleri (Tüm meslek alanları için genelleştirilmiş)
    if (isUserEngineer && !isJobEngineer) {
      return {
        isMatch: false,
        matchType: 'none',
        reason: `Aranan unvan "${userProfession}" (Mühendislik) kadrosudur. Bu ilan tekniker, teknisyen veya operasyonel pozisyondur.`
      };
    }
    if (isUserTechnician && isJobEngineer && !isJobTechnician) {
      return {
        isMatch: false,
        matchType: 'none',
        reason: `Aranan unvan "${userProfession}" (Teknikerlik) kadrosudur. Bu ilan mühendislik pozisyonudur.`
      };
    }
    if (isUserProgrammer && isJobEngineer && !isJobProgrammer) {
      return {
        isMatch: false,
        matchType: 'none',
        reason: `Aranan unvan "${userProfession}" kadrosudur. Bu ilan mühendislik pozisyonudur.`
      };
    }
    if (isUserAccountant && !isJobAccountant) {
      return {
        isMatch: false,
        matchType: 'none',
        reason: `Aranan unvan "${userProfession}" kadrosudur. Bu ilan muhasebe/finans pozisyonu değildir.`
      };
    }

    // Avukat vs Zabıt Kâtibi / Diğer kadrolar
    const isUserLawyer = cleanUserProf.includes('avukat') || cleanUserProf.includes('hukuk musavir');
    const isJobLawyer = normTitle.includes('avukat') || normTitle.includes('hukuk musavir') || normDepts.some(d => d.includes('avukat'));
    if (isUserLawyer && !isJobLawyer) {
      return {
        isMatch: false,
        matchType: 'none',
        reason: `Aranan unvan "${userProfession}" (Avukatlık) kadrosudur. Bu ilan adalet personeli (katip/mübaşir vb.) veya diğer idari pozisyondur.`
      };
    }
    const isUserClerk = cleanUserProf.includes('katip') || cleanUserProf.includes('mubasir') || cleanUserProf.includes('icra');
    if (isUserClerk && isJobLawyer) {
      return {
        isMatch: false,
        matchType: 'none',
        reason: `Aranan unvan "${userProfession}" kadrosudur. Bu ilan Avukatlık pozisyonudur.`
      };
    }

    // Hekim / Tabip vs Diğer sağlık kadroları
    const isUserDoctor = (cleanUserProf.includes('tabip') || cleanUserProf.includes('doktor') || cleanUserProf.includes('hekim')) && !cleanUserProf.includes('dis');
    const isJobDoctor = (normTitle.includes('tabip') || normTitle.includes('doktor') || normTitle.includes('hekim')) && !normTitle.includes('dis');
    if (isUserDoctor && !isJobDoctor) {
      return {
        isMatch: false,
        matchType: 'none',
        reason: `Aranan unvan "${userProfession}" (Hekimlik) kadrosudur. Bu ilan hemşirelik veya teknikerlik pozisyonudur.`
      };
    }

    // Eczacı vs Eczane Teknikeri
    const isUserPharmacist = cleanUserProf.includes('eczaci') && !cleanUserProf.includes('tekniker');
    const isJobPharmacist = normTitle.includes('eczaci') && !normTitle.includes('tekniker');
    if (isUserPharmacist && !isJobPharmacist) {
      return {
        isMatch: false,
        matchType: 'none',
        reason: `Aranan unvan "${userProfession}" (Eczacılık) kadrosudur. Bu ilan teknikerlik pozisyonudur.`
      };
    }

    // Öğretmenlik
    if (isUserTeacher && !isJobTeacher) {
      return {
        isMatch: false,
        matchType: 'none',
        reason: `Aranan unvan "${userProfession}" (Öğretmenlik) kadrosudur. Bu ilan öğretmen kadrosu değildir.`
      };
    }

    // Unvan kelimelerinin / köklerinin tamamının varlığı
    const hasAllStemsInTitle = stems.every(stem => normTitle.includes(stem));
    const hasAllStemsInDept = normDepts.some(dept => stems.every(stem => dept.includes(stem)));
    const directPhraseMatch = normTitle.includes(cleanUserProf) || normDepts.some(d => d.includes(cleanUserProf));

    if (directPhraseMatch || hasAllStemsInTitle || hasAllStemsInDept) {
      return {
        isMatch: true,
        matchType: 'exact',
        reason: `"${userProfession}" unvanı ile tam uyumlu.`
      };
    }

    return {
      isMatch: false,
      matchType: 'none',
      reason: `İlan "${jobTitle}", aradığınız "${userProfession}" unvanı ile uyuşmuyor.`
    };
  }

  // KULLANICI KURALI 2: Tek kelime/kök arama (Örn: "Bilgisayar")
  // Meslek şartlarında bu kök ile başlayan veya içeren tüm unvanlar listelenir
  const prefixToken = userTokens[0];
  const stem = getStem(prefixToken);
  const titleHasPrefix = normTitle.includes(prefixToken) || normTitle.includes(stem);
  const deptsHavePrefix = normDepts.some(d => d.includes(prefixToken) || d.includes(stem));
  const descHasPrefix = normDesc.includes(prefixToken) || normDesc.includes(stem);

  if (titleHasPrefix || deptsHavePrefix || descHasPrefix) {
    return {
      isMatch: true,
      matchType: 'prefix',
      reason: `"${userProfession}" alanı ile ilgili açık pozisyon.`
    };
  }

  return {
    isMatch: false,
    matchType: 'none',
    reason: `İlan "${jobTitle}", aradığınız "${userProfession}" unvanı ile ilgili değildir.`
  };
}

export function checkProfessionMatch(
  userProfession?: string,
  jobTitle?: string,
  allowedDepartments: string[] = [],
  jobDescription?: string
): {
  isMatch: boolean;
  matchType: 'exact' | 'prefix' | 'none';
  reason: string;
} {
  const normUserProf = normalizeTurkish(userProfession);
  const normTitle = normalizeTurkish(jobTitle || '');
  const normDepts = (allowedDepartments || []).map(d => normalizeTurkish(d));
  const normDesc = normalizeTurkish(jobDescription || '');
  return checkProfessionMatchNormalized(
    userProfession || '',
    normUserProf,
    normTitle,
    normDepts,
    normDesc,
    getProfessionContext(userProfession)
  );
}

export function evaluateJobMatch(job: JobPosting, criteria: UserCriteria): MatchResult {
  let criteriaCache = MATCH_RESULT_CACHE.get(criteria);
  if (!criteriaCache) {
    criteriaCache = new WeakMap<JobPosting, MatchResult>();
    MATCH_RESULT_CACHE.set(criteria, criteriaCache);
  }

  const cachedResult = criteriaCache.get(job);
  if (cachedResult) return cachedResult;

  const checks: RequirementCheck[] = [];
  let score = 0;
  let hasCriticalFailure = false;
  let primaryFailureReason = '';

  let evaluationContext = EVALUATION_CONTEXT_CACHE.get(criteria);
  if (!evaluationContext) {
    const userAge = typeof criteria.age === 'number' ? criteria.age : parseInt(String(criteria.age), 10) || 0;
    const userCityNorm = normalizeTurkish(criteria.city);
    const userDeptNorm = normalizeTurkish(criteria.department);
    const userEduNorm = normalizeTurkish(criteria.educationLevel);
    const userProfNorm = normalizeTurkish(criteria.profession);
    const userDeptAndProfTokens = (userDeptNorm + ' ' + userProfNorm).split(/[\s,/-]+/).filter(Boolean);
    const isUserElectronics = ELECTRONICS_KEYWORDS.some(k => userDeptNorm.includes(k));
    const isUserCs = CS_KEYWORDS.some(k => userDeptNorm.includes(k) || userProfNorm.includes(k)) ||
                     userDeptAndProfTokens.some(t => t === 'it' || t === 'bt');
    const isEducationFlexible = !criteria.educationLevel || criteria.educationLevel === 'Fark Etmez';
    const isAllCities = !criteria.city || criteria.city === 'Tüm İller (Türkiye Geneli)' ||
                        criteria.city === 'Tüm İller' || userCityNorm.includes('tum') || userCityNorm.includes('genel');
    const isNoKpssChecked = Boolean(criteria.noKpss);
    const userKpss = typeof criteria.kpssScore === 'number'
      ? criteria.kpssScore
      : (criteria.kpssScore !== '' && criteria.kpssScore !== undefined && !isNaN(parseFloat(String(criteria.kpssScore))))
      ? parseFloat(String(criteria.kpssScore)) : null;
    evaluationContext = {
      userAge, userCityNorm, userDeptNorm, userEduNorm, userProfNorm,
      professionContext: getProfessionContext(criteria.profession),
      userDeptAndProfTokens, isUserElectronics, isUserCs, isEducationFlexible,
      userIsLise: userEduNorm.includes('lise') || userEduNorm.includes('ortaogretim'),
      userIsOnlisans: userEduNorm.includes('onlisans'),
      userIsLisans: !userEduNorm.includes('onlisans') && userEduNorm.includes('lisans'),
      userIsYuksek: userEduNorm.includes('yuksek') || userEduNorm.includes('doktora') || userEduNorm.includes('master'),
      isAllCities, isNoKpssChecked, userKpss
    };
    EVALUATION_CONTEXT_CACHE.set(criteria, evaluationContext);
  }

  const {
    userAge, userCityNorm, userDeptNorm, userEduNorm, userProfNorm, professionContext,
    userDeptAndProfTokens, isUserElectronics, isUserCs, isEducationFlexible,
    userIsLise, userIsOnlisans, userIsLisans, userIsYuksek, isAllCities,
    isNoKpssChecked, userKpss
  } = evaluationContext;

  const jobFields = getNormalizedJobFields(job);
  const jobCityNorm = jobFields.city;

  // 1. YAŞ ŞARTI (AGE CHECK)
  if (userAge > 0) {
    const isAgeEligible = userAge >= job.minAge && userAge <= job.maxAge;
    if (isAgeEligible) {
      score += 25;
      checks.push({
        category: 'age',
        title: 'Yaş Şartı',
        isSatisfied: true,
        userValue: `${userAge} yaş`,
        requiredValue: `${job.minAge}–${job.maxAge} yaş arası`,
        reason: `Yaş: ${userAge} / sınır ${job.minAge}–${job.maxAge}`
      });
    } else {
      hasCriticalFailure = true;
      primaryFailureReason = 'Yaş şartı karşılanmıyor.';
      checks.push({
        category: 'age',
        title: 'Yaş Şartı',
        isSatisfied: false,
        userValue: `${userAge} yaş`,
        requiredValue: `${job.minAge}–${job.maxAge} yaş arası`,
        reason: userAge > job.maxAge 
          ? `Yaş şartı karşılanmıyor. (Azami sınır ${job.maxAge}, sizin yaşınız ${userAge})`
          : `Asgari yaş şartı karşılanmıyor. (En az ${job.minAge} yaş gerekli)`
      });
    }
  } else {
    // Yaş girilmemişse nötr kabul et
    score += 20;
    checks.push({
      category: 'age',
      title: 'Yaş Şartı',
      isSatisfied: true,
      userValue: 'Belirtilmedi',
      requiredValue: `${job.minAge}–${job.maxAge}`,
      reason: 'Yaş girilmediği için sınır kontrolü esnetildi'
    });
  }

  // 2. MEZUNİYET SEVİYESİ VE MÜHENDİSLİK UNVAN YASALLIK KONTROLÜ
  // 3458 sayılı Mühendislik ve Mimarlık Kanunu uyarınca:
  // 2 yıllık önlisans mezunları mühendis unvanına sahip olamaz ve mühendis kadrolarına başvuramaz.
  const titleLegality = checkEducationTitleLegalityNormalized(jobFields.title, userEduNorm);
  if (!titleLegality.isLegal) {
    hasCriticalFailure = true;
    if (!primaryFailureReason) primaryFailureReason = titleLegality.reason!;
    checks.push({
      category: 'education',
      title: 'Mühendislik / Mezuniyet Şartı',
      isSatisfied: false,
      userValue: criteria.educationLevel || 'Önlisans',
      requiredValue: 'En az 4 Yıllık Lisans (Fakülte)',
      reason: titleLegality.reason!
    });
  }

  const eduMatch = isEducationFlexible ||
    jobFields.hasEducationFlexible ||
    jobFields.requiredEducation.includes(userEduNorm) ||
    (userIsLisans && (jobFields.hasOnlisansEducation || jobFields.hasLisansEducation)) ||
    (userIsYuksek && (jobFields.hasLisansEducation || jobFields.hasOnlisansEducation)) ||
    (userIsOnlisans && jobFields.hasOnlisansEducation) ||
    (userIsLise && jobFields.hasLiseEducation);

  if (eduMatch) {
    score += 25;
    checks.push({
      category: 'education',
      title: 'Mezuniyet',
      isSatisfied: true,
      userValue: criteria.educationLevel || 'Fark Etmez',
      requiredValue: job.requiredEducation.join(' veya '),
      reason: `${criteria.educationLevel || job.requiredEducation[0]} şartı karşılanıyor`
    });
  } else {
    hasCriticalFailure = true;
    if (!primaryFailureReason) primaryFailureReason = 'Mezuniyet seviyesi şartı karşılanmıyor.';
    checks.push({
      category: 'education',
      title: 'Mezuniyet',
      isSatisfied: false,
      userValue: criteria.educationLevel,
      requiredValue: job.requiredEducation.join(' veya '),
      reason: `Eğitim seviyesi uyuşmuyor. İlanın talebi: ${job.requiredEducation.join(' / ')}`
    });
  }

  // 3. BÖLÜM / ALAN (DEPARTMENT)
  let deptMatch = false;
  let partialDept = false;

  if (!criteria.department || criteria.department.trim() === '') {
    deptMatch = true;
    score += 25;
    checks.push({
      category: 'department',
      title: 'Bölüm',
      isSatisfied: true,
      userValue: 'Tüm Bölümler',
      requiredValue: 'Genel',
      reason: 'Bölüm filtresi seçilmedi'
    });
  } else {
    const isJobElectronics = jobFields.isElectronics;
    const isJobCs = jobFields.isCs;

    for (const allowedNorm of jobFields.allowedDepartments) {
      if (allowedNorm.includes('alan ayrımı olmaksızın') || allowedNorm.includes('fark etmez') || allowedNorm.includes('tum bolumler') || allowedNorm.includes('ilgili bolum')) {
        deptMatch = true;
        break;
      }
      if (allowedNorm === userDeptNorm || allowedNorm.includes(userDeptNorm) || userDeptNorm.includes(allowedNorm)) {
        deptMatch = true;
        break;
      }
      // Kullanıcının arattığı unvan ilan bölümünde yer alıyorsa tam eşleştir
      if (userProfNorm && (allowedNorm.includes(userProfNorm) || userProfNorm.includes(allowedNorm))) {
        deptMatch = true;
        break;
      }

      if (isUserElectronics && isJobElectronics) {
        partialDept = true;
      }

      // Benzer bilişim alanları (bilgisayar / yazılım / donanım)
      if (isUserCs && isJobCs) {
        partialDept = true;
      }
    }

    // İlan başlığı aranan unvana tam uyuyorsa bölümü kısmi uygun say
    const jobTitleNorm = jobFields.title;
    if (!deptMatch && !partialDept && userProfNorm && (jobTitleNorm.includes(userProfNorm) || userProfNorm.includes(jobTitleNorm))) {
      partialDept = true;
    }

    if (deptMatch) {
      score += 25;
      checks.push({
        category: 'department',
        title: 'Bölüm Şartı',
        isSatisfied: true,
        userValue: criteria.department,
        requiredValue: job.allowedDepartments[0] || 'İlgili bölüm',
        reason: `${criteria.department} bölümü uygun`
      });
    } else if (partialDept) {
      score += 20;
      checks.push({
        category: 'department',
        title: 'Bölüm Şartı',
        isSatisfied: true,
        userValue: criteria.department,
        requiredValue: job.allowedDepartments.join(', '),
        reason: `Eşdeğer/Yakın teknik alan (${criteria.department})`
      });
    } else {
      if (!primaryFailureReason) primaryFailureReason = 'Bölüm / alan şartı karşılanmıyor.';
      checks.push({
        category: 'department',
        title: 'Bölüm Şartı',
        isSatisfied: false,
        userValue: criteria.department,
        requiredValue: job.allowedDepartments.join(', '),
        reason: `Bölüm uyuşmazlığı. İlan şartı: ${job.allowedDepartments.join(', ')}`
      });
    }
  }

  // 4. KONUM (LOCATION)
  const isCityExact = userCityNorm === jobCityNorm || jobCityNorm.includes(userCityNorm);
  const isNationwideJob = job.isNationwide === true || 
                          jobCityNorm.includes('tum') || 
                          jobCityNorm.includes('genel') || 
                          jobCityNorm.includes('turkiye');

  if (isAllCities || isNationwideJob || isCityExact) {
    score += 25;
    checks.push({
      category: 'location',
      title: 'Konum',
      isSatisfied: true,
      userValue: criteria.city || 'Tümü',
      requiredValue: `${job.city}${job.district ? ' / ' + job.district : ''}`,
      reason: isNationwideJob 
        ? 'Türkiye geneli / Çoklu il kadrosu'
        : `Konum uygun (${job.city}${job.district ? ' / ' + job.district : ''})`
    });
  } else {
    // Belirli bir il arayan kullanıcıya başka ildeki yerel ilanlar uygun sayılmaz
    hasCriticalFailure = true;
    if (!primaryFailureReason) {
      primaryFailureReason = `İlan ${job.city} lokasyonundadır, aradığınız il (${criteria.city}) ile uyuşmuyor.`;
    }
    checks.push({
      category: 'location',
      title: 'Konum',
      isSatisfied: false,
      userValue: criteria.city,
      requiredValue: job.city,
      reason: `Farklı şehir (${job.city}). Aranan il: ${criteria.city}`
    });
  }

  // 5. KPSS PUANI ŞARTI (KPSS SCORE CHECK)
  const jobRequiresKpss = job.requiresKpss ?? (job.minKpssScore !== undefined && job.minKpssScore > 0);
  const minRequiredKpss = job.minKpssScore || 0;
  const kpssType = job.kpssScoreType || (jobFields.hasLisansEducation ? 'KPSS P3' : 'KPSS P93');

  if (isNoKpssChecked) {
    // Kullanıcı "KPSS Puanım Yok" seçeneğini işaretledi
    if (jobRequiresKpss && minRequiredKpss > 0) {
      hasCriticalFailure = true;
      if (!primaryFailureReason) primaryFailureReason = `KPSS puanı şartı bulunmaktadır (KPSS puanınız yok).`;
      checks.push({
        category: 'kpss',
        title: 'KPSS Şartı',
        isSatisfied: false,
        userValue: 'KPSS Puanı Yok',
        requiredValue: `Min ${minRequiredKpss} (${kpssType})`,
        reason: `İlan en az ${minRequiredKpss} KPSS puanı talep etmektedir. KPSS puanınız bulunmadığı için başvuru şartı karşılanmıyor.`
      });
    } else {
      score += 10;
      checks.push({
        category: 'kpss',
        title: 'KPSS Şartı',
        isSatisfied: true,
        userValue: 'KPSS Yok (Tam Uyumlu)',
        requiredValue: 'KPSS Şartsız',
        reason: 'Bu ilanda KPSS puanı şartı aranmamaktadır (Noter kurası, sözlü sınav veya özel sektör).'
      });
    }
  } else if (jobRequiresKpss && minRequiredKpss > 0) {
    if (userKpss !== null) {
      if (userKpss >= minRequiredKpss) {
        score += 10;
        checks.push({
          category: 'kpss',
          title: 'KPSS Şartı',
          isSatisfied: true,
          userValue: `${userKpss} Puan`,
          requiredValue: `Min ${minRequiredKpss} (${kpssType})`,
          reason: `KPSS puanınız (${userKpss}), taban puanı (${minRequiredKpss}) karşılıyor.`
        });
      } else {
        hasCriticalFailure = true;
        if (!primaryFailureReason) primaryFailureReason = `KPSS taban puanı (${minRequiredKpss}) karşılanmıyor.`;
        checks.push({
          category: 'kpss',
          title: 'KPSS Şartı',
          isSatisfied: false,
          userValue: `${userKpss} Puan`,
          requiredValue: `Min ${minRequiredKpss} (${kpssType})`,
          reason: `KPSS puanınız (${userKpss}) yetersiz. İlanın taban puanı: ${minRequiredKpss}.`
        });
      }
    } else {
      // Puan girilmemişse ilanın KPSS talebini bilgi olarak göster
      checks.push({
        category: 'kpss',
        title: 'KPSS Şartı',
        isSatisfied: true,
        userValue: 'Puan Girilmedi',
        requiredValue: `Min ${minRequiredKpss} (${kpssType})`,
        reason: `İlan en az ${minRequiredKpss} taban puan talep ediyor.`
      });
    }
  } else {
    // KPSS şartı aranmıyor
    checks.push({
      category: 'kpss',
      title: 'KPSS Şartı',
      isSatisfied: true,
      userValue: userKpss !== null ? `${userKpss} Puan` : 'Girilmedi',
      requiredValue: 'KPSS Şartsız',
      reason: 'Bu ilanda KPSS şartı aranmıyor (Mülakat/kura veya özel sektör).'
    });
  }

  // 6. MESLEK / ÜNVAN UYUM KONTROLÜ (PROFESSION MATCH)
  if (criteria.profession && criteria.profession.trim()) {
    const profMatch = checkProfessionMatchNormalized(
      criteria.profession,
      userProfNorm,
      jobFields.title,
      jobFields.allowedDepartments,
      jobFields.description,
      professionContext
    );

    if (profMatch.isMatch) {
      if (profMatch.matchType === 'exact') {
        score = Math.min(100, score + 10);
      } else {
        score = Math.min(100, score + 5);
      }
      checks.push({
        category: 'profession',
        title: 'Meslek / Ünvan Şartı',
        isSatisfied: true,
        userValue: criteria.profession,
        requiredValue: job.title,
        reason: profMatch.reason
      });
    } else {
      hasCriticalFailure = true;
      if (!primaryFailureReason) {
        primaryFailureReason = profMatch.reason;
      }
      checks.push({
        category: 'profession',
        title: 'Meslek / Ünvan Şartı',
        isSatisfied: false,
        userValue: criteria.profession,
        requiredValue: job.title,
        reason: profMatch.reason
      });
    }
  }

  // Determine final status
  let status: 'eligible' | 'partial' | 'ineligible' = 'eligible';
  let matchPercentage = Math.min(98, Math.max(15, score));

  if (hasCriticalFailure) {
    status = 'ineligible';
    // When ineligible, show realistic lower score like 30-50% reflecting partial factors that did match
    matchPercentage = Math.min(50, Math.max(20, score));
  } else if (score >= 80) {
    status = 'eligible';
    matchPercentage = Math.min(100, Math.max(88, score));
  } else if (score >= 50) {
    status = 'partial';
    matchPercentage = Math.min(85, Math.max(50, score));
  } else {
    status = 'ineligible';
    matchPercentage = Math.min(45, Math.max(15, score));
    if (!primaryFailureReason) primaryFailureReason = 'Kriterlerin çoğunluğu ilanla eşleşmiyor.';
  }

  const summaryNote = status === 'eligible' 
    ? 'Tüm temel kriterler (eğitim, yaş, bölüm, konum) eksiksiz karşılanıyor.'
    : status === 'partial'
    ? 'Kriterlerin önemli bir kısmı karşılansa da bölgesel veya bölüm denkliği koşulları bulunmaktadır.'
    : primaryFailureReason || 'İlanın zorunlu şartları karşılanmıyor.';

  const result: MatchResult = {
    job,
    status,
    matchPercentage,
    checks,
    ineligibilityReason: hasCriticalFailure ? primaryFailureReason : undefined,
    summaryNote
  };

  criteriaCache.set(job, result);
  return result;
}
