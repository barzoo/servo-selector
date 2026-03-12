'use client';

import { Plus, FileText, Settings, ChevronRight, Download, Upload } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { AxisSidebarItem } from './AxisSidebarItem';
import { ProjectPdfExport } from './ProjectPdfExport';
import { ExportDialog } from '@/components/project-data/ExportDialog';
import { ImportDialog } from '@/components/project-data/ImportDialog';
import { ExcelExportButton } from '@/components/project-data/ExcelExportButton';
import { useState } from 'react';
import type { Project } from '@/types';

interface AxisSidebarProps {
  project: Project;
  currentAxisId: string;
  currentStep?: number;
  isComplete?: boolean;
  mainViewMode?: 'wizard' | 'edit-project' | 'edit-common';
  onSwitchAxis: (axisId: string) => void;
  onAddAxis: () => void;
  onDeleteAxis?: (axisId: string) => void;
  onReeditAxis?: (axisId: string) => void;
  onUpdateAxisName?: (axisId: string, name: string) => void;
  onOpenProjectSettings?: () => void;
  onOpenCommonParams?: () => void;
}

export function AxisSidebar({
  project,
  currentAxisId,
  currentStep,
  isComplete,
  mainViewMode,
  onSwitchAxis,
  onAddAxis,
  onDeleteAxis,
  onReeditAxis,
  onUpdateAxisName,
  onOpenProjectSettings,
  onOpenCommonParams,
}: AxisSidebarProps) {
  const t = useTranslations('sidebar');
  const resultT = useTranslations('result');
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const completedCount = project.axes.filter((a) => a.status === 'COMPLETED').length;
  const configCount = project.axes.filter((a) => a.status === 'CONFIGURING').length;

  return (
    <div className="h-full flex flex-col bg-neutral-900/80 backdrop-blur-xl border-r border-neutral-800 overflow-hidden">
      {/* Header - Fixed */}
      <div className="p-4 border-b border-neutral-800 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-sm bg-red-600 flex items-center justify-center shadow-glow-red">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-white">{t('logoTitle')}</h2>
            <p className="text-xs text-neutral-500">{t('logoSubtitle')}</p>
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {/* Project Info Section */}
        <div className="p-3 border-b border-neutral-800">
          <button
            onClick={onOpenProjectSettings}
            className={`
              w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 text-left
              ${mainViewMode === 'edit-project'
                ? 'bg-cyan-500/10 border border-cyan-500/50 shadow-glow-cyan-sm'
                : 'bg-neutral-800 border border-neutral-700 hover:border-neutral-600 hover:bg-neutral-750'
              }
            `}
          >
            <div className={`
              w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
              ${mainViewMode === 'edit-project'
                ? 'bg-cyan-500/20 text-cyan-400'
                : 'bg-neutral-900 text-neutral-400'
              }
            `}>
              <FileText className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-white truncate">
                {project.name || t('unnamedProject')}
              </p>
              <p className="text-xs text-neutral-500">
                {mainViewMode === 'edit-project' ? t('editing') : t('clickToEdit')}
              </p>
            </div>
            <ChevronRight className={`
              w-4 h-4 transition-transform duration-200 flex-shrink-0
              ${mainViewMode === 'edit-project' ? 'rotate-90 text-cyan-400' : 'text-neutral-500'}
            `} />
          </button>
        </div>

        {/* Common Params Section */}
        <div className="p-3 border-b border-neutral-800">
          <button
            onClick={onOpenCommonParams}
            className={`
              w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 text-left
              ${mainViewMode === 'edit-common'
                ? 'bg-amber-500/10 border border-amber-500/50'
                : 'bg-neutral-800 border border-neutral-700 hover:border-neutral-600'
              }
            `}
          >
            <div className={`
              w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
              ${mainViewMode === 'edit-common'
                ? 'bg-amber-500/20 text-amber-400'
                : 'bg-neutral-900 text-neutral-400'
              }
            `}>
              <Settings className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-white">{t('commonParams')}</p>
              <p className="text-xs text-neutral-500">
                {mainViewMode === 'edit-common' ? t('editing') : t('commonParamsDesc')}
              </p>
            </div>
            <ChevronRight className={`
              w-4 h-4 transition-transform duration-200 flex-shrink-0
              ${mainViewMode === 'edit-common' ? 'rotate-90 text-amber-400' : 'text-neutral-500'}
            `} />
          </button>
        </div>

        {/* Axis List Section */}
        <div className="px-4 py-3 flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            {t('axisConfig')}
          </span>
          <span className="text-xs text-neutral-500">
            {t('axisCount', { count: project.axes.length })}
          </span>
        </div>

        <div className="px-3 pb-3 space-y-2">
          {project.axes.map((axis) => (
            <AxisSidebarItem
              key={axis.id}
              axis={axis}
              isActive={axis.id === currentAxisId}
              onClick={() => onSwitchAxis(axis.id)}
              onDelete={onDeleteAxis ? () => onDeleteAxis(axis.id) : undefined}
              onReedit={onReeditAxis ? () => onReeditAxis(axis.id) : undefined}
              onUpdateName={onUpdateAxisName ? (name) => onUpdateAxisName(axis.id, name) : undefined}
              canDelete={project.axes.length > 1}
            />
          ))}

          {/* Add Axis Button */}
          <button
            onClick={onAddAxis}
            className="w-full flex items-center justify-center gap-2 p-4 mt-2 text-sm font-medium text-red-400 bg-red-500/5 border border-dashed border-red-500/30 rounded-lg hover:bg-red-500/10 hover:border-red-500/50 hover:shadow-glow-red-sm transition-all duration-200 group"
          >
            <Plus className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
            {project.axes.length === 0 ? t('addFirstAxis') : t('addNewAxis')}
          </button>
        </div>

        {/* Project Summary Section */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-900/50">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              {t('projectSummary')}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-neutral-800 rounded-lg p-3 border border-neutral-700">
              <p className="text-xs text-neutral-500 mb-1">{t('completed')}</p>
              <p className="text-2xl font-bold text-cyan-400 number-display">{completedCount}</p>
            </div>
            <div className="bg-neutral-800 rounded-lg p-3 border border-neutral-700">
              <p className="text-xs text-neutral-500 mb-1">{t('configuring')}</p>
              <p className="text-2xl font-bold text-amber-400 number-display">{configCount}</p>
            </div>
          </div>

          <ProjectPdfExport project={project} />

          {/* Excel Export Button */}
          <div className="mt-3">
            <ExcelExportButton project={project} />
          </div>

          {/* Export/Import Buttons */}
          <div className="grid grid-cols-2 gap-2 mt-3">
            <button
              onClick={() => setShowExportDialog(true)}
              className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-neutral-400 bg-neutral-800 border border-neutral-700 rounded-lg hover:bg-neutral-750 hover:border-neutral-600 transition-all duration-200"
              title={resultT('exportProject')}
            >
              <Download className="w-4 h-4" />
              <span className="hidden lg:inline">{resultT('exportProject')}</span>
            </button>

            <button
              onClick={() => setShowImportDialog(true)}
              className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-neutral-400 bg-neutral-800 border border-neutral-700 rounded-lg hover:bg-neutral-750 hover:border-neutral-600 transition-all duration-200"
              title={resultT('importProject')}
            >
              <Upload className="w-4 h-4" />
              <span className="hidden lg:inline">{resultT('importProject')}</span>
            </button>
          </div>
        </div>
      </div>

      <ExportDialog
        isOpen={showExportDialog}
        onClose={() => setShowExportDialog(false)}
      />
      <ImportDialog
        isOpen={showImportDialog}
        onClose={() => setShowImportDialog(false)}
      />
    </div>
  );
}
