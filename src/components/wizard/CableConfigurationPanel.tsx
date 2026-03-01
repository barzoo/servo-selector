'use client';

import type { MotorSelections, MC20Motor } from '@/types';

interface CableConfigurationPanelProps {
  motor: MC20Motor;
  selectedOptions: MotorSelections['motorOptions'];
  cableLengths: MotorSelections['cables'];
  onCablesChange: (cables: MotorSelections['cables']) => void;
  communicationType: string;
}

const LENGTH_OPTIONS: Array<3 | 5 | 10 | 15 | 20 | 25 | 30> = [3, 5, 10, 15, 20, 25, 30];

export function CableConfigurationPanel({
  motor,
  selectedOptions,
  cableLengths,
  onCablesChange,
  communicationType,
}: CableConfigurationPanelProps) {
  const motorCableSpec = motor.cableSpecs.motorCable;
  const encoderCableSpec = selectedOptions.encoderType === 'B'
    ? 'MCE02'
    : 'MCE12';

  return (
    <div className="p-4 bg-gray-50 rounded-lg space-y-4">
      <h4 className="font-medium">电缆配置</h4>

      {/* 动力电缆 */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="font-medium">动力电缆</span>
          <span className="text-sm text-gray-500">{motorCableSpec}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {LENGTH_OPTIONS.map((len) => (
            <button
              key={len}
              className={`px-3 py-1 rounded text-sm ${
                cableLengths.motorLength === len
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200'
              }`}
              onClick={() => onCablesChange({ ...cableLengths, motorLength: len })}
            >
              {len}m
            </button>
          ))}
        </div>
      </div>

      {/* 编码器电缆 */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="font-medium">编码器电缆</span>
          <span className="text-sm text-gray-500">{encoderCableSpec}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {LENGTH_OPTIONS.map((len) => (
            <button
              key={len}
              className={`px-3 py-1 rounded text-sm ${
                cableLengths.encoderLength === len
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200'
              }`}
              onClick={() => onCablesChange({ ...cableLengths, encoderLength: len })}
            >
              {len}m
            </button>
          ))}
        </div>
      </div>

      {/* 通讯电缆（非模拟量时） */}
      {communicationType !== 'ANALOG' && (
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="font-medium">通讯电缆</span>
            <span className="text-sm text-gray-500">{communicationType}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {LENGTH_OPTIONS.map((len) => (
              <button
                key={len}
                className={`px-3 py-1 rounded text-sm ${
                  cableLengths.commLength === len
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200'
                }`}
                onClick={() => onCablesChange({ ...cableLengths, commLength: len })}
              >
                {len}m
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
