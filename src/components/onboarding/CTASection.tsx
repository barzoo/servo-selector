'use client';

import { useTranslations } from 'next-intl';
import { ChevronRight, FolderOpen } from 'lucide-react';

interface CTASectionProps {
  onStart: () => void;
  hasRecentProject: boolean;
  onLoadRecent?: () => void;
}

export function CTASection({ onStart, hasRecentProject, onLoadRecent }: CTASectionProps) {
  const t = useTranslations('onboarding');

  return (
    <div className="text-center">
      <button
        onClick={onStart}
        className="btn btn-primary text-base px-8 py-4 inline-flex items-center gap-2"
      >
        <span>{t('cta.start')}</span>
        <ChevronRight className="w-5 h-5" />
      </button>

      {hasRecentProject && onLoadRecent && (
        <button
          onClick={onLoadRecent}
          className="mt-4 flex items-center justify-center gap-2 text-[var(--foreground-muted)] hover:text-[var(--primary-400)] transition-colors mx-auto"
        >
          <FolderOpen className="w-4 h-4" />
          <span>{t('cta.loadRecent')}</span>
        </button>
      )}
    </div>
  );
}
