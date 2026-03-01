import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { defaultTableStyles, getCurrentY, addSectionTitle } from '../styles';
import type { TranslationFunction, ReportCalculationSummary } from '../types';

export function addCalculationSummarySection(
  doc: jsPDF,
  t: TranslationFunction,
  calculations: ReportCalculationSummary
): void {
  let y = getCurrentY(doc);
  y = addSectionTitle(doc, t('pdf.sections.calculationSummary'), y);

  const tableData = [
    [
      t('result.loadInertia'),
      calculations.loadInertia,
      t('result.rmsTorque'),
      calculations.rmsTorque,
      t('result.peakTorque'),
      calculations.peakTorque,
    ],
    [
      t('result.maxSpeed'),
      calculations.maxSpeed,
      t('result.regenPower'),
      calculations.regenPower,
      t('result.calcTime'),
      calculations.calcTime,
    ],
  ];

  autoTable(doc, {
    ...defaultTableStyles,
    startY: y,
    body: tableData,
    columnStyles: {
      0: { cellWidth: 30, fontStyle: 'bold' },
      1: { cellWidth: 35 },
      2: { cellWidth: 30, fontStyle: 'bold' },
      3: { cellWidth: 35 },
      4: { cellWidth: 30, fontStyle: 'bold' },
      5: { cellWidth: 35 },
    },
    styles: {
      fontSize: 9,
    },
  });
}
