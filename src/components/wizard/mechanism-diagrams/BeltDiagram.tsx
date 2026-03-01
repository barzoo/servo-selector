'use client';

import React from 'react';
import { MechanismDiagramProps } from './index';
import { MECHANISM_COLORS, CANVAS_CONFIG } from './constants';

/**
 * 同步带传动示意图
 * 布局：[伺服电机+主动轮] → [皮带] → [从动轮+负载]
 */
const BeltDiagram: React.FC<MechanismDiagramProps> = ({ className }) => {
  const { servo, transmission, load, frame, arrow } = MECHANISM_COLORS;

  return (
    <svg
      viewBox={CANVAS_CONFIG.viewBox}
      className={className}
      aria-label="同步带传动系统示意图"
      role="img"
    >
      {/* 伺服电机 */}
      <rect
        x="20" y="80" width="40" height="45"
        fill={servo}
        rx="4"
      />

      {/* 主动轮 */}
      <circle
        cx="90"
        cy="102"
        r="22"
        fill={transmission}
      />
      {/* 主动轮齿示意 */}
      <circle cx="90" cy="102" r="18" fill="none" stroke="white" strokeWidth="1.5" strokeDasharray="3,3" />

      {/* 从动轮 */}
      <circle
        cx="280"
        cy="102"
        r="22"
        fill={transmission}
      />
      {/* 从动轮齿示意 */}
      <circle cx="280" cy="102" r="18" fill="none" stroke="white" strokeWidth="1.5" strokeDasharray="3,3" />

      {/* 同步带 - 上侧 */}
      <line x1="90" y1="80" x2="280" y2="80" stroke={transmission} strokeWidth="6" strokeLinecap="round" />
      {/* 同步带 - 下侧 */}
      <line x1="90" y1="124" x2="280" y2="124" stroke={transmission} strokeWidth="6" strokeLinecap="round" />

      {/* 负载（连接从动轮） */}
      <rect
        x="310" y="85" width="50" height="35"
        fill={load}
        rx="3"
      />
      {/* 连接轴 */}
      <line x1="302" y1="102" x2="310" y2="102" stroke={frame} strokeWidth="4" />

      {/* 动力流向箭头 */}
      <polygon points="40,150 50,145 50,155" fill={arrow} />
      <line x1="20" y1="150" x2="45" y2="150" stroke={arrow} strokeWidth="2" />

      <polygon points="185,150 195,145 195,155" fill={arrow} />
      <line x1="90" y1="150" x2="190" y2="150" stroke={arrow} strokeWidth="2" />

      <polygon points="335,150 345,145 345,155" fill={arrow} />
      <line x1="280" y1="150" x2="340" y2="150" stroke={arrow} strokeWidth="2" />
    </svg>
  );
};

export default BeltDiagram;
