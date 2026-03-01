'use client';

import React, { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { SizingReportPDFGenerator, generateFileName } from '@/lib/pdf';
import type { ReportData } from '@/lib/pdf/types';

interface PdfExportButtonProps {
  data: ReportData | null;
  disabled?: boolean;
}

// 收集所有 PDF 需要的翻译键
const PDF_TRANSLATION_KEYS = [
  // PDF 通用
  'pdf.reportTitle',
  'pdf.project',
  'pdf.generatedAt',
  'pdf.sections.projectInfo',
  'pdf.sections.calculationSummary',
  'pdf.projectInfo.item',
  'pdf.projectInfo.value',
  'pdf.projectInfo.name',
  'pdf.projectInfo.customer',
  'pdf.projectInfo.salesPerson',
  'pdf.projectInfo.date',
  'pdf.projectInfo.notes',

  // Result
  'result.loadInertia',
  'result.rmsTorque',
  'result.peakTorque',
  'result.maxSpeed',
  'result.regenPower',
  'result.calcTime',

  // SystemSummary
  'systemSummary.configList',
  'systemSummary.motorDetails',
  'systemSummary.driveDetails',
  'systemSummary.cableSpecs',
  'systemSummary.accessories',
  'systemSummary.regeneration',
  'systemSummary.columns.partNumber',
  'systemSummary.columns.type',
  'systemSummary.columns.description',
  'systemSummary.labels.ratedPower',
  'systemSummary.labels.ratedSpeed',
  'systemSummary.labels.ratedTorque',
  'systemSummary.labels.peakTorque',
  'systemSummary.labels.maxSpeed',
  'systemSummary.labels.ratedCurrent',
  'systemSummary.labels.rotorInertia',
  'systemSummary.labels.torqueConstant',
  'systemSummary.labels.encoderType',
  'systemSummary.labels.brake',
  'systemSummary.labels.shaftType',
  'systemSummary.labels.protection',
  'systemSummary.labels.maxCurrent',
  'systemSummary.labels.overloadCapacity',
  'systemSummary.labels.pwmFrequency',
  'systemSummary.labels.communication',
  'systemSummary.labels.panel',
  'systemSummary.labels.safety',
  'systemSummary.labels.cooling',
  'systemSummary.labels.internalResistance',
  'systemSummary.labels.continuousPower',
  'systemSummary.labels.peakPower',
  'systemSummary.labels.motorCable',
  'systemSummary.labels.encoderCable',
  'systemSummary.labels.commCable',
  'systemSummary.labels.brakeResistor',
  'systemSummary.labels.emcFilter',
  'systemSummary.labels.energyPerCycle',
  'systemSummary.labels.brakingPower',
  'systemSummary.labels.externalResistorRequired',
  'systemSummary.labels.recommendedResistorPower',
  'systemSummary.options.batteryMultiTurn',
  'systemSummary.options.mechanicalMultiTurn',
  'systemSummary.options.typeA',
  'systemSummary.options.typeB',
  'systemSummary.options.yes',
  'systemSummary.options.no',
  'systemSummary.options.keyShaft',
  'systemSummary.options.smoothShaft',
  'systemSummary.options.withDisplay',
  'systemSummary.options.withoutDisplay',
  'systemSummary.options.sto',
  'systemSummary.options.none',
  'systemSummary.options.fan',
  'systemSummary.options.natural',
  'systemSummary.options.ethercat',
  'systemSummary.options.profinet',
  'systemSummary.options.ethernetIp',
  'systemSummary.cable.spec',
  'systemSummary.cable.length',
  'systemSummary.cable.lengthUnit',
  'systemSummary.cable.terminalOnly',

  // DetailedCalculations
  'detailedCalculations.title',
  'detailedCalculations.mechanism',
  'detailedCalculations.inertia',
  'detailedCalculations.torques',
  'detailedCalculations.motion',
  'detailedCalculations.power',
  'detailedCalculations.labels.loadType',
  'detailedCalculations.labels.loadInertia',
  'detailedCalculations.labels.totalInertia',
  'detailedCalculations.labels.accelTorque',
  'detailedCalculations.labels.constantTorque',
  'detailedCalculations.labels.decelTorque',
  'detailedCalculations.labels.peakTorque',
  'detailedCalculations.labels.rmsTorque',
  'detailedCalculations.labels.maxSpeed',
  'detailedCalculations.labels.accelTime',
  'detailedCalculations.labels.constantTime',
  'detailedCalculations.labels.decelTime',
  'detailedCalculations.labels.dwellTime',
  'detailedCalculations.labels.cycleTime',
  'detailedCalculations.labels.cyclesPerMinute',
  'detailedCalculations.labels.peakPower',
  'detailedCalculations.labels.continuousPower',
  'detailedCalculations.labels.energyPerCycle',
  'detailedCalculations.labels.brakingPower',
  'detailedCalculations.units.kgm2',
  'detailedCalculations.units.nm',
  'detailedCalculations.units.rpm',
  'detailedCalculations.units.s',
  'detailedCalculations.units.cpm',
  'detailedCalculations.units.w',
  'detailedCalculations.units.j',
];

export function PdfExportButton({ data, disabled }: PdfExportButtonProps) {
  const t = useTranslations();
  const locale = useLocale();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleExport = async () => {
    if (isGenerating || !data) return;

    setIsGenerating(true);
    try {
      // 收集所有翻译
      const translations: Record<string, string> = {};
      PDF_TRANSLATION_KEYS.forEach((key) => {
        translations[key] = t(key);
      });

      const generator = new SizingReportPDFGenerator(locale, translations);
      const doc = generator.generate(data);

      const fileName = generateFileName(data.project.name);
      doc.save(fileName);
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert(t('result.pdfExportError') || 'PDF export failed');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={disabled || isGenerating || !data}
      className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
    >
      {isGenerating ? (
        <>
          <span className="animate-spin">⏳</span>
          {t('result.generatingPdf') || 'Generating...'}
        </>
      ) : (
        <>
          <span>📄</span>
          {t('result.exportPdf')}
        </>
      )}
    </button>
  );
}
