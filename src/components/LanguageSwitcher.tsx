'use client';

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
    <div className="flex items-center gap-1 bg-[var(--background-tertiary)] rounded-xl p-1 border border-[var(--border-subtle)]">
      <div className="px-2">
        <Globe className="w-4 h-4 text-[var(--foreground-muted)]" />
      </div>
      {locales.map((l) => (
        <button
          key={l}
          onClick={() => handleChange(l)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
            locale === l
              ? 'bg-[var(--primary-500)] text-white shadow-lg shadow-[var(--primary-500)]/30'
              : 'text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--background-elevated)]'
          }`}
        >
          {localeLabels[l]}
        </button>
      ))}
    </div>
  );
}
