import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { defaultTableStyles, getCurrentY, addSectionTitle } from '../styles';
import type { TranslationFunction, ReportAccessories } from '../types';

export function addAccessoriesSection(
  doc: jsPDF,
  t: TranslationFunction,
  accessories: ReportAccessories
): void {
  // 如果没有配件，跳过此章节
  if (!accessories.emcFilter && !accessories.brakeResistor) {
    return;
  }

  let y = getCurrentY(doc);
  y = addSectionTitle(doc, t('systemSummary.accessories'), y);

  const tableData: string[][] = [];

  if (accessories.emcFilter) {
    tableData.push([
      t('systemSummary.labels.emcFilter'),
      accessories.emcFilter,
      'EMC Filter',
    ]);
  }

  if (accessories.brakeResistor) {
    tableData.push([
      t('systemSummary.labels.brakeResistor'),
      accessories.brakeResistor.partNumber,
      accessories.brakeResistor.model,
    ]);
  }

  autoTable(doc, {
    ...defaultTableStyles,
    startY: y,
    head: [
      [
        t('systemSummary.columns.type'),
        t('systemSummary.columns.partNumber'),
        t('systemSummary.columns.description'),
      ],
    ],
    body: tableData,
    columnStyles: {
      0: { cellWidth: 35, fontStyle: 'bold' },
      1: { cellWidth: 55, font: 'courier' },
      2: { cellWidth: 'auto' },
    },
  });
}
