'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { MechanismDiagramProps } from './index';
import { MECHANISM_COLORS, CANVAS_CONFIG } from './constants';

/**
 * 齿轮齿条传动示意图
 * 布局：[伺服电机] → [减速机] → [小齿轮] → [齿条] → [滑台/负载]
 * 小齿轮用节圆表示，齿条用带齿形的矩形长条
 */
const RackPinionDiagram: React.FC<MechanismDiagramProps> = ({ className }) => {
  const { servo, transmission, load, frame, arrow } = MECHANISM_COLORS;
  const t = useTranslations('mechanismDiagrams');

  // 生成齿条的齿形路径
  const generateRackTeeth = (startX: number, y: number, count: number, toothWidth: number, toothHeight: number) => {
    const teeth = [];
    for (let i = 0; i < count; i++) {
      const x = startX + i * toothWidth * 2;
      // 齿形：梯形
      teeth.push(
        <polygon
          key={i}
          points={`${x},${y} ${x + toothWidth * 0.3},${y - toothHeight} ${x + toothWidth * 0.7},${y - toothHeight} ${x + toothWidth},${y}`}
          fill={load}
          stroke="white"
          strokeWidth="1"
        />
      );
    }
    return teeth;
  };

  return (
    <svg
      viewBox={CANVAS_CONFIG.viewBox}
      className={className}
      aria-label={t('rackPinion')}
      role="img"
    >
      {/* 底部导轨 */}
      <line
        x1="140" y1="155" x2="380" y2="155"
        stroke={frame}
        strokeWidth="3"
      />

      {/* 伺服电机 */}
      <rect
        x="15" y="65" width="45" height="60"
        fill={servo}
        rx="4"
      />
      {/* 电机轴 */}
      <rect x="60" y="88" width="12" height="14" fill={frame} />

      {/* 减速机 */}
      <polygon
        points="72,72 115,68 115,122 72,118"
        fill={transmission}
      />
      {/* 减速机内部齿轮示意 */}
      <circle cx="93" cy="95" r="15" fill="none" stroke="white" strokeWidth="1.5" opacity="0.6" />
      <line x1="93" y1="80" x2="93" y2="110" stroke="white" strokeWidth="1.5" opacity="0.6" />
      <line x1="78" y1="95" x2="108" y2="95" stroke="white" strokeWidth="1.5" opacity="0.6" />

      {/* 减速机输出轴 */}
      <rect x="115" y="90" width="15" height="10" fill={frame} />

      {/* 小齿轮（节圆表示） */}
      <circle
        cx="155"
        cy="95"
        r="22"
        fill={transmission}
        opacity="0.9"
      />
      {/* 节圆 */}
      <circle cx="155" cy="95" r="18" fill="none" stroke="white" strokeWidth="2" />
      {/* 齿轮齿示意（简化） */}
      {[0, 60, 120, 180, 240, 300].map((angle) => {
        const rad = (angle * Math.PI) / 180;
        const x1 = 155 + 14 * Math.cos(rad);
        const y1 = 95 + 14 * Math.sin(rad);
        const x2 = 155 + 22 * Math.cos(rad);
        const y2 = 95 + 22 * Math.sin(rad);
        return (
          <line key={angle} x1={x1} y1={y1} x2={x2} y2={y2} stroke="white" strokeWidth="2.5" />
        );
      })}
      {/* 齿轮中心 */}
      <circle cx="155" cy="95" r="6" fill={frame} />

      {/* 齿条基体（矩形长条） */}
      <rect
        x="180" y="108" width="160" height="18"
        fill={load}
        opacity="0.3"
        rx="2"
      />

      {/* 齿条齿形 */}
      {generateRackTeeth(175, 108, 8, 10, 6)}

      {/* 滑台/负载（安装在齿条上） */}
      <rect
        x="230" y="75" width="70" height="35"
        fill={load}
        rx="4"
      />
      {/* 滑台与齿条连接示意 */}
      <rect x="255" y="108" width="20" height="8" fill={frame} />
      {/* 滑台上的工件/负载示意 */}
      <rect x="245" y="55" width="40" height="20" fill="white" opacity="0.4" rx="2" />

      {/* 动力流向箭头 - 指向右侧 */}
      <polygon points="37,170 47,165 47,175" fill={arrow} />
      <line x1="15" y1="170" x2="42" y2="170" stroke={arrow} strokeWidth="2" />

      <polygon points="93,170 103,165 103,175" fill={arrow} />
      <line x1="72" y1="170" x2="98" y2="170" stroke={arrow} strokeWidth="2" />

      <polygon points="135,170 145,165 145,175" fill={arrow} />
      <line x1="115" y1="170" x2="140" y2="170" stroke={arrow} strokeWidth="2" />

      <polygon points="200,170 210,165 210,175" fill={arrow} />
      <line x1="155" y1="170" x2="205" y2="170" stroke={arrow} strokeWidth="2" />

      <polygon points="300,170 310,165 310,175" fill={arrow} />
      <line x1="210" y1="170" x2="305" y2="170" stroke={arrow} strokeWidth="2" />
    </svg>
  );
};

export default RackPinionDiagram;
