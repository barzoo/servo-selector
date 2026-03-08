'use client';

import { useState } from 'react';
import { useProjectStore } from '@/stores/project-store';
import { ProjectInfo } from '@/types';
import { useTranslations } from 'next-intl';
import { FileText, Building2, User, StickyNote } from 'lucide-react';

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
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Header */}
      <div className="text-center pb-6 border-b border-[var(--border-subtle)]">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--primary-500)]/20 to-[var(--primary-600)]/10 border border-[var(--primary-500)]/30 mb-4">
          <FileText className="w-7 h-7 text-[var(--primary-400)]" />
        </div>
        <h2 className="text-2xl font-bold gradient-text mb-2">编辑项目信息</h2>
        <p className="text-sm text-[var(--foreground-muted)]">
          修改项目基本信息，这些信息将应用于所有轴
        </p>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Project Name */}
        <div className="group">
          <label className="flex items-center gap-2 text-sm font-medium text-[var(--foreground-secondary)] mb-2">
            <FileText className="w-4 h-4 text-[var(--primary-400)]" />
            {t('projectName')}
            <span className="text-[var(--red-400)]">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 bg-[var(--background-tertiary)] border border-[var(--border-default)] rounded-xl text-[var(--foreground)] placeholder-[var(--foreground-muted)] transition-all duration-200 hover:border-[var(--border-hover)] focus:border-[var(--primary-400)] focus:shadow-[0_0_0_3px_rgba(14,165,233,0.15)] outline-none"
            placeholder={t('projectNamePlaceholder')}
          />
          {errors.name && (
            <p className="mt-2 text-sm text-[var(--red-400)] flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-[var(--red-400)]"></span>
              {errors.name}
            </p>
          )}
        </div>

        {/* Customer Name */}
        <div className="group">
          <label className="flex items-center gap-2 text-sm font-medium text-[var(--foreground-secondary)] mb-2">
            <Building2 className="w-4 h-4 text-[var(--primary-400)]" />
            {t('customerName')}
            <span className="text-[var(--red-400)]">*</span>
          </label>
          <input
            type="text"
            value={formData.customer}
            onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
            className="w-full px-4 py-3 bg-[var(--background-tertiary)] border border-[var(--border-default)] rounded-xl text-[var(--foreground)] placeholder-[var(--foreground-muted)] transition-all duration-200 hover:border-[var(--border-hover)] focus:border-[var(--primary-400)] focus:shadow-[0_0_0_3px_rgba(14,165,233,0.15)] outline-none"
            placeholder={t('customerNamePlaceholder')}
          />
          {errors.customer && (
            <p className="mt-2 text-sm text-[var(--red-400)] flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-[var(--red-400)]"></span>
              {errors.customer}
            </p>
          )}
        </div>

        {/* Sales Person */}
        <div className="group">
          <label className="flex items-center gap-2 text-sm font-medium text-[var(--foreground-secondary)] mb-2">
            <User className="w-4 h-4 text-[var(--primary-400)]" />
            {t('salesPerson')}
          </label>
          <input
            type="text"
            value={formData.salesPerson}
            onChange={(e) => setFormData({ ...formData, salesPerson: e.target.value })}
            className="w-full px-4 py-3 bg-[var(--background-tertiary)] border border-[var(--border-default)] rounded-xl text-[var(--foreground)] placeholder-[var(--foreground-muted)] transition-all duration-200 hover:border-[var(--border-hover)] focus:border-[var(--primary-400)] focus:shadow-[0_0_0_3px_rgba(14,165,233,0.15)] outline-none"
            placeholder={t('salesPersonPlaceholder')}
          />
        </div>

        {/* Notes */}
        <div className="sm:col-span-2 group">
          <label className="flex items-center gap-2 text-sm font-medium text-[var(--foreground-secondary)] mb-2">
            <StickyNote className="w-4 h-4 text-[var(--primary-400)]" />
            {t('notes')}
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={4}
            className="w-full px-4 py-3 bg-[var(--background-tertiary)] border border-[var(--border-default)] rounded-xl text-[var(--foreground)] placeholder-[var(--foreground-muted)] transition-all duration-200 hover:border-[var(--border-hover)] focus:border-[var(--primary-400)] focus:shadow-[0_0_0_3px_rgba(14,165,233,0.15)] outline-none resize-none"
            placeholder={t('notesPlaceholder')}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t border-[var(--border-subtle)]">
        <button
          type="button"
          onClick={onComplete}
          className="w-full sm:w-auto px-6 py-3 bg-[var(--background-elevated)] text-[var(--foreground-secondary)] border border-[var(--border-default)] rounded-xl hover:bg-[var(--background-tertiary)] hover:text-[var(--foreground)] hover:border-[var(--border-hover)] transition-all duration-200 font-medium"
        >
          {commonT('cancel')}
        </button>
        <button
          type="submit"
          className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-[var(--primary-500)] to-[var(--primary-600)] text-white rounded-xl hover:from-[var(--primary-400)] hover:to-[var(--primary-500)] hover:shadow-[0_0_20px_rgba(14,165,233,0.3)] transition-all duration-200 font-medium flex items-center justify-center gap-2"
        >
          <span>{commonT('save')}</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </button>
      </div>
    </form>
  );
}
