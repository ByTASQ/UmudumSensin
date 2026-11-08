import React, { useState } from 'react';
import { UserCriteria, JobSource } from '../types/job';
import { TURKEY_CITIES } from '../data/turkeyLocations';
import { ALL_PROFESSIONS, ALL_DEPARTMENTS } from '../data/professionsAndDepartments';
import { EDUCATION_LEVELS } from '../data/educationLevels';
import { SearchableSuggestInput } from './SearchableSuggestInput';
import { 
  Briefcase, 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  MapPin, 
  Search, 
  Landmark, 
  Building2, 
  Layers, 
  Award, 
  Sparkles,
  Info 
} from 'lucide-react';
import { normalizeTurkish } from '../services/matcher';

const EDUCATION_OPTIONS = EDUCATION_LEVELS.map((edu) => (
  <option key={edu.id} value={edu.id}>{edu.label}</option>
));

const CITY_OPTIONS = TURKEY_CITIES.map((city) => (
  <option key={city.name} value={city.name}>{city.name}</option>
));

interface ScanFormProps {
  criteria: UserCriteria;
  sources: JobSource[];
  onChange: (criteria: UserCriteria) => void;
  onScan: () => void;
  onNavigateToSources?: () => void;
}

export const ScanForm: React.FC<ScanFormProps> = ({
  criteria,
  sources,
  onChange,
  onScan,
  onNavigateToSources
}) => {
  const [selectedCityObj, setSelectedCityObj] = useState(() => {
    return TURKEY_CITIES.find(c => c.name === criteria.city) || TURKEY_CITIES[0];
  });

  const isPublicActive = criteria.includePublic ?? (criteria.onlyPublicJobs !== false);
  const isPrivateActive = criteria.includePrivate ?? (!criteria.onlyPublicJobs);

  const handleSetSectorMode = (mode: 'kamu' | 'ozel' | 'both') => {
    if (mode === 'kamu') {
      onChange({ ...criteria, includePublic: true, includePrivate: false, onlyPublicJobs: true });
    } else if (mode === 'ozel') {
      onChange({ ...criteria, includePublic: false, includePrivate: true, onlyPublicJobs: false });
    } else {
      onChange({ ...criteria, includePublic: true, includePrivate: true, onlyPublicJobs: false });
    }
  };

  const handleCityChange = (cityName: string) => {
    const city = TURKEY_CITIES.find(c => c.name === cityName);
    if (city) {
      setSelectedCityObj(city);
      onChange({
        ...criteria,
        city: cityName,
        district: city.districts[0] || ''
      });
    } else {
      onChange({
        ...criteria,
        city: cityName,
        district: ''
      });
    }
  };

  const normProf = normalizeTurkish(criteria.profession);
  const normEdu = normalizeTurkish(criteria.educationLevel);
  const isUserUndergrad = normEdu.includes('onlisans') || normEdu.includes('lise') || normEdu.includes('ortaogretim') || normEdu.includes('ilkogretim');
  const isEngineerInput = normProf.includes('muhendis') || (normProf.includes('mimar') && !normProf.includes('tekniker'));

  return (
    <div className="w-full flex-1 overflow-y-auto">
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          onScan();
        }}
        className="w-full flex flex-col"
      >
        {/* 1. SEKTÖR SEÇİM ÇUBUĞU - Yatayda Tam Ekran, Yüksek Okunabilirlik ve Şık Segmented Tasarım */}
        <section className="w-full px-4 sm:px-8 xl:px-12 py-3.5 border-b border-purple-200/50 dark:border-purple-900/40 bg-white/60 dark:bg-slate-900/60">
          <div className="w-full max-w-2xl grid grid-cols-3 gap-2 sm:gap-3">
            {/* 1. Kamu */}
            <button
              type="button"
              onClick={() => handleSetSectorMode('kamu')}
              className={`py-2.5 sm:py-3 px-2 sm:px-4 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black transition-colors flex items-center justify-center gap-1.5 sm:gap-2 border cursor-pointer select-none active:scale-[0.98] ${
                isPublicActive && !isPrivateActive 
                  ? 'bg-purple-600 hover:bg-purple-500 text-white border-purple-500 shadow-md shadow-purple-950/40 ring-2 ring-purple-400/60' 
                  : 'bg-white dark:bg-slate-800/95 hover:bg-purple-50 dark:hover:bg-slate-700/90 text-slate-800 dark:text-slate-100 border-purple-200/90 dark:border-purple-800/80 shadow-2xs'
              }`}
            >
              <Landmark className={`w-4 h-4 shrink-0 ${isPublicActive && !isPrivateActive ? 'text-white' : 'text-purple-600 dark:text-purple-400'}`} />
              <span className="whitespace-nowrap tracking-tight">
                <span className="sm:hidden">Kamu</span>
                <span className="hidden sm:inline">Kamu İlanları</span>
              </span>
            </button>

            {/* 2. Özel Sektör */}
            <button
              type="button"
              onClick={() => handleSetSectorMode('ozel')}
              className={`py-2.5 sm:py-3 px-2 sm:px-4 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black transition-colors flex items-center justify-center gap-1.5 sm:gap-2 border cursor-pointer select-none active:scale-[0.98] ${
                !isPublicActive && isPrivateActive 
                  ? 'bg-purple-600 hover:bg-purple-500 text-white border-purple-500 shadow-md shadow-purple-950/40 ring-2 ring-purple-400/60' 
                  : 'bg-white dark:bg-slate-800/95 hover:bg-purple-50 dark:hover:bg-slate-700/90 text-slate-800 dark:text-slate-100 border-purple-200/90 dark:border-purple-800/80 shadow-2xs'
              }`}
            >
              <Building2 className={`w-4 h-4 shrink-0 ${!isPublicActive && isPrivateActive ? 'text-white' : 'text-purple-600 dark:text-purple-400'}`} />
              <span className="whitespace-nowrap tracking-tight">
                <span className="sm:hidden">Özel Sektör</span>
                <span className="hidden sm:inline">Özel Sektör</span>
              </span>
            </button>

            {/* 3. Tümü (Kamu + Özel) */}
            <button
              type="button"
              onClick={() => handleSetSectorMode('both')}
              className={`py-2.5 sm:py-3 px-2 sm:px-4 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black transition-colors flex items-center justify-center gap-1.5 sm:gap-2 border cursor-pointer select-none active:scale-[0.98] ${
                isPublicActive && isPrivateActive 
                  ? 'bg-purple-600 hover:bg-purple-500 text-white border-purple-500 shadow-md shadow-purple-950/40 ring-2 ring-purple-400/60' 
                  : 'bg-white dark:bg-slate-800/95 hover:bg-purple-50 dark:hover:bg-slate-700/90 text-slate-800 dark:text-slate-100 border-purple-200/90 dark:border-purple-800/80 shadow-2xs'
              }`}
            >
              <Layers className={`w-4 h-4 shrink-0 ${isPublicActive && isPrivateActive ? 'text-white' : 'text-purple-600 dark:text-purple-400'}`} />
              <span className="whitespace-nowrap tracking-tight">
                <span className="sm:hidden">Tümü</span>
                <span className="hidden sm:inline">Kamu + Özel</span>
              </span>
            </button>
          </div>
        </section>

        {/* 2. TEMEL KRİTERLER FORMU - Yatayda Tam Ekran Grid, Sadece İnce Çizgilerle Ayrılmış */}
        <section className="relative z-20 w-full px-4 sm:px-8 xl:px-12 py-6 border-b border-purple-200/50 dark:border-purple-900/40 bg-white/20 dark:bg-slate-950/20">
          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            
            {/* 1. Meslek / Unvan */}
            <div>
              <SearchableSuggestInput
                label="Meslek / Unvan"
                icon={<Briefcase className="w-3.5 h-3.5 text-purple-500" />}
                value={criteria.profession}
                onChange={(val) => onChange({ ...criteria, profession: val })}
                onEnterSubmit={onScan}
                placeholder="Örn: Bilgisayar Mühendisi veya Bilgisayar..."
                items={ALL_PROFESSIONS}
                required={true}
                datalistId="all-professions-list"
              />

              {/* 3458 sayılı Kanun Uyarısı: Önlisans mezunu mühendis arıyorsa */}
              {isUserUndergrad && isEngineerInput && (
                <div className="mt-2 p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-200 animate-fadeIn">
                  <div className="font-bold flex items-center gap-1.5 mb-0.5 text-amber-800 dark:text-amber-300">
                    <Info className="w-3.5 h-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                    <span>3458 Sayılı Kanun Uyarısı:</span>
                  </div>
                  <p className="leading-tight text-amber-900/90 dark:text-amber-200/90">
                    3458 sayılı Kanun gereği Mühendislik/Mimarlık kadroları asgari 4 yıllık Lisans diploması gerektirir. Önlisans mezunları mühendis kadrolarına yasal olarak başvuramaz.
                  </p>
                </div>
              )}
            </div>

            {/* 2. Mezuniyet Seviyesi */}
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-purple-500" />
                Mezuniyet Seviyesi
              </label>
              <select
                value={criteria.educationLevel}
                onChange={(e) => onChange({ ...criteria, educationLevel: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-white/80 dark:bg-slate-900/80 border border-purple-200/80 dark:border-purple-900/60 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500 transition font-medium text-slate-900 dark:text-slate-100"
              >
                {EDUCATION_OPTIONS}
              </select>
            </div>

            {/* 3. Bölüm / Alan */}
            <div>
              <SearchableSuggestInput
                label="Mezun Olunan Bölüm / Alan"
                icon={<BookOpen className="w-3.5 h-3.5 text-purple-500" />}
                value={criteria.department}
                onChange={(val) => onChange({ ...criteria, department: val })}
                onEnterSubmit={onScan}
                placeholder="Örn: Elektronik Teknolojisi..."
                items={ALL_DEPARTMENTS}
                required={false}
                datalistId="all-departments-list"
              />
            </div>

            {/* 4. YAŞ VE KPSS PUANI YAN YANA */}
            <div className="grid grid-cols-2 gap-3">
              {/* Yaş */}
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-purple-500" />
                  Yaş
                </label>
                <input
                  type="number"
                  min="15"
                  max="65"
                  required
                  value={criteria.age}
                  onChange={(e) => onChange({ ...criteria, age: e.target.value === '' ? '' : parseInt(e.target.value, 10) })}
                  placeholder="Örn: 30"
                  className="w-full px-3.5 py-2.5 text-sm bg-white/80 dark:bg-slate-900/80 border border-purple-200/80 dark:border-purple-900/60 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500 transition font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                />
              </div>

              {/* KPSS Puanı */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1 truncate">
                    <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="truncate">KPSS</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer select-none shrink-0" title="KPSS şartı aranmayan ilanlar">
                    <input
                      type="checkbox"
                      checked={Boolean(criteria.noKpss)}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        onChange({
                          ...criteria,
                          noKpss: checked,
                          kpssScore: checked ? '' : criteria.kpssScore
                        });
                      }}
                      className="w-3.5 h-3.5 text-purple-600 bg-white border-purple-300 rounded focus:ring-purple-500 accent-purple-600 cursor-pointer"
                    />
                    <span className={`text-[10px] sm:text-[11px] font-semibold transition ${
                      criteria.noKpss ? 'text-purple-700 dark:text-purple-300 font-bold' : 'text-slate-500 dark:text-slate-400'
                    }`}>
                      Şartsız
                    </span>
                  </label>
                </div>

                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  disabled={Boolean(criteria.noKpss)}
                  value={criteria.noKpss ? '' : (criteria.kpssScore ?? '')}
                  onChange={(e) => {
                    const val = e.target.value;
                    onChange({ ...criteria, kpssScore: val === '' ? '' : parseFloat(val) });
                  }}
                  placeholder={criteria.noKpss ? "Şartsız" : "Örn: 74.5"}
                  className={`w-full px-3.5 py-2.5 text-sm border rounded-xl transition font-medium ${
                    criteria.noKpss
                      ? 'bg-purple-50/40 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 border-purple-200/50 dark:border-purple-900/40 cursor-not-allowed italic'
                      : 'bg-white/80 dark:bg-slate-900/80 border-purple-200/80 dark:border-purple-900/60 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-purple-500 placeholder:text-slate-400'
                  }`}
                />
              </div>
            </div>

            {/* 5. İL VE İLÇE YAN YANA */}
            <div className="grid grid-cols-2 gap-3">
              {/* İl */}
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-purple-500" />
                  İl
                </label>
                <select
                  value={criteria.city}
                  onChange={(e) => handleCityChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-white/80 dark:bg-slate-900/80 border border-purple-200/80 dark:border-purple-900/60 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500 transition font-medium text-slate-900 dark:text-slate-100"
                >
                  {CITY_OPTIONS}
                </select>
              </div>

              {/* İlçe */}
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  İlçe
                </label>
                {selectedCityObj && selectedCityObj.districts.length > 0 ? (
                  <select
                    value={criteria.district || ''}
                    onChange={(e) => onChange({ ...criteria, district: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-white/80 dark:bg-slate-900/80 border border-purple-200/80 dark:border-purple-900/60 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500 transition font-medium text-slate-900 dark:text-slate-100"
                  >
                    <option value="">Fark Etmez / Tümü</option>
                    {selectedCityObj.districts.map((dist) => (
                      <option key={dist} value={dist}>
                        {dist}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={criteria.district || ''}
                    onChange={(e) => onChange({ ...criteria, district: e.target.value })}
                    placeholder="İlçe adı..."
                    className="w-full px-3.5 py-2.5 text-sm bg-white/80 dark:bg-slate-900/80 border border-purple-200/80 dark:border-purple-900/60 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500 transition text-slate-900 dark:text-slate-100"
                  />
                )}
              </div>
            </div>

          </div>
        </section>

        {/* 3. ALT ÇUBUK: BÜYÜK TARA BUTONU (Yatayda Tam Ekran) */}
        <section className="relative z-10 w-full px-4 sm:px-8 xl:px-12 py-5 border-b border-purple-200/50 dark:border-purple-900/40 bg-white/40 dark:bg-slate-950/40 flex items-center justify-center">
          <button
            type="submit"
            className="w-full sm:w-auto min-w-[280px] sm:min-w-[360px] py-4 px-8 bg-purple-600 hover:bg-purple-700 text-white font-black text-sm sm:text-base tracking-wide rounded-2xl shadow-lg shadow-purple-950/25 active:scale-[0.98] transition flex items-center justify-center gap-3 cursor-pointer"
          >
            <Search className="w-5 h-5 stroke-[2.5]" />
            <span>İLANLARI TARA VE ANALİZ ET</span>
            <Sparkles className="w-4 h-4 text-purple-200" />
          </button>
        </section>
      </form>
    </div>
  );
};
