'use client';

import { useEffect, useState } from 'react';
import { Plus, Settings, FileText, Zap, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useProjectStore, migrateLegacyData, migrateToSharedParams } from '@/stores/project-store';
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
import { ProjectDataMenu } from '@/components/project-data';

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
    const stored = localStorage.getItem('servo-selector-project');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const migrated = migrateToSharedParams(parsed);
        if (migrated) {
          useProjectStore.setState({
            project: migrated,
            currentAxisId: migrated.axes[0]?.id || '',
            currentStep: migrated.axes[0]?.status === 'COMPLETED' ? 5 : 1,
            isComplete: migrated.axes[0]?.status === 'COMPLETED',
          });
          setIsLoaded(true);
          return;
        }
      } catch {
        // Ignore parse errors
      }
    }

    const migrated = migrateLegacyData();
    if (migrated) {
      useProjectStore.setState({
        project: migrated,
        currentAxisId: migrated.axes[0].id,
        currentStep: migrated.axes[0].status === 'COMPLETED' ? 5 : 1,
        isComplete: migrated.axes[0].status === 'COMPLETED',
      });
    } else if (!project.name) {
      createProject({ name: '', customer: '', salesPerson: '' });
    }
    setIsLoaded(true);
  }, []);

  const handleAddAxis = () => {
    const newAxisId = addAxis(`Axis-${project.axes.length + 1}`);
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
          onComplete={() => setMainViewMode('wizard')}
        />
      );
    }

    if (mainViewMode === 'edit-common') {
      return (
        <CommonParamsEditStep
          onComplete={() => setMainViewMode('wizard')}
        />
      );
    }

    if (project.axes.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[500px] text-center px-8">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary-500)] to-[var(--primary-300)] rounded-full blur-2xl opacity-20 animate-pulse"></div>
            <div className="relative w-24 h-24 bg-gradient-to-br from-[var(--background-tertiary)] to-[var(--background-secondary)] rounded-2xl flex items-center justify-center border border-[var(--border-default)] shadow-2xl">
              <Zap className="w-12 h-12 text-[var(--primary-400)]" />
            </div>
          </div>

          <h2 className="text-3xl font-bold mb-4">
            <span className="gradient-text">{t('welcomeTitle')}</span>
          </h2>

          <p className="text-[var(--foreground-secondary)] mb-8 max-w-md text-lg leading-relaxed">
            {t('welcomeSubtitle')}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md mb-8">
            <div className="card p-4 card-hover">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-[var(--primary-500)]/10 flex items-center justify-center">
                  <Settings className="w-5 h-5 text-[var(--primary-400)]" />
                </div>
                <span className="font-medium">{t('cards.projectConfig')}</span>
              </div>
              <p className="text-sm text-[var(--foreground-muted)]">{t('cards.projectConfigDesc')}</p>
            </div>

            <div className="card p-4 card-hover">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-[var(--green-500)]/10 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-[var(--green-400)]" />
                </div>
                <span className="font-medium">{t('cards.addAxis')}</span>
              </div>
              <p className="text-sm text-[var(--foreground-muted)]">{t('cards.addAxisDesc')}</p>
            </div>
          </div>

          <button
            onClick={() => {
              if (!project.name) {
                setMainViewMode('edit-project');
              } else {
                handleAddAxis();
              }
            }}
            className="btn btn-primary text-base px-8 py-4"
          >
            <Plus className="w-5 h-5" />
            {project.name ? t('buttons.addFirstAxis') : t('buttons.setProjectFirst')}
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
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
    <div className="min-h-screen bg-[var(--background)] flex">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 grid-pattern opacity-50"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[var(--primary-500)] rounded-full blur-[150px] opacity-5"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[var(--primary-300)] rounded-full blur-[150px] opacity-5"></div>
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
                onSwitchAxis={switchAxis}
                onAddAxis={handleAddAxis}
                onDeleteAxis={deleteAxis}
                onReeditAxis={reeditAxis}
                onUpdateAxisName={updateAxisName}
              />
            </div>

            {/* Desktop: Language Switcher & Tools */}
            <div className="hidden md:flex absolute right-0 top-0 items-center gap-2">
              <LanguageSwitcher />
              <ProjectDataMenu />
            </div>

            <div className="inline-flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary-500)] to-[var(--primary-600)] flex items-center justify-center shadow-lg">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                <span className="gradient-text">{t('pageTitle')}</span>
              </h1>
            </div>

            <p className="text-[var(--foreground-secondary)]">{t('pageSubtitle')}</p>

            {/* Mobile: Language Switcher & Tools */}
            <div className="md:hidden mt-4 flex justify-center gap-2">
              <LanguageSwitcher />
              <ProjectDataMenu />
            </div>

            {/* Current Axis Indicator */}
            {currentAxis && mainViewMode === 'wizard' && (
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary-500)]/10 border border-[var(--primary-500)]/30 rounded-full">
                <div className="w-2 h-2 rounded-full bg-[var(--primary-400)] animate-pulse"></div>
                <span className="text-sm font-medium text-[var(--primary-300)]">
                  {axisT('currentConfig')}: {currentAxis.name}
                </span>
                {currentAxis.status === 'CONFIGURING' && (
                  <span className="text-xs text-[var(--amber-400)]">{axisT('status.configuring')}</span>
                )}
                {currentAxis.status === 'COMPLETED' && (
                  <span className="badge badge-success">{axisT('status.completed')}</span>
                )}
              </div>
            )}
          </header>

          {/* Main Card */}
          <div className="card shadow-2xl">
            {project.axes.length > 0 && mainViewMode === 'wizard' && (
              <div className="border-b border-[var(--border-subtle)]">
                <StepIndicator currentStep={currentStep} />
              </div>
            )}
            <div className="p-6 sm:p-8">
              {renderMainContent()}
            </div>
          </div>

          {/* Footer */}
          <footer className="mt-12 text-center text-sm text-[var(--foreground-muted)]">
            <p>{footerT('version')}</p>
          </footer>
        </div>
      </main>
    </div>
  );
}
