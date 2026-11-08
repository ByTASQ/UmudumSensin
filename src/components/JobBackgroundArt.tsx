import React from 'react';

/**
 * JobBackgroundArt:
 * Uygulamanın tek ve birleşik arka planını yöneten, açık mor (light purple/lilac)
 * geometrik şekiller ve iş arama/istihdam temasını yansıtan zarif çizimler (vektörler).
 * 
 * Çizimler:
 * 1. İş Çantası (Briefcase)
 * 2. Özgeçmiş / CV Belgesi (Resume / CV with checkmarks)
 * 3. Büyüteç (Search Magnifier on job posting)
 * 4. Kurumsal & Kamu Binası (Modern corporate / ministry building)
 * 5. Mezuniyet Kepi (Graduation Cap & Diploma)
 * 6. El Sıkışma (Recruitment / Handshake agreement)
 * 7. Kariyer Yıldız & Rozeti (Career verified seal)
 * 8. İlan Panosu & Not İğnesi (Notice board & vacancy pin)
 * 9. Açık mor geometrik ve akıcı şekiller (Soft ambient purple orbs, rings, waves)
 */
export const JobBackgroundArt: React.FC = () => {
  return (
    <div 
      className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* 1. Temel Arka Plan Renk Geçişi (Açık ve Koyu Mod) */}
      <div className="absolute inset-0 bg-[#faf8fd] dark:bg-[#0b0d17] transition-colors duration-300" />

      {/* 2. Açık Mor Yumuşak Geometrik Şekiller & Gradient Işıltılar (Ambient Blobs) */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-purple-200/30 dark:bg-purple-900/20 blur-3xl" />
      <div className="absolute top-1/4 -right-24 w-[28rem] h-[28rem] rounded-full bg-violet-200/25 dark:bg-violet-950/20 blur-3xl" />
      <div className="absolute bottom-10 left-1/3 w-[32rem] h-[32rem] rounded-full bg-fuchsia-100/30 dark:bg-fuchsia-950/15 blur-3xl" />
      <div className="absolute -bottom-20 right-10 w-80 h-80 rounded-full bg-purple-300/20 dark:bg-purple-900/20 blur-3xl" />

      {/* 3. İnce Çizgili İş İlanı Çizimleri ve Açık Mor Şekiller (SVG) */}
      <svg 
        className="absolute inset-0 w-full h-full opacity-40 dark:opacity-25" 
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
      >
        <defs>
          {/* Açık Mor Gradyanlar */}
          <linearGradient id="purpleGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c084fc" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.15" />
          </linearGradient>

          <linearGradient id="purpleGrad2" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#e9d5ff" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#c084fc" stopOpacity="0.2" />
          </linearGradient>

          <pattern id="dotGrid" x="0" y="0" width="36" height="36" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="#c084fc" fillOpacity="0.15" />
          </pattern>
        </defs>

        {/* Hafif Açık Mor Noktalı Izgara (Subtle Grid) */}
        <rect width="100%" height="100%" fill="url(#dotGrid)" />

        {/* ========================================================================= */}
        {/* ÇİZİM 1: SOL ÜST - ÖZGEÇMİŞ / İLAN FORMU & ONAY ÇEKİ (CV / Job Application) */}
        {/* ========================================================================= */}
        <g transform="translate(60, 90) scale(0.95)" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Arka Açık Mor Yumuşak Şekil */}
          <rect x="-10" y="-10" width="130" height="160" rx="18" fill="url(#purpleGrad1)" stroke="none" />
          {/* CV Sayfası */}
          <rect x="0" y="0" width="110" height="140" rx="10" stroke="#a855f7" strokeOpacity="0.5" />
          {/* Katlanan köşe efekti */}
          <path d="M85 0 L110 25 L85 25 Z" fill="#e9d5ff" fillOpacity="0.3" stroke="#a855f7" strokeOpacity="0.5" />
          {/* Aday Profil / Fotoğraf Kutusu */}
          <rect x="14" y="14" width="24" height="24" rx="5" stroke="#a855f7" strokeOpacity="0.6" />
          <circle cx="26" cy="23" r="5" stroke="#a855f7" strokeOpacity="0.7" />
          <path d="M18 35 C18 31 22 29 26 29 C30 29 34 31 34 35" stroke="#a855f7" strokeOpacity="0.7" />
          {/* Başlık Çizgileri */}
          <line x1="46" y1="18" x2="80" y2="18" stroke="#a855f7" strokeOpacity="0.7" strokeWidth="2.5" />
          <line x1="46" y1="26" x2="72" y2="26" stroke="#c084fc" strokeOpacity="0.5" />
          {/* Ayrım Çizgisi */}
          <line x1="14" y1="46" x2="96" y2="46" stroke="#c084fc" strokeOpacity="0.3" strokeDasharray="3 3" />
          {/* Kriter / Beceriler Checklist (✓) */}
          <g strokeOpacity="0.8">
            <polyline points="16,60 19,63 26,57" stroke="#9333ea" strokeWidth="1.8" />
            <line x1="32" y1="60" x2="90" y2="60" stroke="#a855f7" strokeOpacity="0.5" />

            <polyline points="16,78 19,81 26,75" stroke="#9333ea" strokeWidth="1.8" />
            <line x1="32" y1="78" x2="82" y2="78" stroke="#a855f7" strokeOpacity="0.5" />

            <polyline points="16,96 19,99 26,93" stroke="#9333ea" strokeWidth="1.8" />
            <line x1="32" y1="96" x2="88" y2="96" stroke="#a855f7" strokeOpacity="0.5" />
          </g>
          {/* Onay Mührü (Approved Stamp) */}
          <circle cx="75" cy="115" r="14" stroke="#9333ea" strokeWidth="1.5" strokeOpacity="0.6" strokeDasharray="2 2" />
          <path d="M69 115 L73 119 L82 110" stroke="#9333ea" strokeWidth="2" strokeOpacity="0.8" />
        </g>

        {/* ========================================================================= */}
        {/* ÇİZİM 2: SAĞ ÜST - İŞ ÇANTASI & BÜYÜTEÇ (Briefcase & Search Magnifier)   */}
        {/* ========================================================================= */}
        <g transform="translate(calc(100% - 240px), 80)" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Açık Mor Arka Oval */}
          <ellipse cx="70" cy="65" rx="75" ry="55" fill="url(#purpleGrad2)" stroke="none" />
          
          {/* İş Çantası (Briefcase) */}
          <rect x="15" y="32" width="110" height="75" rx="12" stroke="#a855f7" strokeOpacity="0.6" />
          {/* Çanta Sapı */}
          <path d="M50 32 V20 C50 16 54 13 58 13 H82 C86 13 90 16 90 20 V32" stroke="#a855f7" strokeOpacity="0.7" />
          {/* Orta Kilit & Şerit */}
          <line x1="15" y1="62" x2="125" y2="62" stroke="#c084fc" strokeOpacity="0.4" />
          <rect x="62" y="56" width="16" height="14" rx="3" fill="#faf5ff" stroke="#9333ea" strokeWidth="1.5" />
          <circle cx="70" cy="63" r="2" fill="#9333ea" />
          {/* Köşe Takviyeleri */}
          <path d="M15 44 C22 44 26 40 26 32" stroke="#c084fc" strokeOpacity="0.5" />
          <path d="M125 44 C118 44 114 40 114 32" stroke="#c084fc" strokeOpacity="0.5" />

          {/* Büyüteç (Magnifying Glass) - Çapraz */}
          <g transform="translate(75, 40) rotate(-15)">
            <circle cx="28" cy="28" r="22" stroke="#9333ea" strokeWidth="2.2" strokeOpacity="0.8" fill="#f5f3ff" fillOpacity="0.3" />
            <line x1="44" y1="44" x2="68" y2="68" stroke="#9333ea" strokeWidth="4" strokeLinecap="round" />
            {/* Mercek İçi İpucu / İkon */}
            <line x1="18" y1="24" x2="36" y2="24" stroke="#a855f7" strokeOpacity="0.7" strokeWidth="2" />
            <line x1="22" y1="32" x2="34" y2="32" stroke="#c084fc" strokeOpacity="0.6" strokeWidth="1.5" />
          </g>
        </g>

        {/* ========================================================================= */}
        {/* ÇİZİM 3: SOL ORTA / ALT - KAMU & ŞİRKET BİNASI (Building / Organization) */}
        {/* ========================================================================= */}
        <g transform="translate(50, 480)" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Arka Açık Mor Çember */}
          <circle cx="70" cy="80" r="70" fill="url(#purpleGrad1)" stroke="none" />

          {/* Ana Bina Gövdesi */}
          <rect x="30" y="25" width="80" height="120" rx="4" stroke="#a855f7" strokeOpacity="0.6" />
          {/* Bina Çatısı / Alınlık */}
          <path d="M22 25 L70 5 L118 25 Z" stroke="#a855f7" strokeOpacity="0.7" fill="#fdf4ff" fillOpacity="0.2" />
          {/* Bayrak Direği */}
          <line x1="70" y1="5" x2="70" y2="-10" stroke="#a855f7" strokeOpacity="0.7" />
          <path d="M70 -10 L84 -5 L70 0 Z" fill="#c084fc" stroke="#a855f7" strokeOpacity="0.7" />
          {/* Pencereler Grid */}
          {[0, 1, 2, 3].map((row) => (
            <g key={row} transform={`translate(0, ${row * 20})`}>
              <rect x="42" y="38" width="14" height="12" rx="2" stroke="#c084fc" strokeOpacity="0.5" />
              <rect x="63" y="38" width="14" height="12" rx="2" stroke="#c084fc" strokeOpacity="0.5" />
              <rect x="84" y="38" width="14" height="12" rx="2" stroke="#c084fc" strokeOpacity="0.5" />
            </g>
          ))}
          {/* Giriş Kapısı & Merdivenler */}
          <path d="M60 145 V125 H80 V145" stroke="#9333ea" strokeOpacity="0.7" strokeWidth="1.8" />
          <line x1="20" y1="145" x2="120" y2="145" stroke="#a855f7" strokeOpacity="0.6" strokeWidth="2" />
          <line x1="14" y1="150" x2="126" y2="150" stroke="#c084fc" strokeOpacity="0.4" />
        </g>

        {/* ========================================================================= */}
        {/* ÇİZİM 4: SAĞ ORTA - MEZUNİYET KEPİ & DİPLOMA (Education & Qualifications) */}
        {/* ========================================================================= */}
        <g transform="translate(calc(100% - 210px), 430)" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Açık Mor Arka Şekil */}
          <rect x="-10" y="0" width="150" height="110" rx="24" fill="url(#purpleGrad2)" stroke="none" />

          {/* Mezuniyet Kepi Elması */}
          <polygon points="65,15 125,40 65,65 5,40" stroke="#9333ea" strokeWidth="2" strokeOpacity="0.7" fill="#faf5ff" fillOpacity="0.3" />
          {/* Kep Altı */}
          <path d="M30 48 V72 C30 84 100 84 100 72 V48" stroke="#a855f7" strokeOpacity="0.6" />
          {/* Püskül */}
          <path d="M65 40 Q40 50 35 75" stroke="#a855f7" strokeOpacity="0.7" strokeWidth="1.6" />
          <circle cx="35" cy="78" r="3" fill="#9333ea" />

          {/* Diploma Rulosu */}
          <g transform="translate(20, 85) rotate(-8)">
            <rect x="0" y="0" width="70" height="18" rx="5" stroke="#a855f7" strokeOpacity="0.6" fill="#fdf4ff" fillOpacity="0.4" />
            <line x1="28" y1="0" x2="28" y2="18" stroke="#9333ea" strokeWidth="2.5" />
            <path d="M28 18 Q32 26 36 24" stroke="#9333ea" strokeWidth="1.5" />
          </g>
        </g>

        {/* ========================================================================= */}
        {/* ÇİZİM 5: MERKEZ SAĞ ALT - EL SIKIŞMA (Handshake / Career Agreement)      */}
        {/* ========================================================================= */}
        <g transform="translate(calc(100% - 270px), calc(100% - 240px))" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Açık Mor Arka Daire */}
          <circle cx="80" cy="70" r="65" fill="url(#purpleGrad1)" stroke="none" />

          {/* Sol Kol & Ceket Kolu */}
          <path d="M10 50 L35 60 L45 50 L30 35 Z" stroke="#a855f7" strokeOpacity="0.6" />
          {/* Sağ Kol & Ceket Kolu */}
          <path d="M140 50 L115 60 L105 50 L120 35 Z" stroke="#a855f7" strokeOpacity="0.6" />
          {/* El Sıkışma Parmakları */}
          <path d="M35 60 L55 75 C60 78 70 78 75 73 L85 62" stroke="#9333ea" strokeWidth="2" strokeOpacity="0.7" />
          <path d="M115 60 L95 75 C90 78 80 78 75 73 L65 62" stroke="#9333ea" strokeWidth="2" strokeOpacity="0.7" />
          {/* Başparmak Kesişimi */}
          <path d="M50 48 Q75 56 100 48" stroke="#a855f7" strokeOpacity="0.6" strokeWidth="1.8" />
          
          {/* Üstte Başarı Işıltısı */}
          <path d="M75 25 L75 12 M65 20 L58 14 M85 20 L92 14" stroke="#c084fc" strokeWidth="1.8" strokeOpacity="0.8" />
        </g>

        {/* ========================================================================= */}
        {/* ÇİZİM 6: SOL ALT - ROZET & KARİYER YILDIZI (Merit Badge / Qualification) */}
        {/* ========================================================================= */}
        <g transform="translate(100, calc(100% - 220px))" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Rozet Şeridi (Ribbon tails) */}
          <path d="M35 65 L22 110 L45 98 L68 110 L55 65" stroke="#a855f7" strokeOpacity="0.5" fill="#fdf4ff" fillOpacity="0.2" />
          {/* Rozet Dairesi */}
          <circle cx="45" cy="45" r="32" stroke="#9333ea" strokeWidth="2" strokeOpacity="0.7" fill="url(#purpleGrad2)" />
          <circle cx="45" cy="45" r="26" stroke="#c084fc" strokeOpacity="0.5" strokeDasharray="3 3" />
          {/* İç Yıldız */}
          <polygon points="45,26 49,38 61,38 51,46 55,58 45,50 35,58 39,46 29,38 41,38" fill="#a855f7" fillOpacity="0.4" stroke="#9333ea" strokeWidth="1.2" />
        </g>

        {/* ========================================================================= */}
        {/* DİĞER: SERBEST YÜZEN AÇIK MOR GEOMETRİK ÇİZGİLER & HALKALAR              */}
        {/* ========================================================================= */}
        {/* Merkezde zarif açık mor akıcı dalga çizgisi */}
        <path 
          d="M -50 350 Q 200 300 450 420 T 950 380 T 1450 460 T 1950 390" 
          stroke="#c084fc" 
          strokeWidth="1.5" 
          strokeOpacity="0.3" 
          strokeDasharray="6 6"
        />
        <path 
          d="M -50 375 Q 220 330 470 445 T 970 405 T 1470 485 T 1970 415" 
          stroke="#d8b4fe" 
          strokeWidth="1" 
          strokeOpacity="0.2" 
        />

        {/* Geometrik mor halkalar */}
        <circle cx="35%" cy="20%" r="35" stroke="#c084fc" strokeWidth="1" strokeOpacity="0.25" strokeDasharray="4 4" />
        <circle cx="68%" cy="75%" r="48" stroke="#a855f7" strokeWidth="1" strokeOpacity="0.2" strokeDasharray="6 6" />
        <rect x="52%" y="15%" width="22" height="22" rx="5" transform="rotate(45 52 15)" stroke="#c084fc" strokeWidth="1.2" strokeOpacity="0.25" />
        <rect x="22%" y="78%" width="18" height="18" rx="4" transform="rotate(25 22 78)" stroke="#a855f7" strokeWidth="1.2" strokeOpacity="0.25" />
      </svg>
    </div>
  );
};
