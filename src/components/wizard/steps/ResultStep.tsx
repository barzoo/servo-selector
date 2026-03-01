'use client';

import { useWizardStore } from '@/stores/wizard-store';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

export function ResultStep() {
  const { result, input, reset, prevStep } = useWizardStore();
  const t = useTranslations('result');
  const [selectedMotorIndex, setSelectedMotorIndex] = useState(0);

  if (!result || result.motorRecommendations.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-700 text-lg font-medium mb-2">{t('noResults')}</p>
        {result?.failureReason && (
          <p className="text-yellow-700 bg-yellow-50 px-4 py-2 rounded-md inline-block mb-4">
            {t('reason')}{result.failureReason.message}
          </p>
        )}
        <div className="mt-4">
          <button
            onClick={prevStep}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            {t('backToEdit')}
          </button>
        </div>
      </div>
    );
  }

  const selectedRecommendation = result.motorRecommendations[selectedMotorIndex];
  const { motor, safetyMargins, systemConfig } = selectedRecommendation;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">{t('title')}</h2>

      {/* 项目信息摘要 */}
      {input.project && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-700 mb-2">{t('projectInfo')}</h3>
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-900">
            <div><span className="text-gray-700">{t('projectName')}</span> {input.project.name}</div>
            <div><span className="text-gray-700">{t('customer')}</span> {input.project.customer}</div>
          </div>
        </div>
      )}

      {/* 计算摘要 */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">{t('calculationSummary')}</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-gray-800">{t('loadInertia')}</div>
            <div className="font-medium text-gray-900">{result.mechanical.loadInertia.toExponential(3)} kg·m²</div>
          </div>
          <div>
            <div className="text-gray-800">{t('rmsTorque')}</div>
            <div className="font-medium text-gray-900">{result.mechanical.torques.rms.toFixed(2)} N·m</div>
          </div>
          <div>
            <div className="text-gray-800">{t('peakTorque')}</div>
            <div className="font-medium text-gray-900">{result.mechanical.torques.peak.toFixed(2)} N·m</div>
          </div>
          <div>
            <div className="text-gray-800">{t('maxSpeed')}</div>
            <div className="font-medium text-gray-900">{result.mechanical.speeds.max.toFixed(0)} rpm</div>
          </div>
          <div>
            <div className="text-gray-800">{t('regenPower')}</div>
            <div className="font-medium text-gray-900">{result.mechanical.regeneration.brakingPower.toFixed(1)} W</div>
          </div>
          <div>
            <div className="text-gray-800">{t('calcTime')}</div>
            <div className="font-medium text-gray-900">{result.metadata.calculationTime.toFixed(1)} ms</div>
          </div>
        </div>
      </div>

      {/* 推荐电机列表 */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-3">{t('recommendedMotors', { count: result.motorRecommendations.length })}</h3>
        <div className="space-y-2">
          {result.motorRecommendations.map((rec, index) => (
            <div
              key={rec.motor.id}
              onClick={() => setSelectedMotorIndex(index)}
              className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                selectedMotorIndex === index
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="font-semibold text-lg text-gray-900">{rec.motor.model}</div>
                  <div className="text-sm text-gray-800">
                    {rec.motor.ratedTorque} N·m / {rec.motor.ratedSpeed} rpm
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm text-gray-800">{t('matchScore')}</div>
                    <div className={`font-bold text-lg ${
                      rec.matchScore >= 80 ? 'text-green-600' : rec.matchScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {rec.matchScore}%
                    </div>
                  </div>
                  {rec.feasibility === 'OK' && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">{t('feasibility.ok')}</span>
                  )}
                  {rec.feasibility === 'WARNING' && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">{t('feasibility.warning')}</span>
                  )}
                  {rec.feasibility === 'CRITICAL' && (
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">{t('feasibility.critical')}</span>
                  )}
                </div>
              </div>
              {rec.warnings.length > 0 && (
                <div className="mt-2 text-sm text-yellow-700">
                  {rec.warnings.map((w, i) => (
                    <div key={i}>⚠️ {w}</div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 选中电机的详细配置 */}
      {systemConfig && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-3">{t('systemConfigDetails')}</h3>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">{t('motor')}</h4>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-900">
                <div><span className="text-gray-700">{t('motorModel')}</span> {motor.model}</div>
                <div><span className="text-gray-700">{t('ratedTorque')}</span> {motor.ratedTorque} N·m</div>
                <div><span className="text-gray-700">{t('peakTorque')}</span> {motor.peakTorque} N·m</div>
                <div><span className="text-gray-700">{t('ratedSpeed')}</span> {motor.ratedSpeed} rpm</div>
                <div><span className="text-gray-700">{t('rotorInertia')}</span> {motor.rotorInertia} kg·cm²</div>
                <div><span className="text-gray-700">{t('inertiaRatio')}</span> {safetyMargins.inertia}:1</div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-700 mb-2">{t('drive')}</h4>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-900">
                <div><span className="text-gray-700">{t('driveModel')}</span> {systemConfig.drive.model}</div>
                <div><span className="text-gray-700">{t('ratedCurrent')}</span> {systemConfig.drive.ratedCurrent} A</div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-700 mb-2">{t('accessories')}</h4>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-900">
                <div><span className="text-gray-700">{t('motorCable')}</span> {systemConfig.accessories.motorCable.model}</div>
                <div><span className="text-gray-700">{t('encoderCable')}</span> {systemConfig.accessories.encoderCable.model}</div>
                {systemConfig.accessories.brakeResistor && (
                  <div><span className="text-gray-700">{t('brakeResistor')}</span> {systemConfig.accessories.brakeResistor.model}</div>
                )}
                {systemConfig.accessories.emcFilter && (
                  <div><span className="text-gray-700">{t('emcFilter')}</span> {systemConfig.accessories.emcFilter}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <button
          onClick={prevStep}
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
        >
          {t('backToEdit')}
        </button>
        <div className="space-x-3">
          <button
            onClick={reset}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            {t('restart')}
          </button>
          <button
            onClick={() => alert(t('pdfExportInDevelopment'))}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            {t('exportPdf')}
          </button>
        </div>
      </div>
    </div>
  );
}
