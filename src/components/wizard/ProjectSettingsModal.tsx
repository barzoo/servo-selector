'use client';

import { useState, useEffect } from 'react';
import { useProjectStore } from '@/stores/project-store';
import { ProjectInfo, CommonParams } from '@/types';
import { useTranslations } from 'next-intl';

interface ProjectSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'project' | 'common';
}

export function ProjectSettingsModal({ isOpen, onClose, initialTab = 'project' }: ProjectSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'project' | 'common'>(initialTab);
  const { project, updateProjectInfo, updateCommonParams } = useProjectStore();
  const t = useTranslations('projectSettings');

  const [projectInfo, setProjectInfo] = useState<ProjectInfo>({
    name: project.name,
    customer: project.customer,
    salesPerson: project.salesPerson,
    notes: project.notes || '',
  });

  const [commonParams, setCommonParams] = useState<CommonParams>(project.commonParams);

  useEffect(() => {
    const handleOpenSettings = (e: CustomEvent) => {
      if (e.detail?.tab) {
        setActiveTab(e.detail.tab);
      }
    };

    window.addEventListener('open-project-settings', handleOpenSettings as EventListener);
    return () => {
      window.removeEventListener('open-project-settings', handleOpenSettings as EventListener);
    };
  }, []);

  const handleSave = () => {
    updateProjectInfo(projectInfo);
    updateCommonParams(commonParams);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">{t('title')}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('project')}
            className={`flex-1 py-3 text-sm font-medium ${
              activeTab === 'project'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Project Info
          </button>
          <button
            onClick={() => setActiveTab('common')}
            className={`flex-1 py-3 text-sm font-medium ${
              activeTab === 'common'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Common Params
          </button>
        </div>

        {/* Content */}
        {activeTab === 'project' ? (
          <section className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('projectInfo')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('projectName')} *
                </label>
                <input
                  type="text"
                  value={projectInfo.name}
                  onChange={(e) => setProjectInfo({ ...projectInfo, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('customer')} *
                </label>
                <input
                  type="text"
                  value={projectInfo.customer}
                  onChange={(e) => setProjectInfo({ ...projectInfo, customer: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('salesPerson')}
                </label>
                <input
                  type="text"
                  value={projectInfo.salesPerson}
                  onChange={(e) => setProjectInfo({ ...projectInfo, salesPerson: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('notes')}
                </label>
                <textarea
                  value={projectInfo.notes}
                  onChange={(e) => setProjectInfo({ ...projectInfo, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </section>
        ) : (
          <section className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('commonParams')}</h3>
            <p className="text-sm text-gray-500 mb-4">{t('commonParamsDescription')}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('ambientTemp')}
                </label>
                <div className="flex items-center">
                  <input
                    type="number"
                    value={commonParams.ambientTemp}
                    onChange={(e) => setCommonParams({ ...commonParams, ambientTemp: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="ml-2 text-gray-500">°C</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('ipRating')}
                </label>
                <select
                  value={commonParams.ipRating}
                  onChange={(e) => setCommonParams({ ...commonParams, ipRating: e.target.value as CommonParams['ipRating'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="IP54">IP54</option>
                  <option value="IP65">IP65</option>
                  <option value="IP67">IP67</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('communication')}
                </label>
                <select
                  value={commonParams.communication}
                  onChange={(e) => setCommonParams({ ...commonParams, communication: e.target.value as CommonParams['communication'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="ETHERCAT">EtherCAT</option>
                  <option value="PROFINET">PROFINET</option>
                  <option value="ETHERNET_IP">EtherNet/IP</option>
                  <option value="ANALOG">Analog</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('cableLength')}
                </label>
                <select
                  value={commonParams.cableLength}
                  onChange={(e) => setCommonParams({ ...commonParams, cableLength: e.target.value === 'TERMINAL_ONLY' ? 'TERMINAL_ONLY' : parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="TERMINAL_ONLY">{t('terminalOnly')}</option>
                  <option value={3}>3m</option>
                  <option value={5}>5m</option>
                  <option value={10}>10m</option>
                  <option value={15}>15m</option>
                  <option value={20}>20m</option>
                  <option value={25}>25m</option>
                  <option value={30}>30m</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('safetyFactor')}
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  value={commonParams.safetyFactor}
                  onChange={(e) => setCommonParams({ ...commonParams, safetyFactor: parseFloat(e.target.value) || 1 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('maxInertiaRatio')}
                </label>
                <div className="flex items-center">
                  <input
                    type="number"
                    min="1"
                    value={commonParams.maxInertiaRatio}
                    onChange={(e) => setCommonParams({ ...commonParams, maxInertiaRatio: parseInt(e.target.value) || 10 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="ml-2 text-gray-500">:1</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleSave}
            disabled={!projectInfo.name || !projectInfo.customer}
            className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {t('save')}
          </button>
        </div>
      </div>
    </div>
  );
}
