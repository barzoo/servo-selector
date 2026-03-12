'use client';

import { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useProjectStore, migrateLegacyData } from '@/stores/project-store';
import { AxisSidebar } from '@/components/wizard/AxisSidebar';
import { MobileAxisDrawer } from '@/components/wizard/MobileAxisDrawer';
import { StepIndicator } from '@/components/wizard/StepIndicator';
import { MechanismStep } from '@/components/wizard/steps/MechanismStep';
import { MotionStep } from '@/components/wizard/steps/MotionStep';
import { DutyStep } from '@/components/wizard/steps/DutyStep';
import { SystemConfigStep } from '@/components/wizard/steps/SystemConfigStep';
import { ResultStep } from '@/components/wizard/steps/ResultStep';
import { ProjectInfoEditStep } from '@/components/wizard/steps/ProjectInfoEditStep';
import { CommonParamsEditStep } from '@/components/wizard/steps/CommonParamsEditStep';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { OnboardingEmptyState } from '@/components/onboarding';
import { HeroSection } from '@/components/hero';

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

  const t = useTranslations('home');
  const axisT = useTranslations('axis');
  const commonT = useTranslations('common');
  const footerT = useTranslations('footer');

  const [mainViewMode, setMainViewMode] = useState<'wizard' | 'edit-project' | 'edit-common'>('wizard');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Rehydrate from localStorage manually (since skipHydration is enabled)
    const stored = localStorage.getItem('servo-selector-project');

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const state = parsed.state || parsed;

        // Only restore if the stored project has axes
        if (state.project?.axes?.length > 0) {
          useProjectStore.setState({
            project: state.project,
            currentAxisId: state.project.axes[0]?.id || '',
            currentStep: state.project.axes[0]?.status === 'COMPLETED' ? 5 : 1,
            isComplete: state.project.axes[0]?.status === 'COMPLETED',
            input: state.input || {},
            result: state.result,
          });
          setIsLoaded(true);
          return;
        }

        // Stored project has no axes, clear it
        localStorage.removeItem('servo-selector-project');
      } catch {
        localStorage.removeItem('servo-selector-project');
      }
    }

    // Check for legacy data
    const migrated = migrateLegacyData();
    if (migrated) {
      useProjectStore.setState({
        project: migrated,
        currentAxisId: migrated.axes[0]?.id || '',
        currentStep: migrated.axes[0]?.status === 'COMPLETED' ? 5 : 1,
        isComplete: migrated.axes[0]?.status === 'COMPLETED',
      });
    }
    // Otherwise, keep the initial empty project state (will show onboarding)

    setIsLoaded(true);
  }, []);

  const handleAddAxis = () => {
    // Pass empty string to let addAxis use locale-aware default name
    const newAxisId = addAxis('');
    switchAxis(newAxisId);
    setMainViewMode('wizard');

    if (project.axes.length === 0 && !project.name) {
      setMainViewMode('edit-project');
    }
  };

  const renderStep = () => {
    if (isComplete) {
      return <ResultStep />;
    }

    switch (currentStep) {
      case 1:
        return <MechanismStep />;
      case 2:
        return <MotionStep />;
      case 3:
        return <DutyStep />;
      case 4:
        return <SystemConfigStep />;
      default:
        return <MechanismStep />;
    }
  };

  const renderMainContent = () => {
    if (mainViewMode === 'edit-project') {
      return (
        <ProjectInfoEditStep
          onComplete={() => setMainViewMode('edit-common')}
        />
      );
    }

    if (mainViewMode === 'edit-common') {
      return (
        <CommonParamsEditStep
          onComplete={() => {
            // After common params, create first axis and enter wizard
            handleAddAxis();
          }}
        />
      );
    }

    if (project.axes.length === 0) {
      return (
        <HeroSection
          onStartConfiguration={() => {
            if (!project.name) {
              setMainViewMode('edit-project');
            } else {
              handleAddAxis();
            }
          }}
        />
      );
    }

    return renderStep();
  };

  const currentAxis = project.axes.find((a) => a.id === currentAxisId);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-3 border-[var(--primary-500)] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[var(--foreground-secondary)]">{commonT('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 grid-pattern opacity-20" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#00A4E4]/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#0077C8]/5 rounded-full blur-[150px]" />
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-72 flex-shrink-0 h-screen sticky top-0 z-20">
        <AxisSidebar
          project={project}
          currentAxisId={currentAxisId}
          currentStep={currentStep}
          isComplete={isComplete}
          mainViewMode={mainViewMode}
          onSwitchAxis={(axisId) => {
            switchAxis(axisId);
            setMainViewMode('wizard');
          }}
          onAddAxis={handleAddAxis}
          onDeleteAxis={deleteAxis}
          onReeditAxis={(axisId) => {
            reeditAxis(axisId);
            setMainViewMode('wizard');
          }}
          onUpdateAxisName={updateAxisName}
          onOpenProjectSettings={() => setMainViewMode('edit-project')}
          onOpenCommonParams={() => setMainViewMode('edit-common')}
        />
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 relative z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          {/* Header */}
          <header className="mb-8 text-center relative">
            {/* Mobile Menu Button */}
            <div className="absolute left-0 top-0 md:hidden">
              <MobileAxisDrawer
                project={project}
                currentAxisId={currentAxisId}
                onSwitchAxis={(axisId) => {
                  switchAxis(axisId);
                  setMainViewMode('wizard');
                }}
                onAddAxis={handleAddAxis}
                onDeleteAxis={deleteAxis}
                onReeditAxis={(axisId) => {
                  reeditAxis(axisId);
                  setMainViewMode('wizard');
                }}
                onUpdateAxisName={updateAxisName}
                onOpenProjectSettings={() => setMainViewMode('edit-project')}
                onOpenCommonParams={() => setMainViewMode('edit-common')}
              />
            </div>

            {/* Desktop: Language Switcher */}
            <div className="hidden md:flex absolute right-0 top-0 items-center gap-2">
              <LanguageSwitcher />
            </div>

            <div className="inline-flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-sm bg-[#00A4E4] flex items-center justify-center shadow-[0_0_20px_rgba(0,164,228,0.4)]">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#1a1a1a]">
                {t('pageTitle')}
              </h1>
            </div>

            <p className="text-[#718096]">{t('pageSubtitle')}</p>

            {/* Mobile: Language Switcher */}
            <div className="md:hidden mt-4 flex justify-center gap-2">
              <LanguageSwitcher />
            </div>

            {/* Current Axis Indicator */}
            {currentAxis && mainViewMode === 'wizard' && (
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#00A4E4]/10 border border-[#00A4E4]/30 rounded-full">
                <div className="w-2 h-2 rounded-full bg-[#00A4E4] animate-pulse"></div>
                <span className="text-sm font-medium text-[#0077C8]">
                  {axisT('currentConfig')}: {currentAxis.name}
                </span>
                {currentAxis.status === 'CONFIGURING' && (
                  <span className="text-xs text-[#00A4E4]">{axisT('status.configuring')}</span>
                )}
                {currentAxis.status === 'COMPLETED' && (
                  <span className="badge badge-success">{axisT('status.completed')}</span>
                )}
              </div>
            )}
          </header>

          {/* Main Card */}
          <div className="bg-white border border-[#e2e8f0] rounded-sm shadow-2xl">
            {project.axes.length > 0 && mainViewMode === 'wizard' && (
              <div className="border-b border-[#e2e8f0]">
                <StepIndicator currentStep={currentStep} />
              </div>
            )}
            <div className="p-6 sm:p-8">
              {renderMainContent()}
            </div>
          </div>

          {/* Footer */}
          <footer className="mt-12 text-center text-sm text-[#718096]">
            <p>{footerT('version')}</p>
          </footer>
        </div>
      </main>
    </div>
  );
}
