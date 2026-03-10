'use client';

import { useTranslations } from 'next-intl';
import { FileSpreadsheet } from 'lucide-react';
import { exportProjectToExcel } from '@/lib/excel-export';
import type { Project } from '@/types';

interface ExcelExportButtonProps {
  project: Project;
  disabled?: boolean;
}

export function ExcelExportButton({ project, disabled }: ExcelExportButtonProps) {
  const t = useTranslations('projectData');

  const completedCount = project.axes.filter((a) => a.status === 'COMPLETED').length;
  const isDisabled = disabled || completedCount === 0;

  const handleExport = () => {
    if (isDisabled) return;
    exportProjectToExcel(project);
  };

  return (
    <button
      onClick={handleExport}
      disabled={isDisabled}
      className="
        w-full px-4 py-2 bg-green-600 text-white rounded-md
        hover:bg-green-700 transition-colors
        disabled:bg-gray-400 disabled:cursor-not-allowed
        text-sm font-medium flex items-center justify-center gap-2
      "
      title={isDisabled ? t('noCompletedAxesForExport') : t('exportExcelTooltip')}
    >
      <FileSpreadsheet className="w-4 h-4" />
      <span>{t('exportExcel')}</span>
    </button>
  );
}
