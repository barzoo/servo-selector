import type { UserOptions } from 'jspdf-autotable';

// 颜色定义 (RGB)
export const colors = {
  primary: [0, 0, 0] as [number, number, number],           // 黑色
  secondary: [51, 51, 51] as [number, number, number],      // 深灰 #333
  muted: [102, 102, 102] as [number, number, number],       // 中灰 #666
  border: [204, 204, 204] as [number, number, number],      // 浅灰 #CCC
  headerBg: [245, 245, 245] as [number, number, number],    // 表头背景 #F5F5F5
  alternateBg: [250, 250, 250] as [number, number, number], // 交替行背景 #FAFAFA
  white: [255, 255, 255] as [number, number, number],
};

// 字体大小 (mm 转 pt: 1mm ≈ 2.83pt)
export const fonts = {
  title: { size: 18, style: 'bold' as const },
  section: { size: 14, style: 'bold' as const },
  subsection: { size: 12, style: 'bold' as const },
  body: { size: 10, style: 'normal' as const },
  small: { size: 8, style: 'normal' as const },
};

// 间距 (单位: mm)
export const spacing = {
  pageMargin: 15,
  sectionGap: 10,
  paragraphGap: 5,
  tableMargin: 5,
};

// 表格默认样式
export const defaultTableStyles: Partial<UserOptions> = {
  theme: 'grid',
  headStyles: {
    fillColor: colors.headerBg,
    textColor: colors.primary,
    fontStyle: 'bold',
    fontSize: fonts.body.size,
    halign: 'left',
    valign: 'middle',
  },
  bodyStyles: {
    fontSize: fonts.small.size,
    textColor: colors.secondary,
    valign: 'middle',
  },
  alternateRowStyles: {
    fillColor: colors.alternateBg,
  },
  tableLineColor: colors.border,
  tableLineWidth: 0.2,
  margin: { top: 5, right: 0, bottom: 5, left: 0 },
};

// 页面配置
export const pageConfig = {
  format: 'a4' as const,
  orientation: 'portrait' as const,
  unit: 'mm' as const,
};

// A4 尺寸 (mm)
export const pageSize = {
  width: 210,
  height: 297,
};
