import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Globe, ChevronDown, Check } from 'lucide-react';

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage, languageOption, supportedLanguages, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={t('Language')}
        title={`${t('Language')}: ${languageOption.name} (${languageOption.nativeName})`}
        className="p-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
      >
        <Globe className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
        <span className="font-semibold tracking-tight">{languageOption.shortLabel}</span>
        <span className="hidden xl:inline text-slate-500">· {languageOption.nativeName}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label={t('Language')}
          className="absolute right-0 mt-2 w-64 bg-white rounded-xl border border-slate-200 shadow-xl py-1.5 z-50"
        >
          <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {t('Select Language')}
            </span>
            <span className="text-[10px] text-emerald-700 font-medium">East Africa</span>
          </div>

          <div className="py-1 max-h-80 overflow-y-auto">
            {supportedLanguages.map(option => {
              const isSelected = option.code === language;
              return (
                <button
                  key={option.code}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    setLanguage(option.code);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50/90 text-emerald-950'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        {option.shortLabel}
                      </span>
                      <span className="font-semibold text-slate-900 truncate">
                        {option.name}
                      </span>
                      {option.nativeName !== option.name && (
                        <span className="text-[11px] text-slate-500 truncate">
                          ({option.nativeName})
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5 truncate pl-0.5">
                      {option.region}
                    </div>
                  </div>

                  {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
