'use client';

import React from 'react';
import { useLanguage } from '@/i18n/ClientLanguageProvider';
import { locales, localeLabels, type Locale } from '@/i18n/config';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();

  const handleChange = (newLocale: Locale) => {
    if (newLocale !== locale) {
      setLocale(newLocale);
    }
  };

  return (
    <div className="flex items-center gap-1 bg-[#e8eef5] rounded-xl p-1 border border-[#e2e8f0]">
      <div className="px-2">
        <Globe className="w-4 h-4 text-[#718096]" />
      </div>
      {locales.map((l) => (
        <button
          key={l}
          onClick={() => handleChange(l)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
            locale === l
              ? 'bg-[#00A4E4] text-white shadow-lg shadow-[#00A4E4]/30'
              : 'text-[#4a5568] hover:text-[#1a1a1a] hover:bg-white'
          }`}
        >
          {localeLabels[l]}
        </button>
      ))}
    </div>
  );
}
