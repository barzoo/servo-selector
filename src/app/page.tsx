'use client';

import { useEffect, useState } from 'react';
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
  }, []);

  const handleAddAxis = () => {
    const newAxisId = addAxis(`轴-${project.axes.length + 1}`);
    switchAxis(newAxisId);
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

            {/* Desktop: Language Switcher + Project Settings */}
            <div className="hidden md:flex absolute right-0 top-0 items-center gap-2">
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                项目设置
              </button>
              <LanguageSwitcher />
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
              博世力士乐伺服选型工具
            </h1>
            <p className="mt-2 text-gray-600">XC20 + MC20 伺服系统选型向导</p>

            {/* Mobile: Project Settings + Language Switcher */}
            <div className="md:hidden mt-4 flex justify-center gap-2">
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                设置
              </button>
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
            <StepIndicator currentStep={currentStep} />
            <div className="mt-8">{renderStep()}</div>
          </div>
        </div>

        {/* Project Settings Modal */}
        <ProjectSettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />
      </main>
    </div>
  );
}
