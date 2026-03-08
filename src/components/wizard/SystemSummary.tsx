'use client';

import React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import type {
  SystemConfiguration,
  MechanicalResult,
  MC20Motor,
  XC20Drive,
  SummaryItem,
  SystemConfigExportData,
} from '@/types';
import motorsData from '@/data/motors.json';
import drivesData from '@/data/drives.json';

// Extract motors and drives arrays from the JSON data
const motors: MC20Motor[] = (motorsData as { motors: MC20Motor[] }).motors;
const drives: XC20Drive[] = (drivesData as { drives: XC20Drive[] }).drives;

interface SystemSummaryProps {
  config: SystemConfiguration;
  mechanical?: MechanicalResult;
}

/**
 * Find motor by part number from motors.json
 * Time Complexity: O(n) where n is the number of motors
 * Space Complexity: O(1)
 */
export function findMotor(partNumber: string): MC20Motor | undefined {
  return motors.find((m) => m.model === partNumber);
}

/**
 * Find drive by part number from drives.json
 * Time Complexity: O(n) where n is the number of drives
 * Space Complexity: O(1)
 */
export function findDrive(partNumber: string): XC20Drive | undefined {
  return drives.find((d) => d.model === partNumber);
}

/**
 * Generate cable description based on type, length, and spec
 * Time Complexity: O(1)
 * Space Complexity: O(1)
 */
export function getCableDescription(
  type: 'MOTOR' | 'ENCODER' | 'COMMUNICATION',
  length: number | 'TERMINAL_ONLY',
  spec: string,
  t: (key: string) => string,
  tLabels: (key: string) => string
): string {
  if (length === 'TERMINAL_ONLY') {
    return `${spec} - ${t('cable.terminalOnly')}`;
  }

  const typeLabels: Record<string, string> = {
    MOTOR: tLabels('motorCable'),
    ENCODER: tLabels('encoderCable'),
    COMMUNICATION: tLabels('commCable'),
  };

  return `${typeLabels[type] || type} - ${spec}, ${length}${t('cable.lengthUnit')}`;
}

/**
 * Build array of SummaryItem from configuration
 * Time Complexity: O(1) - fixed number of items
 * Space Complexity: O(1) - fixed size array
 */
export function buildSummaryItems(
  config: SystemConfiguration,
  t: (key: string) => string,
  tLabels: (key: string) => string,
  locale: string = 'zh'
): SummaryItem[] {
  const items: SummaryItem[] = [];

  // Motor
  const motor = findMotor(config.motor.partNumber);
  const motorDesc = motor?.description.shortEn && locale === 'en'
    ? motor.description.shortEn
    : motor?.description.short || '';
  items.push({
    partNumber: config.motor.partNumber,
    category: 'MOTOR',
    typeLabel: t('motor'),
    description: motorDesc,
  });

  // Drive
  const drive = findDrive(config.drive.partNumber);
  const driveDesc = drive?.description.shortEn && locale === 'en'
    ? drive.description.shortEn
    : drive?.description.short || '';
  items.push({
    partNumber: config.drive.partNumber,
    category: 'DRIVE',
    typeLabel: t('drive'),
    description: driveDesc,
  });

  // Motor cable
  items.push({
    partNumber: config.cables.motor.partNumber,
    category: 'MOTOR_CABLE',
    typeLabel: tLabels('motorCable'),
    description: getCableDescription(
      'MOTOR',
      config.cables.motor.length,
      config.cables.motor.spec,
      t,
      tLabels
    ),
  });

  // Encoder cable
  items.push({
    partNumber: config.cables.encoder.partNumber,
    category: 'ENCODER_CABLE',
    typeLabel: tLabels('encoderCable'),
    description: getCableDescription(
      'ENCODER',
      config.cables.encoder.length,
      config.cables.encoder.spec,
      t,
      tLabels
    ),
  });

  // Communication cable (optional)
  if (config.cables.communication) {
    items.push({
      partNumber: config.cables.communication.partNumber,
      category: 'COMM_CABLE',
      typeLabel: tLabels('commCable'),
      description: getCableDescription(
        'COMMUNICATION',
        config.cables.communication.length,
        tLabels('commCable'),
        t,
        tLabels
      ),
    });
  }

  // EMC Filter (optional)
  if (config.accessories.emcFilter) {
    items.push({
      partNumber: config.accessories.emcFilter,
      category: 'EMC_FILTER',
      typeLabel: tLabels('emcFilter'),
      description: tLabels('emcFilter'),
    });
  }

  // Brake Resistor (optional)
  if (config.accessories.brakeResistor) {
    items.push({
      partNumber: config.accessories.brakeResistor.partNumber,
      category: 'BRAKE_RESISTOR',
      typeLabel: tLabels('brakeResistor'),
      description: `${tLabels('brakeResistor')} - ${config.accessories.brakeResistor.model}`,
    });
  }

  return items;
}

