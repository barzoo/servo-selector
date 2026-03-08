'use client';

import { useProjectStore } from '@/stores/project-store';
import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { DetailedCalculations } from '../DetailedCalculations';
import { SystemSummary, findMotor, findDrive, buildSummaryItems } from '../SystemSummary';
import { PdfExportButton } from '../PdfExportButton';
import { SaveToBasketMenu } from '../SaveToBasketMenu';
import {
  Trophy,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowLeft,
  RotateCcw,
  Save,
  Plus,
  FileText,
  Zap,
  Clock,
  Activity,
  TrendingUp,
  ChevronRight,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

export function ResultStep() {
  const { result, input, reset, prevStep } = useProjectStore();
  const { completeAxis, addAxis, switchAxis, project } = useProjectStore();
  const t = useTranslations('result');
  const tSystem = useTranslations('systemSummary');
  const tLabels = useTranslations('systemSummary.labels');
  const [selectedMotorIndex, setSelectedMotorIndex] = useState(0);
  const [showSaveMenu, setShowSaveMenu] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const saveButtonRef = useRef<HTMLButtonElement>(null);


  if (!result || result.motorRecommendations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-[var(--red-500)]/10 flex items-center justify-center mb-6">
          <XCircle className="w-10 h-10 text-[var(--red-400)]" />
        </div>
        <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">{t('noResults')}</h3>
        {result?.failureReason && (
          <div className="card p-4 bg-[var(--amber-500)]/5 border-[var(--amber-500)]/30 mb-6 max-w-md">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-[var(--amber-400)] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-[var(--amber-400)]">{result.failureReason.message}</p>
            </div>
          </div>
        )}
        <button
          onClick={prevStep}
          className="btn btn-primary"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('backToEdit')}
        </button>
      </div>
    );
  }

  const selectedRecommendation = result.motorRecommendations[selectedMotorIndex];
  const { motor, systemConfig } = selectedRecommendation;

  const config = result.systemConfiguration || (systemConfig ? {
    motor: {
      model: motor.baseModel,
      partNumber: motor.model,
      options: {
        brake: motor.options.brake.hasBrake,
        encoderType: motor.options.encoder.type === 'BATTERY_MULTI_TURN' ? 'A' : 'B',
        keyShaft: motor.options.keyShaft.hasKey,
      },
    },
    drive: {
      model: systemConfig.drive.baseModel,
      partNumber: systemConfig.drive.model,
      options: {
        communication: systemConfig.drive.communication.type,
        panel: systemConfig.drive.options.panel.code === '01B' ? 'WITH_DISPLAY' : 'WITHOUT_DISPLAY',
        safety: systemConfig.drive.options.safety.code === 'ST' ? 'STO' : 'NONE',
      },
    },
    cables: {
      motor: {
        spec: systemConfig.accessories.motorCable.model,
        length: typeof systemConfig.accessories.motorCable.length === 'number' ? systemConfig.accessories.motorCable.length : 3,
        partNumber: `CAB-MOT-${systemConfig.accessories.motorCable.length}`,
      },
      encoder: {
        spec: systemConfig.accessories.encoderCable.model,
        length: typeof systemConfig.accessories.encoderCable.length === 'number' ? systemConfig.accessories.encoderCable.length : 3,
        partNumber: `CAB-ENC-${systemConfig.accessories.encoderCable.length}`,
      },
      ...(systemConfig.accessories.commCable && {
        communication: {
          length: typeof systemConfig.accessories.commCable.length === 'number' ? systemConfig.accessories.commCable.length : 3,
          partNumber: `CAB-COM-${systemConfig.accessories.commCable.model}`,
        },
      }),
    },
    accessories: {
      ...(systemConfig.accessories.brakeResistor && {
        brakeResistor: {
          model: systemConfig.accessories.brakeResistor.model,
          partNumber: systemConfig.accessories.brakeResistor.model,
        },
      }),
      ...(systemConfig.accessories.emcFilter && {
        emcFilter: systemConfig.accessories.emcFilter,
      }),
    },
  } : null);

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'var(--green-400)';
    if (score >= 60) return 'var(--amber-400)';
    return 'var(--red-400)';
  };

  const getFeasibilityBadge = (feasibility: string) => {
    switch (feasibility) {
      case 'OK':
        return <span className="badge badge-success">{t('feasibility.ok')}</span>;
      case 'WARNING':
        return <span className="badge badge-warning">{t('feasibility.warning')}</span>;
      case 'CRITICAL':
        return <span className="badge badge-error">{t('feasibility.critical')}</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in relative">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--green-500)] to-[var(--green-600)] flex items-center justify-center shadow-lg">
          <Trophy className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[var(--foreground)]">{t('title')}</h2>
          <p className="text-sm text-[var(--foreground-muted)]">选型计算完成，以下是推荐方案</p>
        </div>
      </div>

      {/* Project Info */}
      {input.project && (
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-[var(--primary-400)]" />
            <h3 className="font-semibold text-[var(--foreground)]">{t('projectInfo')}</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-[var(--foreground-muted)]">{t('projectName')}</span>
              <p className="font-medium text-[var(--foreground)]">{input.project.name}</p>
            </div>
            <div>
              <span className="text-[var(--foreground-muted)]">{t('customer')}</span>
              <p className="font-medium text-[var(--foreground)]">{input.project.customer}</p>
            </div>
          </div>
        </div>
      )}

      {/* Calculation Summary */}
      <div className="card p-5 border-l-4 border-l-[var(--primary-500)]">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 text-[var(--primary-400)]" />
          <h3 className="font-semibold text-[var(--foreground)]">{t('calculationSummary')}</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-[var(--background-tertiary)] rounded-lg p-3">
            <p className="text-xs text-[var(--foreground-muted)] mb-1">{t('loadInertia')}</p>
            <p className="text-lg font-bold number-display text-[var(--foreground)]">
              {result.mechanical.loadInertia.toExponential(2)}
            </p>
            <p className="text-xs text-[var(--foreground-muted)]">kg·m²</p>
          </div>
          <div className="bg-[var(--background-tertiary)] rounded-lg p-3">
            <p className="text-xs text-[var(--foreground-muted)] mb-1">{t('rmsTorque')}</p>
            <p className="text-lg font-bold number-display text-[var(--primary-400)]">
              {result.mechanical.torques.rms.toFixed(2)}
            </p>
            <p className="text-xs text-[var(--foreground-muted)]">N·m</p>
          </div>
          <div className="bg-[var(--background-tertiary)] rounded-lg p-3">
            <p className="text-xs text-[var(--foreground-muted)] mb-1">{t('peakTorque')}</p>
            <p className="text-lg font-bold number-display text-[var(--amber-400)]">
              {result.mechanical.torques.peak.toFixed(2)}
            </p>
            <p className="text-xs text-[var(--foreground-muted)]">N·m</p>
          </div>
          <div className="bg-[var(--background-tertiary)] rounded-lg p-3">
            <p className="text-xs text-[var(--foreground-muted)] mb-1">{t('maxSpeed')}</p>
            <p className="text-lg font-bold number-display text-[var(--foreground)]">
              {result.mechanical.speeds.max.toFixed(0)}
            </p>
            <p className="text-xs text-[var(--foreground-muted)]">rpm</p>
          </div>
          <div className="bg-[var(--background-tertiary)] rounded-lg p-3">
            <p className="text-xs text-[var(--foreground-muted)] mb-1">{t('regenPower')}</p>
            <p className="text-lg font-bold number-display text-[var(--foreground)]">
              {result.mechanical.regeneration.brakingPower.toFixed(1)}
            </p>
            <p className="text-xs text-[var(--foreground-muted)]">W</p>
          </div>
          <div className="bg-[var(--background-tertiary)] rounded-lg p-3">
            <p className="text-xs text-[var(--foreground-muted)] mb-1">{t('calcTime')}</p>
            <p className="text-lg font-bold number-display text-[var(--green-400)]">
              {result.metadata.calculationTime.toFixed(1)}
            </p>
            <p className="text-xs text-[var(--foreground-muted)]">ms</p>
          </div>
        </div>
      </div>

      {/* Regeneration Warning */}
      {result.mechanical.regeneration.requiresExternalResistor && (
        <div className="card p-5 bg-[var(--amber-500)]/5 border-[var(--amber-500)]/30">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-[var(--amber-500)]/10 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-[var(--amber-400)]" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-[var(--amber-400)] mb-2">制动电阻警告</h4>
              <p className="text-sm text-[var(--foreground-secondary)] mb-3">
                {result.mechanical.regeneration.warning}
              </p>
              {result.mechanical.regeneration.recommendedResistor && (
                <div className="bg-[var(--background-tertiary)] rounded-lg p-3">
                  <p className="text-sm font-medium text-[var(--foreground)] mb-2">建议外部电阻规格：</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-[var(--foreground-muted)]">持续功率: </span>
                      <span className="text-[var(--amber-400)] font-medium">
                        ≥ {result.mechanical.regeneration.recommendedResistor.minPower.toFixed(0)}W
                      </span>
                    </div>
                    <div>
                      <span className="text-[var(--foreground-muted)]">阻值: </span>
                      <span className="text-[var(--amber-400)] font-medium">
                        ≈ {result.mechanical.regeneration.recommendedResistor.resistance}Ω
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Motor Recommendations */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-[var(--primary-400)]" />
          <h3 className="text-lg font-semibold text-[var(--foreground)]">
            {t('recommendedMotors', { count: result.motorRecommendations.length })}
          </h3>
        </div>

        <div className="space-y-3">
          {result.motorRecommendations.map((rec, index) => (
            <div
              key={rec.motor.id}
              onClick={() => setSelectedMotorIndex(index)}
              className={`
                card p-4 cursor-pointer transition-all duration-200
                ${selectedMotorIndex === index
                  ? 'border-[var(--primary-500)] bg-[var(--primary-500)]/5 shadow-lg shadow-[var(--primary-500)]/10'
                  : 'hover:border-[var(--border-hover)]'
                }
              `}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`
                    w-10 h-10 rounded-lg flex items-center justify-center
                    ${selectedMotorIndex === index ? 'bg-[var(--primary-500)]/20' : 'bg-[var(--background-tertiary)]'}
                  `}>
                    <span className="text-lg">{index + 1}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-lg text-[var(--foreground)]">{rec.motor.model}</div>
                    <div className="text-sm text-[var(--foreground-muted)]">
                      {rec.motor.ratedTorque} N·m / {rec.motor.ratedSpeed} rpm
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-xs text-[var(--foreground-muted)]">{t('matchScore')}</div>
                    <div
                      className="text-2xl font-bold number-display"
                      style={{ color: getMatchScoreColor(rec.matchScore) }}
                    >
                      {rec.matchScore}%
                    </div>
                  </div>
                  {getFeasibilityBadge(rec.feasibility)}
                </div>
              </div>

              {rec.warnings.length > 0 && (
                <div className="mt-3 pt-3 border-t border-[var(--border-subtle)]">
                  {rec.warnings.map((w, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-[var(--amber-400)]">
                      <AlertTriangle className="w-4 h-4" />
                      {w}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* System Configuration */}
      {config && (
        <SystemSummary
          config={config}
          mechanical={result.mechanical}
        />
      )}

      {/* Detailed Calculations */}
      {input && (
        <DetailedCalculations
          input={input}
          mechanical={result.mechanical}
        />
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t border-[var(--border-subtle)]">
        <button
          onClick={prevStep}
          className="btn btn-secondary"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('backToEdit')}
        </button>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={reset}
            className="btn btn-secondary"
          >
            <RotateCcw className="w-4 h-4" />
            {t('restart')}
          </button>

          <div className="relative">
            <button
              ref={saveButtonRef}
              onClick={() => {
                if (!isSaved) {
                  completeAxis();
                  setIsSaved(true);
                  setShowSaveMenu(true);
                } else {
                  setShowSaveMenu(!showSaveMenu);
                }
              }}
              className="btn btn-primary"
            >
              {isSaved ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  已保存
                  {showSaveMenu ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  保存到篮子
                </>
              )}
            </button>

            <SaveToBasketMenu
              isOpen={showSaveMenu}
              onClose={() => setShowSaveMenu(false)}
              onCloneAxis={() => {
                const currentAxisId = useProjectStore.getState().currentAxisId;
                const newAxisId = addAxis(`轴-${project.axes.length + 1}`, currentAxisId);
                switchAxis(newAxisId);
                setShowSaveMenu(false);
                reset();
              }}
              onAddNewAxis={() => {
                const newAxisId = addAxis(`轴-${project.axes.length + 1}`);
                switchAxis(newAxisId);
                setShowSaveMenu(false);
                reset();
              }}
              onContinueEditing={() => setShowSaveMenu(false)}
              triggerRef={saveButtonRef}
            />
          </div>

          <PdfExportButton disabled={!config} />
        </div>
      </div>
    </div>
  );
}
