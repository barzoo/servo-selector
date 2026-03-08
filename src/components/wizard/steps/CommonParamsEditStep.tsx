'use client';

import { useState } from 'react';
import { useProjectStore } from '@/stores/project-store';
import { CommonParams } from '@/types';
import { useTranslations } from 'next-intl';
import { Settings2, Thermometer, Shield, Network, Cable, Gauge, Rotate3D } from 'lucide-react';

interface CommonParamsEditStepProps {
  onComplete?: () => void;
}

export function CommonParamsEditStep({ onComplete }: CommonParamsEditStepProps) {
  const { project, updateCommonParams } = useProjectStore();
  const t = useTranslations('projectSettings');
  const commonT = useTranslations('common');

  const [formData, setFormData] = useState<CommonParams>(project.commonParams);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCommonParams(formData);
    onComplete?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Header */}
      <div className="text-center pb-6 border-b border-[var(--border-subtle)]">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--primary-500)]/20 to-[var(--primary-600)]/10 border border-[var(--primary-500)]/30 mb-4">
          <Settings2 className="w-7 h-7 text-[var(--primary-400)]" />
        </div>
        <h2 className="text-2xl font-bold gradient-text mb-2">{t('editCommonTitle')}</h2>
        <p className="text-sm text-[var(--foreground-muted)]">
          {t('editCommonSubtitle')}
        </p>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Ambient Temperature */}
        <div className="group">
          <label className="flex items-center gap-2 text-sm font-medium text-[var(--foreground-secondary)] mb-2">
            <Thermometer className="w-4 h-4 text-[var(--primary-400)]" />
            {t('ambientTemp')}
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={formData.ambientTemp}
              onChange={(e) => setFormData({ ...formData, ambientTemp: parseFloat(e.target.value) || 0 })}
              className="flex-1 px-4 py-3 bg-[var(--background-tertiary)] border border-[var(--border-default)] rounded-xl text-[var(--foreground)] transition-all duration-200 hover:border-[var(--border-hover)] focus:border-[var(--primary-400)] focus:shadow-[0_0_0_3px_rgba(14,165,233,0.15)] outline-none"
            />
            <span className="text-[var(--foreground-muted)] font-medium">°C</span>
          </div>
        </div>

        {/* IP Rating */}
        <div className="group">
          <label className="flex items-center gap-2 text-sm font-medium text-[var(--foreground-secondary)] mb-2">
            <Shield className="w-4 h-4 text-[var(--primary-400)]" />
            {t('ipRating')}
          </label>
          <div className="relative">
            <select
              value={formData.ipRating}
              onChange={(e) => setFormData({ ...formData, ipRating: e.target.value as CommonParams['ipRating'] })}
              className="w-full px-4 py-3 bg-[var(--background-tertiary)] border border-[var(--border-default)] rounded-xl text-[var(--foreground)] transition-all duration-200 hover:border-[var(--border-hover)] focus:border-[var(--primary-400)] focus:shadow-[0_0_0_3px_rgba(14,165,233,0.15)] outline-none appearance-none cursor-pointer"
            >
              <option value="IP54" className="bg-[var(--background-tertiary)]">IP54</option>
              <option value="IP65" className="bg-[var(--background-tertiary)]">IP65</option>
              <option value="IP67" className="bg-[var(--background-tertiary)]">IP67</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-[var(--foreground-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Communication */}
        <div className="group">
          <label className="flex items-center gap-2 text-sm font-medium text-[var(--foreground-secondary)] mb-2">
            <Network className="w-4 h-4 text-[var(--primary-400)]" />
            {t('communication')}
          </label>
          <div className="relative">
            <select
              value={formData.communication}
              onChange={(e) => setFormData({ ...formData, communication: e.target.value as CommonParams['communication'] })}
              className="w-full px-4 py-3 bg-[var(--background-tertiary)] border border-[var(--border-default)] rounded-xl text-[var(--foreground)] transition-all duration-200 hover:border-[var(--border-hover)] focus:border-[var(--primary-400)] focus:shadow-[0_0_0_3px_rgba(14,165,233,0.15)] outline-none appearance-none cursor-pointer"
            >
              <option value="ETHERCAT" className="bg-[var(--background-tertiary)]">EtherCAT</option>
              <option value="PROFINET" className="bg-[var(--background-tertiary)]">PROFINET</option>
              <option value="ETHERNET_IP" className="bg-[var(--background-tertiary)]">EtherNet/IP</option>
              <option value="ANALOG" className="bg-[var(--background-tertiary)]">Analog</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-[var(--foreground-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Cable Length */}
        <div className="group">
          <label className="flex items-center gap-2 text-sm font-medium text-[var(--foreground-secondary)] mb-2">
            <Cable className="w-4 h-4 text-[var(--primary-400)]" />
            {t('cableLength')}
          </label>
          <div className="relative">
            <select
              value={formData.cableLength}
              onChange={(e) => setFormData({ ...formData, cableLength: e.target.value === 'TERMINAL_ONLY' ? 'TERMINAL_ONLY' : parseInt(e.target.value) })}
              className="w-full px-4 py-3 bg-[var(--background-tertiary)] border border-[var(--border-default)] rounded-xl text-[var(--foreground)] transition-all duration-200 hover:border-[var(--border-hover)] focus:border-[var(--primary-400)] focus:shadow-[0_0_0_3px_rgba(14,165,233,0.15)] outline-none appearance-none cursor-pointer"
            >
              <option value="TERMINAL_ONLY" className="bg-[var(--background-tertiary)]">{t('terminalOnly')}</option>
              <option value={3} className="bg-[var(--background-tertiary)]">3m</option>
              <option value={5} className="bg-[var(--background-tertiary)]">5m</option>
              <option value={10} className="bg-[var(--background-tertiary)]">10m</option>
              <option value={15} className="bg-[var(--background-tertiary)]">15m</option>
              <option value={20} className="bg-[var(--background-tertiary)]">20m</option>
              <option value={25} className="bg-[var(--background-tertiary)]">25m</option>
              <option value={30} className="bg-[var(--background-tertiary)]">30m</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-[var(--foreground-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Safety Factor */}
        <div className="group">
          <label className="flex items-center gap-2 text-sm font-medium text-[var(--foreground-secondary)] mb-2">
            <Gauge className="w-4 h-4 text-[var(--primary-400)]" />
            {t('safetyFactor')}
          </label>
          <input
            type="number"
            step="0.1"
            min="1"
            value={formData.safetyFactor}
            onChange={(e) => setFormData({ ...formData, safetyFactor: parseFloat(e.target.value) || 1 })}
            className="w-full px-4 py-3 bg-[var(--background-tertiary)] border border-[var(--border-default)] rounded-xl text-[var(--foreground)] transition-all duration-200 hover:border-[var(--border-hover)] focus:border-[var(--primary-400)] focus:shadow-[0_0_0_3px_rgba(14,165,233,0.15)] outline-none"
          />
        </div>

        {/* Max Inertia Ratio */}
        <div className="group">
          <label className="flex items-center gap-2 text-sm font-medium text-[var(--foreground-secondary)] mb-2">
            <Rotate3D className="w-4 h-4 text-[var(--primary-400)]" />
            {t('maxInertiaRatio')}
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min="1"
              value={formData.maxInertiaRatio}
              onChange={(e) => setFormData({ ...formData, maxInertiaRatio: parseInt(e.target.value) || 10 })}
              className="flex-1 px-4 py-3 bg-[var(--background-tertiary)] border border-[var(--border-default)] rounded-xl text-[var(--foreground)] transition-all duration-200 hover:border-[var(--border-hover)] focus:border-[var(--primary-400)] focus:shadow-[0_0_0_3px_rgba(14,165,233,0.15)] outline-none"
            />
            <span className="text-[var(--foreground-muted)] font-medium">:1</span>
          </div>
        </div>

        {/* Target Inertia Ratio */}
        <div className="group">
          <label className="flex items-center gap-2 text-sm font-medium text-[var(--foreground-secondary)] mb-2">
            <Rotate3D className="w-4 h-4 text-[var(--green-400)]" />
            {t('targetInertiaRatio')}
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min="1"
              value={formData.targetInertiaRatio}
              onChange={(e) => setFormData({ ...formData, targetInertiaRatio: parseInt(e.target.value) || 5 })}
              className="flex-1 px-4 py-3 bg-[var(--background-tertiary)] border border-[var(--border-default)] rounded-xl text-[var(--foreground)] transition-all duration-200 hover:border-[var(--border-hover)] focus:border-[var(--green-400)] focus:shadow-[0_0_0_3px_rgba(74,222,128,0.15)] outline-none"
            />
            <span className="text-[var(--foreground-muted)] font-medium">:1</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t border-[var(--border-subtle)]">
        <button
          type="button"
          onClick={onComplete}
          className="w-full sm:w-auto px-6 py-3 bg-[var(--background-elevated)] text-[var(--foreground-secondary)] border border-[var(--border-default)] rounded-xl hover:bg-[var(--background-tertiary)] hover:text-[var(--foreground)] hover:border-[var(--border-hover)] transition-all duration-200 font-medium"
        >
          {commonT('cancel')}
        </button>
        <button
          type="submit"
          className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-[var(--primary-500)] to-[var(--primary-600)] text-white rounded-xl hover:from-[var(--primary-400)] hover:to-[var(--primary-500)] hover:shadow-[0_0_20px_rgba(14,165,233,0.3)] transition-all duration-200 font-medium flex items-center justify-center gap-2"
        >
          <span>{commonT('save')}</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </button>
      </div>
    </form>
  );
}
