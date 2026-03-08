'use client';

import { useCallback } from 'react';
import { useProjectStore } from '@/stores/project-store';
import type { Project, ProjectExportData, ImportValidationResult } from '@/types';

const EXPORT_VERSION = '1.0';

export function useProjectData() {
  const project = useProjectStore((state) => state.project);

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
