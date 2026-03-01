import React from 'react';
import { MechanismDiagramProps } from './index';
import { CANVAS_CONFIG, MECHANISM_COLORS } from './constants';

/**
 * 直驱机构示意图
 */
const DirectDriveDiagram: React.FC<MechanismDiagramProps> = ({ className = '' }) => {
  const { width, height } = CANVAS_CONFIG;
  const colors = {
    ...MECHANISM_COLORS,
    motor: '#2563EB',
    motorStroke: '#1D4ED8',
    load: '#DC2626',
    loadStroke: '#B91C1C',
    shaft: '#374151',
    text: '#111827',
  };

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 背景 */}
      <rect width={width} height={height} fill="#F3F4F6" rx={8} />

      {/* 电机 */}
      <rect
        x={60}
        y={height / 2 - 30}
        width={80}
        height={60}
        fill={colors.motor}
        stroke={colors.motorStroke}
        strokeWidth={2}
        rx={4}
      />
      <text x={100} y={height / 2 + 5} textAnchor="middle" fontSize={12} fill={colors.text}>
        电机
      </text>

      {/* 负载 */}
      <rect
        x={200}
        y={height / 2 - 40}
        width={100}
        height={80}
        fill={colors.load}
        stroke={colors.loadStroke}
        strokeWidth={2}
        rx={4}
      />
      <text x={250} y={height / 2 + 5} textAnchor="middle" fontSize={12} fill={colors.text}>
        负载
      </text>

      {/* 连接轴 */}
      <line
        x1={140}
        y1={height / 2}
        x2={200}
        y2={height / 2}
        stroke={colors.shaft}
        strokeWidth={4}
      />

      {/* 标题 */}
      <text x={width / 2} y={30} textAnchor="middle" fontSize={14} fontWeight="bold" fill={colors.text}>
        直驱机构
      </text>
    </svg>
  );
};

export default DirectDriveDiagram;
