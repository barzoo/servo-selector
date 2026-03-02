'use client';

import React, { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import type { ReportData } from '@/lib/pdf/types';

interface PrintReportViewProps {
  data: ReportData;
  onClose: () => void;
}

export function PrintReportView({ data, onClose }: PrintReportViewProps) {
  const t = useTranslations();

  useEffect(() => {
    // 自动触发打印
    const timer = setTimeout(() => {
      window.print();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* 打印控制按钮 - 打印时隐藏 */}
      <div className="fixed top-4 right-4 z-50 flex gap-2 print:hidden">
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          🖨️ {t('result.print')}
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          ✕ {t('common.close')}
        </button>
      </div>

      {/* 打印内容 */}
      <div className="fixed inset-0 bg-white z-40 overflow-auto print:static print:overflow-visible">
        <div className="max-w-[210mm] mx-auto p-[15mm] print:p-0">
          {/* 报告标题 */}
          <div className="text-center border-b-2 border-gray-300 pb-6 mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {t('pdf.reportTitle')}
            </h1>
            {data.project.name && (
              <p className="text-lg text-gray-700">
                {t('pdf.project')}: {data.project.name}
              </p>
            )}
            <p className="text-sm text-gray-500 mt-2">
              {t('pdf.generatedAt')}: {data.project.date}
            </p>
          </div>

          {/* 项目信息 - 纵向卡片布局 */}
          <Section title={t('pdf.sections.projectInfo')}>
            <div className="border rounded-lg overflow-hidden print:break-inside-avoid">
              <div className="p-4 grid grid-cols-1 gap-3">
                <div>
                  <span className="text-gray-600 text-sm">{t('pdf.projectInfo.name')}:</span>
                  <span className="ml-2 font-medium">{data.project.name || '-'}</span>
                </div>
                <div>
                  <span className="text-gray-600 text-sm">{t('pdf.projectInfo.customer')}:</span>
                  <span className="ml-2">{data.project.customer || '-'}</span>
                </div>
                {data.project.salesPerson && (
                  <div>
                    <span className="text-gray-600 text-sm">{t('pdf.projectInfo.salesPerson')}:</span>
                    <span className="ml-2">{data.project.salesPerson}</span>
                  </div>
                )}
                <div>
                  <span className="text-gray-600 text-sm">{t('pdf.projectInfo.date')}:</span>
                  <span className="ml-2">{data.project.date}</span>
                </div>
                {data.project.notes && (
                  <div className="pt-2 border-t mt-2">
                    <span className="text-gray-600 text-sm block mb-1">{t('pdf.projectInfo.notes')}:</span>
                    <p className="text-gray-800 whitespace-pre-wrap text-sm">{data.project.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </Section>

          {/* 计算摘要 - 纵向卡片布局 */}
          <Section title={t('pdf.sections.calculationSummary')}>
            <div className="border rounded-lg overflow-hidden">
              <div className="p-4 grid grid-cols-1 gap-2">
                <CompactRow label={t('result.loadInertia')} value={data.calculations.loadInertia} />
                <CompactRow label={t('result.rmsTorque')} value={data.calculations.rmsTorque} />
                <CompactRow label={t('result.peakTorque')} value={data.calculations.peakTorque} />
                <CompactRow label={t('result.maxSpeed')} value={data.calculations.maxSpeed} />
                <CompactRow label={t('result.regenPower')} value={data.calculations.regenPower} />
                <CompactRow label={t('result.calcTime')} value={data.calculations.calcTime} />
              </div>
            </div>
          </Section>

          {/* 系统配置清单 - 纵向布局 */}
          <Section title={t('systemSummary.configList')}>
            <div className="space-y-4">
              {data.systemConfig.items.map((item, index) => (
                <div key={index} className="border rounded-lg overflow-hidden print:break-inside-avoid">
                  <div className="bg-gray-100 px-4 py-2 font-medium border-b">
                    {item.typeLabel}
                  </div>
                  <div className="p-4 grid grid-cols-1 gap-2">
                    <div>
                      <span className="text-gray-600 text-sm">{t('systemSummary.columns.partNumber')}:</span>
                      <span className="ml-2 font-mono text-sm">{item.partNumber}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">{t('systemSummary.columns.description')}:</span>
                      <span className="ml-2 text-gray-700">{item.description}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* 电机详细参数 - 纵向布局 */}
          {data.systemConfig.motor && (
            <Section title={t('systemSummary.motorDetails')}>
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-100 px-4 py-2 font-medium border-b">
                  {t('systemSummary.motorDetails')}
                </div>
                <div className="p-4 grid grid-cols-1 gap-2">
                  <ParamRow label={t('systemSummary.labels.ratedPower')} value={`${data.systemConfig.motor.ratedPower} W`} />
                  <ParamRow label={t('systemSummary.labels.ratedSpeed')} value={`${data.systemConfig.motor.ratedSpeed} rpm`} />
                  <ParamRow label={t('systemSummary.labels.ratedTorque')} value={`${data.systemConfig.motor.ratedTorque} N·m`} />
                  <ParamRow label={t('systemSummary.labels.peakTorque')} value={`${data.systemConfig.motor.peakTorque} N·m`} />
                  <ParamRow label={t('systemSummary.labels.maxSpeed')} value={`${data.systemConfig.motor.maxSpeed} rpm`} />
                  <ParamRow label={t('systemSummary.labels.ratedCurrent')} value={`${data.systemConfig.motor.ratedCurrent} A`} />
                  <ParamRow label={t('systemSummary.labels.rotorInertia')} value={`${data.systemConfig.motor.rotorInertia.toExponential(5)} kg·m²`} />
                  <ParamRow label={t('systemSummary.labels.torqueConstant')} value={`${data.systemConfig.motor.torqueConstant} N·m/A`} />
                </div>
              </div>
              <div className="mt-4 border rounded-lg overflow-hidden">
                <div className="bg-gray-100 px-4 py-2 font-medium border-b">
                  {t('systemSummary.motorOptions')}
                </div>
                <div className="p-4 grid grid-cols-1 gap-2">
                  <ParamRow
                    label={t('systemSummary.labels.encoderType')}
                    value={data.systemConfig.motor.options.encoder.type === 'BATTERY_MULTI_TURN'
                      ? t('systemSummary.options.batteryMultiTurn')
                      : t('systemSummary.options.mechanicalMultiTurn')}
                  />
                  <ParamRow
                    label={t('systemSummary.labels.brake')}
                    value={data.systemConfig.motor.options.brake.hasBrake ? t('systemSummary.options.yes') : t('systemSummary.options.no')}
                  />
                  <ParamRow
                    label={t('systemSummary.labels.shaftType')}
                    value={data.systemConfig.motor.options.keyShaft.hasKey ? t('systemSummary.options.keyShaft') : t('systemSummary.options.smoothShaft')}
                  />
                  <ParamRow label={t('systemSummary.labels.protection')} value={data.systemConfig.motor.options.protection.level} />
                </div>
              </div>
            </Section>
          )}

          {/* 驱动器详细参数 - 纵向布局 */}
          {data.systemConfig.drive && (
            <Section title={t('systemSummary.driveDetails')}>
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-100 px-4 py-2 font-medium border-b">
                  {t('systemSummary.driveDetails')}
                </div>
                <div className="p-4 grid grid-cols-1 gap-2">
                  <ParamRow label={t('systemSummary.labels.maxCurrent')} value={`${data.systemConfig.drive.maxCurrent} A`} />
                  <ParamRow label={t('systemSummary.labels.ratedCurrent')} value={`${data.systemConfig.drive.ratedCurrent} A`} />
                  <ParamRow label={t('systemSummary.labels.overloadCapacity')} value={`${data.systemConfig.drive.overloadCapacity} ×`} />
                  <ParamRow label={t('systemSummary.labels.pwmFrequency')} value={`${data.systemConfig.drive.ratedPwmFrequency} kHz`} />
                </div>
              </div>
              <div className="mt-4 border rounded-lg overflow-hidden">
                <div className="bg-gray-100 px-4 py-2 font-medium border-b">
                  {t('systemSummary.driveOptions')}
                </div>
                <div className="p-4 grid grid-cols-1 gap-2">
                  <ParamRow
                    label={t('systemSummary.labels.communication')}
                    value={data.systemConfig.drive.communication.type === 'ETHERCAT'
                      ? t('systemSummary.options.ethercat')
                      : data.systemConfig.drive.communication.type === 'PROFINET'
                        ? t('systemSummary.options.profinet')
                        : t('systemSummary.options.ethernetIp')}
                  />
                  <ParamRow
                    label={t('systemSummary.labels.panel')}
                    value={data.systemConfig.drive.options.panel.code === '01B' ? t('systemSummary.options.withDisplay') : t('systemSummary.options.withoutDisplay')}
                  />
                  <ParamRow
                    label={t('systemSummary.labels.safety')}
                    value={data.systemConfig.drive.options.safety.code === 'ST' ? t('systemSummary.options.sto') : t('systemSummary.options.none')}
                  />
                  <ParamRow
                    label={t('systemSummary.labels.cooling')}
                    value={data.systemConfig.drive.hasFan ? t('systemSummary.options.fan') : t('systemSummary.options.natural')}
                  />
                </div>
              </div>
              <div className="mt-4 border rounded-lg overflow-hidden">
                <div className="bg-gray-100 px-4 py-2 font-medium border-b">
                  {t('systemSummary.brakingCapability')}
                </div>
                <div className="p-4 grid grid-cols-1 gap-2">
                  <ParamRow label={t('systemSummary.labels.internalResistance')} value={`${data.systemConfig.drive.braking.internalResistance} Ω`} />
                  <ParamRow label={t('systemSummary.labels.continuousPower')} value={`${data.systemConfig.drive.braking.continuousPower} W`} />
                  <ParamRow label={t('systemSummary.labels.peakPower')} value={`${data.systemConfig.drive.braking.peakPower} W`} />
                </div>
              </div>
            </Section>
          )}

          {/* 电缆规格 - 纵向卡片布局 */}
          <Section title={t('systemSummary.cableSpecs')}>
            <div className="space-y-4">
              {/* 动力电缆 */}
              <div className="border rounded-lg overflow-hidden print:break-inside-avoid">
                <div className="bg-gray-100 px-4 py-2 font-medium border-b">
                  {t('systemSummary.labels.motorCable')}
                </div>
                <div className="p-4 grid grid-cols-1 gap-2">
                  <div>
                    <span className="text-gray-600 text-sm">{t('systemSummary.columns.partNumber')}:</span>
                    <span className="ml-2 font-mono text-sm">{data.systemConfig.cables.motor.partNumber}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 text-sm">{t('systemSummary.cable.spec')}:</span>
                    <span className="ml-2">{data.systemConfig.cables.motor.spec}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 text-sm">{t('systemSummary.cable.length')}:</span>
                    <span className="ml-2">
                      {typeof data.systemConfig.cables.motor.length === 'number'
                        ? `${data.systemConfig.cables.motor.length} ${t('systemSummary.cable.lengthUnit')}`
                        : t('systemSummary.cable.terminalOnly')}
                    </span>
                  </div>
                </div>
              </div>

              {/* 编码器电缆 */}
              <div className="border rounded-lg overflow-hidden print:break-inside-avoid">
                <div className="bg-gray-100 px-4 py-2 font-medium border-b">
                  {t('systemSummary.labels.encoderCable')}
                </div>
                <div className="p-4 grid grid-cols-1 gap-2">
                  <div>
                    <span className="text-gray-600 text-sm">{t('systemSummary.columns.partNumber')}:</span>
                    <span className="ml-2 font-mono text-sm">{data.systemConfig.cables.encoder.partNumber}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 text-sm">{t('systemSummary.cable.spec')}:</span>
                    <span className="ml-2">{data.systemConfig.cables.encoder.spec}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 text-sm">{t('systemSummary.cable.length')}:</span>
                    <span className="ml-2">
                      {typeof data.systemConfig.cables.encoder.length === 'number'
                        ? `${data.systemConfig.cables.encoder.length} ${t('systemSummary.cable.lengthUnit')}`
                        : t('systemSummary.cable.terminalOnly')}
                    </span>
                  </div>
                </div>
              </div>

              {/* 通讯电缆 */}
              {data.systemConfig.cables.communication && (
                <div className="border rounded-lg overflow-hidden print:break-inside-avoid">
                  <div className="bg-gray-100 px-4 py-2 font-medium border-b">
                    {t('systemSummary.labels.commCable')}
                  </div>
                  <div className="p-4 grid grid-cols-1 gap-2">
                    <div>
                      <span className="text-gray-600 text-sm">{t('systemSummary.columns.partNumber')}:</span>
                      <span className="ml-2 font-mono text-sm">{data.systemConfig.cables.communication.partNumber}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">{t('systemSummary.cable.length')}:</span>
                      <span className="ml-2">
                        {typeof data.systemConfig.cables.communication.length === 'number'
                          ? `${data.systemConfig.cables.communication.length} ${t('systemSummary.cable.lengthUnit')}`
                          : t('systemSummary.cable.terminalOnly')}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Section>

          {/* 配件信息 - 纵向卡片布局 */}
          {(data.systemConfig.accessories.emcFilter || data.systemConfig.accessories.brakeResistor) && (
            <Section title={t('systemSummary.accessories')}>
              <div className="space-y-4">
                {data.systemConfig.accessories.emcFilter && (
                  <div className="border rounded-lg overflow-hidden print:break-inside-avoid">
                    <div className="bg-gray-100 px-4 py-2 font-medium border-b">
                      {t('systemSummary.labels.emcFilter')}
                    </div>
                    <div className="p-4">
                      <span className="font-mono text-sm">{data.systemConfig.accessories.emcFilter}</span>
                    </div>
                  </div>
                )}
                {data.systemConfig.accessories.brakeResistor && (
                  <div className="border rounded-lg overflow-hidden print:break-inside-avoid">
                    <div className="bg-gray-100 px-4 py-2 font-medium border-b">
                      {t('systemSummary.labels.brakeResistor')}
                    </div>
                    <div className="p-4 grid grid-cols-1 gap-2">
                      <div>
                        <span className="text-gray-600 text-sm">{t('systemSummary.columns.partNumber')}:</span>
                        <span className="ml-2 font-mono text-sm">{data.systemConfig.accessories.brakeResistor.partNumber}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 text-sm">{t('systemSummary.columns.description')}:</span>
                        <span className="ml-2">{data.systemConfig.accessories.brakeResistor.model}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Section>
          )}

          {/* 制动能量分析 - 纵向布局 */}
          {data.regeneration && (
            <Section title={t('systemSummary.regeneration')}>
              <div className="border rounded-lg overflow-hidden">
                <div className="p-4 grid grid-cols-1 gap-2">
                  <ParamRow label={t('systemSummary.labels.energyPerCycle')} value={`${data.regeneration.energyPerCycle.toFixed(1)} J`} />
                  <ParamRow label={t('systemSummary.labels.brakingPower')} value={`${data.regeneration.brakingPower.toFixed(1)} W`} />
                  <ParamRow
                    label={t('systemSummary.labels.externalResistorRequired')}
                    value={data.regeneration.requiresExternalResistor ? t('systemSummary.options.yes') : t('systemSummary.options.no')}
                  />
                  {data.regeneration.recommendedResistor && (
                    <ParamRow
                      label={t('systemSummary.labels.recommendedResistorPower')}
                      value={`${data.regeneration.recommendedResistor.minPower.toFixed(0)} W`}
                    />
                  )}
                </div>
              </div>
              {data.regeneration.warning && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-300 rounded">
                  <p className="text-yellow-800">⚠️ {data.regeneration.warning}</p>
                </div>
              )}
            </Section>
          )}

          {/* 详细计算过程 */}
          <Section title={t('detailedCalculations.title')}>
            {data.detailedCalculations && (
              <div className="space-y-4">
                {/* 机械参数 */}
                {data.detailedCalculations.mechanical && (
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-100 px-4 py-2 font-medium border-b">
                      {t('detailedCalculations.mechanism')}
                    </div>
                    <div className="p-4 grid grid-cols-1 gap-2">
                      <CompactRow
                        label={t('detailedCalculations.labels.loadInertia')}
                        value={`${data.detailedCalculations.mechanical.loadInertia.toExponential(5)} ${t('detailedCalculations.units.kgm2')}`}
                      />
                      <CompactRow
                        label={t('detailedCalculations.labels.totalInertia')}
                        value={`${data.detailedCalculations.mechanical.totalInertia.toExponential(5)} ${t('detailedCalculations.units.kgm2')}`}
                      />
                      <CompactRow
                        label={t('detailedCalculations.inertiaRatio') || '惯量比'}
                        value={`${data.detailedCalculations.mechanical.inertiaRatio.toFixed(2)}`}
                      />
                    </div>
                  </div>
                )}

                {/* 扭矩分析 */}
                {data.detailedCalculations.mechanical?.torques && (
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-100 px-4 py-2 font-medium border-b">
                      {t('detailedCalculations.torques')}
                    </div>
                    <div className="p-4 grid grid-cols-1 gap-2">
                      <CompactRow
                        label={t('detailedCalculations.labels.accelTorque')}
                        value={`${data.detailedCalculations.mechanical.torques.accel.toFixed(2)} ${t('detailedCalculations.units.nm')}`}
                      />
                      <CompactRow
                        label={t('detailedCalculations.labels.constantTorque')}
                        value={`${data.detailedCalculations.mechanical.torques.constant.toFixed(2)} ${t('detailedCalculations.units.nm')}`}
                      />
                      <CompactRow
                        label={t('detailedCalculations.labels.decelTorque')}
                        value={`${data.detailedCalculations.mechanical.torques.decel.toFixed(2)} ${t('detailedCalculations.units.nm')}`}
                      />
                      <CompactRow
                        label={t('detailedCalculations.labels.peakTorque')}
                        value={`${data.detailedCalculations.mechanical.torques.peak.toFixed(2)} ${t('detailedCalculations.units.nm')}`}
                      />
                      <CompactRow
                        label={t('detailedCalculations.labels.rmsTorque')}
                        value={`${data.detailedCalculations.mechanical.torques.rms.toFixed(2)} ${t('detailedCalculations.units.nm')}`}
                      />
                    </div>
                  </div>
                )}

                {/* 速度参数 */}
                {data.detailedCalculations.mechanical?.speeds && (
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-100 px-4 py-2 font-medium border-b">
                      {t('detailedCalculations.labels.maxSpeed')}
                    </div>
                    <div className="p-4 grid grid-cols-1 gap-2">
                      {data.detailedCalculations.mechanical.speeds.max !== undefined && (
                        <CompactRow
                          label={t('detailedCalculations.labels.maxSpeed')}
                          value={`${data.detailedCalculations.mechanical.speeds.max} ${t('detailedCalculations.units.rpm')}`}
                        />
                      )}
                      {data.detailedCalculations.mechanical.speeds.rms !== undefined && (
                        <CompactRow
                          label="RMS Speed"
                          value={`${data.detailedCalculations.mechanical.speeds.rms.toFixed(2)} ${t('detailedCalculations.units.rpm')}`}
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* 功率与能量 */}
                {data.detailedCalculations.mechanical?.powers && (
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-100 px-4 py-2 font-medium border-b">
                      {t('detailedCalculations.power')}
                    </div>
                    <div className="p-4 grid grid-cols-1 gap-2">
                      {data.detailedCalculations.mechanical.powers.peak !== undefined && (
                        <CompactRow
                          label={t('detailedCalculations.labels.peakPower')}
                          value={`${data.detailedCalculations.mechanical.powers.peak.toFixed(2)} ${t('detailedCalculations.units.w')}`}
                        />
                      )}
                      {data.detailedCalculations.mechanical.powers.continuous !== undefined && (
                        <CompactRow
                          label={t('detailedCalculations.labels.continuousPower')}
                          value={`${data.detailedCalculations.mechanical.powers.continuous.toFixed(2)} ${t('detailedCalculations.units.w')}`}
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Section>
        </div>
      </div>

      {/* 打印样式 */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }
          body * {
            visibility: hidden;
          }
          .print\:static,
          .print\:static * {
            visibility: visible;
          }
          .print\:static {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          /* 严格限制内容宽度为A4可打印区域 (考虑边距后约170mm) */
          .max-w-\[210mm\],
          .max-w-\[210mm\] > * {
            max-width: 170mm !important;
            width: 100% !important;
            box-sizing: border-box !important;
          }
          /* 确保所有直接子元素不溢出 */
          .max-w-\[210mm\] > div,
          .max-w-\[210mm\] > section,
          .max-w-\[210mm\] > section > div {
            max-width: 170mm !important;
            width: 100% !important;
            box-sizing: border-box !important;
          }
          /* 确保卡片布局在打印时正确显示 */
          .border {
            border: 1px solid #d1d5db !important;
          }
          .rounded-lg {
            border-radius: 0.5rem !important;
          }
          /* 强制分页控制 */
          .print\:break-inside-avoid {
            break-inside: avoid;
            page-break-inside: avoid;
          }
          /* 确保文本换行 */
          * {
            word-wrap: break-word !important;
            overflow-wrap: break-word !important;
          }
        }
      `}</style>
    </>
  );
}

// 辅助组件
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8 print:mb-6">
      <h2 className="text-lg font-bold text-gray-900 border-b-2 border-gray-300 pb-2 mb-4">
        {title}
      </h2>
      {children}
    </div>
  );
}

function ParamRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  );
}

function CompactRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex py-1">
      <span className="text-gray-600 w-32 shrink-0">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  );
}
