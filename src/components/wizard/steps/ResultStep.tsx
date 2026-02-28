'use client';

import { useWizardStore } from '@/stores/wizard-store';
import { useState } from 'react';

export function ResultStep() {
  const { result, input, reset, prevStep } = useWizardStore();
  const [selectedMotorIndex, setSelectedMotorIndex] = useState(0);

  if (!result || result.motorRecommendations.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-700 text-lg font-medium mb-2">暂无选型结果</p>
        {result?.failureReason && (
          <p className="text-yellow-700 bg-yellow-50 px-4 py-2 rounded-md inline-block mb-4">
            原因：{result.failureReason.message}
          </p>
        )}
        <div className="mt-4">
          <button
            onClick={prevStep}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            返回修改
          </button>
        </div>
      </div>
    );
  }

  const selectedRecommendation = result.motorRecommendations[selectedMotorIndex];
  const { motor, safetyMargins, systemConfig } = selectedRecommendation;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">选型结果</h2>

      {/* 项目信息摘要 */}
      {input.project && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-700 mb-2">项目信息</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><span className="text-gray-500">项目名称：</span> {input.project.name}</div>
            <div><span className="text-gray-500">客户：</span> {input.project.customer}</div>
          </div>
        </div>
      )}

      {/* 计算摘要 */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">计算摘要</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-gray-600">负载惯量</div>
            <div className="font-medium">{result.mechanical.loadInertia.toExponential(3)} kg·m²</div>
          </div>
          <div>
            <div className="text-gray-600">RMS扭矩</div>
            <div className="font-medium">{result.mechanical.torques.rms.toFixed(2)} N·m</div>
          </div>
          <div>
            <div className="text-gray-600">峰值扭矩</div>
            <div className="font-medium">{result.mechanical.torques.peak.toFixed(2)} N·m</div>
          </div>
          <div>
            <div className="text-gray-600">最大转速</div>
            <div className="font-medium">{result.mechanical.speeds.max.toFixed(0)} rpm</div>
          </div>
          <div>
            <div className="text-gray-600">再生功率</div>
            <div className="font-medium">{result.mechanical.regeneration.brakingPower.toFixed(1)} W</div>
          </div>
          <div>
            <div className="text-gray-600">计算耗时</div>
            <div className="font-medium">{result.metadata.calculationTime.toFixed(1)} ms</div>
          </div>
        </div>
      </div>

      {/* 推荐电机列表 */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-3">推荐电机（{result.motorRecommendations.length}款）</h3>
        <div className="space-y-2">
          {result.motorRecommendations.map((rec, index) => (
            <div
              key={rec.motor.id}
              onClick={() => setSelectedMotorIndex(index)}
              className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                selectedMotorIndex === index
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="font-semibold text-lg">{rec.motor.model}</div>
                  <div className="text-sm text-gray-600">
                    {rec.motor.ratedTorque} N·m / {rec.motor.ratedSpeed} rpm
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm text-gray-500">匹配度</div>
                    <div className={`font-bold text-lg ${
                      rec.matchScore >= 80 ? 'text-green-600' : rec.matchScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {rec.matchScore}%
                    </div>
                  </div>
                  {rec.feasibility === 'OK' && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">推荐</span>
                  )}
                  {rec.feasibility === 'WARNING' && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">警告</span>
                  )}
                  {rec.feasibility === 'CRITICAL' && (
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">风险</span>
                  )}
                </div>
              </div>
              {rec.warnings.length > 0 && (
                <div className="mt-2 text-sm text-yellow-700">
                  {rec.warnings.map((w, i) => (
                    <div key={i}>⚠️ {w}</div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 选中电机的详细配置 */}
      {systemConfig && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-3">系统配置详情</h3>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">电机</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-gray-500">型号：</span> {motor.model}</div>
                <div><span className="text-gray-500">额定扭矩：</span> {motor.ratedTorque} N·m</div>
                <div><span className="text-gray-500">峰值扭矩：</span> {motor.peakTorque} N·m</div>
                <div><span className="text-gray-500">额定转速：</span> {motor.ratedSpeed} rpm</div>
                <div><span className="text-gray-500">转子惯量：</span> {motor.rotorInertia} kg·cm²</div>
                <div><span className="text-gray-500">惯量比：</span> {safetyMargins.inertia}:1</div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-700 mb-2">驱动器</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-gray-500">型号：</span> {systemConfig.drive.model}</div>
                <div><span className="text-gray-500">额定电流：</span> {systemConfig.drive.ratedOutputCurrent} A</div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-700 mb-2">配件</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-gray-500">电机电缆：</span> {systemConfig.accessories.motorCable.model}</div>
                <div><span className="text-gray-500">编码器电缆：</span> {systemConfig.accessories.encoderCable.model}</div>
                {systemConfig.accessories.brakeResistor && (
                  <div><span className="text-gray-500">制动电阻：</span> {systemConfig.accessories.brakeResistor.model}</div>
                )}
                {systemConfig.accessories.emcFilter && (
                  <div><span className="text-gray-500">EMC滤波器：</span> {systemConfig.accessories.emcFilter}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <button
          onClick={prevStep}
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
        >
          返回修改
        </button>
        <div className="space-x-3">
          <button
            onClick={reset}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            重新开始
          </button>
          <button
            onClick={() => alert('PDF导出功能开发中...')}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            导出PDF
          </button>
        </div>
      </div>
    </div>
  );
}
