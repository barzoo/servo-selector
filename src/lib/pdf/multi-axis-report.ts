import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { MultiAxisReportData } from './types';

// Extend jsPDF type for autotable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: {
      startY?: number;
      head?: string[][];
      body?: string[][];
      theme?: string;
      headStyles?: { fillColor?: number[] };
    }) => void;
    lastAutoTable: { finalY: number };
  }
}

export function generateMultiAxisPdf(data: MultiAxisReportData): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Title
  doc.setFontSize(20);
  doc.text('博世力士乐伺服系统选型报告', pageWidth / 2, 20, { align: 'center' });

  // Project Info
  doc.setFontSize(12);
  doc.text(`项目名称: ${data.project.name}`, 20, 40);
  doc.text(`客户: ${data.project.customer}`, 20, 48);
  doc.text(`日期: ${data.project.date}`, 20, 56);

  // Common Params
  let currentY = 75;

  doc.setFontSize(14);
  doc.text('公共参数（适用于所有轴）', 20, currentY);
  currentY += 10;

  const commonParamsData = [
    ['环境温度', `${data.commonParams.ambientTemp}°C`],
    ['防护等级', data.commonParams.ipRating],
    ['通信协议', data.commonParams.communication],
    ['电缆长度', data.commonParams.cableLength],
    ['安全系数', data.commonParams.safetyFactor.toString()],
    ['最大惯量比', `${data.commonParams.maxInertiaRatio}:1`],
  ];

  doc.autoTable({
    startY: currentY,
    head: [['参数', '数值']],
    body: commonParamsData,
    theme: 'striped',
    headStyles: { fillColor: [37, 99, 235] },
  });

  // Overview
  currentY = doc.lastAutoTable.finalY + 15;

  if (currentY > 250) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFontSize(14);
  doc.text('项目概览', 20, currentY);
  currentY += 10;

  const overviewData = [
    ['总轴数', data.axes.length.toString()],
    ['已完成轴数', data.axes.length.toString()],
  ];

  doc.autoTable({
    startY: currentY,
    head: [['项目', '数值']],
    body: overviewData,
    theme: 'striped',
    headStyles: { fillColor: [37, 99, 235] },
  });

  // Each Axis
  currentY = doc.lastAutoTable.finalY + 15;

  data.axes.forEach((axis, index) => {
    // Check if need new page
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFontSize(14);
    doc.text(`🛠️ 轴 ${index + 1}: ${axis.name}`, 20, currentY);
    currentY += 10;

    // Calculations
    doc.setFontSize(12);
    const calcData = [
      ['负载惯量', `${axis.calculations.loadInertia} kg·m²`],
      ['RMS转矩', `${axis.calculations.rmsTorque} N·m`],
      ['峰值转矩', `${axis.calculations.peakTorque} N·m`],
      ['最大速度', `${axis.calculations.maxSpeed} rpm`],
    ];

    doc.autoTable({
      startY: currentY,
      head: [['参数', '数值']],
      body: calcData,
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235] },
    });

    currentY = doc.lastAutoTable.finalY + 10;

    // Motor & Drive
    if (axis.motor && axis.drive) {
      const motorDriveData = [
        ['电机型号', axis.motor.model],
        ['电机料号', axis.motor.partNumber],
        ['驱动器型号', axis.drive.model],
        ['驱动器料号', axis.drive.partNumber],
      ];

      doc.autoTable({
        startY: currentY,
        head: [['类型', '型号/料号']],
        body: motorDriveData,
        theme: 'striped',
        headStyles: { fillColor: [37, 99, 235] },
      });

      currentY = doc.lastAutoTable.finalY + 15;
    }
  });

  // BOM
  if (currentY > 220) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFontSize(14);
  doc.text('📋 物料清单 (BOM)', 20, currentY);
  currentY += 10;

  const bomData = data.bom.map((item) => [
    item.partNumber,
    item.description,
    item.quantity.toString(),
    item.usedIn.join(', '),
  ]);

  doc.autoTable({
    startY: currentY,
    head: [['料号', '描述', '数量', '用于']],
    body: bomData,
    theme: 'striped',
    headStyles: { fillColor: [37, 99, 235] },
  });

  return doc;
}
