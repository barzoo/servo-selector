'use client';

import { useLanguageStore } from '@/stores/language-store';
import { locales, localeLabels, type Locale } from '@/i18n/config';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLanguageStore();

  const handleChange = (newLocale: Locale) => {
    setLocale(newLocale);
    // Update URL parameter
    const url = new URL(window.location.href);
    url.searchParams.set('lang', newLocale);
    window.history.replaceState({}, '', url.toString());
    // Reload to apply new language
    window.location.reload();
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
