/**
 * DetailedCalculations Component
 *
 * 可折叠的详细计算信息展示组件，包含机械参数、惯量计算、扭矩分析、运动参数、功率与能量五个卡片。
 *
 * 论文引用:
 * - UI设计参考 Material Design 折叠面板规范
 * - 数值格式化遵循 ISO 80000-1 量与单位标准
 *
 * 复杂度分析:
 * - 渲染时间复杂度: O(1) - 固定数量的卡片和参数
 * - 空间复杂度: O(1) - 固定结构的数据展示
 */

'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { SizingInput, MechanicalResult, DutyConditions, SystemPreferences } from '@/types';
import {
  extractCalculationDetails,
  formatInertia,
  formatTorque,
  formatSpeed,
  formatTime,
  formatPower,
  formatEnergy,
} from '@/lib/calculations/calculation-details';

// Flexible input type that matches store's StoreInput
type StoreInput = Partial<Omit<SizingInput, 'duty' | 'preferences'>> & {
  duty?: DutyConditions;
  preferences?: SystemPreferences;
};

interface DetailedCalculationsProps {
  input: StoreInput;
  mechanical: MechanicalResult;
  defaultExpanded?: boolean;
}

/**
 * 参数高亮类型
 */
type HighlightType = 'positive' | 'negative' | 'warning' | 'neutral';

/**
 * 获取数值的高亮类型
 */
function getHighlight(value: number): HighlightType {
  if (value > 0) return 'positive';
  if (value < 0) return 'negative';
  return 'neutral';
}

/**
 * 计算卡片容器组件
 */
function CalculationCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border rounded-lg overflow-hidden">
      <div className="px-4 py-2 bg-blue-50 border-b">
        <h4 className="font-medium text-blue-900">{title}</h4>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

/**
 * 参数行组件
 */
function ParamRow({
  label,
  value,
  unit,
  highlight,
  suffix,
}: {
  label: string;
  value: string | number;
  unit?: string;
  highlight?: HighlightType;
  suffix?: React.ReactNode;
}) {
  const valueClass =
    highlight === 'positive'
      ? 'text-green-700'
      : highlight === 'negative'
        ? 'text-red-600'
        : highlight === 'warning'
          ? 'text-yellow-700'
          : 'text-gray-900';

  return (
    <div className="flex justify-between py-1 items-center">
      <span className="text-gray-700">{label}</span>
      <span className={`font-mono font-medium ${valueClass}`}>
        {value}
        {unit && <span className="text-gray-500 ml-1">{unit}</span>}
        {suffix && <span className="ml-2">{suffix}</span>}
      </span>
    </div>
  );
}

/**
 * 分隔线组件
 */
function Divider() {
  return <div className="border-t my-2" />;
}

/**
 * 机械参数卡片
 */
function MechanismCard({
  details,
  t,
}: {
  details: ReturnType<typeof extractCalculationDetails>;
  t: (key: string) => string;
}) {
  const { mechanism } = details;

  return (
    <CalculationCard title={t('detailedCalculations.mechanism')}>
      <div className="space-y-1">
        <ParamRow
          label={t('detailedCalculations.labels.loadType')}
          value={mechanism.typeLabel}
        />
        {mechanism.params.map((param, index) => (
          <ParamRow
            key={index}
            label={param.label}
            value={param.value}
            unit={param.unit ? t(`detailedCalculations.units.${param.unit}`) : undefined}
          />
        ))}
      </div>
    </CalculationCard>
  );
}

/**
 * 惯量计算卡片
 */
