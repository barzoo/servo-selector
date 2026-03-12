'use client';

import { useState } from 'react';
import type { AxisConfig } from '@/types';
import { Check, Loader2, X, MoreVertical, Edit2, Trash2, RotateCcw, Cog } from 'lucide-react';

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

  const getStatusConfig = () => {
    switch (axis.status) {
      case 'COMPLETED':
        return {
          icon: Check,
          bgColor: 'bg-[#0077C8]/10',
          textColor: 'text-[#0077C8]',
          borderColor: 'border-[#0077C8]/30',
          label: '已完成',
        };
      case 'CONFIGURING':
        return {
          icon: Loader2,
          bgColor: 'bg-[#00A4E4]/10',
          textColor: 'text-[#00A4E4]',
          borderColor: 'border-[#00A4E4]/30',
          label: '配置中',
        };
      case 'ABANDONED':
        return {
          icon: X,
          bgColor: 'bg-red-50',
          textColor: 'text-red-500',
          borderColor: 'border-red-200',
          label: '已放弃',
        };
      default:
        return {
          icon: Cog,
          bgColor: 'bg-[#e8eef5]',
          textColor: 'text-[#718096]',
          borderColor: 'border-[#e2e8f0]',
          label: '未知',
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

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
        relative group rounded-xl border transition-all duration-200
        ${isActive
          ? 'bg-[var(--primary-500)]/5 border-[var(--primary-500)]/50 shadow-lg shadow-[var(--primary-500)]/5'
          : 'bg-[var(--background-tertiary)] border-[var(--border-subtle)] hover:border-[var(--border-hover)] hover:bg-[var(--background-elevated)]'
        }
      `}
    >
      {/* Active indicator line */}
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 bg-gradient-to-b from-[var(--primary-400)] to-[var(--primary-600)] rounded-r-full" />
      )}

      {/* Main content */}
      <div className="flex items-center justify-between p-3 pl-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Status Icon */}
          <div className={`
            w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
            ${statusConfig.bgColor} ${statusConfig.textColor}
            ${axis.status === 'CONFIGURING' ? 'animate-pulse' : ''}
          `}>
            <StatusIcon className={`w-4 h-4 ${axis.status === 'CONFIGURING' ? 'animate-spin' : ''}`} />
          </div>

          {/* Name */}
          {isEditing ? (
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleSaveName}
              onKeyDown={handleKeyDown}
              className="flex-1 px-3 py-1.5 text-sm bg-[var(--background-secondary)] border border-[var(--primary-500)]/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]/30 text-[var(--foreground)]"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <div className="flex flex-col min-w-0 flex-1 cursor-pointer" onClick={onClick}>
              <span className={`truncate font-medium ${isActive ? 'text-[var(--primary-300)]' : 'text-[var(--foreground)]'}`}>
                {axis.name}
              </span>
              <span className={`text-xs ${statusConfig.textColor}`}>
                {statusConfig.label}
              </span>
            </div>
          )}
        </div>

        {/* Menu button */}
        {!isEditing && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-[var(--background-secondary)] text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dropdown menu */}
      {showMenu && !isEditing && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-3 top-10 z-20 bg-[var(--background-secondary)] border border-[var(--border-default)] rounded-xl shadow-2xl py-2 min-w-[140px] overflow-hidden">
            {axis.status === 'COMPLETED' && onReedit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onReedit();
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2.5 text-left text-sm text-[var(--foreground)] hover:bg-[var(--primary-500)]/10 flex items-center gap-3 transition-colors"
              >
                <RotateCcw className="w-4 h-4 text-[var(--primary-400)]" />
                <span>重新编辑</span>
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
                setShowMenu(false);
              }}
              className="w-full px-4 py-2.5 text-left text-sm text-[var(--foreground)] hover:bg-[var(--primary-500)]/10 flex items-center gap-3 transition-colors"
            >
              <Edit2 className="w-4 h-4 text-[var(--amber-400)]" />
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
                className="w-full px-4 py-2.5 text-left text-sm text-[var(--red-400)] hover:bg-[var(--red-500)]/10 flex items-center gap-3 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>删除</span>
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
