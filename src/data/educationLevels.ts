import { EducationLevel } from '../types/job';

export const EDUCATION_LEVELS: { id: EducationLevel; label: string; order: number }[] = [
  { id: 'İlköğretim', label: 'İlköğretim / Ortaokul', order: 1 },
  { id: 'Lise (Ortaöğretim)', label: 'Lise (Ortaöğretim)', order: 2 },
  { id: 'Önlisans', label: 'Önlisans (2 Yıllık MYO)', order: 3 },
  { id: 'Lisans', label: 'Lisans (4 Yıllık Fakülte)', order: 4 },
  { id: 'Yüksek Lisans', label: 'Yüksek Lisans (Tezli / Tezsiz)', order: 5 },
  { id: 'Doktora', label: 'Doktora', order: 6 },
  { id: 'Fark Etmez', label: 'Fark Etmez / Tümü', order: 0 }
];
