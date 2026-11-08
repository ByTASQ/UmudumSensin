import React, { useState } from 'react';
import { Shield, Trash2, CheckCircle2 } from 'lucide-react';
import { clearSavedCriteria } from '../services/storage';

interface PrivacyViewProps {
  onCriteriaCleared: () => void;
}

export const PrivacyView: React.FC<PrivacyViewProps> = ({ onCriteriaCleared }) => {
  const [clearedNotice, setClearedNotice] = useState(false);

  const handleClear = () => {
    clearSavedCriteria();
    onCriteriaCleared();
    setClearedNotice(true);
    setTimeout(() => setClearedNotice(false), 3000);
  };

  return (
    <div className="w-full flex-1 overflow-y-auto text-xs">
      
      {/* 1. Başlık ve Yerel Veri Temizleme Çubuğu - Yatayda Tam Ekran, Sadece İnce Çizgiyle Ayrılmış */}
      <section className="w-full px-4 sm:px-8 xl:px-12 py-4 border-b border-purple-200/50 dark:border-purple-900/40 bg-white/40 dark:bg-slate-950/40 backdrop-blur-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0 border border-purple-200 dark:border-purple-800">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
              Gizlilik ve Veri Güvenliği
            </h2>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Arama kriterleri ve tercihleriniz sadece cihazınızda yerel olarak saklanır
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleClear}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-bold transition border border-rose-200 dark:border-rose-900 cursor-pointer active:scale-95 shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Verileri Sıfırla</span>
        </button>
      </section>

      {clearedNotice && (
        <div className="w-full px-4 sm:px-8 xl:px-12 py-2.5 bg-emerald-50 dark:bg-emerald-950/60 border-b border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-semibold flex items-center gap-2 animate-in fade-in-50">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Tarayıcınızda kayıtlı tüm arama ve profil tercihleri başarıyla temizlendi.</span>
        </div>
      )}

      {/* 2. Politika Maddeleri - Yatayda Tam Ekran, Sadece İnce Çizgilerle Ayrılmış */}
      <section className="w-full px-4 sm:px-8 xl:px-12 py-6 border-b border-purple-200/50 dark:border-purple-900/40 bg-white/20 dark:bg-slate-950/20 backdrop-blur-[2px] space-y-6 leading-relaxed text-slate-700 dark:text-slate-300">
        
        <div className="pb-4 border-b border-purple-100 dark:border-purple-950/60">
          <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-1">
            1. Genel İlkeler ve Yerel Mimari
          </h3>
          <p>
            İlan Bulucu, kullanıcı gizliliğini temel tasarım prensibi olarak benimsemiştir. Uygulamada aradığınız meslek, mezuniyet durumu, yaş, KPSS puanı ve şehir gibi hiçbir bilgi sunucuya gönderilmez veya üçüncü şahıslarla paylaşılmaz.
          </p>
        </div>

        <div className="pb-4 border-b border-purple-100 dark:border-purple-950/60">
          <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-1">
            2. Doğrudan Resmi Bağlantılar (No Intermediary)
          </h3>
          <p>
            Uygulamada yer alan kamu ve özel sektör iş ilanları doğrudan resmi kaynakların (Resmi Gazete, Memurlar.net, İŞKUR, Kariyer Kapısı, Kariyer.net vb.) açık indekslerinden alınır. İlan bağlantılarına tıklandığında doğrudan orijinal başvuru sayfası açılır.
          </p>
        </div>

        <div className="pb-4 border-b border-purple-100 dark:border-purple-950/60">
          <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-1">
            3. Çerezler ve İstatistikler
          </h3>
          <p>
            Uygulamada kullanıcıyı takip eden üçüncü taraf çerezler, reklam ağları veya analitik takipçiler bulunmamaktadır.
          </p>
        </div>

        <div>
          <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-1">
            4. İletişim ve Destek
          </h3>
          <p>
            Soru, öneri veya geri bildirimleriniz için doğrudan sistem yöneticisiyle iletişime geçebilirsiniz.
          </p>
        </div>

      </section>

    </div>
  );
};
