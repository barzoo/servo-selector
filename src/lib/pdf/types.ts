import type {
  MC20Motor,
  XC20Drive,
  SummaryItem,
  MechanicalResult,
} from '@/types';

export interface ReportProjectInfo {
  name: string;
  customer: string;
  salesPerson?: string;
  date: string;
  notes?: string;
}

export interface ReportCalculationSummary {
  loadInertia: string;
  rmsTorque: string;
  peakTorque: string;
  maxSpeed: string;
  regenPower: string;
  calcTime: string;
}

export interface ReportCableConfig {
  motor: {
    partNumber: string;
    spec: string;
    length: number | string;
  };
  encoder: {
    partNumber: string;
    spec: string;
    length: number | string;
  };
  communication?: {
    partNumber: string;
    length: number | string;
  };
}

export interface ReportAccessories {
  emcFilter?: string;
  brakeResistor?: {
    model: string;
    partNumber: string;
  };
}

export interface ReportData {
  project: ReportProjectInfo;
  calculations: ReportCalculationSummary;
  systemConfig: {
    items: SummaryItem[];
    motor: MC20Motor | null;
    drive: XC20Drive | null;
    cables: ReportCableConfig;
    accessories: ReportAccessories;
  };
  regeneration: MechanicalResult['regeneration'];
  detailedCalculations: {
    input: Record<string, unknown>;
    mechanical: MechanicalResult;
  };
}

export type TranslationFunction = (key: string) => string;

// ============ 多轴报告类型 ============

export interface MultiAxisReportData {
  project: {
    name: string;
    customer: string;
    salesPerson: string;
    date: string;
    notes?: string;
  };
  axes: Array<{
    name: string;
    calculations: {
      loadInertia: string;
      rmsTorque: string;
      peakTorque: string;
      maxSpeed: string;
    };
    motor: {
      model: string;
      partNumber: string;
      ratedTorque: number;
      ratedSpeed: number;
    } | null;
    drive: {
      model: string;
      partNumber: string;
    } | null;
  }>;
  bom: Array<{
    partNumber: string;
    description: string;
    quantity: number;
    usedIn: string[];
  }>;
}
