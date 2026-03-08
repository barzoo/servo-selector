# 项目数据导出/导入功能实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 实现 JSON 格式的项目数据导出/导入功能，包括顶部工具栏菜单、导出/导入对话框、数据验证和 i18n 支持。

**Architecture:** 在 `components/project-data/` 目录下创建专用组件，使用自定义 hook 处理导出/导入逻辑，通过下拉菜单集成到顶部工具栏，与现有 Zustand store 和 next-intl 集成。

**Tech Stack:** Next.js 14 + TypeScript + TailwindCSS + Zustand + next-intl + Lucide React

---

## 前置检查

### Task 0: 检查现有代码结构

**Files:**
- Read: `src/app/page.tsx` (查看顶部工具栏结构)
- Read: `src/stores/project-store.ts` (查看 Project 类型)
- Read: `src/types/index.ts` (查看类型定义)
- Read: `src/i18n/messages/zh.json` 和 `src/i18n/messages/en.json` (查看 i18n 结构)

**Step 1: 确认页面结构**

```bash
cat src/app/page.tsx | head -100
```

**确认:** 顶部工具栏位置（LanguageSwitcher 旁边）

**Step 2: 确认 store 结构**

```bash
grep -n "interface ProjectStore" src/stores/project-store.ts -A 30
```

**确认:** 可以获取 project 状态

**Step 3: Commit**

```bash
git add -A
git commit -m "chore: check existing code structure for export/import feature"
```

---

## 类型定义

### Task 1: 添加导出数据类型

**Files:**
- Modify: `src/types/index.ts` (末尾添加)

**Step 1: 添加 ProjectExportData 类型**

在 `src/types/index.ts` 文件末尾添加：

```typescript
// ============ 项目数据导出 ============

export interface ProjectExportData {
  version: string;
  exportedAt: string;
  project: Project;
}

export interface ImportValidationResult {
  valid: boolean;
  error?: string;
  data?: ProjectExportData;
}
```

**Step 2: Commit**

```bash
git add src/types/index.ts
git commit -m "types: add ProjectExportData and ImportValidationResult types"
```

---

## 核心 Hook

### Task 2: 创建 useProjectData Hook

**Files:**
- Create: `src/components/project-data/hooks/useProjectData.ts`

**Step 1: 创建 hook 文件**

```typescript
'use client';

import { useCallback } from 'react';
import { useProjectStore } from '@/stores/project-store';
import type { Project, ProjectExportData, ImportValidationResult } from '@/types';

const EXPORT_VERSION = '1.0';

export function useProjectData() {
  const project = useProjectStore((state) => state.project);
  const reset = useProjectStore((state) => state.reset);

  const exportProject = useCallback((filename?: string): void => {
    const exportData: ProjectExportData = {
      version: EXPORT_VERSION,
      exportedAt: new Date().toISOString(),
      project,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    const defaultName = `${project.name || 'project'}_${formatDate(new Date())}.json`;
    link.download = filename || defaultName;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [project]);

  const validateImportFile = useCallback(async (file: File): Promise<ImportValidationResult> => {
    try {
      const text = await file.text();
      let data: unknown;

      try {
        data = JSON.parse(text);
      } catch {
        return { valid: false, error: 'invalidJson' };
      }

      const exportData = data as ProjectExportData;

      // 检查必需字段
      if (!exportData.version || !exportData.exportedAt || !exportData.project) {
        return { valid: false, error: 'missingFields' };
      }

      // 版本检查
      if (!isVersionCompatible(exportData.version)) {
        return { valid: false, error: 'unsupportedVersion' };
      }

      // 检查项目数据结构
      if (!isValidProject(exportData.project)) {
        return { valid: false, error: 'corruptedData' };
      }

      return { valid: true, data: exportData };
    } catch {
      return { valid: false, error: 'corruptedData' };
    }
  }, []);

  const importProject = useCallback((projectData: Project): void => {
    useProjectStore.setState({
      project: projectData,
      currentAxisId: projectData.axes[0]?.id || '',
      currentStep: 1,
      isComplete: false,
      input: {},
      result: undefined,
    });
  }, []);

  const canExport = project.axes.length > 0;

  return {
    exportProject,
    validateImportFile,
    importProject,
    canExport,
    project,
  };
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function isVersionCompatible(version: string): boolean {
  const [major] = version.split('.');
  const [currentMajor] = EXPORT_VERSION.split('.');
  return major === currentMajor;
}

function isValidProject(project: unknown): project is Project {
  const p = project as Partial<Project>;
  return !!(
    p.id &&
    typeof p.name === 'string' &&
    Array.isArray(p.axes) &&
    p.commonParams &&
    p.createdAt
  );
}
```

