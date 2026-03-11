'use client';

import { useEffect, useState } from 'react';
import { ValueProposition } from './ValueProposition';
import { ProcessPreview } from './ProcessPreview';
import { CTASection } from './CTASection';

interface OnboardingEmptyStateProps {
  onStartConfiguration: () => void;
}

export function OnboardingEmptyState({ onStartConfiguration }: OnboardingEmptyStateProps) {
  const [hasRecentProject, setHasRecentProject] = useState(false);

  useEffect(() => {
    // Check if there's a saved project in localStorage
    const stored = localStorage.getItem('servo-selector-project');
    setHasRecentProject(!!stored);
  }, []);

  const handleLoadRecent = () => {
    // The project will be loaded by the parent component's useEffect
    // We just need to trigger a page reload or state refresh
    window.location.reload();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] px-4 sm:px-8">
      {/* Background decoration */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary-500)] to-[var(--primary-300)] rounded-full blur-2xl opacity-20 animate-pulse"></div>
        <div className="relative w-20 h-20 bg-gradient-to-br from-[var(--background-tertiary)] to-[var(--background-secondary)] rounded-2xl flex items-center justify-center border border-[var(--border-default)] shadow-2xl">
          <svg className="w-10 h-10 text-[var(--primary-400)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
      </div>

      {/* Value Proposition */}
      <ValueProposition />

      {/* Process Preview */}
      <div className="w-full max-w-4xl mb-10">
        <ProcessPreview />
      </div>

      {/* CTA */}
      <CTASection
        onStart={onStartConfiguration}
        hasRecentProject={hasRecentProject}
        onLoadRecent={handleLoadRecent}
      />
    </div>
  );
}
