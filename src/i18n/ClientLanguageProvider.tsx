'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import zhMessages from './messages/zh.json';
import enMessages from './messages/en.json';
import type { Locale } from './config';

const messagesMap = {
  zh: zhMessages,
  en: enMessages,
};

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const LanguageContext = createContext<LanguageContextType>({
  locale: 'zh',
  setLocale: () => {},
});

export function useLanguage() {
  return useContext(LanguageContext);
}

interface Props {
  children: React.ReactNode;
}

export default function ClientLanguageProvider({ children }: Props) {
  const [locale, setLocaleState] = useState<Locale>('zh');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Priority: URL param > localStorage > default
    const urlParams = new URLSearchParams(window.location.search);
    const langParam = urlParams.get('lang') as Locale | null;

    if (langParam && ['zh', 'en'].includes(langParam)) {
      setLocaleState(langParam);
      // Sync to localStorage
      localStorage.setItem('servo-selector-language', JSON.stringify({ state: { locale: langParam } }));
    } else {
      // Read locale from localStorage (set by language-store)
      const stored = localStorage.getItem('servo-selector-language');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.state?.locale) {
            setLocaleState(parsed.state.locale);
            // Sync back to URL
            urlParams.set('lang', parsed.state.locale);
            window.history.replaceState({}, '', `${window.location.pathname}?${urlParams.toString()}`);
          }
        } catch {
          // fallback to default
        }
      }
    }
    setMounted(true);
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    // Update URL parameter without reload
    const url = new URL(window.location.href);
    url.searchParams.set('lang', newLocale);
    window.history.replaceState({}, '', url.toString());
  }, []);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <LanguageContext.Provider value={{ locale: 'zh', setLocale: () => {} }}>
        <NextIntlClientProvider messages={zhMessages} locale="zh">
          {children}
        </NextIntlClientProvider>
      </LanguageContext.Provider>
    );
  }

  return (
    <LanguageContext.Provider value={{ locale, setLocale }}>
      <NextIntlClientProvider messages={messagesMap[locale]} locale={locale}>
        {children}
      </NextIntlClientProvider>
    </LanguageContext.Provider>
  );
}
