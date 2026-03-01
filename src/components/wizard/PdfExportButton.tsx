'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { ReportData } from '@/lib/pdf/types';
import { PrintReportView } from './PrintReportView';

interface PdfExportButtonProps {
  data: ReportData | null;
  disabled?: boolean;
}

export function PdfExportButton({ data, disabled }: PdfExportButtonProps) {
  const t = useTranslations();
  const [showPrintView, setShowPrintView] = useState(false);

  const handleExport = () => {
    if (!data) return;
    setShowPrintView(true);
  };

  const handleClose = () => {
    setShowPrintView(false);
  };

  return (
    <>
      <button
        onClick={handleExport}
        disabled={disabled || !data}
        className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
      >
        <span>📄</span>
        {t('result.exportPdf')}
      </button>

      {showPrintView && data && (
        <PrintReportView data={data} onClose={handleClose} />
      )}
    </>
  );
}
