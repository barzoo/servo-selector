/**
 * Excel 导出工具函数
 * 将项目数据转换为 Excel 格式
 */

import type { Project, AxisConfig } from '@/types';
import * as XLSX from 'xlsx';

interface ExcelRow {
  '轴名称': string;
  '传动类型': string;
  '负载质量(kg)': string;
  '电机型号': string;
  '驱动器型号': string;
  '电机电缆': string;
  '编码器电缆': string;
  '通讯电缆': string;
  '制动电阻': string;
  '状态': string;
}

/**
 * 获取传动类型中文名称
 */
function getMechanismTypeName(type?: string): string {
  const typeMap: Record<string, string> = {
    'BALL_SCREW': '滚珠丝杠',
    'GEARBOX': '齿轮箱',
    'DIRECT_DRIVE': '直驱',
    'BELT': '皮带',
    'RACK_PINION': '齿条齿轮',
  };
  return type ? typeMap[type] || type : '-';
}

/**
 * 从轴配置中获取负载质量
 */
function getLoadMass(axis: AxisConfig): string {
  const mechanism = axis.input?.mechanism;
  if (!mechanism?.params) return '-';

  const params = mechanism.params as { loadMass?: number };
  return params.loadMass?.toString() || '-';
}

/**
 * 获取电缆长度显示文本
 */
function getCableLength(length: number | string | undefined): string {
  if (length === undefined || length === null) return '-';
  if (typeof length === 'string') return length === 'TERMINAL_ONLY' ? '端子台' : length;
  return `${length}m`;
}

/**
 * 获取电机电缆信息
 */
function getMotorCable(axis: AxisConfig): string {
  const cable = axis.result?.motorRecommendations[0]?.systemConfig?.accessories?.motorCable;
  if (!cable) return '-';
  return getCableLength(cable.length);
}

/**
 * 获取编码器电缆信息
 */
function getEncoderCable(axis: AxisConfig): string {
  const cable = axis.result?.motorRecommendations[0]?.systemConfig?.accessories?.encoderCable;
  if (!cable) return '-';
  return getCableLength(cable.length);
}

/**
 * 获取通讯电缆信息
 */
function getCommCable(axis: AxisConfig): string {
  const cable = axis.result?.motorRecommendations[0]?.systemConfig?.accessories?.commCable;
  if (!cable) return '-';
  return getCableLength(cable.length);
}

/**
 * 检查是否有制动电阻
 */
function hasBrakeResistor(axis: AxisConfig): boolean {
  return !!axis.result?.motorRecommendations[0]?.systemConfig?.accessories?.brakeResistor;
}

/**
 * 将轴数据转换为 Excel 行
 */
function axisToExcelRow(axis: AxisConfig): ExcelRow {
  const recommendation = axis.result?.motorRecommendations[0];
  const motor = recommendation?.motor;
  const drive = recommendation?.systemConfig?.drive;

  return {
    '轴名称': axis.name,
    '传动类型': getMechanismTypeName(axis.input?.mechanism?.type),
    '负载质量(kg)': getLoadMass(axis),
    '电机型号': motor?.model || '-',
    '驱动器型号': drive?.model || '-',
    '电机电缆': getMotorCable(axis),
    '编码器电缆': getEncoderCable(axis),
    '通讯电缆': getCommCable(axis),
    '制动电阻': hasBrakeResistor(axis) ? '有' : '-',
    '状态': axis.status === 'COMPLETED' ? '已完成' : '配置中',
  };
}

/**
 * 生成 BOM 汇总数据
 */
