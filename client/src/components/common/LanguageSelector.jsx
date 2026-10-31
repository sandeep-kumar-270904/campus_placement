import React, { useState, useRef, useEffect } from 'react';
import { Languages, ChevronDown, Check } from 'lucide-react';
import { useTranslation, LANGUAGES } from '../../context/I18nContext';

export default function LanguageSelector({ className = '' }) {
  const { language, setLanguage } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const activeLang = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        className="px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label="Select interface language"
      >
        <Languages className="w-3.5 h-3.5 text-emerald-400" />
        <span>{activeLang.nativeName}</span>
        <ChevronDown className="w-3 h-3 text-slate-400" />
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 mt-2 w-36 rounded-lg bg-slate-900 border border-slate-700 shadow-xl z-50 py-1 divide-y divide-slate-800 animate-in fade-in zoom-in-95 duration-150"
        >
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => {
                setLanguage(l.code);
                setIsOpen(false);
              }}
              role="menuitem"
              type="button"
              className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition cursor-pointer ${
                language === l.code
                  ? 'bg-emerald-500/10 text-emerald-400 font-bold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span>{l.nativeName}</span>
              {language === l.code && <Check className="w-3.5 h-3.5 text-emerald-400" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
