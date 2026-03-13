'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { FolderOpen, Plus, Settings, ChevronDown, Check, Trash2 } from 'lucide-react';
import { useProjectStore } from '@/stores/project-store';
import { NewProjectConfirmModal } from './NewProjectConfirmModal';
import { NewProjectFormModal } from './NewProjectFormModal';
import { ProjectInfo } from '@/types';
import type { ProjectMeta } from '@/types/project-list';

interface ProjectPanelProps {
  onOpenProjectSettings: () => void;
}

export function ProjectPanel({ onOpenProjectSettings }: ProjectPanelProps) {
  const t = useTranslations('project');

  // Store state and methods
  const {
    projects,
    project,
    loadProjectsList,
    saveAndCreateNewProject,
    switchProject,
    deleteProject,
  } = useProjectStore();

  // Local state
  const [isOpen, setIsOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load projects list on mount
  useEffect(() => {
    loadProjectsList();
  }, [loadProjectsList]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle new project button click
  const handleNewProjectClick = () => {
    setIsOpen(false);
    // Check if current project has unsaved changes
    const hasUnsavedChanges = project.axes.length > 0 &&
      project.axes.some(axis =>
        axis.status === 'CONFIGURING' &&
        Object.keys(axis.input || {}).length > 0
      );

    if (hasUnsavedChanges) {
      setShowConfirmModal(true);
    } else {
      setShowFormModal(true);
    }
  };

  // Handle confirm modal confirm
  const handleConfirmNewProject = () => {
    setShowConfirmModal(false);
    setShowFormModal(true);
  };

  // Handle form modal submit
  const handleFormSubmit = (info: ProjectInfo) => {
    saveAndCreateNewProject(info);
    setShowFormModal(false);
  };

  // Handle project switch
  const handleSwitchProject = (projectId: string) => {
    setIsOpen(false);
    if (projectId !== project.id) {
      switchProject(projectId);
    }
  };

  // Handle project delete
  const handleDeleteProject = (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    setProjectToDelete(projectId);
  };

  // Confirm delete
  const confirmDelete = () => {
    if (projectToDelete) {
      deleteProject(projectToDelete);
      setProjectToDelete(null);
    }
  };

  // Format last updated date
  const formatLastUpdated = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <>
      {/* Dropdown */}
      <div ref={dropdownRef} className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-2 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
          title={t('panel.title')}
        >
          <FolderOpen className="w-4 h-4" />
          <span className="max-w-[100px] truncate hidden sm:inline">{t('panel.title')}</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute right-0 top-full mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 bg-gray-50">
              <span className="font-medium text-sm text-gray-700">{t('panel.title')}</span>
              <span className="text-xs text-gray-400">{projects.length} 个项目</span>
            </div>

            {/* Project List */}
            <div className="max-h-60 overflow-y-auto py-1">
              {projects.length === 0 ? (
                <div className="px-3 py-4 text-center text-gray-500 text-sm">
                  {t('panel.noProjects')}
                </div>
              ) : (
                projects.map((proj) => (
                  <ProjectDropdownItem
                    key={proj.id}
                    project={proj}
                    isActive={proj.id === project.id}
                    onClick={() => handleSwitchProject(proj.id)}
                    onDelete={proj.id !== project.id ? (e) => handleDeleteProject(e, proj.id) : undefined}
                    formatDate={formatLastUpdated}
                  />
                ))
              )}
            </div>

            {/* Actions */}
            <div className="border-t border-gray-100 p-1.5 space-y-0.5">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenProjectSettings();
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                <Settings className="w-4 h-4" />
                {t('settings')}
              </button>
              <button
                onClick={handleNewProjectClick}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-sm text-[#00A4E4] hover:bg-[#00A4E4]/10 rounded-md transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t('newProject')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirm Modal */}
      <NewProjectConfirmModal
        isOpen={showConfirmModal}
        projectName={project.name || '未命名项目'}
        lastUpdated={new Date().toLocaleString()}
        onConfirm={handleConfirmNewProject}
        onCancel={() => setShowConfirmModal(false)}
      />

      {/* Form Modal */}
      <NewProjectFormModal
        isOpen={showFormModal}
        onSubmit={handleFormSubmit}
        onCancel={() => setShowFormModal(false)}
      />

      {/* Delete Confirm Modal */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('delete.title')}
            </h3>
            <p className="text-gray-600 mb-4">
              {t('delete.confirm', { name: projects.find(p => p.id === projectToDelete)?.name || '' })}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setProjectToDelete(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                {t('form.cancel')}
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
              >
                {t('delete.confirmButton')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Dropdown Item Component
interface ProjectDropdownItemProps {
  project: ProjectMeta;
  isActive: boolean;
  onClick: () => void;
  onDelete?: (e: React.MouseEvent) => void;
  formatDate: (date: string) => string;
}

function ProjectDropdownItem({ project, isActive, onClick, onDelete, formatDate }: ProjectDropdownItemProps) {
  const [showDelete, setShowDelete] = useState(false);

  return (
    <div
      className={`
        group flex items-center gap-2 px-3 py-2 mx-1 rounded-md cursor-pointer
        transition-colors
        ${isActive ? 'bg-[#00A4E4]/10 text-[#0077C8]' : 'hover:bg-gray-100 text-gray-700'}
      `}
      onClick={onClick}
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
    >
      <div className="flex-1 min-w-0">
        <p className={`font-medium text-sm truncate ${isActive ? 'text-[#0077C8]' : 'text-gray-900'}`}>
          {project.name}
        </p>
        <p className="text-xs text-gray-400">
          {formatDate(project.updatedAt)}
        </p>
      </div>

      {isActive && (
        <Check className="w-4 h-4 text-[#00A4E4] flex-shrink-0" />
      )}

      {!isActive && onDelete && showDelete && (
        <button
          onClick={onDelete}
          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
          title="Delete project"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
