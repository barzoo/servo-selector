'use client';

import { useState, useRef, useEffect } from 'react';
import { CheckCircle, RotateCcw, Plus, FileText } from 'lucide-react';

interface SaveToBasketMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onCloneAxis: () => void;
  onAddNewAxis: () => void;
  onContinueEditing: () => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

export function SaveToBasketMenu({
  isOpen,
  onClose,
  onCloneAxis,
  onAddNewAxis,
  onContinueEditing,
  triggerRef,
}: SaveToBasketMenuProps) {
  const [placement, setPlacement] = useState<'top' | 'bottom'>('bottom');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const menuHeight = 280;

      if (spaceBelow < menuHeight && spaceAbove > spaceBelow) {
        setPlacement('top');
      } else {
        setPlacement('bottom');
      }
    }
  }, [isOpen, triggerRef]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Menu */}
      <div
        ref={menuRef}
        className="absolute right-0 z-50 w-72"
        style={{
          top: placement === 'bottom' ? '100%' : 'auto',
          bottom: placement === 'top' ? '100%' : 'auto',
          marginTop: placement === 'bottom' ? '8px' : '0',
          marginBottom: placement === 'top' ? '8px' : '0',
        }}
        role="menu"
      >
        <div className="card shadow-2xl border border-[var(--border-default)] overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 bg-[var(--green-500)]/5 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-[var(--green-400)]" />
              <span className="font-medium text-[var(--foreground)] text-sm">轴已保存到篮子</span>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <MenuItem
              icon={<RotateCcw className="w-4 h-4 text-[var(--primary-400)]" />}
              title="基于此轴创建新轴"
              description="复制当前配置作为起点"
              onClick={onCloneAxis}
              iconBg="bg-[var(--primary-500)]/10"
            />

            <MenuItem
              icon={<Plus className="w-4 h-4 text-[var(--green-400)]" />}
              title="添加空白新轴"
              description="从头开始配置新轴"
              onClick={onAddNewAxis}
              iconBg="bg-[var(--green-500)]/10"
            />

            <MenuItem
              icon={<FileText className="w-4 h-4 text-[var(--foreground-muted)]" />}
              title="继续编辑当前轴"
              description="返回查看或修改配置"
              onClick={onContinueEditing}
              iconBg="bg-[var(--background-tertiary)]"
            />
          </div>
        </div>

        {/* Arrow indicator */}
        <div
          className={`absolute right-6 w-3 h-3 bg-[var(--background-secondary)] border-l border-t border-[var(--border-default)] transform rotate-45 ${
            placement === 'bottom' ? '-top-1.5' : '-bottom-1.5 rotate-[225deg]'
          }`}
        />
      </div>
    </>
  );
}

interface MenuItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  iconBg: string;
}

function MenuItem({ icon, title, description, onClick, iconBg }: MenuItemProps) {
  return (
    <button
      onClick={onClick}
      className="w-full px-4 py-3 text-left hover:bg-[var(--primary-500)]/5 transition-colors flex items-start gap-3 group"
      role="menuitem"
    >
      <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="font-medium text-[var(--foreground)] text-sm">{title}</p>
        <p className="text-xs text-[var(--foreground-muted)]">{description}</p>
      </div>
    </button>
  );
}
