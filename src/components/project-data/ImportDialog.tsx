'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Upload, X, FileJson, AlertTriangle, CheckCircle } from 'lucide-react';
import { useProjectData } from './hooks/useProjectData';
import type { ImportValidationResult } from '@/types';

interface ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ImportDialog({ isOpen, onClose }: ImportDialogProps) {
  const t = useTranslations('projectData.import');
  const errorsT = useTranslations('projectData.errors');
  const commonT = useTranslations('common');
  const { validateImportFile, importProject } = useProjectData();

  const [file, setFile] = useState<File | null>(null);
  const [validation, setValidation] = useState<ImportValidationResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  if (!isOpen) return null;

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    const result = await validateImportFile(selectedFile);
    setValidation(result);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/json') {
      handleFileSelect(droppedFile);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleImport = () => {
    if (validation?.data) {
      importProject(validation.data.project);
      onClose();
      resetState();
    }
  };

  const resetState = () => {
    setFile(null);
    setValidation(null);
    setShowConfirm(false);
  };

  const handleClose = () => {
    onClose();
    resetState();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-md card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--primary-500)]/10 flex items-center justify-center">
              <Upload className="w-5 h-5 text-[var(--primary-400)]" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--foreground)]">
              {t('title')}
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-[var(--background-tertiary)] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[var(--foreground-muted)]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {!file ? (
            /* Drop Zone */
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center transition-colors
                ${isDragging
                  ? 'border-[var(--primary-500)] bg-[var(--primary-500)]/5'
                  : 'border-[var(--border-default)] hover:border-[var(--primary-500)]/50'
                }
              `}
            >
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[var(--background-tertiary)] flex items-center justify-center">
                <Upload className="w-6 h-6 text-[var(--primary-400)]" />
              </div>
              <p className="text-[var(--foreground-secondary)] mb-2">
                {t('dragDrop')}
              </p>
              <p className="text-sm text-[var(--foreground-muted)] mb-4">
                {t('or')}
              </p>
              <label className="inline-flex">
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                  className="hidden"
                />
                <span className="px-4 py-2 bg-[var(--primary-500)] text-white rounded-lg hover:bg-[var(--primary-600)] cursor-pointer transition-colors">
                  {t('selectFile')}
                </span>
              </label>
            </div>
          ) : (
            /* File Preview */
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-[var(--background-tertiary)] rounded-lg">
                <FileJson className="w-8 h-8 text-[var(--primary-400)]" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--foreground)] truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-[var(--foreground-muted)]">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <button
                  onClick={() => {
                    setFile(null);
                    setValidation(null);
                  }}
                  className="p-1 hover:bg-[var(--background-secondary)] rounded transition-colors"
                >
                  <X className="w-4 h-4 text-[var(--foreground-muted)]" />
                </button>
              </div>

              {validation && (
                <div className={`
                  p-4 rounded-lg
                  ${validation.valid
                    ? 'bg-[var(--green-500)]/10 border border-[var(--green-500)]/30'
                    : 'bg-[var(--red-500)]/10 border border-[var(--red-500)]/30'
                  }
                `}>
                  <div className="flex items-start gap-3">
                    {validation.valid ? (
                      <CheckCircle className="w-5 h-5 text-[var(--green-400)] flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-[var(--red-400)] flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      {validation.valid ? (
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-[var(--green-400)]">
                            {t('validation.valid')}
                          </p>
                          {validation.data && (
                            <div className="text-sm space-y-1">
                              <div className="flex justify-between">
                                <span className="text-[var(--foreground-muted)]">{t('projectName')}:</span>
                                <span className="text-[var(--foreground)]">
                                  {validation.data.project.name || t('unnamed')}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-[var(--foreground-muted)]">{t('axisCount')}:</span>
                                <span className="text-[var(--foreground)]">
                                  {validation.data.project.axes.length}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-[var(--foreground-muted)]">{t('exportedAt')}:</span>
                                <span className="text-[var(--foreground)]">
                                  {new Date(validation.data.exportedAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-[var(--red-400)]">
                          {errorsT(validation.error || 'corruptedData')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {validation?.valid && !showConfirm && (
                <div className="p-3 bg-[var(--amber-500)]/10 border border-[var(--amber-500)]/30 rounded-lg">
                  <p className="text-sm text-[var(--amber-400)]">
                    {t('warning')}
                  </p>
                </div>
              )}

              {showConfirm && (
                <div className="p-4 bg-[var(--red-500)]/10 border border-[var(--red-500)]/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-[var(--red-400)] flex-shrink-0" />
                    <div>
                      <p className="font-medium text-[var(--red-400)] mb-1">
                        {t('confirmTitle')}
                      </p>
                      <p className="text-sm text-[var(--red-300)]">
                        {t('confirmMessage')}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-[var(--border-subtle)]">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors"
          >
            {commonT('cancel')}
          </button>

          {file && validation?.valid && !showConfirm && (
            <button
              onClick={() => setShowConfirm(true)}
              className="px-4 py-2 bg-[var(--primary-500)] text-white rounded-lg hover:bg-[var(--primary-600)] transition-colors"
            >
              {t('nextButton')}
            </button>
          )}

          {showConfirm && (
            <button
              onClick={handleImport}
              className="px-4 py-2 bg-[var(--red-500)] text-white rounded-lg hover:bg-[var(--red-600)] transition-colors flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              {t('importButton')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
