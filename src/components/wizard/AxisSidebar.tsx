'use client';

import { AxisSidebarItem } from './AxisSidebarItem';
import { AddAxisButton } from './AddAxisButton';
import { ProjectPdfExport } from './ProjectPdfExport';
import type { Project } from '@/types';

interface AxisSidebarProps {
  project: Project;
  currentAxisId: string;
  onSwitchAxis: (axisId: string) => void;
  onAddAxis: () => void;
  onDeleteAxis?: (axisId: string) => void;
}

export function AxisSidebar({
  project,
  currentAxisId,
  onSwitchAxis,
  onAddAxis,
}: AxisSidebarProps) {
  const completedCount = project.axes.filter((a) => a.status === 'COMPLETED').length;

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Project Info */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900 truncate" title={project.name}>
          {project.name || '未命名项目'}
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          {project.axes.length} 个轴
          {completedCount > 0 && ` · ${completedCount} 个已完成`}
        </p>
      </div>

      {/* Axis List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {project.axes.map((axis) => (
          <AxisSidebarItem
            key={axis.id}
            axis={axis}
            isActive={axis.id === currentAxisId}
            onClick={() => onSwitchAxis(axis.id)}
          />
        ))}
      </div>

      {/* Add Axis */}
      <div className="p-2 border-t border-gray-200">
        <AddAxisButton onClick={onAddAxis} />
      </div>

      {/* Project Basket */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">📋 项目篮子</span>
          <span className="text-xs text-gray-500">{completedCount} 个轴</span>
        </div>
        <ProjectPdfExport project={project} />
      </div>
    </div>
  );
}
