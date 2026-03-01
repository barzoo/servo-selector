/**
 * 计算详情数值格式化工具函数
 *
 * 论文引用:
 * - 数值格式化遵循 IEEE 754 双精度浮点数标准
 * - 工程数值表示参考 ISO 80000-1 量与单位标准
 *
 * 复杂度分析:
 * - 所有格式化函数时间复杂度: O(1)
 * - 所有格式化函数空间复杂度: O(1)
 */

/**
 * 格式化惯量值
 * 小于 0.001 的使用科学计数法 (×10⁻⁴)
 *
 * @param value - 惯量值，单位 kg·m²
 * @returns 格式化后的字符串
 *
 * 示例:
 * - formatInertia(0.000507) => '5.07×10⁻⁴'
 * - formatInertia(0.015) => '0.0150'
 */
export function formatInertia(value: number): string {
  if (Math.abs(value) > 0 && Math.abs(value) < 0.001) {
    return `${(value * 10000).toFixed(2)}×10⁻⁴`;
  }
  return value.toFixed(4);
}

/**
 * 格式化扭矩值
 * 固定2位小数，正值带+号
 *
 * @param value - 扭矩值，单位 N·m
 * @returns 格式化后的字符串
 *
 * 示例:
 * - formatTorque(4.85) => '+4.85'
 * - formatTorque(-3.29) => '-3.29'
 */
export function formatTorque(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}`;
}

/**
 * 格式化转速
 * 整数显示
 *
 * @param value - 转速值，单位 rpm
 * @returns 格式化后的字符串
 *
 * 示例:
 * - formatSpeed(3000.7) => '3001'
 */
export function formatSpeed(value: number): string {
  return Math.round(value).toString();
}

/**
 * 格式化时间
 * 固定2位小数
 *
 * @param value - 时间值，单位 s
 * @returns 格式化后的字符串
 *
 * 示例:
 * - formatTime(0.1) => '0.10'
 */
export function formatTime(value: number): string {
  return value.toFixed(2);
}

/**
 * 格式化功率
 * 大于等于100取整，否则1位小数
 *
 * @param value - 功率值，单位 W
 * @returns 格式化后的字符串
 *
 * 示例:
 * - formatPower(1520.5) => '1520'
 * - formatPower(50.5) => '50.5'
 */
export function formatPower(value: number): string {
  if (value >= 100) {
    return Math.floor(value).toString();
  }
  return value.toFixed(1);
}

/**
 * 格式化能量
 * 固定1位小数
 *
 * @param value - 能量值，单位 J
 * @returns 格式化后的字符串
 *
 * 示例:
 * - formatEnergy(25.6) => '25.6'
 */
export function formatEnergy(value: number): string {
  return value.toFixed(1);
}
