'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Edit, Plus } from 'lucide-react';
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
  const [isCommonParamsExpanded, setIsCommonParamsExpanded] = useState(true);

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* 项目信息区域 */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            项目信息
          </span>
          <button
            onClick={onOpenProjectSettings}
            className={`text-xs flex items-center gap-1 ${
              mainViewMode === 'edit-project'
                ? 'text-blue-800 font-semibold'
                : 'text-blue-600 hover:text-blue-800'
            }`}
          >
            <Edit className="w-3 h-3" />
            {mainViewMode === 'edit-project' ? '编辑中...' : '编辑'}
          </button>
        </div>
        <h3 className="font-semibold text-gray-900 truncate" title={project.name}>
          {project.name || '未命名项目'}
        </h3>
        {project.customer && (
          <p className="text-sm text-gray-500 mt-1">客户: {project.customer}</p>
        )}
        {project.salesPerson && (
          <p className="text-sm text-gray-500">销售: {project.salesPerson}</p>
        )}
      </div>

      {/* 公共参数区域 */}
      <div className="border-b border-gray-200 bg-blue-50">
        <button
          onClick={() => setIsCommonParamsExpanded(!isCommonParamsExpanded)}
          className="w-full px-4 py-3 flex items-center justify-between text-left"
        >
          <span className="text-xs font-medium text-blue-700 uppercase tracking-wider">
            公共参数
          </span>
          {isCommonParamsExpanded ? (
            <ChevronUp className="w-4 h-4 text-blue-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-blue-500" />
          )}
        </button>

        {isCommonParamsExpanded && (
          <div className="px-4 pb-3 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">环境温度:</span>
              <span className="text-gray-700">{project.commonParams.ambientTemp}C</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">防护等级:</span>
              <span className="text-gray-700">{project.commonParams.ipRating}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">通信协议:</span>
              <span className="text-gray-700">{project.commonParams.communication}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">电缆长度:</span>
              <span className="text-gray-700">
                {typeof project.commonParams.cableLength === 'number'
                  ? `${project.commonParams.cableLength}m`
                  : '仅接线端子'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">安全系数:</span>
              <span className="text-gray-700">{project.commonParams.safetyFactor}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">目标惯量比:</span>
              <span className="text-gray-700">{project.commonParams.targetInertiaRatio}:1</span>
            </div>
            <button
              onClick={onOpenCommonParams}
              className={`mt-2 text-xs flex items-center gap-1 ${
                mainViewMode === 'edit-common'
                  ? 'text-blue-800 font-semibold'
                  : 'text-blue-600 hover:text-blue-800'
              }`}
            >
              <Edit className="w-3 h-3" />
              {mainViewMode === 'edit-common' ? '编辑中...' : '编辑公共参数'}
            </button>
          </div>
        )}
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
