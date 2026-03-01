'use client';

import React from 'react';
import { MechanismDiagramProps } from './index';
import { MECHANISM_COLORS, CANVAS_CONFIG } from './constants';

/**
 * 齿轮齿条传动示意图
 * 布局：[伺服电机+减速机] → [小齿轮] → [齿条+滑块]
 */
const RackPinionDiagram: React.FC<MechanismDiagramProps> = ({ className }) => {
  const { servo, transmission, load, frame, arrow } = MECHANISM_COLORS;

  return (
    <svg
      viewBox={CANVAS_CONFIG.viewBox}
      className={className}
      aria-label="齿轮齿条传动系统示意图"
      role="img"
    >
      {/* 导轨 */}
      <line
        x1="160" y1="145" x2="360" y2="145"
        stroke={frame}
        strokeWidth="3"
      />

      {/* 伺服电机 */}
      <rect
        x="20" y="70" width="42" height="55"
        fill={servo}
        rx="4"
      />

      {/* 减速机 */}
      <polygon
        points="62,75 100,70 100,125 62,120"
        fill={transmission}
      />

      {/* 小齿轮（输出） */}
      <circle
        cx="130"
        cy="97"
        r="20"
        fill={transmission}
      />
      {/* 齿轮齿示意 */}
      <circle cx="130" cy="97" r="15" fill="none" stroke="white" strokeWidth="2" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
        const rad = (angle * Math.PI) / 180;
        const x1 = 130 + 15 * Math.cos(rad);
        const y1 = 97 + 15 * Math.sin(rad);
        const x2 = 130 + 20 * Math.cos(rad);
        const y2 = 97 + 20 * Math.sin(rad);
        return (
          <line key={angle} x1={x1} y1={y1} x2={x2} y2={y2} stroke="white" strokeWidth="2" />
        );
      })}

      {/* 齿条 */}
      <rect
        x="160" y="105" width="160" height="12"
        fill={load}
        rx="2"
      />
      {/* 齿条齿示意 */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <line
          key={i}
          x1={170 + i * 20}
          y1="105"
          x2={170 + i * 20}
          y2="100"
          stroke="white"
          strokeWidth="2"
        />
      ))}

      {/* 滑块/负载 */}
      <rect
        x="220" y="117" width="55" height="28"
        fill={load}
        opacity="0.8"
        rx="3"
      />

      {/* 动力流向箭头 */}
      <polygon points="41,160 51,155 51,165" fill={arrow} />
      <line x1="20" y1="160" x2="46" y2="160" stroke={arrow} strokeWidth="2" />

      <polygon points="81,160 91,155 91,165" fill={arrow} />
      <line x1="62" y1="160" x2="86" y2="160" stroke={arrow} strokeWidth="2" />

      <polygon points="115,160 125,155 125,165" fill={arrow} />
      <line x1="100" y1="160" x2="120" y2="160" stroke={arrow} strokeWidth="2" />

      <polygon points="247,160 257,155 257,165" fill={arrow} />
      <line x1="150" y1="160" x2="252" y2="160" stroke={arrow} strokeWidth="2" />
    </svg>
  );
};

export default RackPinionDiagram;
