'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { MechanismDiagramProps } from './index';
import { MECHANISM_COLORS, CANVAS_CONFIG } from './constants';

/**
 * 滚珠丝杠传动示意图
 * 布局：[伺服电机] → [减速机] → [丝杠] → [滑块]
 */
const BallScrewDiagram: React.FC<MechanismDiagramProps> = ({ className }) => {
  const { servo, transmission, load, frame, arrow } = MECHANISM_COLORS;
  const t = useTranslations('mechanismDiagrams');

  return (
    <svg
      viewBox={CANVAS_CONFIG.viewBox}
      className={className}
      aria-label={t('ballScrew')}
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

      {/* 动力流向箭头 - 指向右侧 */}
      <polygon points="50,140 40,135 40,145" fill={arrow} />
      <line x1="20" y1="140" x2="45" y2="140" stroke={arrow} strokeWidth="2" />

      <polygon points="97,140 87,135 87,145" fill={arrow} />
      <line x1="75" y1="140" x2="92" y2="140" stroke={arrow} strokeWidth="2" />

      <polygon points="215,140 205,135 205,145" fill={arrow} />
      <line x1="130" y1="140" x2="210" y2="140" stroke={arrow} strokeWidth="2" />

      <polygon points="290,140 280,135 280,145" fill={arrow} />
      <line x1="220" y1="140" x2="285" y2="140" stroke={arrow} strokeWidth="2" />
    </svg>
  );
};

export default BallScrewDiagram;