/**
 * Generate export data structure for system configuration
 * Time Complexity: O(n + m) where n is motors count, m is drives count
 * Space Complexity: O(1) - returns fixed size object
 */
export function generateExportData(
  config: SystemConfiguration,
  t: (key: string) => string,
  tLabels: (key: string) => string,
  mechanical?: MechanicalResult,
  locale: string = 'zh'
): SystemConfigExportData {
  const motor = findMotor(config.motor.partNumber) || null;
  const drive = findDrive(config.drive.partNumber) || null;

  return {
    summary: buildSummaryItems(config, t, tLabels, locale),
    details: {
      motor,
      drive,
      cables: {
        motor: {
          model: config.cables.motor.spec,
          length: config.cables.motor.length,
          description: getCableDescription(
            'MOTOR',
            config.cables.motor.length,
            config.cables.motor.spec,
            t,
            tLabels
          ),
        },
        encoder: {
          model: config.cables.encoder.spec,
          length: config.cables.encoder.length,
          description: getCableDescription(
            'ENCODER',
            config.cables.encoder.length,
            config.cables.encoder.spec,
            t,
            tLabels
          ),
        },
        communication: config.cables.communication
          ? {
              length: config.cables.communication.length,
              description: getCableDescription(
                'COMMUNICATION',
                config.cables.communication.length,
                tLabels('commCable'),
                t,
                tLabels
              ),
            }
          : null,
      },
      accessories: {
        brakeResistor: config.accessories.brakeResistor || null,
        emcFilter: config.accessories.emcFilter || null,
      },
    },
    calculations: mechanical,
  };
}

