import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { defaultTableStyles, getCurrentY, addSectionTitle } from '../styles';
import type { TranslationFunction, ReportCableConfig } from '../types';

export function addCableSpecsSection(
  doc: jsPDF,
  t: TranslationFunction,
  cables: ReportCableConfig
): void {
  let y = getCurrentY(doc);
  y = addSectionTitle(doc, t('systemSummary.cableSpecs'), y);

  const tableData = [
    [
      t('systemSummary.labels.motorCable'),
      cables.motor.partNumber,
      cables.motor.spec,
      typeof cables.motor.length === 'number'
        ? `${cables.motor.length} ${t('systemSummary.cable.lengthUnit')}`
        : t('systemSummary.cable.terminalOnly'),
    ],
    [
      t('systemSummary.labels.encoderCable'),
      cables.encoder.partNumber,
      cables.encoder.spec,
      typeof cables.encoder.length === 'number'
        ? `${cables.encoder.length} ${t('systemSummary.cable.lengthUnit')}`
        : t('systemSummary.cable.terminalOnly'),
    ],
  ];

  if (cables.communication) {
    tableData.push([
      t('systemSummary.labels.commCable'),
      cables.communication.partNumber,
      '-',
      typeof cables.communication.length === 'number'
        ? `${cables.communication.length} ${t('systemSummary.cable.lengthUnit')}`
        : t('systemSummary.cable.terminalOnly'),
    ]);
  }

  autoTable(doc, {
    ...defaultTableStyles,
    startY: y,
    head: [
      [
        t('systemSummary.columns.type'),
        t('systemSummary.columns.partNumber'),
        t('systemSummary.cable.spec'),
        t('systemSummary.cable.length'),
      ],
    ],
    body: tableData,
    columnStyles: {
      0: { cellWidth: 35, fontStyle: 'bold' },
      1: { cellWidth: 55, font: 'courier' },
      2: { cellWidth: 50 },
      3: { cellWidth: 'auto' },
    },
  });
}
