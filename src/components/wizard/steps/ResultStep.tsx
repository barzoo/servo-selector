'use client';

import { useProjectStore } from '@/stores/project-store';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { DetailedCalculations } from '../DetailedCalculations';
import { SystemSummary, findMotor, findDrive, buildSummaryItems } from '../SystemSummary';
import { PdfExportButton } from '../PdfExportButton';
import type { ReportData } from '@/lib/pdf/types';

export function ResultStep() {
  const { result, input, reset, prevStep } = useProjectStore();
  const { completeAxis, addAxis, switchAxis, project } = useProjectStore();
  const t = useTranslations('result');
  const tSystem = useTranslations('systemSummary');
  const tLabels = useTranslations('systemSummary.labels');
  const [selectedMotorIndex, setSelectedMotorIndex] = useState(0);
  const [showSaveOptions, setShowSaveOptions] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

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
  const { motor, systemConfig } = selectedRecommendation;

  // Use systemConfiguration from result if available, otherwise construct from selected recommendation
  const config = result.systemConfiguration || (systemConfig ? {
    motor: {
      model: motor.baseModel,
      partNumber: motor.model,
      options: {
        brake: motor.options.brake.hasBrake,
        encoderType: motor.options.encoder.type === 'BATTERY_MULTI_TURN' ? 'A' : 'B',
        keyShaft: motor.options.keyShaft.hasKey,
      },
    },
    drive: {
      model: systemConfig.drive.baseModel,
      partNumber: systemConfig.drive.model,
      options: {
        communication: systemConfig.drive.communication.type,
        panel: systemConfig.drive.options.panel.code === '01B' ? 'WITH_DISPLAY' : 'WITHOUT_DISPLAY',
        safety: systemConfig.drive.options.safety.code === 'ST' ? 'STO' : 'NONE',
      },
    },
    cables: {
      motor: {
        spec: systemConfig.accessories.motorCable.model,
        length: typeof systemConfig.accessories.motorCable.length === 'number' ? systemConfig.accessories.motorCable.length : 3,
        partNumber: `CAB-MOT-${systemConfig.accessories.motorCable.length}`,
      },
      encoder: {
        spec: systemConfig.accessories.encoderCable.model,
        length: typeof systemConfig.accessories.encoderCable.length === 'number' ? systemConfig.accessories.encoderCable.length : 3,
        partNumber: `CAB-ENC-${systemConfig.accessories.encoderCable.length}`,
      },
      ...(systemConfig.accessories.commCable && {
        communication: {
          length: typeof systemConfig.accessories.commCable.length === 'number' ? systemConfig.accessories.commCable.length : 3,
          partNumber: `CAB-COM-${systemConfig.accessories.commCable.model}`,
        },
      }),
    },
    accessories: {
      ...(systemConfig.accessories.brakeResistor && {
        brakeResistor: {
          model: systemConfig.accessories.brakeResistor.model,
          partNumber: systemConfig.accessories.brakeResistor.model,
        },
      }),
      ...(systemConfig.accessories.emcFilter && {
        emcFilter: systemConfig.accessories.emcFilter,
      }),
    },
  } : null);

  const prepareReportData = (): ReportData | null => {
    if (!config || !result) return null;

    const motor = findMotor(config.motor.partNumber);
    const drive = findDrive(config.drive.partNumber);

    return {
      project: {
        name: input.project?.name || '-',
        customer: input.project?.customer || '-',
        salesPerson: input.project?.salesPerson,
        date: new Date().toLocaleDateString(),
        notes: input.project?.notes,
      },
      calculations: {
        loadInertia: result.mechanical.loadInertia.toExponential(3),
        rmsTorque: result.mechanical.torques.rms.toFixed(2),
        peakTorque: result.mechanical.torques.peak.toFixed(2),
        maxSpeed: result.mechanical.speeds.max.toFixed(0),
        regenPower: result.mechanical.regeneration.brakingPower.toFixed(1),
        calcTime: result.metadata.calculationTime.toFixed(1),
      },
      systemConfig: {
        items: buildSummaryItems(config, tSystem, tLabels),
        motor: motor || null,
        drive: drive || null,
        cables: {
          motor: {
            partNumber: config.cables.motor.partNumber,
            spec: config.cables.motor.spec,
            length: config.cables.motor.length,
          },
          encoder: {
            partNumber: config.cables.encoder.partNumber,
            spec: config.cables.encoder.spec,
            length: config.cables.encoder.length,
          },
          ...(config.cables.communication && {
            communication: {
              partNumber: config.cables.communication.partNumber,
              length: config.cables.communication.length,
            },
          }),
        },
        accessories: {
          ...(config.accessories.emcFilter && {
            emcFilter: config.accessories.emcFilter,
          }),
          ...(config.accessories.brakeResistor && {
            brakeResistor: config.accessories.brakeResistor,
          }),
        },
      },
      regeneration: result.mechanical.regeneration,
      detailedCalculations: {
        input,
        mechanical: result.mechanical,
      },
    };
  };

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
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
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

      {/* 制动电阻警告 */}
      {result.mechanical.regeneration.requiresExternalResistor && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
          <div className="flex items-start">
            <span className="text-yellow-600 text-xl mr-2">⚠️</span>
            <div>
              <h4 className="font-semibold text-yellow-800">制动电阻警告</h4>
              <p className="text-yellow-700 text-sm mt-1">
                {result.mechanical.regeneration.warning}
              </p>
              {result.mechanical.regeneration.recommendedResistor && (
                <div className="mt-2 text-sm text-yellow-700">
                  <p>建议外部电阻规格：</p>
                  <ul className="list-disc list-inside ml-2">
                    <li>持续功率: ≥ {result.mechanical.regeneration.recommendedResistor.minPower.toFixed(0)}W</li>
                    <li>阻值: ≈ {result.mechanical.regeneration.recommendedResistor.resistance}Ω</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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

      {/* 系统配置详情 */}
      {config && (
        <SystemSummary
          config={config}
          mechanical={result.mechanical}
        />
      )}

      {/* 详细计算信息 */}
      {input && (
        <DetailedCalculations
          input={input}
          mechanical={result.mechanical}
        />
      )}

      <div className="flex flex-col sm:flex-row justify-between gap-3">
        <button
          onClick={prevStep}
          className="w-full sm:w-auto px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
        >
          {t('backToEdit')}
        </button>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={reset}
            className="w-full sm:w-auto px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            {t('restart')}
          </button>
          <button
            onClick={() => {
              completeAxis();
              setIsSaved(true);
              setShowSaveOptions(true);
            }}
            disabled={isSaved}
            className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span>💾</span>
            <span>{isSaved ? '已保存' : '保存到篮子'}</span>
          </button>
          <div className="w-full sm:w-auto">
            <PdfExportButton data={prepareReportData()} disabled={!config} />
          </div>
        </div>
      </div>

      {/* Save Options Dialog */}
      {showSaveOptions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">轴已保存到篮子</h3>
            <div className="space-y-2">
              <button
                onClick={() => {
                  const currentAxisId = useProjectStore.getState().currentAxisId;
                  const newAxisId = addAxis(`轴-${project.axes.length + 1}`, currentAxisId);
                  switchAxis(newAxisId);
                  setShowSaveOptions(false);
                  reset();
                }}
                className="w-full p-3 text-left rounded-lg border border-gray-300 hover:bg-gray-50 flex items-center gap-2 text-gray-900 bg-white"
              >
                <span>🔄</span>
                <span className="text-gray-900">基于此轴创建新轴</span>
              </button>
              <button
                onClick={() => {
                  const newAxisId = addAxis(`轴-${project.axes.length + 1}`);
                  switchAxis(newAxisId);
                  setShowSaveOptions(false);
                  reset();
                }}
                className="w-full p-3 text-left rounded-lg border border-gray-300 hover:bg-gray-50 flex items-center gap-2 text-gray-900 bg-white"
              >
                <span>➕</span>
                <span className="text-gray-900">添加空白新轴</span>
              </button>
              <button
                onClick={() => setShowSaveOptions(false)}
                className="w-full p-3 text-left rounded-lg border border-gray-300 hover:bg-gray-50 flex items-center gap-2 text-gray-900 bg-white"
              >
                <span>📋</span>
                <span className="text-gray-900">继续编辑当前轴</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
