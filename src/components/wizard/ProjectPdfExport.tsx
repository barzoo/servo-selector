'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { MultiAxisPrintView } from './MultiAxisPrintView';
import type { Project } from '@/types';

interface ProjectPdfExportProps {
  project: Project;
}

export function ProjectPdfExport({ project }: ProjectPdfExportProps) {
  const [showPrintView, setShowPrintView] = useState(false);
  const t = useTranslations('result');

  const completedCount = project.axes.filter((a) => a.status === 'COMPLETED').length;

  if (showPrintView) {
    return (
      <MultiAxisPrintView
        project={project}
        onClose={() => setShowPrintView(false)}
      />
    );
  }

  return (
    <button
      onClick={() => setShowPrintView(true)}
      disabled={completedCount === 0}
      className="
        w-full px-4 py-2 bg-green-600 text-white rounded-md
        hover:bg-green-700 transition-colors
        disabled:bg-gray-400 disabled:cursor-not-allowed
        text-sm font-medium flex items-center justify-center gap-2
      "
    >
      <span>📄</span>
      <span>{t('exportProjectPdf')}</span>
    </button>
  );
}
