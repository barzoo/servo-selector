'use client';

import { useState } from 'react';
import { generateMultiAxisPdf } from '@/lib/pdf/multi-axis-report';
import type { Project, AxisConfig } from '@/types';

interface ProjectPdfExportProps {
  project: Project;
}

export function ProjectPdfExport({ project }: ProjectPdfExportProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleExport = () => {
    setIsGenerating(true);

    try {
      const completedAxes = project.axes.filter((a) => a.status === 'COMPLETED');

      // Build report data
      const reportData = {
        project: {
          name: project.name,
          customer: project.customer,
          salesPerson: project.salesPerson,
          date: new Date().toLocaleDateString(),
          notes: project.notes,
        },
        axes: completedAxes.map((axis) => ({
          name: axis.name,
          calculations: {
            loadInertia: axis.result?.mechanical.loadInertia.toExponential(3) || '-',
            rmsTorque: axis.result?.mechanical.torques.rms.toFixed(2) || '-',
            peakTorque: axis.result?.mechanical.torques.peak.toFixed(2) || '-',
            maxSpeed: axis.result?.mechanical.speeds.max.toFixed(0) || '-',
          },
          motor: axis.result?.motorRecommendations[0]
            ? {
                model: axis.result.motorRecommendations[0].motor.baseModel,
                partNumber: axis.result.motorRecommendations[0].motor.model,
                ratedTorque: axis.result.motorRecommendations[0].motor.ratedTorque,
                ratedSpeed: axis.result.motorRecommendations[0].motor.ratedSpeed,
              }
            : null,
          drive: axis.result?.motorRecommendations[0]?.systemConfig?.drive
            ? {
                model: axis.result.motorRecommendations[0].systemConfig.drive.baseModel,
                partNumber: axis.result.motorRecommendations[0].systemConfig.drive.model,
              }
            : null,
        })),
        bom: buildBom(completedAxes),
      };

      const doc = generateMultiAxisPdf(reportData);
      doc.save(`${project.name || '伺服选型报告'}.pdf`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isGenerating}
      className="
        w-full px-4 py-2 bg-green-600 text-white rounded-md
        hover:bg-green-700 transition-colors
        disabled:bg-gray-400 disabled:cursor-not-allowed
        text-sm font-medium flex items-center justify-center gap-2
      "
    >
      <span>{isGenerating ? '⏳' : '📄'}</span>
      <span>{isGenerating ? '生成中...' : '导出项目PDF'}</span>
    </button>
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

    // Add drive to BOM
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
