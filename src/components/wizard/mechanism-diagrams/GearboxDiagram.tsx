'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { MechanismDiagramProps } from './index';
import { MECHANISM_COLORS, CANVAS_CONFIG } from './constants';

/**
 * 齿轮减速机传动示意图
 * 布局：[伺服电机] → [减速机] → [转盘]
 */
const GearboxDiagram: React.FC<MechanismDiagramProps> = ({ className }) => {
  const { servo, transmission, load, frame, arrow } = MECHANISM_COLORS;
  const t = useTranslations('mechanismDiagrams');

  return (
    <svg
      viewBox={CANVAS_CONFIG.viewBox}
      className={className}
      aria-label={t('gearbox')}
      role="img"
    >
      {/* 伺服电机 */}
      <rect
        x="30" y="75" width="45" height="55"
        fill={servo}
        rx="4"
      />
      {/* 电机轴 */}
      <rect x="75" y="95" width="15" height="15" fill={frame} />

      {/* 减速机 */}
      <polygon
        points="90,70 150,65 150,140 90,135"
        fill={transmission}
      />
      {/* 减速机细节 - 齿轮示意 */}
      <circle cx="120" cy="100" r="20" fill="none" stroke="white" strokeWidth="2" />
      <line x1="120" y1="80" x2="120" y2="120" stroke="white" strokeWidth="2" />
      <line x1="100" y1="100" x2="140" y2="100" stroke="white" strokeWidth="2" />

      {/* 输出轴 */}
      <rect x="150" y="92" width="20" height="16" fill={frame} />

      {/* 转盘/工作台 */}
      <circle
        cx="260"
        cy="100"
        r="55"
        fill={load}
        opacity="0.9"
      />
      {/* 转盘中心 */}
      <circle cx="260" cy="100" r="12" fill={frame} />
      {/* 转盘上的工件示意 */}
      <rect x="240" y="70" width="20" height="15" fill="white" opacity="0.5" rx="2" />
      <rect x="270" y="110" width="18" height="15" fill="white" opacity="0.5" rx="2" />

      {/* 动力流向箭头 - 指向右侧 */}
      <polygon points="57,155 67,150 67,160" fill={arrow} />
      <line x1="30" y1="155" x2="62" y2="155" stroke={arrow} strokeWidth="2" />

      <polygon points="125,155 135,150 135,160" fill={arrow} />
      <line x1="90" y1="155" x2="130" y2="155" stroke={arrow} strokeWidth="2" />

      <polygon points="210,155 220,150 220,160" fill={arrow} />
      <line x1="150" y1="155" x2="215" y2="155" stroke={arrow} strokeWidth="2" />
    </svg>
  );
};

export default GearboxDiagram;
