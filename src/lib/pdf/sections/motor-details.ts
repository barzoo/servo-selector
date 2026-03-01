import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { defaultTableStyles, getCurrentY, addSectionTitle } from '../styles';
import type { TranslationFunction, MC20Motor } from '../types';

export function addMotorDetailsSection(
  doc: jsPDF,
  t: TranslationFunction,
  motor: MC20Motor | null
): void {
  if (!motor) return;

  let y = getCurrentY(doc);
  y = addSectionTitle(doc, t('systemSummary.motorDetails'), y);

  // 基本参数
  const basicParams = [
    [t('systemSummary.labels.ratedPower'), `${motor.ratedPower} W`],
    [t('systemSummary.labels.ratedSpeed'), `${motor.ratedSpeed} rpm`],
    [t('systemSummary.labels.ratedTorque'), `${motor.ratedTorque} N·m`],
    [t('systemSummary.labels.peakTorque'), `${motor.peakTorque} N·m`],
    [t('systemSummary.labels.maxSpeed'), `${motor.maxSpeed} rpm`],
    [t('systemSummary.labels.ratedCurrent'), `${motor.ratedCurrent} A`],
    [t('systemSummary.labels.rotorInertia'), `${motor.rotorInertia.toExponential(5)} kg·m²`],
    [t('systemSummary.labels.torqueConstant'), `${motor.torqueConstant} N·m/A`],
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
      t('systemSummary.labels.encoderType'),
      motor.options.encoder.type === 'BATTERY_MULTI_TURN'
        ? t('systemSummary.options.batteryMultiTurn')
        : t('systemSummary.options.mechanicalMultiTurn'),
    ],
    [
      t('systemSummary.labels.brake'),
      motor.options.brake.hasBrake ? t('systemSummary.options.yes') : t('systemSummary.options.no'),
    ],
    [
      t('systemSummary.labels.shaftType'),
      motor.options.keyShaft.hasKey
        ? t('systemSummary.options.keyShaft')
        : t('systemSummary.options.smoothShaft'),
    ],
    [t('systemSummary.labels.protection'), motor.options.protection.level],
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
}
