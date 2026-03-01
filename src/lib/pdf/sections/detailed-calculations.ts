import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { defaultTableStyles, getCurrentY, addSectionTitle, addSubsectionTitle } from '../styles';
import type { TranslationFunction, SizingInput, MechanicalResult } from '../types';
import { extractCalculationDetails } from '@/lib/calculations/calculation-details';

export function addDetailedCalculationsSection(
  doc: jsPDF,
  t: TranslationFunction,
  input: Partial<SizingInput>,
  mechanical: MechanicalResult
): void {
  let y = getCurrentY(doc);
  y = addSectionTitle(doc, t('detailedCalculations.title'), y);

  const details = extractCalculationDetails(input, mechanical);

  // 1. 机械参数
  y = addSubsectionTitle(doc, t('detailedCalculations.mechanism'), y);
  const mechanismData = [
    [t('detailedCalculations.labels.loadType'), details.mechanism.typeLabel],
    ...details.mechanism.params.map((p) => [
      p.label,
      p.unit ? `${p.value} ${t(`detailedCalculations.units.${p.unit}`)}` : String(p.value),
    ]),
  ];

  autoTable(doc, {
    ...defaultTableStyles,
    startY: y,
    body: mechanismData,
    columnStyles: {
      0: { cellWidth: 50, fontStyle: 'bold' },
      1: { cellWidth: 'auto' },
    },
  });

  // 2. 惯量计算
  y = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || y;
  y = addSubsectionTitle(doc, t('detailedCalculations.inertia'), y + 5);

  const inertiaData = [
    [
      t('detailedCalculations.labels.loadInertia'),
      `${details.inertia.loadInertia.toExponential(4)} ${t('detailedCalculations.units.kgm2')}`,
    ],
    ...(details.inertia.components?.map((c) => [
      c.name,
      `${c.value.toExponential(4)} ${t('detailedCalculations.units.kgm2')}`,
    ]) || []),
    [
      t('detailedCalculations.labels.totalInertia'),
      `${details.inertia.totalInertia.toExponential(4)} ${t('detailedCalculations.units.kgm2')}`,
    ],
  ];

  autoTable(doc, {
    ...defaultTableStyles,
    startY: y,
    body: inertiaData,
    columnStyles: {
      0: { cellWidth: 50, fontStyle: 'bold' },
      1: { cellWidth: 'auto' },
    },
  });

  // 3. 扭矩分析
  y = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || y;
  y = addSubsectionTitle(doc, t('detailedCalculations.torques'), y + 5);

  const torqueData = [
    [
      t('detailedCalculations.labels.accelTorque'),
      `${details.torques.accel.toFixed(2)} ${t('detailedCalculations.units.nm')}`,
    ],
    [
      t('detailedCalculations.labels.constantTorque'),
      `${details.torques.constant.toFixed(2)} ${t('detailedCalculations.units.nm')}`,
    ],
    [
      t('detailedCalculations.labels.decelTorque'),
      `${details.torques.decel.toFixed(2)} ${t('detailedCalculations.units.nm')}`,
    ],
    [
      t('detailedCalculations.labels.peakTorque'),
      `${details.torques.peak.toFixed(2)} ${t('detailedCalculations.units.nm')}`,
    ],
    [
      t('detailedCalculations.labels.rmsTorque'),
      `${details.torques.rms.toFixed(2)} ${t('detailedCalculations.units.nm')}`,
    ],
  ];

  autoTable(doc, {
    ...defaultTableStyles,
    startY: y,
    body: torqueData,
    columnStyles: {
      0: { cellWidth: 50, fontStyle: 'bold' },
      1: { cellWidth: 'auto' },
    },
  });

  // 4. 运动参数
  y = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || y;
  y = addSubsectionTitle(doc, t('detailedCalculations.motion'), y + 5);

  const motionData = [
    [
      t('detailedCalculations.labels.maxSpeed'),
      `${details.motion.maxSpeed.toFixed(0)} ${t('detailedCalculations.units.rpm')}`,
    ],
    [
      t('detailedCalculations.labels.accelTime'),
      `${details.motion.accelTime.toFixed(3)} ${t('detailedCalculations.units.s')}`,
    ],
    [
      t('detailedCalculations.labels.constantTime'),
      `${details.motion.constantTime.toFixed(3)} ${t('detailedCalculations.units.s')}`,
    ],
    [
      t('detailedCalculations.labels.decelTime'),
      `${details.motion.decelTime.toFixed(3)} ${t('detailedCalculations.units.s')}`,
    ],
    [
      t('detailedCalculations.labels.dwellTime'),
      `${details.motion.dwellTime.toFixed(3)} ${t('detailedCalculations.units.s')}`,
    ],
    [
      t('detailedCalculations.labels.cycleTime'),
      `${details.motion.cycleTime.toFixed(3)} ${t('detailedCalculations.units.s')}`,
    ],
    [
      t('detailedCalculations.labels.cyclesPerMinute'),
      `${details.motion.cyclesPerMinute.toFixed(1)} ${t('detailedCalculations.units.cpm')}`,
    ],
  ];

  autoTable(doc, {
    ...defaultTableStyles,
    startY: y,
    body: motionData,
    columnStyles: {
      0: { cellWidth: 50, fontStyle: 'bold' },
      1: { cellWidth: 'auto' },
    },
  });

  // 5. 功率与能量
  y = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || y;
  y = addSubsectionTitle(doc, t('detailedCalculations.power'), y + 5);

  const powerData = [
    [
      t('detailedCalculations.labels.peakPower'),
      `${details.power.peak.toFixed(1)} ${t('detailedCalculations.units.w')}`,
    ],
    [
      t('detailedCalculations.labels.continuousPower'),
      `${details.power.continuous.toFixed(1)} ${t('detailedCalculations.units.w')}`,
    ],
    [
      t('detailedCalculations.labels.energyPerCycle'),
      `${details.regeneration.energyPerCycle.toFixed(1)} ${t('detailedCalculations.units.j')}`,
    ],
    [
      t('detailedCalculations.labels.brakingPower'),
      `${details.regeneration.brakingPower.toFixed(1)} ${t('detailedCalculations.units.w')}`,
    ],
  ];

  autoTable(doc, {
    ...defaultTableStyles,
    startY: y,
    body: powerData,
    columnStyles: {
      0: { cellWidth: 50, fontStyle: 'bold' },
      1: { cellWidth: 'auto' },
    },
  });
}
