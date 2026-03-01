'use client';

import React from 'react';
import { MechanismDiagramProps } from './index';
import { MECHANISM_COLORS, CANVAS_CONFIG } from './constants';

/**
 * 滚珠丝杠传动示意图
 * 布局：[伺服电机] → [减速机] → [丝杠] → [滑块]
 */
const BallScrewDiagram: React.FC<MechanismDiagramProps> = ({ className }) => {
  const { servo, transmission, load, frame, arrow } = MECHANISM_COLORS;

  return (
    <svg
      viewBox={CANVAS_CONFIG.viewBox}
      className={className}
      aria-label="滚珠丝杠传动系统示意图"
      role="img"
    >
      {/* 导轨 */}
      <line
        x1="140" y1="130" x2="360" y2="130"
        stroke={frame}
        strokeWidth="2"
      />

      {/* 丝杠 */}
      <rect
        x="130" y="96" width="180" height="8"
        fill={transmission}
        rx="2"
      />

      {/* 丝杠螺纹示意 */}
      <line x1="140" y1="100" x2="300" y2="100" stroke="white" strokeWidth="1" strokeDasharray="4,4" />

      {/* 伺服电机 */}
      <rect
        x="20" y="75" width="40" height="50"
        fill={servo}
        rx="4"
      />
      {/* 电机轴 */}
      <rect x="60" y="95" width="15" height="10" fill={frame} />

      {/* 减速机 */}
      <polygon
        points="75,85 110,80 110,120 75,115"
        fill={transmission}
      />

      {/* 联轴器 */}
      <rect x="110" y="92" width="12" height="16" fill={frame} rx="2" />

      {/* 滑块/工作台 */}
      <rect
        x="260" y="105" width="50" height="25"
        fill={load}
        rx="3"
      />
      {/* 滑块与丝杠连接示意 */}
      <rect x="280" y="100" width="10" height="5" fill={frame} />

      {/* 动力流向箭头 */}
      <polygon points="45,140 55,135 55,145" fill={arrow} />
      <line x1="20" y1="140" x2="50" y2="140" stroke={arrow} strokeWidth="2" />

      <polygon points="92,140 102,135 102,145" fill={arrow} />
      <line x1="75" y1="140" x2="97" y2="140" stroke={arrow} strokeWidth="2" />

      <polygon points="210,140 220,135 220,145" fill={arrow} />
      <line x1="130" y1="140" x2="215" y2="140" stroke={arrow} strokeWidth="2" />

      <polygon points="285,140 295,135 295,145" fill={arrow} />
      <line x1="220" y1="140" x2="290" y2="140" stroke={arrow} strokeWidth="2" />
    </svg>
  );
};

export default BallScrewDiagram;
