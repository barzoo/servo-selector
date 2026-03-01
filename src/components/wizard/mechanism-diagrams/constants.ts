/**
 * 机械示意图颜色系统
 * 遵循工业标准视觉语言：
 * - 蓝色：动力源（伺服电机）
 * - 绿色：传动系统
 * - 红色：执行端/负载
 * - 橙色：动力流向指示
 */
export const MECHANISM_COLORS = {
  servo: '#2563EB',        // 蓝色 - 伺服电机
  transmission: '#059669', // 绿色 - 传动机构
  load: '#DC2626',         // 红色 - 负载
  frame: '#374151',        // 深灰 - 结构框架
  guide: '#9CA3AF',        // 浅灰 - 导轨/辅助线
  arrow: '#F59E0B',        // 橙色 - 动力流向箭头
} as const;

/**
 * 标准元素尺寸 (px)
 * 基于 viewBox="0 0 400 200" 的坐标系
 */
export const MECHANISM_DIMENSIONS = {
  servo: { width: 40, height: 50 },
  gearbox: { width: 35, height: 40 },
  screw: { width: 120, height: 8 },
  slider: { width: 50, height: 30 },
  pulley: { diameter: 30 },
  gear: { diameter: 25 },
  arrow: { length: 15, width: 3 },
} as const;

/**
 * 画布配置
 */
export const CANVAS_CONFIG = {
  viewBox: '0 0 400 200',
  width: 400,
  height: 200,
  padding: 20,
} as const;
