'use client';

import { Plus } from 'lucide-react';
import { AxisSidebarItem } from './AxisSidebarItem';
import { ProjectPdfExport } from './ProjectPdfExport';
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
  const completedCount = project.axes.filter((a) => a.status === 'COMPLETED').length;
  const configCount = project.axes.filter((a) => a.status === 'CONFIGURING').length;

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* 项目信息区域 - 简化为Item模式 */}
      <div className="p-2 border-b border-gray-200 bg-white">
        <button
          onClick={onOpenProjectSettings}
          className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left ${
            mainViewMode === 'edit-project'
              ? 'bg-blue-50 border-blue-500 shadow-sm'
              : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-gray-50'
          }`}
        >
          <span className="flex-shrink-0 text-lg">📁</span>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate">
              {project.name || '未命名项目'}
            </p>
            {mainViewMode === 'edit-project' && (
              <p className="text-xs text-blue-600">编辑中...</p>
            )}
          </div>
        </button>
      </div>

      {/* 公共参数区域 - 简化为Item模式 */}
      <div className="p-2 border-b border-gray-200 bg-blue-50">
        <button
          onClick={onOpenCommonParams}
          className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left ${
            mainViewMode === 'edit-common'
              ? 'bg-blue-100 border-blue-500 shadow-sm'
              : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-gray-50'
          }`}
        >
          <span className="flex-shrink-0 text-lg">⚙️</span>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900">公共参数</p>
            {mainViewMode === 'edit-common' && (
              <p className="text-xs text-blue-600">编辑中...</p>
            )}
          </div>
        </button>
      </div>

      {/* 轴列表区域 */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-2 border-b border-gray-200 bg-gray-100">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            轴配置
          </span>
        </div>

        <div className="p-2 space-y-1">
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

          {/* 添加新轴按钮 */}
          <button
            onClick={onAddAxis}
            className="w-full flex items-center justify-center gap-2 p-3 mt-2 text-sm text-blue-600 bg-blue-50 border border-blue-200 border-dashed rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Plus className="w-4 h-4" />
            {project.axes.length === 0 ? '添加第一个轴' : '添加新轴'}
          </button>
        </div>
      </div>

      {/* 项目汇总区域 */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            项目汇总
          </span>
        </div>
        <div className="space-y-1 mb-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">已完成:</span>
            <span className="text-green-600 font-medium">{completedCount} 个轴</span>
          </div>
          {configCount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">配置中:</span>
              <span className="text-blue-600 font-medium">{configCount} 个轴</span>
            </div>
          )}
        </div>

        <ProjectPdfExport project={project} />
      </div>
    </div>
  );
}
