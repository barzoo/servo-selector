'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Settings, Download, Upload, FileText, ChevronDown } from 'lucide-react';
import { ExportDialog } from './ExportDialog';
import { ImportDialog } from './ImportDialog';
import { useProjectStore } from '@/stores/project-store';

export function ProjectDataMenu() {
  const t = useTranslations('projectData.menu');
  const [isOpen, setIsOpen] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const project = useProjectStore((state) => state.project);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleExportClick = () => {
    setIsOpen(false);
    setShowExportDialog(true);
  };

  const handleImportClick = () => {
    setIsOpen(false);
    setShowImportDialog(true);
  };

  const handleExportPdfClick = () => {
    setIsOpen(false);
    // 触发现有的 PDF 导出
    const pdfButton = document.querySelector('[data-pdf-export-trigger]') as HTMLButtonElement;
    pdfButton?.click();
  };

  const completedCount = project.axes.filter((a) => a.status === 'COMPLETED').length;

  return (
    <>
      <div className="relative" ref={menuRef}>
        <button
          ref={buttonRef}
          onClick={() => setIsOpen(!isOpen)}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-lg transition-all
            ${isOpen
              ? 'bg-[var(--primary-500)]/10 text-[var(--primary-400)]'
              : 'text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--background-tertiary)]'
            }
          `}
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <Settings className="w-4 h-4" />
          <span className="hidden sm:inline text-sm font-medium">{t('title')}</span>
          <ChevronDown className={`
            w-4 h-4 transition-transform
            ${isOpen ? 'rotate-180' : ''}
          `} />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-56 card shadow-2xl border border-[var(--border-default)] py-1 z-50">
            <MenuItem
              icon={<Download className="w-4 h-4" />}
              label={t('exportProject')}
              onClick={handleExportClick}
            />
            <MenuItem
              icon={<Upload className="w-4 h-4" />}
              label={t('importProject')}
              onClick={handleImportClick}
            />
            <div className="my-1 border-t border-[var(--border-subtle)]" />
            <MenuItem
              icon={<FileText className="w-4 h-4" />}
              label={t('exportPdf')}
              onClick={handleExportPdfClick}
              disabled={completedCount === 0}
              hint={completedCount === 0 ? t('noCompletedAxes') : undefined}
            />
          </div>
        )}
      </div>

      <ExportDialog
        isOpen={showExportDialog}
        onClose={() => setShowExportDialog(false)}
      />
      <ImportDialog
        isOpen={showImportDialog}
        onClose={() => setShowImportDialog(false)}
      />
    </>
  );
}

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  hint?: string;
}

function MenuItem({ icon, label, onClick, disabled, hint }: MenuItemProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full px-4 py-2.5 text-left flex items-center gap-3 transition-colors
        ${disabled
          ? 'opacity-50 cursor-not-allowed text-[var(--foreground-muted)]'
          : 'hover:bg-[var(--primary-500)]/5 text-[var(--foreground)]'
        }
      `}
      title={hint}
    >
      <span className={disabled ? 'text-[var(--foreground-muted)]' : 'text-[var(--primary-400)]'}>
        {icon}
      </span>
      <span className="text-sm">{label}</span>
    </button>
  );
}
