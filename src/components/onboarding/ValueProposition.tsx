'use client';

import { useTranslations } from 'next-intl';
import { Route, Calculator, FileText } from 'lucide-react';

const features = [
  { key: 'wizard', icon: Route },
  { key: 'smart', icon: Calculator },
  { key: 'report', icon: FileText },
] as const;

export function ValueProposition() {
  const t = useTranslations('onboarding');

  return (
    <div className="text-center mb-12">
      {/* Hero Title */}
      <h2 className="text-3xl sm:text-4xl font-bold mb-4">
        <span className="gradient-text">{t('hero.title')}</span>
      </h2>
      <p className="text-[var(--foreground-secondary)] mb-10 max-w-2xl mx-auto text-lg">
        {t('hero.subtitle')}
      </p>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
        {features.map(({ key, icon: Icon }) => (
          <div
            key={key}
            className="card p-5 card-hover transition-all duration-300 hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-xl bg-[var(--primary-500)]/10 flex items-center justify-center mx-auto mb-3">
              <Icon className="w-6 h-6 text-[var(--primary-400)]" />
            </div>
            <h3 className="font-semibold mb-1">{t(`features.${key}.title`)}</h3>
            <p className="text-sm text-[var(--foreground-muted)]">
              {t(`features.${key}.description`)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
