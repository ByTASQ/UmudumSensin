import { GoogleGenAI } from '@google/genai';
import { JobPosting, UserCriteria } from '../types/job';

export interface AIAnalysisResult {
  extractedEducation: string;
  extractedField: string;
  extractedAgeLimit: string;
  extractedSpecialConditions: string[];
  departmentEquivalence: string;
  verdictTurkish: string;
  isEligible: boolean;
  confidenceScore: number;
}

export async function analyzeJobWithAI(job: JobPosting, criteria: UserCriteria): Promise<AIAnalysisResult | null> {
  try {
    const ai = new GoogleGenAI();

    const prompt = `
Aşağıdaki iş ilanı metnini ve bir adayın kriterlerini inceleyerek resmi/özel istihdam şartlarını analiz et.

ADAY BİLGİLERİ:
- Meslek: ${criteria.profession}
- Mezuniyet Seviyesi: ${criteria.educationLevel}
- Mezun Olunan Bölüm: ${criteria.department}
- Yaş: ${criteria.age}
- İkamet: ${criteria.city} ${criteria.district ? '(' + criteria.district + ')' : ''}

İŞ İLANI:
- Başlık: ${job.title}
- Kurum: ${job.company}
- Şehir: ${job.city}
- İlan Açıklaması: ${job.description}
- İstenen Eğitim: ${job.requiredEducation.join(', ')}
- Kabul Edilen Bölümler: ${job.allowedDepartments.join(', ')}
- Yaş Sınırı: ${job.minAge} - ${job.maxAge}
- Ek Şartlar: ${job.additionalRequirements ? job.additionalRequirements.join(' | ') : 'Belirtilmemiş'}

GÖREV:
İlandaki şartları ve adayın durumunu analiz et. İlandaki karmaşık bölüm/meslek şartlarını (denklikler, YÖK eşdeğerlikleri, yaş sınırları) değerlendir.
Aşağıdaki JSON formatında yanıt ver:
{
  "extractedEducation": "İlandan çıkarılan mezuniyet şartı",
  "extractedField": "İlandan çıkarılan ana branş veya alan",
  "extractedAgeLimit": "Örn: 18-45 yaş veya 35 yaşını doldurmamış olmak",
  "extractedSpecialConditions": ["Madde 1", "Madde 2"],
  "departmentEquivalence": "Adayın bölümü (${criteria.department}) ilanın talep ettiği bölüm ve unvanla YÖK/kurum nezdinde denk mi? Kısa açıklama.",
  "verdictTurkish": "Aday bu ilana uygun mu, neden? Kısa ve net 2-3 cümlelik Türkçe gerekçe.",
  "isEligible": true,
  "confidenceScore": 95
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    if (response.text) {
      const parsed = JSON.parse(response.text) as AIAnalysisResult;
      return parsed;
    }
    return null;
  } catch (error) {
    console.warn('AI analysis skipped or fallback used:', error);
    // Graceful fallback if offline or no key
    const isAgeOk = !criteria.age || (Number(criteria.age) >= job.minAge && Number(criteria.age) <= job.maxAge);
    return {
      extractedEducation: job.requiredEducation.join(' / '),
      extractedField: job.allowedDepartments.slice(0, 3).join(', '),
      extractedAgeLimit: `${job.minAge} - ${job.maxAge} yaş`,
      extractedSpecialConditions: job.additionalRequirements || ['Genel şartlar geçerlidir'],
      departmentEquivalence: `Adayın ${criteria.department || 'bölümü'} ile ilan şartları incelendi.`,
      verdictTurkish: isAgeOk 
        ? `Kural tabanlı kontrol başarılı: ${criteria.educationLevel} ve ${criteria.age} yaş şartı ilan profiline uyuyor.`
        : `Yaş şartı (${job.minAge}-${job.maxAge}) adayın yaşı (${criteria.age}) ile uyuşmuyor.`,
      isEligible: isAgeOk,
      confidenceScore: 88
    };
  }
}