**Step 2: Commit**

```bash
git add src/components/project-data/hooks/useProjectData.ts
git commit -m "feat: add useProjectData hook for export/import logic"
```

---

## UI 组件

### Task 3: 创建导出对话框组件

**Files:**
- Create: `src/components/project-data/ExportDialog.tsx`

**Step 1: 创建组件文件**

```typescript
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
```

**Step 2: Commit**

```bash
git add src/components/project-data/ExportDialog.tsx
git commit -m "feat: add ExportDialog component"
```

### Task 4: 创建导入对话框组件

**Files:**
- Create: `src/components/project-data/ImportDialog.tsx`

**Step 1: 创建组件文件**

```typescript
'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Upload, X, FileJson, AlertTriangle, CheckCircle } from 'lucide-react';
import { useProjectData } from './hooks/useProjectData';
import type { ProjectExportData, ImportValidationResult } from '@/types';

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
```

**Step 2: Commit**

```bash
git add src/components/project-data/ImportDialog.tsx
git commit -m "feat: add ImportDialog component with drag-drop and validation"
```

### Task 5: 创建项目数据菜单组件

**Files:**
- Create: `src/components/project-data/ProjectDataMenu.tsx`

**Step 1: 创建组件文件**

```typescript
'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Settings, Download, Upload, FileText, ChevronDown } from 'lucide-react';
import { ExportDialog } from './ExportDialog';
import { ImportDialog } from './ImportDialog';
import { useProjectStore } from '@/stores/project-store';

export function ProjectDataMenu() {
  const t = useTranslations('projectData.menu');
  const [isOpen, setIsOpen] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const canExportPdf = useProjectStore((state) => state.canExportPdf);
  const project = useProjectStore((state) => state.project);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleExportClick = () => {
    setIsOpen(false);
    setShowExportDialog(true);
  };

  const handleImportClick = () => {
    setIsOpen(false);
    setShowImportDialog(true);
  };

  const handleExportPdfClick = () => {
    setIsOpen(false);
    // 触发现有的 PDF 导出
    const pdfButton = document.querySelector('[data-pdf-export-trigger]') as HTMLButtonElement;
    pdfButton?.click();
  };

  const completedCount = project.axes.filter((a) => a.status === 'COMPLETED').length;

  return (
    <>
      <div className="relative" ref={menuRef}>
        <button
          ref={buttonRef}
          onClick={() => setIsOpen(!isOpen)}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-lg transition-all
            ${isOpen
              ? 'bg-[var(--primary-500)]/10 text-[var(--primary-400)]'
              : 'text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--background-tertiary)]'
            }
          `}
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <Settings className="w-4 h-4" />
          <span className="hidden sm:inline text-sm font-medium">{t('title')}</span>
          <ChevronDown className={`
            w-4 h-4 transition-transform
            ${isOpen ? 'rotate-180' : ''}
          `} />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-56 card shadow-2xl border border-[var(--border-default)] py-1 z-50">
            <MenuItem
              icon={<Download className="w-4 h-4" />}
              label={t('exportProject')}
              onClick={handleExportClick}
            />
            <MenuItem
              icon={<Upload className="w-4 h-4" />}
              label={t('importProject')}
              onClick={handleImportClick}
            />
            <div className="my-1 border-t border-[var(--border-subtle)]" />
            <MenuItem
              icon={<FileText className="w-4 h-4" />}
              label={t('exportPdf')}
              onClick={handleExportPdfClick}
              disabled={completedCount === 0}
              hint={completedCount === 0 ? t('noCompletedAxes') : undefined}
            />
          </div>
        )}
      </div>

      <ExportDialog
        isOpen={showExportDialog}
        onClose={() => setShowExportDialog(false)}
      />
      <ImportDialog
        isOpen={showImportDialog}
        onClose={() => setShowImportDialog(false)}
      />
    </>
  );
}

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  hint?: string;
}

