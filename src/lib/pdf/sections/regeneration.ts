import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { defaultTableStyles, getCurrentY, addSectionTitle, colors } from '../styles';
import type { TranslationFunction, MechanicalResult } from '../types';

export function addRegenerationSection(
  doc: jsPDF,
  t: TranslationFunction,
  regeneration: MechanicalResult['regeneration']
): void {
  if (!regeneration) return;

  let y = getCurrentY(doc);
  y = addSectionTitle(doc, t('systemSummary.regeneration'), y);

  const tableData = [
    [
      t('systemSummary.labels.energyPerCycle'),
      `${regeneration.energyPerCycle.toFixed(1)} J`,
      t('systemSummary.labels.brakingPower'),
      `${regeneration.brakingPower.toFixed(1)} W`,
    ],
    [
      t('systemSummary.labels.externalResistorRequired'),
      regeneration.requiresExternalResistor ? t('systemSummary.options.yes') : t('systemSummary.options.no'),
      t('systemSummary.labels.recommendedResistorPower'),
      regeneration.recommendedResistor
        ? `${regeneration.recommendedResistor.minPower.toFixed(0)} W`
        : '-',
    ],
  ];

  autoTable(doc, {
    ...defaultTableStyles,
    startY: y,
    body: tableData,
    columnStyles: {
      0: { cellWidth: 50, fontStyle: 'bold' },
      1: { cellWidth: 35 },
      2: { cellWidth: 50, fontStyle: 'bold' },
      3: { cellWidth: 35 },
    },
    styles: {
      fontSize: 9,
    },
  });

  // 警告信息
  if (regeneration.warning) {
    y = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || y;
    y += 5;

    doc.setFillColor(255, 250, 230);
    doc.setDrawColor(255, 200, 100);
    doc.setLineWidth(0.3);
    doc.roundedRect(15, y, 180, 12, 2, 2, 'FD');

    doc.setFontSize(9);
    doc.setTextColor(...colors.secondary);
    doc.text(`⚠️ ${regeneration.warning}`, 20, y + 7);
  }
}