function InertiaCard({
  details,
  t,
}: {
  details: ReturnType<typeof extractCalculationDetails>;
  t: (key: string) => string;
}) {
  const { inertia } = details;

  return (
    <CalculationCard title={t('detailedCalculations.inertia')}>
      <div className="space-y-1">
        <ParamRow
          label={t('detailedCalculations.labels.loadInertia')}
          value={formatInertia(inertia.loadInertia)}
          unit={t('detailedCalculations.units.kgm2')}
        />
        {inertia.components?.map((comp, index) => (
          <ParamRow
            key={index}
            label={comp.name}
            value={formatInertia(comp.value)}
            unit={t('detailedCalculations.units.kgm2')}
          />
        ))}
        <Divider />
        <ParamRow
          label={t('detailedCalculations.labels.totalInertia')}
          value={formatInertia(inertia.totalInertia)}
          unit={t('detailedCalculations.units.kgm2')}
          highlight="positive"
        />
      </div>
    </CalculationCard>
  );
}

/**
 * 扭矩分析卡片
 */
function TorqueCard({
  details,
  t,
}: {
  details: ReturnType<typeof extractCalculationDetails>;
  t: (key: string) => string;
}) {
  const { torques } = details;
  const isRegenerative = torques.decel < 0;

  return (
    <CalculationCard title={t('detailedCalculations.torques')}>
      <div className="space-y-1">
        <ParamRow
          label={t('detailedCalculations.labels.accelTorque')}
          value={formatTorque(torques.accel)}
          unit={t('detailedCalculations.units.nm')}
          highlight={getHighlight(torques.accel)}
        />
        <ParamRow
          label={t('detailedCalculations.labels.constantTorque')}
          value={formatTorque(torques.constant)}
          unit={t('detailedCalculations.units.nm')}
          highlight={getHighlight(torques.constant)}
        />
        <ParamRow
          label={t('detailedCalculations.labels.decelTorque')}
          value={formatTorque(torques.decel)}
          unit={t('detailedCalculations.units.nm')}
          highlight={getHighlight(torques.decel)}
          suffix={
            isRegenerative ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                ⚡{t('detailedCalculations.labels.regenerative')}
              </span>
            ) : undefined
          }
        />
        <Divider />
        <ParamRow
          label={t('detailedCalculations.labels.peakTorque')}
          value={formatTorque(torques.peak)}
          unit={t('detailedCalculations.units.nm')}
          highlight="positive"
        />
        <ParamRow
          label={t('detailedCalculations.labels.rmsTorque')}
          value={formatTorque(torques.rms)}
          unit={t('detailedCalculations.units.nm')}
          highlight="positive"
        />
        {(torques.friction !== undefined || torques.gravity !== undefined) && (
          <>
            <Divider />
            {torques.friction !== undefined && (
              <ParamRow
                label={t('detailedCalculations.labels.frictionTorque')}
                value={formatTorque(torques.friction)}
                unit={t('detailedCalculations.units.nm')}
              />
            )}
            {torques.gravity !== undefined && (
              <ParamRow
                label={t('detailedCalculations.labels.gravityTorque')}
                value={formatTorque(torques.gravity)}
                unit={t('detailedCalculations.units.nm')}
              />
            )}
          </>
        )}
      </div>
    </CalculationCard>
  );
}

/**
 * 运动参数卡片
 */
function MotionCard({
  details,
  t,
}: {
  details: ReturnType<typeof extractCalculationDetails>;
  t: (key: string) => string;
}) {
  const { motion } = details;

  return (
    <CalculationCard title={t('detailedCalculations.motion')}>
      <div className="space-y-1">
        <ParamRow
          label={t('detailedCalculations.labels.maxSpeed')}
          value={formatSpeed(motion.maxSpeed)}
          unit={t('detailedCalculations.units.rpm')}
        />
        {motion.maxSpeedLinear !== undefined && (
          <ParamRow
            label={t('detailedCalculations.labels.maxLinearSpeed')}
            value={formatSpeed(motion.maxSpeedLinear)}
            unit={t('detailedCalculations.units.mmps')}
          />
        )}
        <Divider />
        <ParamRow
          label={t('detailedCalculations.labels.accelTime')}
          value={formatTime(motion.accelTime)}
          unit={t('detailedCalculations.units.s')}
        />
        <ParamRow
          label={t('detailedCalculations.labels.constantTime')}
          value={formatTime(motion.constantTime)}
          unit={t('detailedCalculations.units.s')}
        />
        <ParamRow
          label={t('detailedCalculations.labels.decelTime')}
          value={formatTime(motion.decelTime)}
          unit={t('detailedCalculations.units.s')}
        />
        <ParamRow
          label={t('detailedCalculations.labels.dwellTime')}
          value={formatTime(motion.dwellTime)}
          unit={t('detailedCalculations.units.s')}
        />
        <Divider />
        <ParamRow
          label={t('detailedCalculations.labels.cycleTime')}
          value={formatTime(motion.cycleTime)}
          unit={t('detailedCalculations.units.s')}
        />
        <ParamRow
          label={t('detailedCalculations.labels.cyclesPerMinute')}
          value={motion.cyclesPerMinute}
          unit={t('detailedCalculations.units.cpm')}
        />
      </div>
    </CalculationCard>
  );
}

