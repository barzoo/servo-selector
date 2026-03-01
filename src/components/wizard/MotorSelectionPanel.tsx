'use client';

import type { MotorRecommendation, MotorSelections } from '@/types';

interface MotorSelectionPanelProps {
  recommendations: MotorRecommendation[];
  selectedMotorId: string;
  selectedOptions: MotorSelections['motorOptions'];
  onMotorSelect: (motorId: string) => void;
  onOptionsChange: (options: MotorSelections['motorOptions']) => void;
  verticalAxis: boolean;
}

export function MotorSelectionPanel({
  recommendations,
  selectedMotorId,
  selectedOptions,
  onMotorSelect,
  onOptionsChange,
  verticalAxis,
}: MotorSelectionPanelProps) {
  const selectedMotor = recommendations.find(r => r.motor.id === selectedMotorId)?.motor;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">推荐电机</h3>

      {/* 电机列表 */}
      <div className="space-y-2">
        {recommendations.map((rec) => (
          <div
            key={rec.motor.id}
            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
              selectedMotorId === rec.motor.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onMotorSelect(rec.motor.id)}
          >
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">{rec.motor.baseModel}</div>
                <div className="text-sm text-gray-500">
                  {rec.motor.ratedPower}kW | {rec.motor.ratedTorque}Nm | {rec.motor.maxSpeed}rpm
                </div>
              </div>
              <div className="text-right">
                <div className={`text-lg font-bold ${
                  rec.matchScore >= 80 ? 'text-green-600' :
                  rec.matchScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {rec.matchScore}%
                </div>
                <div className="text-xs text-gray-500">匹配度</div>
              </div>
            </div>
            <div className="mt-2 flex gap-4 text-sm">
              <span>扭矩余量: {rec.safetyMargins.torque}%</span>
              <span>惯量比: {rec.safetyMargins.inertia}:1</span>
            </div>
          </div>
        ))}
      </div>

      {/* 电机选项 */}
      {selectedMotor && (
        <div className="p-4 bg-gray-50 rounded-lg space-y-4">
          <h4 className="font-medium">电机选项 - {selectedMotor.baseModel}</h4>

          {/* 刹车 */}
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium">刹车</span>
              {verticalAxis && (
                <span className="ml-2 text-xs text-amber-600">(垂直轴建议带刹车)</span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                className={`px-3 py-1 rounded ${
                  !selectedOptions.brake ? 'bg-blue-500 text-white' : 'bg-gray-200'
                }`}
                onClick={() => onOptionsChange({ ...selectedOptions, brake: false })}
              >
                无
              </button>
              <button
                className={`px-3 py-1 rounded ${
                  selectedOptions.brake ? 'bg-blue-500 text-white' : 'bg-gray-200'
                }`}
                onClick={() => onOptionsChange({ ...selectedOptions, brake: true })}
              >
                有
              </button>
            </div>
          </div>

          {/* 编码器类型 */}
          <div className="flex items-center justify-between">
            <span className="font-medium">编码器类型</span>
            <select
              value={selectedOptions.encoderType}
              onChange={(e) => onOptionsChange({
                ...selectedOptions,
                encoderType: e.target.value as 'A' | 'B'
              })}
              className="px-3 py-1 border rounded"
            >
              <option value="A">A型 - 电池盒式多圈 (2.5Mbps)</option>
              <option value="B">B型 - 机械式多圈 (5Mbps)</option>
            </select>
          </div>

          {/* 键槽 */}
          <div className="flex items-center justify-between">
            <span className="font-medium">电机轴</span>
            <div className="flex gap-2">
              <button
                className={`px-3 py-1 rounded ${
                  !selectedOptions.keyShaft ? 'bg-blue-500 text-white' : 'bg-gray-200'
                }`}
                onClick={() => onOptionsChange({ ...selectedOptions, keyShaft: false })}
              >
                光轴
              </button>
              <button
                className={`px-3 py-1 rounded ${
                  selectedOptions.keyShaft ? 'bg-blue-500 text-white' : 'bg-gray-200'
                }`}
                onClick={() => onOptionsChange({ ...selectedOptions, keyShaft: true })}
              >
                带键槽
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
