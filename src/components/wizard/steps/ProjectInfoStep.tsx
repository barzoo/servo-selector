'use client';

import { useWizardStore } from '@/stores/wizard-store';
import { ProjectInfo } from '@/types';
import { useState } from 'react';

export function ProjectInfoStep() {
  const { input, setProjectInfo, nextStep } = useWizardStore();
  const [errors, setErrors] = useState<Partial<Record<keyof ProjectInfo, string>>>({});

  const [formData, setFormData] = useState<ProjectInfo>(
    input.project || {
      name: '',
      customer: '',
      salesPerson: '',
      notes: '',
    }
  );

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ProjectInfo, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = '请输入项目名称';
    }
    if (!formData.customer.trim()) {
      newErrors.customer = '请输入客户名称';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setProjectInfo(formData);
      nextStep();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">项目信息</h2>

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          项目名称 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2 text-gray-900 placeholder-gray-400"
          placeholder="例如：CNC X轴伺服选型"
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="customer" className="block text-sm font-medium text-gray-700">
          客户名称 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="customer"
          value={formData.customer}
          onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2 text-gray-900 placeholder-gray-400"
          placeholder="例如：ABC机械有限公司"
        />
        {errors.customer && <p className="mt-1 text-sm text-red-600">{errors.customer}</p>}
      </div>

      <div>
        <label htmlFor="salesPerson" className="block text-sm font-medium text-gray-700">
          销售人员
        </label>
        <input
          type="text"
          id="salesPerson"
          value={formData.salesPerson}
          onChange={(e) => setFormData({ ...formData, salesPerson: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2 text-gray-900 placeholder-gray-400"
          placeholder="您的姓名"
        />
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          备注
        </label>
        <textarea
          id="notes"
          rows={3}
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2 text-gray-900 placeholder-gray-400"
          placeholder="其他需要说明的信息..."
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          下一步
        </button>
      </div>
    </form>
  );
}
