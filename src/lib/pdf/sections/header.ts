import jsPDF from 'jspdf';
import { spacing, fonts, colors, pageSize } from '../styles';
import type { TranslationFunction } from '../types';

export function addReportHeader(
  doc: jsPDF,
  t: TranslationFunction,
  projectName: string,
  date: string
): void {
  // 主标题
  doc.setFontSize(fonts.title.size);
  doc.setFont('helvetica', fonts.title.style);
  doc.setTextColor(...colors.primary);

  const title = t('pdf.reportTitle');
  const titleWidth = doc.getTextWidth(title);
  const titleX = (pageSize.width - titleWidth) / 2;
  doc.text(title, titleX, spacing.pageMargin + 10);

  // 副标题（项目名称）
  if (projectName) {
    doc.setFontSize(fonts.subsection.size);
    doc.setFont('helvetica', 'normal');
    const subtitle = `${t('pdf.project')}: ${projectName}`;
    const subtitleWidth = doc.getTextWidth(subtitle);
    const subtitleX = (pageSize.width - subtitleWidth) / 2;
    doc.text(subtitle, subtitleX, spacing.pageMargin + 18);
  }

  // 生成日期
  doc.setFontSize(fonts.small.size);
  doc.setTextColor(...colors.muted);
  const dateText = `${t('pdf.generatedAt')}: ${date}`;
  const dateWidth = doc.getTextWidth(dateText);
  const dateX = (pageSize.width - dateWidth) / 2;
  doc.text(dateText, dateX, spacing.pageMargin + 25);

  // 分隔线
  doc.setDrawColor(...colors.border);
  doc.setLineWidth(0.5);
  doc.line(
    spacing.pageMargin,
    spacing.pageMargin + 30,
    pageSize.width - spacing.pageMargin,
    spacing.pageMargin + 30
  );
}
