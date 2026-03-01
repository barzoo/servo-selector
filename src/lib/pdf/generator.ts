import jsPDF from 'jspdf';
import { pageConfig } from './styles';
import type { ReportData, TranslationFunction } from './types';

// Import sections
import { addReportHeader } from './sections/header';
import { addProjectInfoSection } from './sections/project-info';
import { addCalculationSummarySection } from './sections/calculation-summary';
import { addSystemConfigSection } from './sections/system-config';
import { addMotorDetailsSection } from './sections/motor-details';
import { addDriveDetailsSection } from './sections/drive-details';
import { addCableSpecsSection } from './sections/cable-specs';
import { addAccessoriesSection } from './sections/accessories';
import { addRegenerationSection } from './sections/regeneration';
import { addDetailedCalculationsSection } from './sections/detailed-calculations';

export class SizingReportPDFGenerator {
  private doc: jsPDF;
  private t: TranslationFunction;

  constructor(locale: string, translations: Record<string, string>) {
    this.doc = new jsPDF(pageConfig);
    this.t = (key: string) => translations[key] || key;
  }

  generate(data: ReportData): jsPDF {
    // 报告标题
    addReportHeader(
      this.doc,
      this.t,
      data.project.name,
      data.project.date
    );

    // 项目信息
    addProjectInfoSection(this.doc, this.t, data.project);

    // 计算摘要
    addCalculationSummarySection(this.doc, this.t, data.calculations);

    // 系统配置清单
    addSystemConfigSection(this.doc, this.t, data.systemConfig.items);

    // 电机详细参数
    addMotorDetailsSection(this.doc, this.t, data.systemConfig.motor);

    // 驱动器详细参数
    addDriveDetailsSection(this.doc, this.t, data.systemConfig.drive);

    // 电缆规格
    addCableSpecsSection(this.doc, this.t, data.systemConfig.cables);

    // 配件信息
    addAccessoriesSection(this.doc, this.t, data.systemConfig.accessories);

    // 制动能量分析
    if (data.regeneration) {
      addRegenerationSection(this.doc, this.t, data.regeneration);
    }

    // 详细计算过程
    addDetailedCalculationsSection(
      this.doc,
      this.t,
      data.detailedCalculations.input,
      data.detailedCalculations.mechanical
    );

    return this.doc;
  }
}
