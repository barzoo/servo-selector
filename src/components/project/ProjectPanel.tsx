'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { FolderOpen, Plus, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { useProjectStore } from '@/stores/project-store';
import { ProjectListItem } from './ProjectListItem';
import { NewProjectConfirmModal } from './NewProjectConfirmModal';
import { NewProjectFormModal } from './NewProjectFormModal';
import { ProjectInfo } from '@/types';

interface ProjectPanelProps {
  onOpenProjectSettings: () => void;
}

export function ProjectPanel({ onOpenProjectSettings }: ProjectPanelProps) {
  const t = useTranslations('project');
  const commonT = useTranslations('common');

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
  const [isExpanded, setIsExpanded] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  // Load projects list on mount
  useEffect(() => {
    loadProjectsList();
  }, [loadProjectsList]);

  // Handle new project button click
  const handleNewProjectClick = () => {
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
    if (projectId !== project.id) {
      switchProject(projectId);
    }
  };

  // Handle project delete
  const handleDeleteProject = (projectId: string) => {
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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      {/* Collapsed State - Toggle Button */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="fixed left-4 top-24 z-40 flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
          title={t('panel.title')}
        >
          <FolderOpen className="w-5 h-5 text-[#00A4E4]" />
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>
      )}

      {/* Expanded Panel */}
      {isExpanded && (
        <div className="fixed left-4 top-24 z-40 w-72 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-[#00A4E4]" />
              <span className="font-semibold text-gray-900">{t('panel.title')}</span>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-1.5 hover:bg-gray-200 rounded-md transition-colors"
              title={commonT('collapse')}
            >
              <ChevronLeft className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Project List */}
          <div className="max-h-80 overflow-y-auto p-2 space-y-1">
            {projects.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500 text-sm">
                {t('panel.noProjects')}
              </div>
            ) : (
              projects.map((proj) => (
                <ProjectListItem
                  key={proj.id}
                  project={proj}
                  isActive={proj.id === project.id}
                  onClick={() => handleSwitchProject(proj.id)}
                  onDelete={proj.id !== project.id ? () => handleDeleteProject(proj.id) : undefined}
                />
              ))
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
            <button
              onClick={handleNewProjectClick}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-[#00A4E4] rounded-md hover:bg-[#0093cd] transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('panel.newProject')}
            </button>
            <button
              onClick={onOpenProjectSettings}
              className="p-1.5 text-gray-600 hover:bg-gray-200 rounded-md transition-colors"
              title={t('panel.projectSettings')}
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* New Project Confirm Modal */}
      <NewProjectConfirmModal
        isOpen={showConfirmModal}
        projectName={project.name || t('panel.unnamedProject')}
        lastUpdated={formatLastUpdated(project.createdAt)}
        onConfirm={handleConfirmNewProject}
        onCancel={() => setShowConfirmModal(false)}
      />

      {/* New Project Form Modal */}
      <NewProjectFormModal
        isOpen={showFormModal}
        onSubmit={handleFormSubmit}
        onCancel={() => setShowFormModal(false)}
      />

      {/* Delete Confirmation Modal */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setProjectToDelete(null)}
          />

          {/* Dialog */}
          <div className="relative w-full max-w-sm bg-white rounded-lg shadow-2xl overflow-hidden">
            <div className="p-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {t('deleteConfirm.title')}
              </h3>
              <p className="text-gray-600">
                {t('deleteConfirm.message')}
              </p>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setProjectToDelete(null)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                {commonT('cancel')}
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors"
              >
                {commonT('delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