/**
 * 功率与能量卡片
 */
function PowerCard({
  details,
  t,
}: {
  details: ReturnType<typeof extractCalculationDetails>;
  t: (key: string) => string;
}) {
  const { power, regeneration } = details;

  return (
    <CalculationCard title={t('detailedCalculations.power')}>
      <div className="space-y-1">
        <ParamRow
          label={t('detailedCalculations.labels.peakPower')}
          value={formatPower(power.peak)}
          unit={t('detailedCalculations.units.w')}
        />
        <ParamRow
          label={t('detailedCalculations.labels.continuousPower')}
          value={formatPower(power.continuous)}
          unit={t('detailedCalculations.units.w')}
        />
        {(regeneration.energyPerCycle > 0 || regeneration.brakingPower > 0) && (
          <>
            <Divider />
            <ParamRow
              label={t('detailedCalculations.labels.energyPerCycle')}
              value={formatEnergy(regeneration.energyPerCycle)}
              unit={t('detailedCalculations.units.j')}
            />
            <ParamRow
              label={t('detailedCalculations.labels.brakingPower')}
              value={formatPower(regeneration.brakingPower)}
              unit={t('detailedCalculations.units.w')}
            />
          </>
        )}
        <Divider />
        <div className="flex justify-between py-1 items-center">
          <span className="text-gray-700">
            {t('detailedCalculations.labels.brakeResistor')}
          </span>
          {regeneration.requiresExternalResistor ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
              ⚠️ {t('detailedCalculations.labels.externalRequired')}
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
              ✓ {t('detailedCalculations.labels.internalSufficient')}
            </span>
          )}
        </div>
        {regeneration.requiresExternalResistor &&
          regeneration.recommendedResistor && (
            <div className="text-sm text-gray-600 mt-1">
              ≥{formatPower(regeneration.recommendedResistor.minPower)}W,{' '}
              {regeneration.recommendedResistor.resistance}Ω
            </div>
          )}
      </div>
    </CalculationCard>
  );
}

/**
 * 详细计算信息主组件
 *
 * 可折叠容器，包含五个卡片：机械参数、惯量计算、扭矩分析、运动参数、功率与能量
 */
export function DetailedCalculations({
  input,
  mechanical,
  defaultExpanded = false,
}: DetailedCalculationsProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const t = useTranslations();

  const details = extractCalculationDetails(input, mechanical);

  return (
    <section className="border rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex justify-between items-center transition-colors"
        aria-expanded={isExpanded}
        aria-controls="detailed-calculations-content"
      >
        <span className="font-medium text-gray-800 flex items-center gap-2">
          <span>🔧</span>
          <span>{t('detailedCalculations.title')}</span>
        </span>
        <span className="text-gray-500">{isExpanded ? '▲' : '▼'}</span>
      </button>

      {isExpanded && (
        <div
          id="detailed-calculations-content"
          className="p-4 space-y-4 bg-gray-50/50"
        >
          <MechanismCard details={details} t={t} />
          <InertiaCard details={details} t={t} />
          <TorqueCard details={details} t={t} />
          <MotionCard details={details} t={t} />
          <PowerCard details={details} t={t} />
        </div>
      )}
    </section>
  );
}

export default DetailedCalculations;
