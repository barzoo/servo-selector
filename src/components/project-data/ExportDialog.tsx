'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Download, X, FileJson } from 'lucide-react';
import { useProjectData } from './hooks/useProjectData';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExportDialog({ isOpen, onClose }: ExportDialogProps) {
  const t = useTranslations('projectData.export');
  const commonT = useTranslations('common');
  const { exportProject, project, canExport } = useProjectData();
  const [filename, setFilename] = useState('');

  if (!isOpen) return null;

  const defaultFilename = `${project.name || 'project'}_${formatDate(new Date())}.json`;
  const finalFilename = filename.trim() || defaultFilename;

  const handleExport = () => {
    exportProject(finalFilename.endsWith('.json') ? finalFilename : `${finalFilename}.json`);
    onClose();
    setFilename('');
  };

  const axisCount = project.axes.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-md card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--green-500)]/10 flex items-center justify-center">
              <Download className="w-5 h-5 text-[var(--green-400)]" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--foreground)]">
              {t('title')}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--background-tertiary)] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[var(--foreground-muted)]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Project Summary */}
          <div className="p-4 bg-[var(--background-tertiary)] rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-[var(--foreground-secondary)]">
              <FileJson className="w-4 h-4" />
              <span className="text-sm font-medium">{t('projectSummary')}</span>
            </div>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-[var(--foreground-muted)]">{t('projectName')}:</span>
                <span className="text-[var(--foreground)] font-medium">
                  {project.name || t('unnamed')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--foreground-muted)]">{t('axisCount')}:</span>
                <span className="text-[var(--foreground)] font-medium">{axisCount}</span>
              </div>
            </div>
          </div>

          {/* Filename Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--foreground-secondary)]">
              {t('filename')}
            </label>
            <input
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder={defaultFilename}
              className="w-full px-3 py-2 bg-[var(--background-secondary)] border border-[var(--border-default)] rounded-lg text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]"
            />
          </div>

          {!canExport && (
            <div className="p-3 bg-[var(--amber-500)]/10 border border-[var(--amber-500)]/30 rounded-lg text-sm text-[var(--amber-400)]">
              {t('noDataWarning')}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-[var(--border-subtle)]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors"
          >
            {commonT('cancel')}
          </button>
          <button
            onClick={handleExport}
            disabled={!canExport}
            className="px-4 py-2 bg-[var(--green-500)] text-white rounded-lg hover:bg-[var(--green-600)] disabled:bg-[var(--background-tertiary)] disabled:text-[var(--foreground-muted)] disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            {t('exportButton')}
          </button>
        </div>
      </div>
    </div>
  );
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}
