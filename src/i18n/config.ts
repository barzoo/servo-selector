export type Locale = 'zh' | 'en';

export const defaultLocale: Locale = 'zh';
export const locales: Locale[] = ['zh', 'en'];

export const localeLabels: Record<Locale, string> = {
  zh: '中文',
  en: 'EN',
};
