import { getRequestConfig } from 'next-intl/server';
import { defaultLocale } from './src/i18n/config';

export default getRequestConfig(async ({ locale }) => {
  const resolvedLocale = locale || defaultLocale;

  return {
    locale: resolvedLocale,
    messages: (await import(`./src/i18n/messages/${resolvedLocale}.json`)).default,
  };
});
