'use client';

import { Check, Trash2 } from 'lucide-react';
import type { ProjectMeta } from '@/types/project-list';

interface ProjectListItemProps {
  project: ProjectMeta;
  isActive: boolean;
  onClick: () => void;
  onDelete?: () => void;
}

export function ProjectListItem({
  project,
  isActive,
  onClick,
  onDelete,
}: ProjectListItemProps) {
  return (
    <div
      onClick={onClick}
      className={`
        group relative flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer
        transition-all duration-200 border
        ${isActive
          ? 'bg-[#00A4E4]/10 border-[#00A4E4]/30'
          : 'border-transparent hover:bg-gray-100'
        }
      `}
    >
      {/* Project Info */}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm text-gray-900 truncate">
          {project.name}
        </div>
        {project.customer && (
          <div className="text-xs text-gray-500 mt-0.5">
            {project.customer}
          </div>
        )}
      </div>

      {/* Active Indicator or Delete Button */}
      <div className="flex-shrink-0 ml-2">
        {isActive ? (
          <Check className="w-5 h-5 text-[#00A4E4]" />
        ) : (
          onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="
                p-1.5 rounded-md opacity-0 group-hover:opacity-100
                transition-all duration-200
                hover:bg-red-100 text-gray-400 hover:text-red-500
              "
              title="删除项目"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )
        )}
      </div>
    </div>
  );
}
