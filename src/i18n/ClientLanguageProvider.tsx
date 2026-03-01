'use client';

import { useEffect, useState } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import zhMessages from './messages/zh.json';
import enMessages from './messages/en.json';
import type { Locale } from './config';

const messagesMap = {
  zh: zhMessages,
  en: enMessages,
};

interface Props {
  children: React.ReactNode;
}

export default function ClientLanguageProvider({ children }: Props) {
  const [locale, setLocale] = useState<Locale>('zh');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Read locale from localStorage (set by language-store)
    const stored = localStorage.getItem('servo-selector-language');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.state?.locale) {
          setLocale(parsed.state.locale);
        }
      } catch {
        // fallback to default
      }
    }
    setMounted(true);
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
    <NextIntlClientProvider messages={messagesMap[locale]} locale={locale}>
      {children}
    </NextIntlClientProvider>
  );
}
