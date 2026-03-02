'use client';

import { useEffect } from 'react';
import { useProjectStore, migrateLegacyData } from '@/stores/project-store';
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

export default function Home() {
  const {
    project,
    currentAxisId,
    currentStep,
    isComplete,
    result,
    switchAxis,
    addAxis,
    deleteAxis,
    reset,
    createProject,
  } = useProjectStore();

  // Migrate legacy data on first load
  useEffect(() => {
    const migrated = migrateLegacyData();
    if (migrated) {
      useProjectStore.setState({
        project: migrated,
        currentAxisId: migrated.axes[0].id,
        currentStep: migrated.axes[0].status === 'COMPLETED' ? 6 : 1,
        isComplete: migrated.axes[0].status === 'COMPLETED',
        input: migrated.axes[0].input,
        result: migrated.axes[0].result,
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
              />
            </div>

            {/* Desktop: Language Switcher */}
            <div className="hidden md:block absolute right-0 top-0">
              <LanguageSwitcher />
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
              博世力士乐伺服选型工具
            </h1>
            <p className="mt-2 text-gray-600">XC20 + MC20 伺服系统选型向导</p>

            {/* Mobile: Language Switcher */}
            <div className="md:hidden mt-4 flex justify-center">
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
      </main>
    </div>
  );
}
