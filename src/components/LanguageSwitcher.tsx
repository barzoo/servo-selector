'use client';

import { useLanguageStore } from '@/stores/language-store';
import { locales, localeLabels, type Locale } from '@/i18n/config';

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
    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
      {locales.map((l) => (
        <button
          key={l}
          onClick={() => handleChange(l)}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            locale === l
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {localeLabels[l]}
        </button>
      ))}
    </div>
  );
}
