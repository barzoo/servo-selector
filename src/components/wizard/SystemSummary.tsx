'use client';

import type { SystemConfiguration, MechanicalResult } from '@/types';

interface SystemSummaryProps {
  config: SystemConfiguration;
  mechanical?: MechanicalResult;
}

export function SystemSummary({ config, mechanical }: SystemSummaryProps) {
  return (
    <div className="p-4 bg-blue-50 rounded-lg space-y-3">
      <h4 className="font-medium text-blue-900">完整配置清单</h4>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>电机:</span>
          <span className="font-mono">{config.motor.partNumber}</span>
        </div>
        <div className="flex justify-between">
          <span>驱动器:</span>
          <span className="font-mono">{config.drive.partNumber}</span>
        </div>
        <div className="flex justify-between">
          <span>动力电缆:</span>
          <span className="font-mono">{config.cables.motor.partNumber}</span>
        </div>
        <div className="flex justify-between">
          <span>编码器电缆:</span>
          <span className="font-mono">{config.cables.encoder.partNumber}</span>
        </div>
        {config.cables.communication && (
          <div className="flex justify-between">
            <span>通讯电缆:</span>
            <span className="font-mono">{config.cables.communication.partNumber}</span>
          </div>
        )}
        {config.accessories.emcFilter && (
          <div className="flex justify-between">
            <span>EMC滤波器:</span>
            <span className="font-mono">{config.accessories.emcFilter}</span>
          </div>
        )}
        {config.accessories.brakeResistor && (
          <div className="flex justify-between">
            <span>制动电阻:</span>
            <span className="font-mono">{config.accessories.brakeResistor.partNumber}</span>
          </div>
        )}
      </div>

      {mechanical?.regeneration && (
        <div className="border-t pt-4 mt-4">
          <h4 className="font-semibold text-gray-900 mb-2">制动能量分析</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-600">单次制动能量:</span>
              <span className="ml-2 font-medium">
                {mechanical.regeneration.energyPerCycle.toFixed(1)} J
              </span>
            </div>
            <div>
              <span className="text-gray-600">平均制动功率:</span>
              <span className="ml-2 font-medium">
                {mechanical.regeneration.brakingPower.toFixed(1)} W
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
