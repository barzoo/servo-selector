'use client';

import { useState } from 'react';
import type { AxisConfig } from '@/types';

interface AxisSidebarItemProps {
  axis: AxisConfig;
  isActive: boolean;
  onClick: () => void;
  onDelete?: () => void;
  onReedit?: () => void;
  onUpdateName?: (name: string) => void;
  canDelete?: boolean;
}

export function AxisSidebarItem({
  axis,
  isActive,
  onClick,
  onDelete,
  onReedit,
  onUpdateName,
  canDelete = false,
}: AxisSidebarItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(axis.name);
  const [showMenu, setShowMenu] = useState(false);

  const statusIcon = {
    COMPLETED: '✅',
    CONFIGURING: '🔄',
    ABANDONED: '❌',
  }[axis.status];

  const handleSaveName = () => {
    if (editName.trim() && onUpdateName) {
      onUpdateName(editName.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveName();
    } else if (e.key === 'Escape') {
      setEditName(axis.name);
      setIsEditing(false);
    }
  };

  return (
    <div
      className={`
        relative group
        w-full rounded-lg border transition-colors
        ${
          isActive
            ? 'bg-blue-50 border-blue-500 shadow-sm'
            : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-gray-50'
        }
      `}
    >
      {/* Main content */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="flex-shrink-0">🛠️</span>
          {isEditing ? (
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleSaveName}
              onKeyDown={handleKeyDown}
              className="flex-1 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span
              className="truncate font-medium text-gray-900 cursor-pointer flex-1"
              onClick={onClick}
            >
              {axis.name}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <span className="text-sm">{statusIcon}</span>

          {/* Menu button */}
          {!isEditing && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1 rounded hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Dropdown menu */}
      {showMenu && !isEditing && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-2 top-8 z-20 bg-white border rounded-lg shadow-lg py-1 min-w-[120px]">
            {axis.status === 'COMPLETED' && onReedit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onReedit();
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
              >
                <span>✏️</span>
                <span>重新编辑</span>
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
                setShowMenu(false);
              }}
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
            >
              <span>🏷️</span>
              <span>重命名</span>
            </button>
            {canDelete && onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`确定要删除 "${axis.name}" 吗？`)) {
                    onDelete();
                  }
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 text-red-600 flex items-center gap-2"
              >
                <span>🗑️</span>
                <span>删除</span>
              </button>
            )}
          </div>
        </>
      )}

      {/* Active indicator */}
      {isActive && axis.status === 'CONFIGURING' && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r" />
      )}
    </div>
  );
}
