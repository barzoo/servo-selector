'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { useProjectStore, migrateLegacyData, migrateToSharedParams } from '@/stores/project-store';
import { AxisSidebar } from '@/components/wizard/AxisSidebar';
import { MobileAxisDrawer } from '@/components/wizard/MobileAxisDrawer';
import { StepIndicator } from '@/components/wizard/StepIndicator';
import { ProjectInfoStep } from '@/components/wizard/steps/ProjectInfoStep';
import { MechanismStep } from '@/components/wizard/steps/MechanismStep';
import { MotionStep } from '@/components/wizard/steps/MotionStep';
import { DutyStep } from '@/components/wizard/steps/DutyStep';
import { SystemConfigStep } from '@/components/wizard/steps/SystemConfigStep';
import { ResultStep } from '@/components/wizard/steps/ResultStep';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { ProjectSettingsModal } from '@/components/wizard/ProjectSettingsModal';

export default function Home() {
  const {
    project,
    currentAxisId,
    currentStep,
    isComplete,
    switchAxis,
    addAxis,
    deleteAxis,
    updateAxisName,
    reeditAxis,
    createProject,
  } = useProjectStore();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'project' | 'common'>('project');

  // Migrate legacy data on first load
  useEffect(() => {
    // Try new migration first
    const stored = localStorage.getItem('servo-selector-project');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const migrated = migrateToSharedParams(parsed);
        if (migrated && !project.name) {
          useProjectStore.setState({
            project: migrated,
            currentAxisId: migrated.axes[0]?.id || '',
            currentStep: migrated.axes[0]?.status === 'COMPLETED' ? 6 : 1,
            isComplete: migrated.axes[0]?.status === 'COMPLETED',
          });
          return;
        }
      } catch {
        // Ignore parse errors
      }
    }

    // Fall back to legacy migration
    const migrated = migrateLegacyData();
    if (migrated) {
      useProjectStore.setState({
        project: migrated,
        currentAxisId: migrated.axes[0].id,
        currentStep: migrated.axes[0].status === 'COMPLETED' ? 6 : 1,
        isComplete: migrated.axes[0].status === 'COMPLETED',
      });
    } else if (!project.name) {
      // Initialize with empty project if no data
      createProject({ name: '', customer: '', salesPerson: '' });
    }

    // Listen for open project settings event
    const handleOpenSettings = (e: CustomEvent) => {
      setSettingsTab(e.detail?.tab || 'project');
      setIsSettingsOpen(true);
    };
    window.addEventListener('open-project-settings', handleOpenSettings as EventListener);

    return () => {
      window.removeEventListener('open-project-settings', handleOpenSettings as EventListener);
    };
  }, []);

  const handleAddAxis = () => {
    const newAxisId = addAxis(`轴-${project.axes.length + 1}`);
    switchAxis(newAxisId);

    // If this is the first axis and project name is empty, prompt user to fill project info
    if (project.axes.length === 0 && !project.name) {
      setSettingsTab('project');
      setIsSettingsOpen(true);
    }
  };

  const renderStep = () => {
    if (isComplete) {
      return <ResultStep />;
    }

    switch (currentStep) {
      case 1:
        return <ProjectInfoStep />;
      case 2:
        return <MechanismStep />;
      case 3:
        return <MotionStep />;
      case 4:
        return <DutyStep />;
      case 5:
        return <SystemConfigStep />;
      default:
        return <ProjectInfoStep />;
    }
  };

  const renderMainContent = () => {
    // If no axes, show empty state
    if (project.axes.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Plus className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            欢迎使用伺服选型工具
          </h2>
          <p className="text-gray-600 mb-6 max-w-md">
            请从侧边栏开始：
            <br />
            1. 确认项目信息和公共参数
            <br />
            2. 点击"添加第一个轴"开始配置
          </p>
          <button
            onClick={() => {
              if (!project.name) {
                setSettingsTab('project');
                setIsSettingsOpen(true);
              } else {
                handleAddAxis();
              }
            }}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            {project.name ? '添加第一个轴' : '先设置项目信息'}
          </button>
        </div>
      );
    }

    // Otherwise show the step content
    return renderStep();
  };

  const currentAxis = project.axes.find((a) => a.id === currentAxisId);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 flex-shrink-0 h-screen sticky top-0 border-r border-gray-200">
        <AxisSidebar
          project={project}
          currentAxisId={currentAxisId}
          onSwitchAxis={switchAxis}
          onAddAxis={handleAddAxis}
          onDeleteAxis={deleteAxis}
          onReeditAxis={reeditAxis}
          onUpdateAxisName={updateAxisName}
          onOpenProjectSettings={() => {
            setSettingsTab('project');
            setIsSettingsOpen(true);
          }}
        />
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        <div className="max-w-4xl mx-auto px-2 sm:px-4 py-6 sm:py-8">
          <header className="mb-6 sm:mb-8 text-center relative">
            {/* Mobile Menu Button */}
            <div className="absolute left-0 top-0 md:hidden">
              <MobileAxisDrawer
                project={project}
                currentAxisId={currentAxisId}
                onSwitchAxis={switchAxis}
                onAddAxis={handleAddAxis}
                onDeleteAxis={deleteAxis}
                onReeditAxis={reeditAxis}
                onUpdateAxisName={updateAxisName}
              />
            </div>

            {/* Desktop: Language Switcher */}
            <div className="hidden md:flex absolute right-0 top-0 items-center gap-2">
              <LanguageSwitcher />
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
              博世力士乐伺服选型工具
            </h1>
            <p className="mt-2 text-gray-600">XC20 + MC20 伺服系统选型向导</p>

            {/* Mobile: Language Switcher */}
            <div className="md:hidden mt-4 flex justify-center gap-2">
              <LanguageSwitcher />
            </div>

            {/* Current Axis Indicator */}
            {currentAxis && (
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                <span>🛠️</span>
                <span>当前配置: {currentAxis.name}</span>
                {currentAxis.status === 'CONFIGURING' && (
                  <span className="text-xs">🔄</span>
                )}
              </div>
            )}
          </header>

          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 md:p-8">
            {project.axes.length > 0 && <StepIndicator currentStep={currentStep} />}
            <div className={project.axes.length > 0 ? 'mt-8' : ''}>{renderMainContent()}</div>
          </div>
        </div>

        {/* Project Settings Modal */}
        <ProjectSettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          initialTab={settingsTab}
        />
      </main>
    </div>
  );
}
