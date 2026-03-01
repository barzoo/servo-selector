'use client';

import React from 'react';
import type {
  SystemConfiguration,
  MechanicalResult,
  MC20Motor,
  XC20Drive,
  SummaryItem,
  SystemConfigExportData,
} from '@/types';
import motorsData from '@/data/motors.json';
import drivesData from '@/data/drives.json';

// Extract motors and drives arrays from the JSON data
const motors: MC20Motor[] = (motorsData as { motors: MC20Motor[] }).motors;
const drives: XC20Drive[] = (drivesData as { drives: XC20Drive[] }).drives;

interface SystemSummaryProps {
  config: SystemConfiguration;
  mechanical?: MechanicalResult;
}

/**
 * Find motor by part number from motors.json
 * Time Complexity: O(n) where n is the number of motors
 * Space Complexity: O(1)
 */
export function findMotor(partNumber: string): MC20Motor | undefined {
  return motors.find((m) => m.model === partNumber);
}

/**
 * Find drive by part number from drives.json
 * Time Complexity: O(n) where n is the number of drives
 * Space Complexity: O(1)
 */
export function findDrive(partNumber: string): XC20Drive | undefined {
  return drives.find((d) => d.model === partNumber);
}

/**
 * Generate cable description based on type, length, and spec
 * Time Complexity: O(1)
 * Space Complexity: O(1)
 */
export function getCableDescription(
  type: 'MOTOR' | 'ENCODER' | 'COMMUNICATION',
  length: number | 'TERMINAL_ONLY',
  spec: string
): string {
  if (length === 'TERMINAL_ONLY') {
    return `${spec} - 仅接线端子`;
  }

  const typeLabels: Record<string, string> = {
    MOTOR: '动力电缆',
    ENCODER: '编码器电缆',
    COMMUNICATION: '通讯电缆',
  };

  return `${typeLabels[type] || type} - ${spec}, ${length}米`;
}

/**
 * Build array of SummaryItem from configuration
 * Time Complexity: O(1) - fixed number of items
 * Space Complexity: O(1) - fixed size array
 */
export function buildSummaryItems(config: SystemConfiguration): SummaryItem[] {
  const items: SummaryItem[] = [];

  // Motor
  items.push({
    partNumber: config.motor.partNumber,
    category: 'MOTOR',
    typeLabel: '伺服电机',
    description: findMotor(config.motor.partNumber)?.description.short || '',
  });

  // Drive
  items.push({
    partNumber: config.drive.partNumber,
    category: 'DRIVE',
    typeLabel: '伺服驱动器',
    description: findDrive(config.drive.partNumber)?.description.short || '',
  });

  // Motor cable
  items.push({
    partNumber: config.cables.motor.partNumber,
    category: 'MOTOR_CABLE',
    typeLabel: '动力电缆',
    description: getCableDescription(
      'MOTOR',
      config.cables.motor.length,
      config.cables.motor.spec
    ),
  });

  // Encoder cable
  items.push({
    partNumber: config.cables.encoder.partNumber,
    category: 'ENCODER_CABLE',
    typeLabel: '编码器电缆',
    description: getCableDescription(
      'ENCODER',
      config.cables.encoder.length,
      config.cables.encoder.spec
    ),
  });

  // Communication cable (optional)
  if (config.cables.communication) {
    items.push({
      partNumber: config.cables.communication.partNumber,
      category: 'COMM_CABLE',
      typeLabel: '通讯电缆',
      description: getCableDescription(
        'COMMUNICATION',
        config.cables.communication.length,
        '通讯线'
      ),
    });
  }

  // EMC Filter (optional)
  if (config.accessories.emcFilter) {
    items.push({
      partNumber: config.accessories.emcFilter,
      category: 'EMC_FILTER',
      typeLabel: 'EMC滤波器',
      description: 'EMC滤波器',
    });
  }

  // Brake Resistor (optional)
  if (config.accessories.brakeResistor) {
    items.push({
      partNumber: config.accessories.brakeResistor.partNumber,
      category: 'BRAKE_RESISTOR',
      typeLabel: '制动电阻',
      description: `外部制动电阻 - ${config.accessories.brakeResistor.model}`,
    });
  }

  return items;
}

/**
 * Generate export data structure for system configuration
 * Time Complexity: O(n + m) where n is motors count, m is drives count
 * Space Complexity: O(1) - returns fixed size object
 */
