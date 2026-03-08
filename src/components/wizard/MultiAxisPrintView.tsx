'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { useTranslations } from 'next-intl';
import type { Project, AxisConfig } from '@/types';
import { AxisDetailSection } from './AxisDetailSection';
import { createPortal } from 'react-dom';

interface MultiAxisPrintViewProps {
  project: Project;
  onClose: () => void;
}

export function MultiAxisPrintView({ project, onClose }: MultiAxisPrintViewProps) {
  const t = useTranslations();
  const printRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

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

  if (completedAxes.length === 0) {
    const emptyContent = (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center"
           style={{ background: '#f5f5f5' }}>
        <div className="text-center p-8 rounded-lg shadow-lg"
             style={{ background: 'white', border: '1px solid #e0e0e0' }}>
          <p style={{ color: '#374151', fontSize: '1.125rem', fontWeight: 500 }}>
            没有已完成的轴可供导出
          </p>
          <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            请至少完成一个轴的配置
          </p>
          <button
            onClick={onClose}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              background: '#374151',
              color: 'white',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            关闭
          </button>
        </div>
      </div>
    );
    return mounted ? createPortal(emptyContent, document.body) : emptyContent;
  }

  const content = (
    <div className="fixed inset-0 z-[9999] flex flex-col"
         style={{ background: '#f5f5f5' }}>
      {/* 打印控制按钮 */}
      <div className="flex justify-end gap-3 p-4 border-b print:hidden"
           style={{ background: 'white', borderColor: '#e5e7eb' }}>
        <button
          onClick={() => handlePrint()}
          style={{
            padding: '0.5rem 1rem',
            background: '#1e40af',
            color: 'white',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/>
            <path d="M6 14h12v8H6z"/>
          </svg>
          {t('result.print')}
        </button>
        <button
          onClick={onClose}
          style={{
            padding: '0.5rem 1rem',
            background: '#4b5563',
            color: 'white',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 500
          }}
        >
          ✕ {t('common.close')}
        </button>
      </div>

      {/* 打印内容预览 */}
      <div className="flex-1 overflow-auto p-4" style={{ background: '#e5e7eb' }}>
        <div
          ref={printRef}
          className="mx-auto shadow-lg"
          style={{
            width: '210mm',
            minHeight: '297mm',
            maxWidth: '100%',
            background: 'white',
            color: '#1f2937',
            fontFamily: '"Noto Sans SC", "Source Han Sans SC", "Microsoft YaHei", sans-serif',
            lineHeight: 1.6
          }}
        >
          <PrintStyles />

          {/* 第1页：项目信息 + 汇总BOM */}
          <div style={{ padding: '20mm' }}>
            {/* 报告标题 */}
            <div style={{
              textAlign: 'center',
              borderBottom: '3px solid #1e40af',
              paddingBottom: '1.5rem',
              marginBottom: '2rem'
            }}>
              <div style={{
                fontSize: '1.75rem',
                fontWeight: 700,
                color: '#1e3a8a',
                marginBottom: '0.5rem',
                letterSpacing: '0.05em'
              }}>
                博世力士乐伺服选型报告
              </div>
              {project.name && (
                <div style={{
                  fontSize: '1.25rem',
                  color: '#374151',
                  fontWeight: 500
                }}>
                  项目: {project.name}
                </div>
              )}
              <div style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                marginTop: '0.5rem'
              }}>
                生成时间: {new Date().toLocaleDateString('zh-CN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>

            {/* 项目信息 */}
            <PrintSection title="项目信息">
              <div style={{
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                overflow: 'hidden'
              }}>
                <div style={{ padding: '1rem' }}>
                  <InfoGrid>
                    <InfoItem label="项目名称" value={project.name || '-'} />
                    <InfoItem label="客户" value={project.customer || '-'} />
                    {project.salesPerson && (
                      <InfoItem label="销售人员" value={project.salesPerson} />
                    )}
                    <InfoItem
                      label="轴数量"
                      value={`${completedAxes.length} 个已完成 / ${project.axes.length} 个总计`}
                    />
                  </InfoGrid>
                  {project.notes && (
                    <div style={{
                      marginTop: '1rem',
                      paddingTop: '1rem',
                      borderTop: '1px solid #e5e7eb'
                    }}>
                      <span style={{
                        fontSize: '0.875rem',
                        color: '#6b7280',
                        display: 'block',
                        marginBottom: '0.25rem'
                      }}>备注:</span>
                      <p style={{
                        color: '#374151',
                        whiteSpace: 'pre-wrap',
                        fontSize: '0.875rem',
                        margin: 0
                      }}>{project.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </PrintSection>

            {/* 公共参数 */}
            <PrintSection title="公共参数（适用于所有轴）">
              <div style={{
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                overflow: 'hidden'
              }}>
                <div style={{ padding: '1rem' }}>
                  <InfoGrid cols={2}>
                    <InfoItem label="环境温度" value={`${project.commonParams.ambientTemp}°C`} />
                    <InfoItem label="防护等级" value={project.commonParams.ipRating} />
                    <InfoItem label="通信协议" value={project.commonParams.communication} />
                    <InfoItem
                      label="电缆长度"
                      value={typeof project.commonParams.cableLength === 'number'
                        ? `${project.commonParams.cableLength}m`
                        : '仅接线端子'}
                    />
                    <InfoItem label="安全系数" value={String(project.commonParams.safetyFactor)} />
                    <InfoItem label="最大惯量比" value={`${project.commonParams.maxInertiaRatio}:1`} />
                  </InfoGrid>
                </div>
              </div>
            </PrintSection>

            {/* 汇总BOM */}
            {bom.length > 0 && (
              <PrintSection title="物料清单 (BOM)">
                <div style={{
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  overflow: 'hidden'
                }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '0.875rem'
                  }}>
                    <thead>
                      <tr style={{ background: '#f3f4f6' }}>
                        <th style={{
                          padding: '0.75rem 1rem',
                          textAlign: 'left',
                          fontWeight: 600,
                          color: '#374151',
                          borderBottom: '2px solid #d1d5db'
                        }}>序号</th>
                        <th style={{
                          padding: '0.75rem 1rem',
                          textAlign: 'left',
                          fontWeight: 600,
                          color: '#374151',
                          borderBottom: '2px solid #d1d5db'
                        }}>料号</th>
                        <th style={{
                          padding: '0.75rem 1rem',
                          textAlign: 'left',
                          fontWeight: 600,
                          color: '#374151',
                          borderBottom: '2px solid #d1d5db'
                        }}>描述</th>
                        <th style={{
                          padding: '0.75rem 1rem',
                          textAlign: 'center',
                          fontWeight: 600,
                          color: '#374151',
                          borderBottom: '2px solid #d1d5db'
                        }}>数量</th>
                        <th style={{
                          padding: '0.75rem 1rem',
                          textAlign: 'left',
                          fontWeight: 600,
                          color: '#374151',
                          borderBottom: '2px solid #d1d5db'
                        }}>用于轴</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bom.map((item, index) => (
                        <tr key={item.partNumber} style={{
                          borderBottom: index < bom.length - 1 ? '1px solid #e5e7eb' : 'none'
                        }}>
                          <td style={{ padding: '0.75rem 1rem', color: '#6b7280' }}>
                            {index + 1}
                          </td>
                          <td style={{
                            padding: '0.75rem 1rem',
                            fontFamily: 'monospace',
                            fontSize: '0.8125rem',
                            color: '#1f2937'
                          }}>
                            {item.partNumber}
                          </td>
                          <td style={{ padding: '0.75rem 1rem', color: '#374151' }}>
                            {item.description}
                          </td>
                          <td style={{
                            padding: '0.75rem 1rem',
                            textAlign: 'center',
                            color: '#1f2937',
                            fontWeight: 500
                          }}>
                            {item.quantity}
                          </td>
                          <td style={{
                            padding: '0.75rem 1rem',
                            fontSize: '0.8125rem',
                            color: '#6b7280'
                          }}>
                            {item.usedIn.join(', ')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </PrintSection>
            )}
          </div>

          {/* 各轴详细配置 - 每轴一页 */}
          {completedAxes.map((axis, index) => (
            <div key={axis.id} className="axis-page" style={{ padding: '20mm' }}>
              <AxisDetailSection axis={axis} axisIndex={index} />
            </div>
          ))}

          {/* 最后页：页脚 */}
          <div style={{ padding: '20mm' }}>
            <div style={{
              marginTop: '3rem',
              paddingTop: '1rem',
              borderTop: '2px solid #e5e7eb',
              textAlign: 'center'
            }}>
              <p style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                margin: '0.25rem 0'
              }}>博世力士乐伺服选型工具生成</p>
              <p style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                margin: '0.25rem 0'
              }}>XC20 + MC20 伺服系统</p>
              <p style={{
                fontSize: '0.75rem',
                color: '#9ca3af',
                margin: '0.25rem 0'
              }}>{new Date().toLocaleString('zh-CN')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return mounted ? createPortal(content, document.body) : content;
}

function PrintStyles() {
  return (
    <style>{`
      @page {
        size: A4;
        margin: 15mm 15mm 20mm 15mm;
      }
      @media print {
        .axis-page {
          page-break-before: always;
          break-before: page;
          padding-top: 0 !important;
        }
        .axis-page:first-of-type {
          page-break-before: auto;
          break-before: auto;
        }
        .axis-page:last-child {
          page-break-after: auto;
          break-after: auto;
        }
        .print-content {
          padding-top: 5mm;
        }
        /* 确保打印时颜色正确 */
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      }
    `}</style>
  );
}

function PrintSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <h2 style={{
        fontSize: '1.125rem',
        fontWeight: 700,
        color: '#1e3a8a',
        borderBottom: '2px solid #e5e7eb',
        paddingBottom: '0.5rem',
        marginBottom: '1rem'
      }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

function InfoGrid({ children, cols = 1 }: { children: React.ReactNode; cols?: 1 | 2 }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: cols === 2 ? 'repeat(2, 1fr)' : '1fr',
      gap: '0.75rem'
    }}>
      {children}
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span style={{
        fontSize: '0.875rem',
        color: '#6b7280'
      }}>{label}:</span>
      <span style={{
        marginLeft: '0.5rem',
        fontWeight: 500,
        color: '#1f2937'
      }}>{value}</span>
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
