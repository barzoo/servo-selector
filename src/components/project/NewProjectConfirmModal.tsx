'use client';

import { useTranslations } from 'next-intl';
import { AlertTriangle, X } from 'lucide-react';

interface NewProjectConfirmModalProps {
  isOpen: boolean;
  projectName: string;
  lastUpdated: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function NewProjectConfirmModal({
  isOpen,
  projectName,
  lastUpdated,
  onConfirm,
  onCancel,
}: NewProjectConfirmModalProps) {
  const t = useTranslations('project.confirmNew');
  const commonT = useTranslations('common');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-md bg-white rounded-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {t('title')}
            </h3>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Warning Message */}
          <p className="text-gray-700">
            {t('warningMessage')}
          </p>

          {/* Project Info Card */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">{t('currentProject')}:</span>
                <span className="text-sm font-medium text-gray-900">{projectName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">{t('lastUpdated')}:</span>
                <span className="text-sm text-gray-700">{lastUpdated}</span>
              </div>
            </div>
          </div>

          {/* Unsaved Data Warning */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-700">
              {t('unsavedWarning')}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            {commonT('cancel')}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-white rounded-md hover:opacity-90 transition-colors"
            style={{ backgroundColor: '#00A4E4' }}
          >
            {t('confirmButton')}
          </button>
        </div>
      </div>
    </div>
  );
}