export function generateExportData(
  config: SystemConfiguration,
  mechanical?: MechanicalResult
): SystemConfigExportData {
  const motor = findMotor(config.motor.partNumber) || null;
  const drive = findDrive(config.drive.partNumber) || null;

  return {
    summary: buildSummaryItems(config),
    details: {
      motor,
      drive,
      cables: {
        motor: {
          model: config.cables.motor.spec,
          length: config.cables.motor.length,
          description: getCableDescription(
            'MOTOR',
            config.cables.motor.length,
            config.cables.motor.spec
          ),
        },
        encoder: {
          model: config.cables.encoder.spec,
          length: config.cables.encoder.length,
          description: getCableDescription(
            'ENCODER',
            config.cables.encoder.length,
            config.cables.encoder.spec
          ),
        },
        communication: config.cables.communication
          ? {
              length: config.cables.communication.length,
              description: getCableDescription(
                'COMMUNICATION',
                config.cables.communication.length,
                '通讯线'
              ),
            }
          : null,
      },
      accessories: {
        brakeResistor: config.accessories.brakeResistor || null,
        emcFilter: config.accessories.emcFilter || null,
      },
    },
    calculations: mechanical,
  };
}

export function SystemSummary({ config, mechanical }: SystemSummaryProps) {
  const summaryItems = buildSummaryItems(config);
  const motor = findMotor(config.motor.partNumber);
  const drive = findDrive(config.drive.partNumber);

  return (
    <div className="space-y-6">
      {/* Summary Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h4 className="font-semibold text-gray-900">系统配置清单</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-700">订货号</th>
                <th className="px-4 py-2 text-left font-medium text-gray-700">类型</th>
                <th className="px-4 py-2 text-left font-medium text-gray-700">描述</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {summaryItems.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-900">
                    {item.partNumber}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{item.typeLabel}</td>
                  <td className="px-4 py-3 text-gray-600">{item.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Motor Details */}
      {motor && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-blue-50 border-b border-blue-100">
            <h4 className="font-semibold text-blue-900">电机详细参数</h4>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500 block">额定功率</span>
                <span className="font-medium text-gray-900">{motor.ratedPower} W</span>
              </div>
              <div>
                <span className="text-gray-500 block">额定转速</span>
                <span className="font-medium text-gray-900">{motor.ratedSpeed} rpm</span>
              </div>
              <div>
                <span className="text-gray-500 block">额定扭矩</span>
                <span className="font-medium text-gray-900">{motor.ratedTorque} N·m</span>
              </div>
              <div>
                <span className="text-gray-500 block">峰值扭矩</span>
                <span className="font-medium text-gray-900">{motor.peakTorque} N·m</span>
              </div>
              <div>
                <span className="text-gray-500 block">最大转速</span>
                <span className="font-medium text-gray-900">{motor.maxSpeed} rpm</span>
              </div>
              <div>
                <span className="text-gray-500 block">额定电流</span>
                <span className="font-medium text-gray-900">{motor.ratedCurrent} A</span>
              </div>
              <div>
                <span className="text-gray-500 block">转子惯量</span>
                <span className="font-medium text-gray-900">
                  {motor.rotorInertia.toExponential(5)} kg·m²
                </span>
              </div>
              <div>
                <span className="text-gray-500 block">扭矩常数</span>
                <span className="font-medium text-gray-900">{motor.torqueConstant} N·m/A</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <h5 className="text-sm font-medium text-gray-700 mb-2">电机选项</h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 block">编码器类型</span>
                  <span className="font-medium text-gray-900">
                    {motor.options.encoder.type === 'BATTERY_MULTI_TURN'
                      ? '电池多圈'
                      : '机械多圈'}
                    ({motor.options.encoder.code}型)
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block">抱闸</span>
                  <span className="font-medium text-gray-900">
                    {motor.options.brake.hasBrake ? '有' : '无'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block">轴类型</span>
                  <span className="font-medium text-gray-900">
                    {motor.options.keyShaft.hasKey ? '带键槽' : '光轴'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block">防护等级</span>
                  <span className="font-medium text-gray-900">{motor.options.protection.level}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Drive Details */}
      {drive && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-green-50 border-b border-green-100">
            <h4 className="font-semibold text-green-900">驱动详细参数</h4>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500 block">最大电流</span>
                <span className="font-medium text-gray-900">{drive.maxCurrent} A</span>
              </div>
              <div>
                <span className="text-gray-500 block">额定电流</span>
                <span className="font-medium text-gray-900">{drive.ratedCurrent} A</span>
              </div>
              <div>
                <span className="text-gray-500 block">过载能力</span>
                <span className="font-medium text-gray-900">{drive.overloadCapacity} 倍</span>
              </div>
              <div>
                <span className="text-gray-500 block">PWM频率</span>
                <span className="font-medium text-gray-900">{drive.ratedPwmFrequency} kHz</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <h5 className="text-sm font-medium text-gray-700 mb-2">驱动选项</h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 block">通讯协议</span>
                  <span className="font-medium text-gray-900">
                    {drive.communication.type === 'ETHERCAT'
                      ? 'EtherCAT'
                      : drive.communication.type === 'PROFINET'
                        ? 'PROFINET'
                        : 'EtherNet/IP'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block">面板</span>
                  <span className="font-medium text-gray-900">
                    {drive.options.panel.code === '01B' ? '带显示' : '无显示'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block">安全功能</span>
                  <span className="font-medium text-gray-900">
                    {drive.options.safety.code === 'ST' ? 'STO' : '无'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block">散热</span>
                  <span className="font-medium text-gray-900">{drive.hasFan ? '风扇' : '自然冷却'}</span>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <h5 className="text-sm font-medium text-gray-700 mb-2">制动能力</h5>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 block">内置电阻</span>
                  <span className="font-medium text-gray-900">{drive.braking.internalResistance} Ω</span>
                </div>
                <div>
                  <span className="text-gray-500 block">连续功率</span>
                  <span className="font-medium text-gray-900">{drive.braking.continuousPower} W</span>
                </div>
                <div>
                  <span className="text-gray-500 block">峰值功率</span>
                  <span className="font-medium text-gray-900">{drive.braking.peakPower} W</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cable Specifications */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 bg-purple-50 border-b border-purple-100">
          <h4 className="font-semibold text-purple-900">电缆规格</h4>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <h5 className="text-sm font-medium text-gray-700 mb-2">动力电缆</h5>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500">订货号:</span>
                  <span className="font-mono text-xs">{config.cables.motor.partNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">规格:</span>
                  <span>{config.cables.motor.spec}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">长度:</span>
                  <span>{config.cables.motor.length} 米</span>
                </div>
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <h5 className="text-sm font-medium text-gray-700 mb-2">编码器电缆</h5>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500">订货号:</span>
                  <span className="font-mono text-xs">{config.cables.encoder.partNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">规格:</span>
                  <span>{config.cables.encoder.spec}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">长度:</span>
                  <span>{config.cables.encoder.length} 米</span>
                </div>
              </div>
            </div>
            {config.cables.communication && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <h5 className="text-sm font-medium text-gray-700 mb-2">通讯电缆</h5>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-500">订货号:</span>
                    <span className="font-mono text-xs">
                      {config.cables.communication.partNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">长度:</span>
                    <span>{config.cables.communication.length} 米</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Accessories */}
      {(config.accessories.emcFilter || config.accessories.brakeResistor) && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-orange-50 border-b border-orange-100">
            <h4 className="font-semibold text-orange-900">配件信息</h4>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {config.accessories.emcFilter && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">EMC滤波器</h5>
                  <div className="text-sm">
                    <span className="text-gray-500">订货号: </span>
                    <span className="font-mono text-xs">{config.accessories.emcFilter}</span>
                  </div>
                </div>
              )}
              {config.accessories.brakeResistor && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">制动电阻</h5>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-500">型号:</span>
                      <span>{config.accessories.brakeResistor.model}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">订货号:</span>
                      <span className="font-mono text-xs">
                        {config.accessories.brakeResistor.partNumber}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Regeneration Info */}
      {mechanical?.regeneration && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-red-50 border-b border-red-100">
            <h4 className="font-semibold text-red-900">制动能量分析</h4>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500 block">单次制动能量</span>
                <span className="font-medium text-gray-900">
                  {mechanical.regeneration.energyPerCycle.toFixed(1)} J
                </span>
              </div>
              <div>
                <span className="text-gray-500 block">平均制动功率</span>
                <span className="font-medium text-gray-900">
                  {mechanical.regeneration.brakingPower.toFixed(1)} W
                </span>
              </div>
              <div>
                <span className="text-gray-500 block">需要外部电阻</span>
                <span
                  className={`font-medium ${
                    mechanical.regeneration.requiresExternalResistor
                      ? 'text-red-600'
                      : 'text-green-600'
                  }`}
                >
                  {mechanical.regeneration.requiresExternalResistor ? '是' : '否'}
                </span>
              </div>
              {mechanical.regeneration.recommendedResistor && (
                <div>
                  <span className="text-gray-500 block">推荐电阻功率</span>
                  <span className="font-medium text-gray-900">
                    {mechanical.regeneration.recommendedResistor.minPower.toFixed(0)} W
                  </span>
                </div>
              )}
            </div>
            {mechanical.regeneration.warning && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                {mechanical.regeneration.warning}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
