'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWizardStore } from '@/stores/wizard-store';
import { SizingEngine } from '@/lib/calculations/sizing-engine';
import { MotorSelectionPanel } from '@/components/wizard/MotorSelectionPanel';
import { DriveConfigurationPanel } from '@/components/wizard/DriveConfigurationPanel';
import { CableConfigurationPanel } from '@/components/wizard/CableConfigurationPanel';
import { SystemSummary } from '@/components/wizard/SystemSummary';
import type { MotorSelections, XC20Drive } from '@/types';

export default function Step5Page() {
  const router = useRouter();
  const { input, result, setResult, setSelections, goToStep, completeWizard, isComplete } = useWizardStore();
  const [isCalculating, setIsCalculating] = useState(false);

  const [selections, setLocalSelections] = useState<MotorSelections>(() => {
    const firstMotor = result?.motorRecommendations[0]?.motor;
    return input?.selections || {
      motorId: firstMotor?.id || '',
      motorOptions: {
        brake: false,
        encoderType: 'A',
        keyShaft: false,
      },
      driveOptions: {
        communication: 'ETHERCAT',
        panel: 'WITH_DISPLAY',
        safety: 'NONE',
      },
      cables: {
        motorLength: 3,
        encoderLength: 3,
      },
      accessories: {
        // emcFilter removed - not available in XC20 drives
      },
    };
  });

  // 当选择变化时重新计算
  useEffect(() => {
    if (!input?.project || !input?.mechanism || !input?.motion || !input?.duty || !input?.preferences) return;

    setIsCalculating(true);
    const engine = new SizingEngine();
    const newResult = engine.calculate({
      project: input.project,
      mechanism: input.mechanism,
      motion: input.motion,
      duty: input.duty,
      preferences: input.preferences,
      selections,
    });
    setResult(newResult);
    setSelections(selections);
    setIsCalculating(false);
  }, [selections]);

  const selectedMotor = result?.motorRecommendations.find(
    r => r.motor.id === selections.motorId
  )?.motor;

  const selectedDrive = selectedMotor
    ? result?.motorRecommendations.find(r => r.motor.id === selections.motorId)?.systemConfig?.drive
    : undefined;

  const isVerticalAxis = input?.duty?.mountingOrientation?.startsWith('VERTICAL');

  // 当选型完成时，自动导航回主页显示结果
  useEffect(() => {
    if (isComplete) {
      router.push('/');
    }
  }, [isComplete, router]);

  if (!result) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-8">
          <p className="text-gray-500">请先完成前面的步骤</p>
          <button
            onClick={() => goToStep(1)}
            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded"
          >
            返回第一步
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold">Step 5: 系统配置</h2>

      {isCalculating && (
        <div className="text-center py-4 text-gray-500">
          计算中...
        </div>
      )}

      {result.motorRecommendations.length > 0 && (
        <MotorSelectionPanel
          recommendations={result.motorRecommendations}
          selectedMotorId={selections.motorId}
          selectedOptions={selections.motorOptions}
          onMotorSelect={(id) => setLocalSelections({ ...selections, motorId: id })}
          onOptionsChange={(opts) => setLocalSelections({ ...selections, motorOptions: opts })}
          verticalAxis={isVerticalAxis || false}
        />
      )}

      {selectedDrive && (
        <DriveConfigurationPanel
          drive={selectedDrive as XC20Drive}
          selectedOptions={selections.driveOptions}
          onOptionsChange={(opts) => setLocalSelections({ ...selections, driveOptions: opts })}
        />
      )}

      {selectedMotor && (
        <CableConfigurationPanel
          motor={selectedMotor}
          selectedOptions={selections.motorOptions}
          cableLengths={selections.cables}
          onCablesChange={(cables) => setLocalSelections({ ...selections, cables })}
          communicationType={selections.driveOptions.communication}
        />
      )}

      {result.systemConfiguration && (
        <SystemSummary config={result.systemConfiguration} />
      )}

      <div className="flex justify-between pt-6">
        <button
          onClick={() => goToStep(4)}
          className="px-6 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          上一步
        </button>
        <button
          onClick={() => completeWizard()}
          className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          生成规格书
        </button>
      </div>
    </div>
  );
}
