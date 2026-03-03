'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import type { AxisConfig } from '@/types';

interface AxisDetailSectionProps {
  axis: AxisConfig;
  axisIndex: number;
}

export function AxisDetailSection({ axis, axisIndex }: AxisDetailSectionProps) {
  const t = useTranslations();
  const result = axis.result;
  const recommendation = result?.motorRecommendations[0];
  const systemConfig = recommendation?.systemConfig;

  if (!result || !recommendation) {
    return null;
  }

  return (
    <div className="axis-detail-page">
      {/* 轴标题 */}
      <div className="text-center border-b-2 border-gray-300 pb-4 mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          轴 {axisIndex + 1}: {axis.name}
        </h2>
        {axis.completedAt && (
          <p className="text-sm text-gray-500 mt-1">
            完成时间: {new Date(axis.completedAt).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* 计算摘要 */}
      <Section title={t('pdf.sections.calculationSummary')}>
        <div className="border rounded-lg overflow-hidden">
          <div className="p-4 grid grid-cols-1 gap-2">
            <CompactRow label={t('result.loadInertia')} value={`${result.mechanical.loadInertia.toExponential(3)} kg·m²`} />
            <CompactRow label={t('result.rmsTorque')} value={`${result.mechanical.torques.rms.toFixed(2)} N·m`} />
            <CompactRow label={t('result.peakTorque')} value={`${result.mechanical.torques.peak.toFixed(2)} N·m`} />
            <CompactRow label={t('result.maxSpeed')} value={`${result.mechanical.speeds.max.toFixed(0)} rpm`} />
          </div>
        </div>
      </Section>

      {/* 系统配置清单 */}
      <Section title={t('systemSummary.configList')}>
        <div className="space-y-4">
          {systemConfig && (
            <>
              {/* 电机 */}
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-100 px-4 py-2 font-medium border-b">
                  {t('systemSummary.motorDetails')}
                </div>
                <div className="p-4 grid grid-cols-1 gap-2">
                  <div>
                    <span className="text-gray-600 text-sm">{t('systemSummary.columns.partNumber')}:</span>
                    <span className="ml-2 font-mono text-sm">{recommendation.motor.model}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 text-sm">{t('systemSummary.columns.description')}:</span>
                    <span className="ml-2 text-gray-700">{recommendation.motor.baseModel}</span>
                  </div>
                </div>
              </div>

              {/* 驱动器 */}
              {systemConfig.drive && (
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-100 px-4 py-2 font-medium border-b">
                    {t('systemSummary.driveDetails')}
                  </div>
                  <div className="p-4 grid grid-cols-1 gap-2">
                    <div>
                      <span className="text-gray-600 text-sm">{t('systemSummary.columns.partNumber')}:</span>
                      <span className="ml-2 font-mono text-sm">{systemConfig.drive.model}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">{t('systemSummary.columns.description')}:</span>
                      <span className="ml-2 text-gray-700">{systemConfig.drive.baseModel}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 电缆 */}
              {systemConfig.accessories && (
                <>
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-100 px-4 py-2 font-medium border-b">
                      {t('systemSummary.labels.motorCable')}
                    </div>
                    <div className="p-4 grid grid-cols-1 gap-2">
                      <div>
                        <span className="text-gray-600 text-sm">{t('systemSummary.columns.partNumber')}:</span>
                        <span className="ml-2 font-mono text-sm">{systemConfig.accessories.motorCable.model}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 text-sm">{t('systemSummary.cable.length')}:</span>
                        <span className="ml-2">
                          {typeof systemConfig.accessories.motorCable.length === 'number'
                            ? `${systemConfig.accessories.motorCable.length} m`
                            : t('systemSummary.cable.terminalOnly')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-100 px-4 py-2 font-medium border-b">
                      {t('systemSummary.labels.encoderCable')}
                    </div>
                    <div className="p-4 grid grid-cols-1 gap-2">
                      <div>
                        <span className="text-gray-600 text-sm">{t('systemSummary.columns.partNumber')}:</span>
                        <span className="ml-2 font-mono text-sm">{systemConfig.accessories.encoderCable.model}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 text-sm">{t('systemSummary.cable.length')}:</span>
                        <span className="ml-2">
                          {typeof systemConfig.accessories.encoderCable.length === 'number'
                            ? `${systemConfig.accessories.encoderCable.length} m`
                            : t('systemSummary.cable.terminalOnly')}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </Section>

      {/* 电机详细参数 */}
      {recommendation.motor && (
        <Section title={t('systemSummary.motorDetails')}>
          <div className="border rounded-lg overflow-hidden">
            <div className="p-4 grid grid-cols-1 gap-2">
              <ParamRow label={t('systemSummary.labels.ratedPower')} value={`${recommendation.motor.ratedPower} W`} />
              <ParamRow label={t('systemSummary.labels.ratedSpeed')} value={`${recommendation.motor.ratedSpeed} rpm`} />
              <ParamRow label={t('systemSummary.labels.ratedTorque')} value={`${recommendation.motor.ratedTorque} N·m`} />
              <ParamRow label={t('systemSummary.labels.peakTorque')} value={`${recommendation.motor.peakTorque} N·m`} />
              <ParamRow label={t('systemSummary.labels.maxSpeed')} value={`${recommendation.motor.maxSpeed} rpm`} />
              <ParamRow label={t('systemSummary.labels.ratedCurrent')} value={`${recommendation.motor.ratedCurrent} A`} />
              <ParamRow label={t('systemSummary.labels.rotorInertia')} value={`${recommendation.motor.rotorInertia.toExponential(5)} kg·m²`} />
              <ParamRow label={t('systemSummary.labels.torqueConstant')} value={`${recommendation.motor.torqueConstant} N·m/A`} />
            </div>
          </div>
        </Section>
      )}

      {/* 驱动器详细参数 */}
      {systemConfig?.drive && (
        <Section title={t('systemSummary.driveDetails')}>
          <div className="border rounded-lg overflow-hidden">
            <div className="p-4 grid grid-cols-1 gap-2">
              <ParamRow label={t('systemSummary.labels.maxCurrent')} value={`${systemConfig.drive.maxCurrent} A`} />
              <ParamRow label={t('systemSummary.labels.ratedCurrent')} value={`${systemConfig.drive.ratedCurrent} A`} />
              <ParamRow label={t('systemSummary.labels.overloadCapacity')} value={`${systemConfig.drive.overloadCapacity} ×`} />
              <ParamRow label={t('systemSummary.labels.pwmFrequency')} value={`${systemConfig.drive.ratedPwmFrequency} kHz`} />
            </div>
          </div>
        </Section>
      )}

      {/* 制动能量分析 */}
      {result.mechanical.regeneration && (
        <Section title={t('systemSummary.regeneration')}>
          <div className="border rounded-lg overflow-hidden">
            <div className="p-4 grid grid-cols-1 gap-2">
              <ParamRow label={t('systemSummary.labels.energyPerCycle')} value={`${result.mechanical.regeneration.energyPerCycle.toFixed(1)} J`} />
              <ParamRow label={t('systemSummary.labels.brakingPower')} value={`${result.mechanical.regeneration.brakingPower.toFixed(1)} W`} />
              <ParamRow
                label={t('systemSummary.labels.externalResistorRequired')}
                value={result.mechanical.regeneration.requiresExternalResistor ? t('systemSummary.options.yes') : t('systemSummary.options.no')}
              />
            </div>
          </div>
        </Section>
      )}
    </div>
  );
}

// 辅助组件
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="text-base font-bold text-gray-900 border-b border-gray-300 pb-2 mb-3">
        {title}
      </h3>
      {children}
    </div>
  );
}

function ParamRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1">
      <span className="text-gray-600 text-sm">{label}</span>
      <span className="font-medium text-gray-900 text-sm">{value}</span>
    </div>
  );
}

function CompactRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex py-1">
      <span className="text-gray-600 w-32 shrink-0 text-sm">{label}</span>
      <span className="font-medium text-gray-900 text-sm">{value}</span>
    </div>
  );
}