function generateBomData(axes: AxisConfig[]): Array<{
  '序号': number;
  '物料号': string;
  '描述': string;
  '数量': number;
  '使用轴': string;
}> {
  const bomMap = new Map<string, { description: string; quantity: number; usedIn: string[] }>();

  axes.forEach((axis) => {
    if (axis.status !== 'COMPLETED') return;

    const recommendation = axis.result?.motorRecommendations[0];
    if (!recommendation) return;

    // 电机
    const motorPn = recommendation.motor?.model;
    if (motorPn) {
      const existing = bomMap.get(motorPn);
      if (existing) {
        existing.quantity += 1;
        if (!existing.usedIn.includes(axis.name)) {
          existing.usedIn.push(axis.name);
        }
      } else {
        bomMap.set(motorPn, {
          description: recommendation.motor?.baseModel || '伺服电机',
          quantity: 1,
          usedIn: [axis.name],
        });
      }
    }

    // 驱动器
    const drivePn = recommendation.systemConfig?.drive?.model;
    if (drivePn) {
      const existing = bomMap.get(drivePn);
      if (existing) {
        existing.quantity += 1;
        if (!existing.usedIn.includes(axis.name)) {
          existing.usedIn.push(axis.name);
        }
      } else {
        bomMap.set(drivePn, {
          description: recommendation.systemConfig?.drive?.baseModel || '伺服驱动器',
          quantity: 1,
          usedIn: [axis.name],
        });
      }
    }
  });

  return Array.from(bomMap.entries()).map(([partNumber, data], index) => ({
    '序号': index + 1,
    '物料号': partNumber,
    '描述': data.description,
    '数量': data.quantity,
    '使用轴': data.usedIn.join(', '),
  }));
}

/**
 * 生成 Excel 工作簿
 */
export function generateProjectExcel(project: Project): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();

  // 1. 主数据表 - 轴列表
  const completedAxes = project.axes.filter((a) => a.status === 'COMPLETED');
  const axisData = completedAxes.map(axisToExcelRow);

  const ws = XLSX.utils.json_to_sheet(axisData);

  // 设置列宽
  const colWidths = [
    { wch: 12 },  // 轴名称
    { wch: 12 },  // 传动类型
    { wch: 14 },  // 负载质量
    { wch: 20 },  // 电机型号
    { wch: 20 },  // 驱动器型号
    { wch: 12 },  // 电机电缆
    { wch: 12 },  // 编码器电缆
    { wch: 12 },  // 通讯电缆
    { wch: 10 },  // 制动电阻
    { wch: 10 },  // 状态
  ];
  ws['!cols'] = colWidths;

  // 2. 添加空行
  const startRow = axisData.length + 3;

  // 3. 添加项目信息
  XLSX.utils.sheet_add_json(ws, [{ '项目信息': '' }], {
    origin: { r: startRow, c: 0 },
    skipHeader: true,
  });
  XLSX.utils.sheet_add_json(
    ws,
    [
      { '项目': '项目名称', '值': project.name || '未命名项目' },
      { '项目': '客户', '值': project.customer || '-' },
      { '项目': '销售员', '值': project.salesPerson || '-' },
      { '项目': '备注', '值': project.notes || '-' },
    ],
    { origin: { r: startRow + 1, c: 0 }, skipHeader: true }
  );

  // 4. 添加公共参数
  const paramsRow = startRow + 6;
  XLSX.utils.sheet_add_json(ws, [{ '公共参数': '' }], {
    origin: { r: paramsRow, c: 0 },
    skipHeader: true,
  });
  XLSX.utils.sheet_add_json(
    ws,
    [
      { '参数': '环境温度', '值': `${project.commonParams.ambientTemp}°C` },
      { '参数': '防护等级', '值': project.commonParams.ipRating },
      { '参数': '通讯协议', '值': project.commonParams.communication },
      { '参数': '电缆长度', '值': `${project.commonParams.cableLength}m` },
      { '参数': '安全系数', '值': String(project.commonParams.safetyFactor) },
      { '参数': '最大惯量比', '值': `${project.commonParams.maxInertiaRatio}:1` },
    ],
    { origin: { r: paramsRow + 1, c: 0 }, skipHeader: true }
  );

  // 5. 添加 BOM 汇总
  const bomRow = paramsRow + 8;
  XLSX.utils.sheet_add_json(ws, [{ '物料清单汇总': '' }], {
    origin: { r: bomRow, c: 0 },
    skipHeader: true,
  });
  const bomData = generateBomData(project.axes);
  XLSX.utils.sheet_add_json(ws, bomData, {
    origin: { r: bomRow + 1, c: 0 },
  });

  XLSX.utils.book_append_sheet(wb, ws, '选型结果');

  return wb;
}

/**
 * 导出项目为 Excel 文件
 */
export function exportProjectToExcel(project: Project): void {
  const wb = generateProjectExcel(project);

  // 生成文件名
  const dateStr = new Date().toISOString().split('T')[0];
  const projectName = project.name || '未命名项目';
  const fileName = `${projectName}_选型结果_${dateStr}.xlsx`;

  // 下载文件
  XLSX.writeFile(wb, fileName);
}
