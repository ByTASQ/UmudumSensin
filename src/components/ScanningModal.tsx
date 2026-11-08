import React, { useState, useEffect } from 'react';
import { UserCriteria, JobSource } from '../types/job';
import { Loader2, Check, Search, ShieldCheck } from 'lucide-react';

interface ScanningModalProps {
  criteria: UserCriteria;
  sources: JobSource[];
  isOpen: boolean;
  onComplete: () => void;
}

export const ScanningModal: React.FC<ScanningModalProps> = ({
  criteria,
  sources,
  isOpen,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const activeSources = sources.filter(s => s.enabled);

  const steps = [
    { title: 'Kullanıcı Kriterleri Analiz Ediliyor', desc: `${criteria.profession} • ${criteria.educationLevel} • ${criteria.age} Yaş • ${criteria.city}` },
    { title: 'Seçili Kaynaklar Taranıyor', desc: `${activeSources.length} kaynak sorgulanıyor (${activeSources.map(s => s.shortName).slice(0, 4).join(', ')}...)` },
    { title: 'İlan Metinleri ve Şartları Ayrıştırılıyor', desc: 'Yaş sınırları, bölüm denklikleri, mezuniyet şartları süzülüyor' },
    { title: 'Şartlar Kullanıcıyla Karşılaştırılıyor', desc: 'Kural tabanlı uygunluk ve eşleşme skorları hesaplanıyor' },
    { title: 'Uygun İlanlar Listeleniyor', desc: 'Sonuçlar başarıyla derlendi' }
  ];

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            onComplete();
          }, 400);
          return prev;
        }
      });
    }, 450);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
        
        {/* Animated Icon */}
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center mb-4 relative shadow-sm">
          <Search className="w-8 h-8 text-emerald-600 animate-pulse" />
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          </div>
        </div>

        <h3 className="text-base font-extrabold text-slate-900 tracking-tight text-center">
          İş İlanları Taranıyor
        </h3>
        <p className="text-xs text-slate-500 text-center mt-1">
          {criteria.city} için {criteria.profession} ilanları inceleniyor
        </p>

        {/* Progress bar */}
        <div className="w-full bg-slate-100 h-2 rounded-full mt-5 overflow-hidden border border-slate-200">
          <div 
            className="bg-emerald-600 h-full rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Steps List */}
        <div className="w-full space-y-2.5 mt-5">
          {steps.map((step, idx) => {
            const isDone = idx < currentStep;
            const isCurrent = idx === currentStep;

            return (
              <div 
                key={idx}
                className={`flex items-start gap-2.5 text-xs transition-opacity duration-200 ${
                  isCurrent 
                    ? 'opacity-100 font-semibold text-slate-900' 
                    : isDone 
                    ? 'opacity-80 text-slate-600' 
                    : 'opacity-35 text-slate-400'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isDone ? (
                    <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  ) : isCurrent ? (
                    <div className="w-4 h-4 rounded-full bg-emerald-100 border border-emerald-500 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                    </div>
                  ) : (
                    <div className="w-4 h-4 rounded-full bg-slate-200 border border-slate-300" />
                  )}
                </div>
                <div>
                  <p className="leading-tight">{step.title}</p>
                  {isCurrent && (
                    <p className="text-[11px] text-slate-500 font-normal mt-0.5">
                      {step.desc}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-3 border-t border-slate-100 w-full flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Verileriniz toplanmıyor • Tamamen anonim</span>
        </div>

      </div>
    </div>
  );
};
