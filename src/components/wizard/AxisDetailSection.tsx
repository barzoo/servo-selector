'use client';

import React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import type { AxisConfig } from '@/types';

interface AxisDetailSectionProps {
  axis: AxisConfig;
  axisIndex: number;
}

export function AxisDetailSection({ axis, axisIndex }: AxisDetailSectionProps) {
  const t = useTranslations();
  const locale = useLocale();
  const result = axis.result;
  const recommendation = result?.motorRecommendations[0];
  const systemConfig = recommendation?.systemConfig;

  if (!result || !recommendation) {
    return null;
  }

  return (
    <div>
      {/* Axis Title */}
      <div style={{
        textAlign: 'center',
        borderBottom: '3px solid #1e40af',
        paddingBottom: '1rem',
        marginBottom: '1.5rem'
      }}>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          color: '#1e3a8a',
          margin: 0
        }}>
          {t('result.axisNameWithLabel', { index: axisIndex + 1, name: axis.name })}
        </h2>
        {axis.completedAt && (
          <p style={{
            fontSize: '0.875rem',
            color: '#6b7280',
            marginTop: '0.25rem'
          }}>
            {t('result.completedAt')}: {new Date(axis.completedAt).toLocaleDateString(locale)}
          </p>
        )}
      </div>

      {/* Calculation Summary */}
      <Section title={t('result.calculationSummary')}>
        <div style={{
          border: '1px solid #d1d5db',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          <div style={{ padding: '1rem' }}>
            <CompactRow
              label={t('result.loadInertia')}
              value={`${result.mechanical.loadInertia.toExponential(3)} kg·m²`}
            />
            <CompactRow
              label={t('result.rmsTorque')}
              value={`${result.mechanical.torques.rms.toFixed(2)} N·m`}
            />
            <CompactRow
              label={t('result.peakTorque')}
              value={`${result.mechanical.torques.peak.toFixed(2)} N·m`}
            />
            <CompactRow
              label={t('result.maxSpeed')}
              value={`${result.mechanical.speeds.max.toFixed(0)} rpm`}
            />
          </div>
        </div>
      </Section>

      {/* 系统配置清单 */}
      <Section title={t('systemSummary.configList')}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {systemConfig && (
            <>
              {/* Motor */}
              <div style={{
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                overflow: 'hidden'
              }}>
                <div style={{
                  background: '#f3f4f6',
                  padding: '0.75rem 1rem',
                  fontWeight: 600,
                  color: '#374151',
                  borderBottom: '1px solid #d1d5db'
                }}>
                  {t('systemSummary.motorDetails')}
                </div>
                <div style={{ padding: '1rem' }}>
                  <InfoRow
                    label={t('systemSummary.columns.partNumber')}
                    value={recommendation.motor.model}
                    mono
                  />
                  <InfoRow
                    label={t('systemSummary.columns.description')}
                    value={recommendation.motor.baseModel}
                  />
                </div>
              </div>

              {/* Drive */}
              {systemConfig.drive && (
                <div style={{
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    background: '#f3f4f6',
                    padding: '0.75rem 1rem',
                    fontWeight: 600,
                    color: '#374151',
                    borderBottom: '1px solid #d1d5db'
                  }}>
                    {t('systemSummary.driveDetails')}
                  </div>
                  <div style={{ padding: '1rem' }}>
                    <InfoRow
                      label={t('systemSummary.columns.partNumber')}
                      value={systemConfig.drive.model}
                      mono
                    />
                    <InfoRow
                      label={t('systemSummary.columns.description')}
                      value={systemConfig.drive.baseModel}
                    />
                  </div>
                </div>
              )}

              {/* Cables */}
              {systemConfig.accessories && (
                <>
                  <div style={{
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      background: '#f3f4f6',
                      padding: '0.75rem 1rem',
                      fontWeight: 600,
                      color: '#374151',
                      borderBottom: '1px solid #d1d5db'
                    }}>
                      {t('systemSummary.labels.motorCable')}
                    </div>
                    <div style={{ padding: '1rem' }}>
                      <InfoRow
                        label={t('systemSummary.columns.partNumber')}
                        value={systemConfig.accessories.motorCable.model}
                        mono
                      />
                      <InfoRow
                        label={t('systemSummary.cable.length')}
                        value={typeof systemConfig.accessories.motorCable.length === 'number'
                          ? `${systemConfig.accessories.motorCable.length} m`
                          : t('systemSummary.cable.terminalOnly')}
                      />
                    </div>
                  </div>

                  <div style={{
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      background: '#f3f4f6',
                      padding: '0.75rem 1rem',
                      fontWeight: 600,
                      color: '#374151',
                      borderBottom: '1px solid #d1d5db'
                    }}>
                      {t('systemSummary.labels.encoderCable')}
                    </div>
                    <div style={{ padding: '1rem' }}>
                      <InfoRow
                        label={t('systemSummary.columns.partNumber')}
                        value={systemConfig.accessories.encoderCable.model}
                        mono
                      />
                      <InfoRow
                        label={t('systemSummary.cable.length')}
                        value={typeof systemConfig.accessories.encoderCable.length === 'number'
                          ? `${systemConfig.accessories.encoderCable.length} m`
                          : t('systemSummary.cable.terminalOnly')}
                      />
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </Section>

      {/* Motor Details */}
      {recommendation.motor && (
        <Section title={t('systemSummary.motorDetails')}>
          <div style={{
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '1rem' }}>
              <ParamRow
                label={t('systemSummary.labels.ratedPower')}
                value={`${recommendation.motor.ratedPower} W`}
              />
              <ParamRow
                label={t('systemSummary.labels.ratedSpeed')}
                value={`${recommendation.motor.ratedSpeed} rpm`}
              />
              <ParamRow
                label={t('systemSummary.labels.ratedTorque')}
                value={`${recommendation.motor.ratedTorque} N·m`}
              />
              <ParamRow
                label={t('systemSummary.labels.peakTorque')}
                value={`${recommendation.motor.peakTorque} N·m`}
              />
              <ParamRow
                label={t('systemSummary.labels.maxSpeed')}
                value={`${recommendation.motor.maxSpeed} rpm`}
              />
              <ParamRow
                label={t('systemSummary.labels.ratedCurrent')}
                value={`${recommendation.motor.ratedCurrent} A`}
              />
              <ParamRow
                label={t('systemSummary.labels.rotorInertia')}
                value={`${recommendation.motor.rotorInertia.toExponential(5)} kg·m²`}
              />
              <ParamRow
                label={t('systemSummary.labels.torqueConstant')}
                value={`${recommendation.motor.torqueConstant} N·m/A`}
              />
            </div>
          </div>
        </Section>
      )}

      {/* Drive Details */}
      {systemConfig?.drive && (
        <Section title={t('systemSummary.driveDetails')}>
          <div style={{
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '1rem' }}>
              <ParamRow
                label={t('systemSummary.labels.maxCurrent')}
                value={`${systemConfig.drive.maxCurrent} A`}
              />
              <ParamRow
                label={t('systemSummary.labels.ratedCurrent')}
                value={`${systemConfig.drive.ratedCurrent} A`}
              />
              <ParamRow
                label={t('systemSummary.labels.overloadCapacity')}
                value={`${systemConfig.drive.overloadCapacity} ×`}
              />
              <ParamRow
                label={t('systemSummary.labels.pwmFrequency')}
                value={`${systemConfig.drive.ratedPwmFrequency} kHz`}
              />
            </div>
          </div>
        </Section>
      )}

      {/* Regeneration Analysis */}
      {result.mechanical.regeneration && (
        <Section title={t('systemSummary.regeneration')}>
          <div style={{
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '1rem' }}>
              <ParamRow
                label={t('systemSummary.labels.energyPerCycle')}
                value={`${result.mechanical.regeneration.energyPerCycle.toFixed(1)} J`}
              />
              <ParamRow
                label={t('systemSummary.labels.brakingPower')}
                value={`${result.mechanical.regeneration.brakingPower.toFixed(1)} W`}
              />
              <ParamRow
                label={t('systemSummary.labels.externalResistorRequired')}
                value={result.mechanical.regeneration.requiresExternalResistor
                  ? t('systemSummary.options.yes')
                  : t('systemSummary.options.no')}
              />
            </div>
          </div>
        </Section>
      )}
    </div>
  );
}

// Helper Components
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <h3 style={{
        fontSize: '1rem',
        fontWeight: 700,
        color: '#1e3a8a',
        borderBottom: '2px solid #e5e7eb',
        paddingBottom: '0.5rem',
        marginBottom: '0.75rem'
      }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

function ParamRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      padding: '0.375rem 0'
    }}>
      <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>{label}</span>
      <span style={{
        fontSize: '0.875rem',
        fontWeight: 500,
        color: '#1f2937'
      }}>{value}</span>
    </div>
  );
}

function CompactRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', padding: '0.375rem 0' }}>
      <span style={{
        fontSize: '0.875rem',
        color: '#6b7280',
        width: '8rem',
        flexShrink: 0
      }}>{label}</span>
      <span style={{
        fontSize: '0.875rem',
        fontWeight: 500,
        color: '#1f2937'
      }}>{value}</span>
    </div>
  );
}

function InfoRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{ marginBottom: '0.5rem' }}>
      <span style={{
        fontSize: '0.875rem',
        color: '#6b7280'
      }}>{label}: </span>
      <span style={{
        fontSize: '0.875rem',
        fontWeight: 500,
        color: '#1f2937',
        fontFamily: mono ? 'monospace' : 'inherit'
      }}>{value}</span>
    </div>
  );
}
