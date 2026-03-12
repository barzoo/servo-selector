'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { MechanismDiagramProps } from './index';
import { MECHANISM_COLORS, CANVAS_CONFIG } from './constants';

/**
 * 直接驱动示意图
 * 布局：[伺服电机] → [负载]
 * 适用于旋转直驱和直线直驱两种模式
 */
const DirectDriveDiagram: React.FC<MechanismDiagramProps> = ({ className }) => {
  const { servo, load, frame, arrow } = MECHANISM_COLORS;
  const t = useTranslations('mechanismDiagrams');

  return (
    <svg
      viewBox={CANVAS_CONFIG.viewBox}
      className={className}
      aria-label={t('directDrive')}
      role="img"
    >
      {/* 伺服电机（较大，因为是直驱） */}
      <rect
        x="30" y="65" width="65" height="70"
        fill={servo}
        rx="5"
      />
      {/* 电机细节 - 散热片示意 */}
      <line x1="40" y1="75" x2="85" y2="75" stroke="white" strokeWidth="1.5" opacity="0.5" />
      <line x1="40" y1="85" x2="85" y2="85" stroke="white" strokeWidth="1.5" opacity="0.5" />
      <line x1="40" y1="95" x2="85" y2="95" stroke="white" strokeWidth="1.5" opacity="0.5" />
      <line x1="40" y1="105" x2="85" y2="105" stroke="white" strokeWidth="1.5" opacity="0.5" />
      <line x1="40" y1="115" x2="85" y2="115" stroke="white" strokeWidth="1.5" opacity="0.5" />

      {/* 电机轴/连接 */}
      <rect x="95" y="92" width="25" height="16" fill={frame} rx="2" />

      {/* 负载 - 旋转工作台示意 */}
      <circle
        cx="240"
        cy="100"
        r="60"
        fill={load}
        opacity="0.9"
      />
      {/* 转盘中心 */}
      <circle cx="240" cy="100" r="15" fill={frame} />
      {/* 转盘上的安装孔示意 */}
      <circle cx="240" cy="60" r="5" fill="white" opacity="0.4" />
      <circle cx="280" cy="100" r="5" fill="white" opacity="0.4" />
      <circle cx="240" cy="140" r="5" fill="white" opacity="0.4" />
      <circle cx="200" cy="100" r="5" fill="white" opacity="0.4" />

      {/* 动力流向箭头 - 指向右侧 */}
      <polygon points="67,155 77,150 77,160" fill={arrow} />
      <line x1="30" y1="155" x2="72" y2="155" stroke={arrow} strokeWidth="2" />

      <polygon points="165,155 175,150 175,160" fill={arrow} />
      <line x1="95" y1="155" x2="170" y2="155" stroke={arrow} strokeWidth="2" />
    </svg>
  );
};

export default DirectDriveDiagram;
