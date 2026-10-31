import React, { createContext, useContext, useState, useEffect } from 'react';
import en from '../i18n/locales/en.json';
import te from '../i18n/locales/te.json';
import hi from '../i18n/locales/hi.json';

const dictionaries = { en, te, hi };

export const LANGUAGES = [
  { code: 'en', label: 'English', nativeName: 'English' },
  { code: 'te', label: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'hi', label: 'Hindi', nativeName: 'हिन्दी' },
];

const I18nContext = createContext();

export function I18nProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    try {
      const saved = localStorage.getItem('placeearly_language');
      return saved && dictionaries[saved] ? saved : 'en';
    } catch {
      return 'en';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('placeearly_language', language);
      document.documentElement.lang = language;
    } catch {}
  }, [language]);

  /**
   * Helper translation function supporting nested dot-syntax: t('nav.dashboard')
   */
  const t = (key, fallback = '') => {
    const dict = dictionaries[language] || dictionaries.en;
    const parts = key.split('.');
    let val = dict;
    for (const part of parts) {
      if (val && typeof val === 'object' && part in val) {
        val = val[part];
      } else {
        val = null;
        break;
      }
    }

    if (val !== null && val !== undefined) return val;

    // Fallback to English dictionary if key missing in translation
    let enVal = dictionaries.en;
    for (const part of parts) {
      if (enVal && typeof enVal === 'object' && part in enVal) {
        enVal = enVal[part];
      } else {
        enVal = null;
        break;
      }
    }
    return enVal || fallback || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, languages: LANGUAGES }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
}
