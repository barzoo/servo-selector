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
          🖨️ {t('result.print') || '打印'}
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          ✕ {t('common.close') || '关闭'}
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

          {/* 项目信息 */}
          <Section title={t('pdf.sections.projectInfo')}>
            <table className="w-full border-collapse">
              <tbody>
                <tr className="border-b">
                  <td className="py-2 px-4 bg-gray-50 w-1/3 font-medium">{t('pdf.projectInfo.name')}</td>
                  <td className="py-2 px-4">{data.project.name || '-'}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-4 bg-gray-50 font-medium">{t('pdf.projectInfo.customer')}</td>
                  <td className="py-2 px-4">{data.project.customer || '-'}</td>
                </tr>
                {data.project.salesPerson && (
                  <tr className="border-b">
                    <td className="py-2 px-4 bg-gray-50 font-medium">{t('pdf.projectInfo.salesPerson')}</td>
                    <td className="py-2 px-4">{data.project.salesPerson}</td>
                  </tr>
                )}
                <tr className="border-b">
                  <td className="py-2 px-4 bg-gray-50 font-medium">{t('pdf.projectInfo.date')}</td>
                  <td className="py-2 px-4">{data.project.date}</td>
                </tr>
                {data.project.notes && (
                  <tr className="border-b">
                    <td className="py-2 px-4 bg-gray-50 font-medium">{t('pdf.projectInfo.notes')}</td>
                    <td className="py-2 px-4">{data.project.notes}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </Section>

          {/* 计算摘要 */}
          <Section title={t('pdf.sections.calculationSummary')}>
            <div className="grid grid-cols-3 gap-4">
              <SummaryItem label={t('result.loadInertia')} value={data.calculations.loadInertia} />
              <SummaryItem label={t('result.rmsTorque')} value={data.calculations.rmsTorque} />
              <SummaryItem label={t('result.peakTorque')} value={data.calculations.peakTorque} />
              <SummaryItem label={t('result.maxSpeed')} value={data.calculations.maxSpeed} />
              <SummaryItem label={t('result.regenPower')} value={data.calculations.regenPower} />
              <SummaryItem label={t('result.calcTime')} value={data.calculations.calcTime} />
            </div>
          </Section>

          {/* 系统配置清单 */}
          <Section title={t('systemSummary.configList')}>
            <table className="w-full border-collapse border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border py-2 px-4 text-left font-medium">{t('systemSummary.columns.partNumber')}</th>
                  <th className="border py-2 px-4 text-left font-medium">{t('systemSummary.columns.type')}</th>
                  <th className="border py-2 px-4 text-left font-medium">{t('systemSummary.columns.description')}</th>
                </tr>
              </thead>
              <tbody>
                {data.systemConfig.items.map((item, index) => (
                  <tr key={index} className={index % 2 === 1 ? 'bg-gray-50' : ''}>
                    <td className="border py-2 px-4 font-mono text-sm">{item.partNumber}</td>
                    <td className="border py-2 px-4">{item.typeLabel}</td>
                    <td className="border py-2 px-4 text-gray-600">{item.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          {/* 电机详细参数 */}
          {data.systemConfig.motor && (
            <Section title={t('systemSummary.motorDetails')}>
              <div className="grid grid-cols-2 gap-4">
                <ParamRow label={t('systemSummary.labels.ratedPower')} value={`${data.systemConfig.motor.ratedPower} W`} />
                <ParamRow label={t('systemSummary.labels.ratedSpeed')} value={`${data.systemConfig.motor.ratedSpeed} rpm`} />
                <ParamRow label={t('systemSummary.labels.ratedTorque')} value={`${data.systemConfig.motor.ratedTorque} N·m`} />
                <ParamRow label={t('systemSummary.labels.peakTorque')} value={`${data.systemConfig.motor.peakTorque} N·m`} />
                <ParamRow label={t('systemSummary.labels.maxSpeed')} value={`${data.systemConfig.motor.maxSpeed} rpm`} />
                <ParamRow label={t('systemSummary.labels.ratedCurrent')} value={`${data.systemConfig.motor.ratedCurrent} A`} />
                <ParamRow label={t('systemSummary.labels.rotorInertia')} value={`${data.systemConfig.motor.rotorInertia.toExponential(5)} kg·m²`} />
                <ParamRow label={t('systemSummary.labels.torqueConstant')} value={`${data.systemConfig.motor.torqueConstant} N·m/A`} />
              </div>
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-medium mb-2">{t('systemSummary.motorOptions')}</h4>
                <div className="grid grid-cols-2 gap-4">
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

          {/* 驱动器详细参数 */}
          {data.systemConfig.drive && (
            <Section title={t('systemSummary.driveDetails')}>
              <div className="grid grid-cols-2 gap-4">
                <ParamRow label={t('systemSummary.labels.maxCurrent')} value={`${data.systemConfig.drive.maxCurrent} A`} />
                <ParamRow label={t('systemSummary.labels.ratedCurrent')} value={`${data.systemConfig.drive.ratedCurrent} A`} />
                <ParamRow label={t('systemSummary.labels.overloadCapacity')} value={`${data.systemConfig.drive.overloadCapacity} ×`} />
                <ParamRow label={t('systemSummary.labels.pwmFrequency')} value={`${data.systemConfig.drive.ratedPwmFrequency} kHz`} />
              </div>
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-medium mb-2">{t('systemSummary.driveOptions')}</h4>
                <div className="grid grid-cols-2 gap-4">
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
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-medium mb-2">{t('systemSummary.brakingCapability')}</h4>
                <div className="grid grid-cols-3 gap-4">
                  <ParamRow label={t('systemSummary.labels.internalResistance')} value={`${data.systemConfig.drive.braking.internalResistance} Ω`} />
                  <ParamRow label={t('systemSummary.labels.continuousPower')} value={`${data.systemConfig.drive.braking.continuousPower} W`} />
                  <ParamRow label={t('systemSummary.labels.peakPower')} value={`${data.systemConfig.drive.braking.peakPower} W`} />
                </div>
              </div>
            </Section>
          )}

          {/* 电缆规格 */}
          <Section title={t('systemSummary.cableSpecs')}>
            <table className="w-full border-collapse border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border py-2 px-4 text-left font-medium">{t('systemSummary.columns.type')}</th>
                  <th className="border py-2 px-4 text-left font-medium">{t('systemSummary.columns.partNumber')}</th>
                  <th className="border py-2 px-4 text-left font-medium">{t('systemSummary.cable.spec')}</th>
                  <th className="border py-2 px-4 text-left font-medium">{t('systemSummary.cable.length')}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border py-2 px-4 font-medium">{t('systemSummary.labels.motorCable')}</td>
                  <td className="border py-2 px-4 font-mono text-sm">{data.systemConfig.cables.motor.partNumber}</td>
                  <td className="border py-2 px-4">{data.systemConfig.cables.motor.spec}</td>
                  <td className="border py-2 px-4">
                    {typeof data.systemConfig.cables.motor.length === 'number'
                      ? `${data.systemConfig.cables.motor.length} ${t('systemSummary.cable.lengthUnit')}`
                      : t('systemSummary.cable.terminalOnly')}
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border py-2 px-4 font-medium">{t('systemSummary.labels.encoderCable')}</td>
                  <td className="border py-2 px-4 font-mono text-sm">{data.systemConfig.cables.encoder.partNumber}</td>
                  <td className="border py-2 px-4">{data.systemConfig.cables.encoder.spec}</td>
                  <td className="border py-2 px-4">
                    {typeof data.systemConfig.cables.encoder.length === 'number'
                      ? `${data.systemConfig.cables.encoder.length} ${t('systemSummary.cable.lengthUnit')}`
                      : t('systemSummary.cable.terminalOnly')}
                  </td>
                </tr>
                {data.systemConfig.cables.communication && (
                  <tr>
                    <td className="border py-2 px-4 font-medium">{t('systemSummary.labels.commCable')}</td>
                    <td className="border py-2 px-4 font-mono text-sm">{data.systemConfig.cables.communication.partNumber}</td>
                    <td className="border py-2 px-4">-</td>
                    <td className="border py-2 px-4">
                      {typeof data.systemConfig.cables.communication.length === 'number'
                        ? `${data.systemConfig.cables.communication.length} ${t('systemSummary.cable.lengthUnit')}`
                        : t('systemSummary.cable.terminalOnly')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Section>

          {/* 配件信息 */}
          {(data.systemConfig.accessories.emcFilter || data.systemConfig.accessories.brakeResistor) && (
            <Section title={t('systemSummary.accessories')}>
              <table className="w-full border-collapse border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border py-2 px-4 text-left font-medium">{t('systemSummary.columns.type')}</th>
                    <th className="border py-2 px-4 text-left font-medium">{t('systemSummary.columns.partNumber')}</th>
                    <th className="border py-2 px-4 text-left font-medium">{t('systemSummary.columns.description')}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.systemConfig.accessories.emcFilter && (
                    <tr>
                      <td className="border py-2 px-4 font-medium">{t('systemSummary.labels.emcFilter')}</td>
                      <td className="border py-2 px-4 font-mono text-sm">{data.systemConfig.accessories.emcFilter}</td>
                      <td className="border py-2 px-4">EMC Filter</td>
                    </tr>
                  )}
                  {data.systemConfig.accessories.brakeResistor && (
                    <tr className="bg-gray-50">
                      <td className="border py-2 px-4 font-medium">{t('systemSummary.labels.brakeResistor')}</td>
                      <td className="border py-2 px-4 font-mono text-sm">{data.systemConfig.accessories.brakeResistor.partNumber}</td>
                      <td className="border py-2 px-4">{data.systemConfig.accessories.brakeResistor.model}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Section>
          )}

          {/* 制动能量分析 */}
          {data.regeneration && (
            <Section title={t('systemSummary.regeneration')}>
              <div className="grid grid-cols-2 gap-4">
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
              {data.regeneration.warning && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-300 rounded">
                  <p className="text-yellow-800">⚠️ {data.regeneration.warning}</p>
                </div>
              )}
            </Section>
          )}

          {/* 详细计算过程 */}
          <Section title={t('detailedCalculations.title')}>
            <p className="text-gray-600 text-sm">
              {t('detailedCalculations.description') || '详细计算数据请查看系统配置页面'}
            </p>
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

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 p-3 rounded">
      <div className="text-sm text-gray-600">{label}</div>
      <div className="font-medium text-gray-900">{value}</div>
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