export function SystemSummary({ config, mechanical }: SystemSummaryProps) {
  const t = useTranslations('systemSummary');
  const tOptions = useTranslations('systemSummary.options');
  const tLabels = useTranslations('systemSummary.labels');
  const locale = useLocale();

  const summaryItems = buildSummaryItems(config, t, tLabels, locale);
  const motor = findMotor(config.motor.partNumber);
  const drive = findDrive(config.drive.partNumber);

  return (
    <div className="space-y-6">
      {/* Summary Table */}
      <div className="card overflow-hidden">
        <div className="px-4 py-3 bg-[var(--background-tertiary)] border-b border-[var(--border-default)]">
          <h4 className="font-semibold text-[var(--foreground)]">{t('configList')}</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--background-tertiary)]">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-[var(--foreground-secondary)]">{t('columns.partNumber')}</th>
                <th className="px-4 py-2 text-left font-medium text-[var(--foreground-secondary)]">{t('columns.type')}</th>
                <th className="px-4 py-2 text-left font-medium text-[var(--foreground-secondary)]">{t('columns.description')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {summaryItems.map((item, index) => (
                <tr key={index} className="hover:bg-[var(--background-tertiary)]/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-[var(--primary-300)]">
                    {item.partNumber}
                  </td>
                  <td className="px-4 py-3 text-[var(--foreground-secondary)]">{item.typeLabel}</td>
                  <td className="px-4 py-3 text-[var(--foreground-muted)]">{item.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Motor Details */}
      {motor && (
        <div className="card overflow-hidden">
          <div className="px-4 py-3 bg-[var(--primary-500)]/10 border-b border-[var(--primary-500)]/20">
            <h4 className="font-semibold text-[var(--primary-300)]">{t('motorDetails')}</h4>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-[var(--foreground-muted)] block">{tLabels('ratedPower')}</span>
                <span className="font-medium text-[var(--foreground)]">{motor.ratedPower} W</span>
              </div>
              <div>
                <span className="text-[var(--foreground-muted)] block">{tLabels('ratedSpeed')}</span>
                <span className="font-medium text-[var(--foreground)]">{motor.ratedSpeed} rpm</span>
              </div>
              <div>
                <span className="text-[var(--foreground-muted)] block">{tLabels('ratedTorque')}</span>
                <span className="font-medium text-[var(--foreground)]">{motor.ratedTorque} N·m</span>
              </div>
              <div>
                <span className="text-[var(--foreground-muted)] block">{tLabels('peakTorque')}</span>
                <span className="font-medium text-[var(--foreground)]">{motor.peakTorque} N·m</span>
              </div>
              <div>
                <span className="text-[var(--foreground-muted)] block">{tLabels('maxSpeed')}</span>
                <span className="font-medium text-[var(--foreground)]">{motor.maxSpeed} rpm</span>
              </div>
              <div>
                <span className="text-[var(--foreground-muted)] block">{tLabels('ratedCurrent')}</span>
                <span className="font-medium text-[var(--foreground)]">{motor.ratedCurrent} A</span>
              </div>
              <div>
                <span className="text-[var(--foreground-muted)] block">{tLabels('rotorInertia')}</span>
                <span className="font-medium text-[var(--foreground)]">
                  {motor.rotorInertia.toExponential(5)} kg·m²
                </span>
              </div>
              <div>
                <span className="text-[var(--foreground-muted)] block">{tLabels('torqueConstant')}</span>
                <span className="font-medium text-[var(--foreground)]">{motor.torqueConstant} N·m/A</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-[var(--border-subtle)]">
              <h5 className="text-sm font-medium text-[var(--foreground-secondary)] mb-2">{t('motorOptions')}</h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-[var(--foreground-muted)] block">{tLabels('encoderType')}</span>
                  <span className="font-medium text-[var(--foreground)]">
                    {motor.options.encoder.type === 'BATTERY_MULTI_TURN'
                      ? tOptions('batteryMultiTurn')
                      : tOptions('mechanicalMultiTurn')}
                    ({motor.options.encoder.code}型)
                  </span>
                </div>
                <div>
                  <span className="text-[var(--foreground-muted)] block">{tLabels('brake')}</span>
                  <span className="font-medium text-[var(--foreground)]">
                    {motor.options.brake.hasBrake ? tOptions('yes') : tOptions('no')}
                  </span>
                </div>
                <div>
                  <span className="text-[var(--foreground-muted)] block">{tLabels('shaftType')}</span>
                  <span className="font-medium text-[var(--foreground)]">
                    {motor.options.keyShaft.hasKey ? tOptions('keyShaft') : tOptions('smoothShaft')}
                  </span>
                </div>
                <div>
                  <span className="text-[var(--foreground-muted)] block">{tLabels('protection')}</span>
                  <span className="font-medium text-[var(--foreground)]">{motor.options.protection.level}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Drive Details */}
      {drive && (
        <div className="card overflow-hidden">
          <div className="px-4 py-3 bg-[var(--green-500)]/10 border-b border-[var(--green-500)]/20">
            <h4 className="font-semibold text-[var(--green-400)]">{t('driveDetails')}</h4>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-[var(--foreground-muted)] block">{tLabels('maxCurrent')}</span>
                <span className="font-medium text-[var(--foreground)]">{drive.maxCurrent} A</span>
              </div>
              <div>
                <span className="text-[var(--foreground-muted)] block">{tLabels('ratedCurrent')}</span>
                <span className="font-medium text-[var(--foreground)]">{drive.ratedCurrent} A</span>
              </div>
              <div>
                <span className="text-[var(--foreground-muted)] block">{tLabels('overloadCapacity')}</span>
                <span className="font-medium text-[var(--foreground)]">{drive.overloadCapacity} 倍</span>
              </div>
              <div>
                <span className="text-[var(--foreground-muted)] block">{tLabels('pwmFrequency')}</span>
                <span className="font-medium text-[var(--foreground)]">{drive.ratedPwmFrequency} kHz</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-[var(--border-subtle)]">
              <h5 className="text-sm font-medium text-[var(--foreground-secondary)] mb-2">{t('driveOptions')}</h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-[var(--foreground-muted)] block">{tLabels('communication')}</span>
                  <span className="font-medium text-[var(--foreground)]">
                    {drive.communication.type === 'ETHERCAT'
                      ? tOptions('ethercat')
                      : drive.communication.type === 'PROFINET'
                        ? tOptions('profinet')
                        : tOptions('ethernetIp')}
                  </span>
                </div>
                <div>
                  <span className="text-[var(--foreground-muted)] block">{tLabels('panel')}</span>
                  <span className="font-medium text-[var(--foreground)]">
                    {drive.options.panel.code === '01B' ? tOptions('withDisplay') : tOptions('withoutDisplay')}
                  </span>
                </div>
                <div>
                  <span className="text-[var(--foreground-muted)] block">{tLabels('safety')}</span>
                  <span className="font-medium text-[var(--foreground)]">
                    {drive.options.safety.code === 'ST' ? tOptions('sto') : tOptions('no')}
                  </span>
                </div>
                <div>
                  <span className="text-[var(--foreground-muted)] block">{tLabels('cooling')}</span>
                  <span className="font-medium text-[var(--foreground)]">{drive.hasFan ? tOptions('fan') : tOptions('natural')}</span>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-[var(--border-subtle)]">
              <h5 className="text-sm font-medium text-[var(--foreground-secondary)] mb-2">{t('brakingCapability')}</h5>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-[var(--foreground-muted)] block">{tLabels('internalResistance')}</span>
                  <span className="font-medium text-[var(--foreground)]">{drive.braking.internalResistance} Ω</span>
                </div>
                <div>
                  <span className="text-[var(--foreground-muted)] block">{tLabels('continuousPower')}</span>
                  <span className="font-medium text-[var(--foreground)]">{drive.braking.continuousPower} W</span>
                </div>
                <div>
                  <span className="text-[var(--foreground-muted)] block">{tLabels('peakPower')}</span>
                  <span className="font-medium text-[var(--foreground)]">{drive.braking.peakPower} W</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cable Specifications */}
      <div className="card overflow-hidden">
        <div className="px-4 py-3 bg-[var(--primary-500)]/10 border-b border-[var(--primary-500)]/20">
          <h4 className="font-semibold text-[var(--primary-300)]">{t('cableSpecs')}</h4>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-[var(--background-tertiary)] rounded-lg">
              <h5 className="text-sm font-medium text-[var(--foreground-secondary)] mb-2">{tLabels('motorCable')}</h5>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-[var(--foreground-muted)]">{t('columns.partNumber')}:</span>
                  <span className="font-mono text-xs text-[var(--primary-300)]">{config.cables.motor.partNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--foreground-muted)]">{t('cable.spec')}:</span>
                  <span className="text-[var(--foreground)]">{config.cables.motor.spec}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--foreground-muted)]">{t('cable.length')}:</span>
                  <span className="text-[var(--foreground)]">{config.cables.motor.length} {t('cable.lengthUnit')}</span>
                </div>
              </div>
            </div>
            <div className="p-3 bg-[var(--background-tertiary)] rounded-lg">
              <h5 className="text-sm font-medium text-[var(--foreground-secondary)] mb-2">{tLabels('encoderCable')}</h5>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-[var(--foreground-muted)]">{t('columns.partNumber')}:</span>
                  <span className="font-mono text-xs text-[var(--primary-300)]">{config.cables.encoder.partNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--foreground-muted)]">{t('cable.spec')}:</span>
                  <span className="text-[var(--foreground)]">{config.cables.encoder.spec}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--foreground-muted)]">{t('cable.length')}:</span>
                  <span className="text-[var(--foreground)]">{config.cables.encoder.length} {t('cable.lengthUnit')}</span>
                </div>
              </div>
            </div>
            {config.cables.communication && (
              <div className="p-3 bg-[var(--background-tertiary)] rounded-lg">
                <h5 className="text-sm font-medium text-[var(--foreground-secondary)] mb-2">{tLabels('commCable')}</h5>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[var(--foreground-muted)]">{t('columns.partNumber')}:</span>
                    <span className="font-mono text-xs text-[var(--primary-300)]">
                      {config.cables.communication.partNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--foreground-muted)]">{t('cable.length')}:</span>
                    <span className="text-[var(--foreground)]">{config.cables.communication.length} {t('cable.lengthUnit')}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Accessories */}
      {(config.accessories.emcFilter || config.accessories.brakeResistor) && (
        <div className="card overflow-hidden">
          <div className="px-4 py-3 bg-[var(--amber-500)]/10 border-b border-[var(--amber-500)]/20">
            <h4 className="font-semibold text-[var(--amber-400)]">{t('accessories')}</h4>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {config.accessories.emcFilter && (
                <div className="p-3 bg-[var(--background-tertiary)] rounded-lg">
                  <h5 className="text-sm font-medium text-[var(--foreground)] mb-2">{tLabels('emcFilter')}</h5>
                  <div className="text-sm">
                    <span className="text-[var(--foreground-muted)]">{t('columns.partNumber')}: </span>
                    <span className="font-mono text-xs text-[var(--primary-300)]">{config.accessories.emcFilter}</span>
                  </div>
                </div>
              )}
              {config.accessories.brakeResistor && (
                <div className="p-3 bg-[var(--background-tertiary)] rounded-lg">
                  <h5 className="text-sm font-medium text-[var(--foreground)] mb-2">{tLabels('brakeResistor')}</h5>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-[var(--foreground-muted)]">{t('columns.type')}:</span>
                      <span className="text-[var(--foreground)]">{config.accessories.brakeResistor.model}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--foreground-muted)]">{t('columns.partNumber')}:</span>
                      <span className="font-mono text-xs text-[var(--primary-300)]">
                        {config.accessories.brakeResistor.partNumber}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Regeneration Info */}
      {mechanical?.regeneration && (
        <div className="card overflow-hidden">
          <div className="px-4 py-3 bg-[var(--red-500)]/10 border-b border-[var(--red-500)]/20">
            <h4 className="font-semibold text-[var(--red-400)]">{t('regeneration')}</h4>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-[var(--foreground-muted)] block">{tLabels('energyPerCycle')}</span>
                <span className="font-medium text-[var(--foreground)]">
                  {mechanical.regeneration.energyPerCycle.toFixed(1)} J
                </span>
              </div>
              <div>
                <span className="text-[var(--foreground-muted)] block">{tLabels('brakingPower')}</span>
                <span className="font-medium text-[var(--foreground)]">
                  {mechanical.regeneration.brakingPower.toFixed(1)} W
                </span>
              </div>
              <div>
                <span className="text-[var(--foreground-muted)] block">{tLabels('externalResistorRequired')}</span>
                <span
                  className={`font-medium ${
                    mechanical.regeneration.requiresExternalResistor
                      ? 'text-[var(--red-400)]'
                      : 'text-[var(--green-400)]'
                  }`}
                >
                  {mechanical.regeneration.requiresExternalResistor ? tOptions('yes') : tOptions('no')}
                </span>
              </div>
              {mechanical.regeneration.recommendedResistor && (
                <div>
                  <span className="text-[var(--foreground-muted)] block">{tLabels('recommendedResistorPower')}</span>
                  <span className="font-medium text-[var(--foreground)]">
                    {mechanical.regeneration.recommendedResistor.minPower.toFixed(0)} W
                  </span>
                </div>
              )}
            </div>
            {mechanical.regeneration.warning && (
              <div className="mt-3 p-3 bg-[var(--amber-500)]/10 border border-[var(--amber-500)]/30 rounded text-sm text-[var(--amber-400)]">
                {mechanical.regeneration.warning}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
