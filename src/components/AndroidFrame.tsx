import React from 'react';
import { JobBackgroundArt } from './JobBackgroundArt';

interface AndroidFrameProps {
  children: React.ReactNode;
  viewMode?: 'android' | 'full';
  isDarkMode?: boolean;
  onToggleViewMode?: () => void;
}

/**
 * AndroidFrame / FullScreenAppContainer:
 * Eski telefon mockup penceresi yerine tüm ekranı (full screen) uçtan uca kullanan,
 * tek birleşik açık mor temalı arka planla yönetilen ve bölümleri sadece ince çizgilerle ayıran
 * modern tam ekran düzen kabuğu.
 */
export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  children,
  isDarkMode = false
}) => {
  return (
    <div className={`min-h-screen w-full flex flex-col relative antialiased transition-colors duration-300 ${
      isDarkMode ? 'dark text-slate-100' : 'text-slate-800'
    }`}>
      {/* Tek ve Birleşik Arka Plan (Açık mor şekiller ve iş ilanı çizimleri) */}
      <JobBackgroundArt />

      {/* Tam Ekran Ana Çalışma Alanı (Pencereler yerine tam ekran akışı) */}
      <div className="w-full flex-1 flex flex-col min-h-screen relative z-10">
        {children}
      </div>
    </div>
  );
};
