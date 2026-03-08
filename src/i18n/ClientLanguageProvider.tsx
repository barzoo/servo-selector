'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
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

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}

interface Props {
  children: React.ReactNode;
}

export default function ClientLanguageProvider({ children }: Props) {
  const [locale, setLocaleState] = useState<Locale>('zh');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Read locale from localStorage (set by language-store)
    const stored = localStorage.getItem('servo-selector-language');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.state?.locale) {
          setLocaleState(parsed.state.locale);
        }
      } catch {
        // fallback to default
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
      <NextIntlClientProvider messages={zhMessages} locale="zh">
        {children}
      </NextIntlClientProvider>
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
