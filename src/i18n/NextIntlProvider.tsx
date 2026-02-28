'use client';

import { NextIntlClientProvider } from 'next-intl';
import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  messages: Record<string, unknown>;
  locale: string;
}

export default function NextIntlProvider({ children, messages, locale }: Props) {
  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      {children}
    </NextIntlClientProvider>
  );
}
