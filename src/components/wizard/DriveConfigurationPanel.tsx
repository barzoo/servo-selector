'use client';

import type { XC20Drive, MotorSelections } from '@/types';

interface DriveConfigurationPanelProps {
  drive: XC20Drive;
  selectedOptions: MotorSelections['driveOptions'];
  onOptionsChange: (options: MotorSelections['driveOptions']) => void;
}

export function DriveConfigurationPanel({
  drive,
  selectedOptions,
  onOptionsChange,
}: DriveConfigurationPanelProps) {
  return (
    <div className="p-4 bg-gray-50 rounded-lg space-y-4">
      <h4 className="font-medium">驱动器选项 - {drive.baseModel}</h4>

      {/* 通讯协议 */}
      <div className="flex items-center justify-between">
        <span className="font-medium">通讯协议</span>
        <select
          value={selectedOptions.communication}
          onChange={(e) => onOptionsChange({
            ...selectedOptions,
            communication: e.target.value as MotorSelections['driveOptions']['communication']
          })}
          className="px-3 py-1 border rounded"
        >
          <option value="ETHERCAT">EtherCAT</option>
          <option value="PROFINET">PROFINET</option>
          <option value="ETHERNET_IP">Ethernet/IP</option>
          <option value="ANALOG">模拟量</option>
        </select>
      </div>

      {/* 显示面板 */}
      <div className="flex items-center justify-between">
        <span className="font-medium">显示面板</span>
        <div className="flex gap-2">
          <button
            className={`px-3 py-1 rounded ${
              selectedOptions.panel === 'WITH_DISPLAY'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200'
            }`}
            onClick={() => onOptionsChange({
              ...selectedOptions,
              panel: 'WITH_DISPLAY'
            })}
          >
            带显示屏
          </button>
          <button
            className={`px-3 py-1 rounded ${
              selectedOptions.panel === 'WITHOUT_DISPLAY'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200'
            }`}
            onClick={() => onOptionsChange({
              ...selectedOptions,
              panel: 'WITHOUT_DISPLAY'
            })}
          >
            无显示屏
          </button>
        </div>
      </div>

      {/* 安全功能 */}
      <div className="flex items-center justify-between">
        <span className="font-medium">安全功能</span>
        <div className="flex gap-2">
          <button
            className={`px-3 py-1 rounded ${
              selectedOptions.safety === 'STO'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200'
            }`}
            onClick={() => onOptionsChange({
              ...selectedOptions,
              safety: 'STO'
            })}
          >
            STO安全关断
          </button>
          <button
            className={`px-3 py-1 rounded ${
              selectedOptions.safety === 'NONE'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200'
            }`}
            onClick={() => onOptionsChange({
              ...selectedOptions,
              safety: 'NONE'
            })}
          >
            无
          </button>
        </div>
      </div>
    </div>
  );
}
