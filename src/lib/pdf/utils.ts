import jsPDF from 'jspdf';
import { spacing, fonts, colors, pageSize } from './styles';

/**
 * 添加章节标题
 */
export function addSectionTitle(
  doc: jsPDF,
  title: string,
  y: number
): number {
  doc.setFontSize(fonts.section.size);
  doc.setFont('helvetica', fonts.section.style);
  doc.setTextColor(...colors.primary);
  doc.text(title, spacing.pageMargin, y);

  // 添加下划线
  doc.setDrawColor(...colors.border);
  doc.setLineWidth(0.5);
  doc.line(
    spacing.pageMargin,
    y + 2,
    pageSize.width - spacing.pageMargin,
    y + 2
  );

  return y + spacing.paragraphGap + 2;
}

/**
 * 添加子章节标题
 */
export function addSubsectionTitle(
  doc: jsPDF,
  title: string,
  y: number
): number {
  doc.setFontSize(fonts.subsection.size);
  doc.setFont('helvetica', fonts.subsection.style);
  doc.setTextColor(...colors.primary);
  doc.text(title, spacing.pageMargin, y);

  return y + spacing.paragraphGap;
}

/**
 * 添加普通文本
 */
export function addText(
  doc: jsPDF,
  text: string,
  y: number,
  options?: {
    size?: number;
    style?: 'normal' | 'bold' | 'italic';
    color?: [number, number, number];
    align?: 'left' | 'center' | 'right';
  }
): number {
  const {
    size = fonts.body.size,
    style = 'normal',
    color = colors.secondary,
    align = 'left',
  } = options || {};

  doc.setFontSize(size);
  doc.setFont('helvetica', style);
  doc.setTextColor(...color);

  let x = spacing.pageMargin;
  if (align === 'center') {
    const textWidth = doc.getTextWidth(text);
    x = (pageSize.width - textWidth) / 2;
  } else if (align === 'right') {
    const textWidth = doc.getTextWidth(text);
    x = pageSize.width - spacing.pageMargin - textWidth;
  }

  doc.text(text, x, y);
  return y + spacing.paragraphGap;
}

/**
 * 检查是否需要新页面
 */
export function checkNewPage(doc: jsPDF, requiredHeight: number): number {
  const currentY = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || 0;
  const pageHeight = pageSize.height - spacing.pageMargin;

  if (currentY + requiredHeight > pageHeight) {
    doc.addPage();
    return spacing.pageMargin + 10;
  }

  return currentY + spacing.sectionGap;
}

/**
 * 获取当前 Y 位置
 */
export function getCurrentY(doc: jsPDF): number {
  return (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || spacing.pageMargin + 10;
}

/**
 * 格式化日期
 */
export function formatDate(date: Date = new Date()): string {
  return date.toISOString().split('T')[0].replace(/-/g, '');
}

/**
 * 生成文件名
 */
export function generateFileName(projectName: string): string {
  const date = formatDate();
  const sanitizedName = projectName.replace(/[^\w\u4e00-\u9fa5]/g, '_');
  return `选型报告_${sanitizedName}_${date}.pdf`;
}
