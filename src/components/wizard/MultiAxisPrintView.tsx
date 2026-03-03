'use client';

import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { useTranslations } from 'next-intl';
import type { Project, AxisConfig } from '@/types';

interface MultiAxisPrintViewProps {
  project: Project;
  onClose: () => void;
}

export function MultiAxisPrintView({ project, onClose }: MultiAxisPrintViewProps) {
  const t = useTranslations();
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `${project.name || '选型报告'}.pdf`,
    onAfterPrint: () => {
      console.log('打印完成');
    },
    onPrintError: (error) => {
      console.error('打印错误:', error);
    },
  });

  const completedAxes = project.axes.filter((a) => a.status === 'COMPLETED');
  const bom = buildBom(completedAxes);

  // 如果没有已完成的轴，显示提示
  if (completedAxes.length === 0) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg">没有已完成的轴可供导出</p>
          <p className="text-gray-400 text-sm mt-2">请至少完成一个轴的配置</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            关闭
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* 打印控制按钮 */}
      <div className="flex justify-end gap-2 p-4 border-b bg-gray-50 print:hidden">
        <button
          onClick={() => handlePrint()}
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

      {/* 打印内容预览 */}
      <div className="flex-1 overflow-auto p-4 bg-gray-100">
        <div
          ref={printRef}
          className="bg-white mx-auto p-8 shadow-lg"
          style={{
            width: '210mm',
            minHeight: '297mm',
            maxWidth: '100%',
          }}
        >
          {/* 报告标题 */}
          <div className="text-center border-b-2 border-gray-300 pb-6 mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              博世力士乐伺服选型报告
            </h1>
            {project.name && (
              <p className="text-lg text-gray-700">
                项目: {project.name}
              </p>
            )}
            <p className="text-sm text-gray-500 mt-2">
              生成时间: {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* 项目信息 */}
          <Section title="项目信息">
            <div className="border rounded-lg overflow-hidden">
              <div className="p-4 grid grid-cols-1 gap-3">
                <div>
                  <span className="text-gray-600 text-sm">项目名称:</span>
                  <span className="ml-2 font-medium">{project.name || '-'}</span>
                </div>
                <div>
                  <span className="text-gray-600 text-sm">客户:</span>
                  <span className="ml-2">{project.customer || '-'}</span>
                </div>
                {project.salesPerson && (
                  <div>
                    <span className="text-gray-600 text-sm">销售人员:</span>
                    <span className="ml-2">{project.salesPerson}</span>
                  </div>
                )}
                <div>
                  <span className="text-gray-600 text-sm">轴数量:</span>
                  <span className="ml-2">{completedAxes.length} 个已完成 / {project.axes.length} 个总计</span>
                </div>
                {project.notes && (
                  <div className="pt-2 border-t mt-2">
                    <span className="text-gray-600 text-sm block mb-1">备注:</span>
                    <p className="text-gray-800 whitespace-pre-wrap text-sm">{project.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </Section>

          {/* 各轴配置摘要 */}
          <Section title="轴配置摘要">
            <div className="space-y-4">
              {completedAxes.map((axis, index) => (
                <div key={axis.id} className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-100 px-4 py-2 font-medium border-b flex items-center justify-between">
                    <span>轴 {index + 1}: {axis.name}</span>
                    <span className="text-sm text-gray-500">{axis.completedAt ? new Date(axis.completedAt).toLocaleDateString() : '-'}</span>
                  </div>
                  <div className="p-4 grid grid-cols-1 gap-2">
                    {axis.result && (
                      <>
                        <CompactRow label="负载惯量" value={`${axis.result.mechanical.loadInertia.toExponential(3)} kg·m²`} />
                        <CompactRow label="RMS扭矩" value={`${axis.result.mechanical.torques.rms.toFixed(2)} N·m`} />
                        <CompactRow label="峰值扭矩" value={`${axis.result.mechanical.torques.peak.toFixed(2)} N·m`} />
                        <CompactRow label="最大速度" value={`${axis.result.mechanical.speeds.max.toFixed(0)} rpm`} />
                        {axis.result.motorRecommendations[0] && (
                          <>
                            <div className="border-t pt-2 mt-2">
                              <CompactRow
                                label="电机型号"
                                value={axis.result.motorRecommendations[0].motor.baseModel}
                              />
                              <CompactRow
                                label="料号"
                                value={axis.result.motorRecommendations[0].motor.model}
                              />
                            </div>
                            {axis.result.motorRecommendations[0].systemConfig?.drive && (
                              <div className="border-t pt-2 mt-2">
                                <CompactRow
                                  label="驱动器型号"
                                  value={axis.result.motorRecommendations[0].systemConfig.drive.baseModel}
                                />
                                <CompactRow
                                  label="料号"
                                  value={axis.result.motorRecommendations[0].systemConfig.drive.model}
                                />
                              </div>
                            )}
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* BOM清单 */}
          {bom.length > 0 && (
            <Section title="物料清单 (BOM)">
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm border-collapse">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium border-b border-gray-300">序号</th>
                      <th className="px-4 py-2 text-left font-medium border-b border-gray-300">料号</th>
                      <th className="px-4 py-2 text-left font-medium border-b border-gray-300">描述</th>
                      <th className="px-4 py-2 text-center font-medium border-b border-gray-300">数量</th>
                      <th className="px-4 py-2 text-left font-medium border-b border-gray-300">用于轴</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bom.map((item, index) => (
                      <tr key={item.partNumber} className="border-b border-gray-200 last:border-b-0">
                        <td className="px-4 py-2">{index + 1}</td>
                        <td className="px-4 py-2 font-mono text-xs">{item.partNumber}</td>
                        <td className="px-4 py-2">{item.description}</td>
                        <td className="px-4 py-2 text-center">{item.quantity}</td>
                        <td className="px-4 py-2 text-xs">{item.usedIn.join(', ')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>
          )}

          {/* 页脚 */}
          <div className="mt-12 pt-4 border-t text-center text-sm text-gray-500">
            <p>博世力士乐伺服选型工具生成</p>
            <p className="mt-1">XC20 + MC20 伺服系统</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function buildBom(axes: AxisConfig[]) {
  const bomMap = new Map<
    string,
    { description: string; quantity: number; usedIn: string[] }
  >();

  axes.forEach((axis) => {
    const motorPn = axis.result?.motorRecommendations[0]?.motor.model;
    if (motorPn) {
      const existing = bomMap.get(motorPn);
      if (existing) {
        existing.quantity += 1;
        if (!existing.usedIn.includes(axis.name)) {
          existing.usedIn.push(axis.name);
        }
      } else {
        bomMap.set(motorPn, {
          description: axis.result?.motorRecommendations[0]?.motor.baseModel || '',
          quantity: 1,
          usedIn: [axis.name],
        });
      }
    }

    const drivePn = axis.result?.motorRecommendations[0]?.systemConfig?.drive.model;
    if (drivePn) {
      const existing = bomMap.get(drivePn);
      if (existing) {
        existing.quantity += 1;
        if (!existing.usedIn.includes(axis.name)) {
          existing.usedIn.push(axis.name);
        }
      } else {
        bomMap.set(drivePn, {
          description: axis.result?.motorRecommendations[0]?.systemConfig?.drive.baseModel || '',
          quantity: 1,
          usedIn: [axis.name],
        });
      }
    }
  });

  return Array.from(bomMap.entries()).map(([partNumber, data]) => ({
    partNumber,
    description: data.description,
    quantity: data.quantity,
    usedIn: data.usedIn,
  }));
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-bold text-gray-900 border-b-2 border-gray-300 pb-2 mb-4">
        {title}
      </h2>
      {children}
    </div>
  );
}

function CompactRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex py-1">
      <span className="text-gray-600 w-24 shrink-0">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  );
}
