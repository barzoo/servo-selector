import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { defaultTableStyles, getCurrentY, addSectionTitle } from '../styles';
import type { TranslationFunction, XC20Drive } from '../types';

export function addDriveDetailsSection(
  doc: jsPDF,
  t: TranslationFunction,
  drive: XC20Drive | null
): void {
  if (!drive) return;

  let y = getCurrentY(doc);
  y = addSectionTitle(doc, t('systemSummary.driveDetails'), y);

  // 基本参数
  const basicParams = [
    [t('systemSummary.labels.maxCurrent'), `${drive.maxCurrent} A`],
    [t('systemSummary.labels.ratedCurrent'), `${drive.ratedCurrent} A`],
    [t('systemSummary.labels.overloadCapacity'), `${drive.overloadCapacity} ×`],
    [t('systemSummary.labels.pwmFrequency'), `${drive.ratedPwmFrequency} kHz`],
  ];

  autoTable(doc, {
    ...defaultTableStyles,
    startY: y,
    body: basicParams,
    columnStyles: {
      0: { cellWidth: 40, fontStyle: 'bold' },
      1: { cellWidth: 'auto' },
    },
    tableWidth: 90,
    margin: { left: 15, right: 0, top: 5, bottom: 5 },
  });

  // 选项参数
  const optionParams = [
    [
      t('systemSummary.labels.communication'),
      drive.communication.type === 'ETHERCAT'
        ? t('systemSummary.options.ethercat')
        : drive.communication.type === 'PROFINET'
          ? t('systemSummary.options.profinet')
          : t('systemSummary.options.ethernetIp'),
    ],
    [
      t('systemSummary.labels.panel'),
      drive.options.panel.code === '01B'
        ? t('systemSummary.options.withDisplay')
        : t('systemSummary.options.withoutDisplay'),
    ],
    [
      t('systemSummary.labels.safety'),
      drive.options.safety.code === 'ST' ? t('systemSummary.options.sto') : t('systemSummary.options.none'),
    ],
    [
      t('systemSummary.labels.cooling'),
      drive.hasFan ? t('systemSummary.options.fan') : t('systemSummary.options.natural'),
    ],
  ];

  autoTable(doc, {
    ...defaultTableStyles,
    startY: y,
    body: optionParams,
    columnStyles: {
      0: { cellWidth: 40, fontStyle: 'bold' },
      1: { cellWidth: 'auto' },
    },
    tableWidth: 90,
    margin: { left: 105, right: 15, top: 5, bottom: 5 },
  });

  // 制动能力
  y = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || y;
  y += 5;

  const brakingParams = [
    [t('systemSummary.labels.internalResistance'), `${drive.braking.internalResistance} Ω`],
    [t('systemSummary.labels.continuousPower'), `${drive.braking.continuousPower} W`],
    [t('systemSummary.labels.peakPower'), `${drive.braking.peakPower} W`],
  ];

  autoTable(doc, {
    ...defaultTableStyles,
    startY: y,
    body: brakingParams,
    columnStyles: {
      0: { cellWidth: 40, fontStyle: 'bold' },
      1: { cellWidth: 'auto' },
    },
    tableWidth: 90,
    margin: { left: 15, right: 0, top: 5, bottom: 5 },
  });
}
