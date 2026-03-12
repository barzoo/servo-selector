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
    <div className="h-full flex flex-col bg-[#f5f7fa] border-r border-[#e2e8f0] overflow-hidden">
      {/* Header - Fixed */}
      <div className="p-4 border-b border-[#e2e8f0] flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-sm bg-[#00A4E4] flex items-center justify-center shadow-[0_0_20px_rgba(0,164,228,0.4)]">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-[#1a1a1a]">{t('logoTitle')}</h2>
            <p className="text-xs text-[#718096]">{t('logoSubtitle')}</p>
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {/* Project Info Section */}
        <div className="p-3 border-b border-[#e2e8f0]">
          <button
            onClick={onOpenProjectSettings}
            className={`
              w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 text-left
              ${mainViewMode === 'edit-project'
                ? 'bg-[#00A4E4]/10 border border-[#00A4E4]/50 shadow-[0_0_15px_rgba(0,164,228,0.2)]'
                : 'bg-white border border-[#e2e8f0] hover:border-[#cbd5e1] hover:bg-[#f8fafc]'
              }
            `}
          >
            <div className={`
              w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
              ${mainViewMode === 'edit-project'
                ? 'bg-[#00A4E4]/20 text-[#00A4E4]'
                : 'bg-[#f5f7fa] text-[#718096]'
              }
            `}>
              <FileText className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-[#1a1a1a] truncate">
                {project.name || t('unnamedProject')}
              </p>
              <p className="text-xs text-[#718096]">
                {mainViewMode === 'edit-project' ? t('editing') : t('clickToEdit')}
              </p>
            </div>
            <ChevronRight className={`
              w-4 h-4 transition-transform duration-200 flex-shrink-0
              ${mainViewMode === 'edit-project' ? 'rotate-90 text-[#00A4E4]' : 'text-[#718096]'}
            `} />
          </button>
        </div>

        {/* Common Params Section */}
        <div className="p-3 border-b border-[#e2e8f0]">
          <button
            onClick={onOpenCommonParams}
            className={`
              w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 text-left
              ${mainViewMode === 'edit-common'
                ? 'bg-[#0077C8]/10 border border-[#0077C8]/50'
                : 'bg-white border border-[#e2e8f0] hover:border-[#cbd5e1]'
              }
            `}
          >
            <div className={`
              w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
              ${mainViewMode === 'edit-common'
                ? 'bg-[#0077C8]/20 text-[#0077C8]'
                : 'bg-[#f5f7fa] text-[#718096]'
              }
            `}>
              <Settings className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-[#1a1a1a]">{t('commonParams')}</p>
              <p className="text-xs text-[#718096]">
                {mainViewMode === 'edit-common' ? t('editing') : t('commonParamsDesc')}
              </p>
            </div>
            <ChevronRight className={`
              w-4 h-4 transition-transform duration-200 flex-shrink-0
              ${mainViewMode === 'edit-common' ? 'rotate-90 text-[#0077C8]' : 'text-[#718096]'}
            `} />
          </button>
        </div>

        {/* Axis List Section */}
        <div className="px-4 py-3 flex items-center justify-between">
          <span className="text-xs font-semibold text-[#718096] uppercase tracking-wider">
            {t('axisConfig')}
          </span>
          <span className="text-xs text-[#718096]">
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
            className="w-full flex items-center justify-center gap-2 p-4 mt-2 text-sm font-medium text-[#00A4E4] bg-[#00A4E4]/5 border border-dashed border-[#00A4E4]/30 rounded-lg hover:bg-[#00A4E4]/10 hover:border-[#00A4E4]/50 hover:shadow-[0_0_15px_rgba(0,164,228,0.2)] transition-all duration-200 group"
          >
            <Plus className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
            {project.axes.length === 0 ? t('addFirstAxis') : t('addNewAxis')}
          </button>
        </div>

        {/* Project Summary Section */}
        <div className="p-4 border-t border-[#e2e8f0] bg-[#e8eef5]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-[#718096] uppercase tracking-wider">
              {t('projectSummary')}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white rounded-lg p-3 border border-[#e2e8f0]">
              <p className="text-xs text-[#718096] mb-1">{t('completed')}</p>
              <p className="text-2xl font-bold text-[#0077C8] number-display">{completedCount}</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-[#e2e8f0]">
              <p className="text-xs text-[#718096] mb-1">{t('configuring')}</p>
              <p className="text-2xl font-bold text-[#00A4E4] number-display">{configCount}</p>
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
              className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-[#4a5568] bg-white border border-[#e2e8f0] rounded-lg hover:bg-[#f8fafc] hover:border-[#cbd5e1] transition-all duration-200"
              title={resultT('exportProject')}
            >
              <Download className="w-4 h-4" />
              <span className="hidden lg:inline">{resultT('exportProject')}</span>
            </button>

            <button
              onClick={() => setShowImportDialog(true)}
              className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-[#4a5568] bg-white border border-[#e2e8f0] rounded-lg hover:bg-[#f8fafc] hover:border-[#cbd5e1] transition-all duration-200"
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
