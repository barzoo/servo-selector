'use client';

import { useWizardStore } from '@/stores/wizard-store';
import { SystemPreferences } from '@/types';
import { useState } from 'react';

export function SystemConfigStep() {
  const { input, setPreferences, prevStep } = useWizardStore();

  const [formData, setFormData] = useState<SystemPreferences>(
    input.preferences || {
      safetyFactor: 1.5,
      maxInertiaRatio: 10,
      encoderType: 'MULTI_TURN',
      communication: 'ETHERCAT',
      emcFilter: 'NONE',
      cableLength: 5,
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPreferences(formData);
    // TODO: Trigger calculation and show results
    alert('选型参数已保存，计算功能开发中...');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">系统配置</h2>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            安全余量系数
          </label>
          <input
            type="number"
            step="0.1"
            min="1"
            max="3"
            value={formData.safetyFactor}
            onChange={(e) =>
              setFormData({ ...formData, safetyFactor: parseFloat(e.target.value) || 1.5 })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2 text-gray-900"
          />
          <p className="mt-1 text-xs text-gray-500">默认 1.5，推荐范围 1.2-2.0</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            编码器类型
          </label>
          <select
            value={formData.encoderType}
            onChange={(e) =>
              setFormData({ ...formData, encoderType: e.target.value as 'SINGLE_TURN' | 'MULTI_TURN' })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2 text-gray-900"
          >
            <option value="SINGLE_TURN">单圈绝对值</option>
            <option value="MULTI_TURN">多圈绝对值</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            通讯接口
          </label>
          <select
            value={formData.communication}
            onChange={(e) =>
              setFormData({ ...formData, communication: e.target.value as 'ETHERCAT' | 'PROFINET' | 'ETHERNET_IP' | 'ANALOG' })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2 text-gray-900"
          >
            <option value="ETHERCAT">EtherCAT</option>
            <option value="PROFINET">PROFINET</option>
            <option value="ETHERNET_IP">EtherNet-IP</option>
            <option value="ANALOG">模拟量</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            EMC 滤波器
          </label>
          <select
            value={formData.emcFilter}
            onChange={(e) =>
              setFormData({ ...formData, emcFilter: e.target.value as 'NONE' | 'C3' })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2 text-gray-900"
          >
            <option value="NONE">无滤波器</option>
            <option value="C3">C3 等级</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            电缆长度 (m)
          </label>
          <select
            value={formData.cableLength}
            onChange={(e) =>
              setFormData({ ...formData, cableLength: e.target.value === 'TERMINAL_ONLY' ? 'TERMINAL_ONLY' : parseInt(e.target.value) })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2 text-gray-900"
          >
            <option value={3}>3m</option>
            <option value={5}>5m</option>
            <option value={10}>10m</option>
            <option value={15}>15m</option>
            <option value={20}>20m</option>
            <option value="TERMINAL_ONLY">仅端子（自制电缆）</option>
          </select>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={prevStep}
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
        >
          上一步
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          开始选型
        </button>
      </div>
    </form>
  );
}
