'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { FolderPlus } from 'lucide-react';
import { ProjectInfo } from '@/types';

interface NewProjectFormModalProps {
  isOpen: boolean;
  onSubmit: (info: ProjectInfo) => void;
  onCancel: () => void;
}

export function NewProjectFormModal({ isOpen, onSubmit, onCancel }: NewProjectFormModalProps) {
  const t = useTranslations('project.form');
  const tCommon = useTranslations('common');

  const [formData, setFormData] = useState<ProjectInfo>({
    name: '',
    customer: '',
    salesPerson: '',
    notes: '',
  });

  const [errors, setErrors] = useState<{
    name?: string;
  }>({});

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        customer: '',
        salesPerson: '',
        notes: '',
      });
      setErrors({});
    }
  }, [isOpen]);

  const validateForm = (): boolean => {
    const newErrors: { name?: string } = {};

    if (!formData.name || formData.name.trim() === '') {
      newErrors.name = t('errors.nameRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit({
        ...formData,
        name: formData.name.trim() || t('defaultName'),
      });
    }
  };

  const handleChange = (field: keyof ProjectInfo, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (field === 'name' && errors.name) {
      setErrors((prev) => ({ ...prev, name: undefined }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
        {/* Header */}
        <div className="flex items-center gap-3 p-6 border-b">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FolderPlus className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{t('title')}</h2>
            <p className="text-sm text-gray-500">{t('subtitle')}</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Project Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('projectName')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder={t('projectNamePlaceholder')}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              autoFocus
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Customer Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('customerName')}
            </label>
            <input
              type="text"
              value={formData.customer}
              onChange={(e) => handleChange('customer', e.target.value)}
              placeholder={t('customerNamePlaceholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
            />
          </div>

          {/* Sales Person */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('salesPerson')}
            </label>
            <input
              type="text"
              value={formData.salesPerson}
              onChange={(e) => handleChange('salesPerson', e.target.value)}
              placeholder={t('salesPersonPlaceholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('notes')}
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder={t('notesPlaceholder')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white resize-none"
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              {tCommon('cancel')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              {tCommon('create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