function MenuItem({ icon, label, onClick, disabled, hint }: MenuItemProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full px-4 py-2.5 text-left flex items-center gap-3 transition-colors
        ${disabled
          ? 'opacity-50 cursor-not-allowed text-[var(--foreground-muted)]'
          : 'hover:bg-[var(--primary-500)]/5 text-[var(--foreground)]'
        }
      `}
      title={hint}
    >
      <span className={disabled ? 'text-[var(--foreground-muted)]' : 'text-[var(--primary-400)]'}>
        {icon}
      </span>
      <span className="text-sm">{label}</span>
    </button>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/project-data/ProjectDataMenu.tsx
git commit -m "feat: add ProjectDataMenu component with dropdown"
```

### Task 6: 创建组件索引文件

**Files:**
- Create: `src/components/project-data/index.ts`

**Step 1: 创建索引文件**

```typescript
export { ProjectDataMenu } from './ProjectDataMenu';
export { ExportDialog } from './ExportDialog';
export { ImportDialog } from './ImportDialog';
export { useProjectData } from './hooks/useProjectData';
```

**Step 2: Commit**

```bash
git add src/components/project-data/index.ts
git commit -m "chore: add project-data component index"
```

---

## 页面集成

### Task 7: 集成到主页面

**Files:**
- Modify: `src/app/page.tsx`

**Step 1: 添加导入**

在文件顶部添加：

```typescript
import { ProjectDataMenu } from '@/components/project-data';
```

**Step 2: 添加到顶部工具栏**

在 LanguageSwitcher 旁边添加 ProjectDataMenu：

```typescript
{/* Desktop: Language Switcher & Tools */}
<div className="hidden md:flex absolute right-0 top-0 items-center gap-2">
  <LanguageSwitcher />
  <ProjectDataMenu />
</div>
```

**Step 3: 移动端也需要添加**

在移动端区域添加：

```typescript
{/* Mobile: Language Switcher & Tools */}
<div className="md:hidden mt-4 flex justify-center gap-2">
  <LanguageSwitcher />
  <ProjectDataMenu />
</div>
```

**Step 4: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: integrate ProjectDataMenu into main page header"
```

---

## i18n 支持

### Task 8: 添加中文翻译

**Files:**
- Modify: `src/i18n/messages/zh.json`

**Step 1: 添加翻译键**

在文件中添加：

```json
{
  "projectData": {
    "menu": {
      "title": "工具",
      "exportProject": "导出项目",
      "importProject": "导入项目",
      "exportPdf": "导出 PDF",
      "noCompletedAxes": "没有已完成的轴"
    },
    "export": {
      "title": "导出项目",
      "projectSummary": "项目摘要",
      "projectName": "项目名称",
      "unnamed": "未命名",
      "axisCount": "轴数量",
      "filename": "文件名",
      "exportButton": "导出",
      "noDataWarning": "当前没有可导出的数据，请先添加至少一个轴"
    },
    "import": {
      "title": "导入项目",
      "dragDrop": "拖放 JSON 文件到此处",
      "or": "或",
      "selectFile": "选择文件",
      "projectName": "项目名称",
      "axisCount": "轴数量",
      "exportedAt": "导出时间",
      "unnamed": "未命名",
      "warning": "导入将覆盖当前项目数据",
      "confirmTitle": "确认导入",
      "confirmMessage": "此操作不可撤销，当前项目数据将被替换。是否继续？",
      "importButton": "确认导入",
      "nextButton": "下一步",
      "validation": {
        "valid": "文件验证通过"
      }
    },
    "errors": {
      "invalidJson": "文件格式不正确，请检查是否为有效的 JSON 文件",
      "missingFields": "文件格式不正确，缺少必要的数据字段",
      "unsupportedVersion": "不支持的文件版本，请更新应用后重试",
      "corruptedData": "项目数据不完整，可能已损坏"
    }
  }
}
```

**Step 2: Commit**

```bash
git add src/i18n/messages/zh.json
git commit -m "i18n: add Chinese translations for project data export/import"
```

### Task 9: 添加英文翻译

**Files:**
- Modify: `src/i18n/messages/en.json`

**Step 1: 添加翻译键**

```json
{
  "projectData": {
    "menu": {
      "title": "Tools",
      "exportProject": "Export Project",
      "importProject": "Import Project",
      "exportPdf": "Export PDF",
      "noCompletedAxes": "No completed axes"
    },
    "export": {
      "title": "Export Project",
      "projectSummary": "Project Summary",
      "projectName": "Project Name",
      "unnamed": "Unnamed",
      "axisCount": "Axis Count",
      "filename": "Filename",
      "exportButton": "Export",
      "noDataWarning": "No data to export. Please add at least one axis first."
    },
    "import": {
      "title": "Import Project",
      "dragDrop": "Drop JSON file here",
      "or": "or",
      "selectFile": "Select File",
      "projectName": "Project Name",
      "axisCount": "Axis Count",
      "exportedAt": "Exported At",
      "unnamed": "Unnamed",
      "warning": "Import will overwrite current project data",
      "confirmTitle": "Confirm Import",
      "confirmMessage": "This action cannot be undone. Current project data will be replaced. Continue?",
      "importButton": "Confirm Import",
      "nextButton": "Next",
      "validation": {
        "valid": "File validation passed"
      }
    },
    "errors": {
      "invalidJson": "Invalid file format. Please check if it's a valid JSON file.",
      "missingFields": "Invalid file format. Required data fields are missing.",
      "unsupportedVersion": "Unsupported file version. Please update the app and try again.",
      "corruptedData": "Project data is incomplete or corrupted."
    }
  }
}
```

**Step 2: Commit**

```bash
git add src/i18n/messages/en.json
git commit -m "i18n: add English translations for project data export/import"
```

---

## 测试

### Task 10: 运行构建测试

**Files:**
- Run: `npm run build`

**Step 1: 构建项目**

```bash
npm run build
```

**Expected:** 构建成功，无 TypeScript 错误

**Step 2: Commit（如果修复了问题）**

```bash
git add -A
git commit -m "fix: resolve build issues" || echo "No changes to commit"
```

### Task 11: 运行现有测试

**Files:**
- Run: `npm test`

**Step 1: 运行测试**

```bash
npm test
```

**Expected:** 所有现有测试通过

**Step 2: 修复任何失败的测试**

如果有测试失败，修复它们。

**Step 3: Commit**

```bash
git add -A
git commit -m "test: ensure all tests pass" || echo "No changes to commit"
```

---

## 完成

### Task 12: 最终检查

**Step 1: 验证文件结构**

```bash
tree src/components/project-data/ || find src/components/project-data -type f
```

**Expected:**
```
src/components/project-data/
├── ExportDialog.tsx
├── ImportDialog.tsx
├── ProjectDataMenu.tsx
├── index.ts
└── hooks/
    └── useProjectData.ts
```

**Step 2: 验证 page.tsx 修改**

```bash
grep -n "ProjectDataMenu" src/app/page.tsx
```

**Expected:** 显示导入和使用位置

**Step 3: 最终提交**

```bash
git add -A
git commit -m "feat: complete project data export/import feature implementation"
```

---

## 测试清单（手动验证）

1. **导出功能**
   - [ ] 点击工具菜单显示下拉选项
   - [ ] 点击"导出项目"打开对话框
   - [ ] 对话框显示正确的项目信息
   - [ ] 可以修改文件名
   - [ ] 点击导出下载 JSON 文件
   - [ ] 空项目时导出按钮禁用

2. **导入功能**
   - [ ] 点击"导入项目"打开对话框
   - [ ] 可以拖放 JSON 文件
   - [ ] 可以点击选择文件
   - [ ] 显示文件预览和验证结果
   - [ ] 有效文件显示项目信息
   - [ ] 无效文件显示错误信息
   - [ ] 点击下一步显示确认对话框
   - [ ] 确认后项目数据被加载

3. **i18n**
   - [ ] 中文界面显示中文文本
   - [ ] 英文界面显示英文文本

4. **集成**
   - [ ] 桌面端显示工具菜单
   - [ ] 移动端显示工具菜单
   - [ ] 与现有 PDF 导出功能共存
