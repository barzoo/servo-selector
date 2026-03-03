'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useProjectStore } from '@/stores/project-store';
import { MultiAxisPrintView } from './MultiAxisPrintView';

interface PdfExportButtonProps {
  disabled?: boolean;
}

export function PdfExportButton({ disabled }: PdfExportButtonProps) {
  const t = useTranslations();
  const [showPrintView, setShowPrintView] = useState(false);
  const { project } = useProjectStore();

  const handleExport = () => {
    setShowPrintView(true);
  };

  const handleClose = () => {
    setShowPrintView(false);
  };

  const completedCount = project.axes.filter((a) => a.status === 'COMPLETED').length;

  return (
    <>
      <button
        onClick={handleExport}
        disabled={disabled || completedCount === 0}
        className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
      >
        <span>📄</span>
        {t('result.exportPdf')}
      </button>

      {showPrintView && (
        <MultiAxisPrintView project={project} onClose={handleClose} />
      )}
    </>
  );
}
