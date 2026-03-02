'use client';

import type { AxisConfig } from '@/types';

interface AxisSidebarItemProps {
  axis: AxisConfig;
  isActive: boolean;
  onClick: () => void;
}

export function AxisSidebarItem({ axis, isActive, onClick }: AxisSidebarItemProps) {
  const statusIcon = {
    COMPLETED: '✅',
    CONFIGURING: '🔄',
    ABANDONED: '❌',
  }[axis.status];

  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left p-3 rounded-lg border transition-colors
        flex items-center justify-between
        ${
          isActive
            ? 'bg-blue-50 border-blue-500 shadow-sm'
            : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-gray-50'
        }
      `}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className="flex-shrink-0">🛠️</span>
        <span className="truncate font-medium text-gray-900">{axis.name}</span>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <span className="text-sm">{statusIcon}</span>
        {isActive && axis.status === 'CONFIGURING' && (
          <span className="text-xs text-blue-600 font-medium">▶</span>
        )}
      </div>
    </button>
  );
}
