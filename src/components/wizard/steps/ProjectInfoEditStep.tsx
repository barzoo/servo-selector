'use client';

import { useState } from 'react';
import { useProjectStore } from '@/stores/project-store';
import { ProjectInfo } from '@/types';
import { useTranslations } from 'next-intl';

interface ProjectInfoEditStepProps {
  onComplete?: () => void;
}

export function ProjectInfoEditStep({ onComplete }: ProjectInfoEditStepProps) {
  const { project, updateProjectInfo } = useProjectStore();
  const t = useTranslations('projectInfo');
  const commonT = useTranslations('common');

  const [formData, setFormData] = useState<ProjectInfo>({
    name: project.name,
    customer: project.customer,
    salesPerson: project.salesPerson || '',
    notes: project.notes || '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ProjectInfo, string>>>({});

  const validate = () => {
    const newErrors: Partial<Record<keyof ProjectInfo, string>> = {};
    if (!formData.name.trim()) {
      newErrors.name = t('errors.projectNameRequired');
    }
    if (!formData.customer.trim()) {
      newErrors.customer = t('errors.customerNameRequired');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      updateProjectInfo(formData);
      onComplete?.();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">编辑项目信息</h2>
        <p className="mt-2 text-sm text-gray-500">
          修改项目基本信息，这些信息将应用于所有轴
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('projectName')} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2 text-gray-900 bg-white"
            placeholder={t('projectNamePlaceholder')}
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('customerName')} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.customer}
            onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2 text-gray-900 bg-white"
            placeholder={t('customerNamePlaceholder')}
          />
          {errors.customer && <p className="mt-1 text-sm text-red-600">{errors.customer}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('salesPerson')}
          </label>
          <input
            type="text"
            value={formData.salesPerson}
            onChange={(e) => setFormData({ ...formData, salesPerson: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2 text-gray-900 bg-white"
            placeholder={t('salesPersonPlaceholder')}
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            {t('notes')}
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2 text-gray-900 bg-white"
            placeholder={t('notesPlaceholder')}
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-3">
        <button
          type="button"
          onClick={onComplete}
          className="w-full sm:w-auto px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
        >
          {commonT('cancel')}
        </button>
        <button
          type="submit"
          className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          {commonT('save')}
        </button>
      </div>
    </form>
  );
}
