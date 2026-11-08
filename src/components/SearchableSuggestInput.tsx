import React, { useState, useRef, useEffect, useMemo, useDeferredValue } from 'react';
import { SuggestionItem } from '../data/professionsAndDepartments';
import { normalizeTurkish } from '../services/matcher';
import { X, ChevronDown, Check } from 'lucide-react';

const SUGGESTION_NORMALIZED_CACHE = new WeakMap<SuggestionItem, string>();

const getNormalizedSuggestionName = (item: SuggestionItem): string => {
  const cached = SUGGESTION_NORMALIZED_CACHE.get(item);
  if (cached !== undefined) return cached;
  const normalized = normalizeTurkish(item.name);
  SUGGESTION_NORMALIZED_CACHE.set(item, normalized);
  return normalized;
};

interface SearchableSuggestInputProps {
  label: string;
  subLabel?: string;
  icon: React.ReactNode;
  value: string;
  onChange: (val: string) => void;
  onEnterSubmit?: () => void;
  placeholder: string;
  items: SuggestionItem[];
  required?: boolean;
  datalistId?: string;
  popularPills?: string[];
  autoFocus?: boolean;
}

export const SearchableSuggestInput: React.FC<SearchableSuggestInputProps> = ({
  label,
  subLabel,
  icon,
  value,
  onChange,
  onEnterSubmit,
  placeholder,
  items,
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const deferredValue = useDeferredValue(value);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, []);

  // Filter items based on normalized query
  const filteredSuggestions = useMemo(() => {
    const query = normalizeTurkish(deferredValue.trim());
    const queryTokens = query.split(/\s+/).filter(Boolean);

    if (!query) {
      return items.slice(0, 30);
    }

    // Rank: exact match, starts-with, then token match in name
    const exactMatch: SuggestionItem[] = [];
    const startsWith: SuggestionItem[] = [];
    const includesAllTokens: SuggestionItem[] = [];
    const includesAnyToken: SuggestionItem[] = [];

    for (const item of items) {
      const itemNorm = getNormalizedSuggestionName(item);

      if (itemNorm === query) {
        exactMatch.push(item);
      } else if (itemNorm.startsWith(query)) {
        startsWith.push(item);
      } else if (queryTokens.every(tok => itemNorm.includes(tok))) {
        includesAllTokens.push(item);
      } else if (queryTokens.some(tok => itemNorm.includes(tok))) {
        includesAnyToken.push(item);
      }
    }

    return [...exactMatch, ...startsWith, ...includesAllTokens, ...includesAnyToken].slice(0, 30);
  }, [items, deferredValue]);

  const handleSelect = (name: string) => {
    onChange(name);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown') {
        setIsOpen(true);
      } else if (e.key === 'Enter') {
        const finalVal = value.trim();
        if (finalVal !== value) {
          onChange(finalVal);
        }
        inputRef.current?.blur();
        if (onEnterSubmit) {
          e.preventDefault();
          onEnterSubmit();
        }
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => 
        prev < filteredSuggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => 
        prev > 0 ? prev - 1 : filteredSuggestions.length - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      // KULLANICI KURALI: Enter'a basıldığında ASLA otomatik olarak ilk öneri (filteredSuggestions[0]) ile kullanıcının yazdığı ezilmez!
      // Eğer kullanıcı ok tuşlarıyla bilerek bir satırı seçmediyse (highlightedIndex < 0), SADECE klavyeden yazdığı metin korunur.
      if (highlightedIndex >= 0 && highlightedIndex < filteredSuggestions.length) {
        handleSelect(filteredSuggestions[highlightedIndex].name);
        inputRef.current?.blur();
        if (onEnterSubmit) {
          onEnterSubmit();
        }
      } else {
        const finalVal = value.trim();
        onChange(finalVal);
        setIsOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        if (onEnterSubmit) {
          onEnterSubmit();
        }
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  // Helper to highlight matching text
  const renderHighlightedText = (text: string, query: string) => {
    if (!query.trim()) return <span>{text}</span>;
    const normText = normalizeTurkish(text);
    const normQuery = normalizeTurkish(query);
    const index = normText.indexOf(normQuery);

    if (index === -1) {
      const firstToken = normQuery.split(/\s+/)[0];
      const tokenIndex = firstToken ? normText.indexOf(firstToken) : -1;
      if (tokenIndex !== -1 && firstToken) {
        const before = text.substring(0, tokenIndex);
        const match = text.substring(tokenIndex, tokenIndex + firstToken.length);
        const after = text.substring(tokenIndex + firstToken.length);
        return (
          <span>
            {before}
            <strong className="text-purple-600 dark:text-purple-300 font-black bg-purple-100 dark:bg-purple-950 px-0.5 rounded">
              {match}
            </strong>
            {after}
          </span>
        );
      }
      return <span>{text}</span>;
    }

    const before = text.substring(0, index);
    const match = text.substring(index, index + query.length);
    const after = text.substring(index + query.length);

    return (
      <span>
        {before}
        <strong className="text-purple-600 dark:text-purple-300 font-black bg-purple-100 dark:bg-purple-950 px-0.5 rounded">
          {match}
        </strong>
        {after}
      </span>
    );
  };

  return (
    <div className={`relative ${isOpen ? 'z-50' : 'z-10'}`} ref={containerRef}>
      {/* Label */}
      <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          {icon}
          <span>{label}</span>
          {required && <span className="text-rose-500 font-black">*</span>}
        </span>
        {subLabel && (
          <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400">
            {subLabel}
          </span>
        )}
      </label>

      {/* Input container */}
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          required={required}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            if (!isOpen) setIsOpen(true);
            setHighlightedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full pl-3.5 pr-16 py-2.5 text-sm bg-white/90 dark:bg-slate-900/90 border border-purple-200/80 dark:border-purple-900/60 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500 transition font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
        />

        {/* Clear & Dropdown icons */}
        <div className="absolute right-2 flex items-center gap-1">
          {value && (
            <button
              type="button"
              tabIndex={-1}
              onMouseDown={(e) => e.preventDefault()}
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
                setIsOpen(true);
                inputRef.current?.focus();
              }}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md transition hover:bg-purple-50 dark:hover:bg-purple-950/40 cursor-pointer"
              title="Temizle"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            tabIndex={-1}
            onMouseDown={(e) => e.preventDefault()}
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(prev => !prev);
            }}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md transition cursor-pointer"
            title={isOpen ? "Listeyi Kapat" : "Listeyi Aç"}
            aria-label={isOpen ? "Listeyi Kapat" : "Listeyi Aç"}
          >
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Sadece Mesleklerin/Bölümlerin Listelendiği Sade Öneri Penceresi */}
      {isOpen && (
        <div 
          ref={listRef}
          className="absolute z-50 left-0 right-0 mt-1.5 bg-white dark:bg-slate-900 rounded-2xl shadow-lg ring-1 ring-purple-500/20 border border-purple-200 dark:border-purple-800/80 max-h-56 sm:max-h-64 overflow-y-auto flex flex-col text-xs divide-y divide-purple-100/70 dark:divide-purple-950/60"
        >
          {filteredSuggestions.length > 0 ? (
            filteredSuggestions.map((item, idx) => {
              const isSelected = item.name.toLowerCase() === value.toLowerCase();
              const isHighlighted = idx === highlightedIndex;

              return (
                <div
                  key={`${item.name}-${idx}`}
                  onClick={() => handleSelect(item.name)}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  className={`px-3.5 py-2.5 cursor-pointer transition flex items-center justify-between gap-2 select-none ${
                    isHighlighted
                      ? 'bg-purple-100/80 dark:bg-purple-950/80 text-purple-950 dark:text-purple-100'
                      : isSelected
                      ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-900 dark:text-purple-200 font-bold'
                      : 'hover:bg-purple-50/50 dark:hover:bg-purple-950/30 text-slate-800 dark:text-slate-100'
                  }`}
                >
                  <span className="font-semibold text-xs truncate text-slate-900 dark:text-slate-50 flex-1">
                    {renderHighlightedText(item.name, value)}
                  </span>

                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 stroke-[3] shrink-0" />
                  )}
                </div>
              );
            })
          ) : (
            <div className="p-3 text-center">
              <p className="font-bold text-slate-700 dark:text-slate-300">Eşleşen meslek bulunamadı</p>
              <button
                type="button"
                onClick={() => handleSelect(value.trim())}
                className="mt-1.5 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition cursor-pointer"
              >
                "{value}" Olarak Seç
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
