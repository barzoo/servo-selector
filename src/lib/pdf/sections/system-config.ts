import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { defaultTableStyles, getCurrentY, addSectionTitle } from '../styles';
import type { TranslationFunction } from '../types';
import type { SummaryItem } from '@/types';

export function addSystemConfigSection(
  doc: jsPDF,
  t: TranslationFunction,
  items: SummaryItem[]
): void {
  let y = getCurrentY(doc);
  y = addSectionTitle(doc, t('systemSummary.configList'), y);

  const tableData = items.map((item) => ({
    partNumber: item.partNumber,
    type: item.typeLabel,
    description: item.description,
  }));

  autoTable(doc, {
    ...defaultTableStyles,
    startY: y,
    head: [
      [
        t('systemSummary.columns.partNumber'),
        t('systemSummary.columns.type'),
        t('systemSummary.columns.description'),
      ],
    ],
    body: tableData,
    columnStyles: {
      partNumber: { cellWidth: 50, font: 'courier' },
      type: { cellWidth: 35 },
      description: { cellWidth: 'auto' },
    },
  });
}
