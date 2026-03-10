'use client';

import { useId, useMemo } from 'react';

interface VelocityProfileChartProps {
  profile: 'TRAPEZOIDAL' | 'S_CURVE';
  className?: string;
}

// Motion profile ratio constants
const ACCEL_RATIO = 0.25;
const CONSTANT_RATIO = 0.5;
const DECEL_RATIO = 0.25;
const BEZIER_CONTROL_OFFSET = 0.1;
const BEZIER_CONTROL_SMALL_OFFSET = 0.05;

export function VelocityProfileChart({ profile, className = '' }: VelocityProfileChartProps) {
  // SVG viewBox dimensions
  const width = 320;
  const height = 120;
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };

  // Chart area dimensions
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Unique ID for gradient to prevent collisions between instances
  const gradientId = useId();

  // Generate path based on profile type
  const generatePath = useMemo((): string => {
    const startX = padding.left;
    const endX = padding.left + chartWidth;
    const bottomY = padding.top + chartHeight;
    const topY = padding.top;

    if (profile === 'TRAPEZOIDAL') {
      // Trapezoidal: 25% accel / 50% constant / 25% decel
      const accelEndX = startX + chartWidth * ACCEL_RATIO;
      const decelStartX = startX + chartWidth * (ACCEL_RATIO + CONSTANT_RATIO);

      return `M ${startX} ${bottomY} L ${accelEndX} ${topY} L ${decelStartX} ${topY} L ${endX} ${bottomY}`;
    } else {
      // S-Curve: smooth bezier curves
      const accelEndX = startX + chartWidth * ACCEL_RATIO;
      const decelStartX = startX + chartWidth * (ACCEL_RATIO + CONSTANT_RATIO);

      // Control points for smooth S-curve
      const cp1x = startX + chartWidth * BEZIER_CONTROL_OFFSET;
      const cp2x = accelEndX - chartWidth * BEZIER_CONTROL_SMALL_OFFSET;
      const cp3x = accelEndX + chartWidth * BEZIER_CONTROL_SMALL_OFFSET;
      const cp4x = decelStartX - chartWidth * BEZIER_CONTROL_SMALL_OFFSET;
      const cp5x = decelStartX + chartWidth * BEZIER_CONTROL_SMALL_OFFSET;
      const cp6x = endX - chartWidth * BEZIER_CONTROL_OFFSET;

      return `M ${startX} ${bottomY}
              C ${cp1x} ${bottomY}, ${cp2x} ${topY}, ${accelEndX} ${topY}
              L ${decelStartX} ${topY}
              C ${cp3x} ${topY}, ${cp4x} ${bottomY}, ${endX} ${bottomY}`;
    }
  }, [profile, chartWidth, chartHeight, padding.left, padding.right, padding.top, padding.bottom]);

  // Generate fill path (closed area under curve)
  const generateFillPath = useMemo((): string => {
    const startX = padding.left;
    const endX = padding.left + chartWidth;
    const bottomY = padding.top + chartHeight;

    return `${generatePath} L ${endX} ${bottomY} L ${startX} ${bottomY} Z`;
  }, [generatePath, chartWidth, chartHeight, padding.left, padding.right, padding.top, padding.bottom]);

  const ariaLabel = `Velocity profile chart showing ${profile.toLowerCase().replace('_', '-')} curve`;

  return (
    <div className={`bg-[var(--background-secondary)] rounded-xl p-4 ${className}`}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto transition-all duration-200"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={ariaLabel}
      >
        {/* Gradient definition */}
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary-500)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--primary-500)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Axes */}
        <line
          x1={padding.left}
          y1={padding.top + chartHeight}
          x2={padding.left + chartWidth}
          y2={padding.top + chartHeight}
          stroke="var(--foreground-muted)"
          strokeWidth="1"
          opacity="0.3"
        />
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={padding.top + chartHeight}
          stroke="var(--foreground-muted)"
          strokeWidth="1"
          opacity="0.3"
        />

        {/* Fill area */}
        <path
          d={generateFillPath}
          fill={`url(#${gradientId})`}
          className="transition-all duration-200"
        />

        {/* Curve line */}
        <path
          d={generatePath}
          fill="none"
          stroke="var(--primary-400)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-all duration-200"
        />

        {/* Axis labels */}
        <text
          x={padding.left + chartWidth / 2}
          y={height - 5}
          textAnchor="middle"
          fill="var(--foreground-muted)"
          fontSize="10"
          opacity="0.6"
        >
          t
        </text>
        <text
          x={15}
          y={padding.top + chartHeight / 2}
          textAnchor="middle"
          fill="var(--foreground-muted)"
          fontSize="10"
          opacity="0.6"
          transform={`rotate(-90, 15, ${padding.top + chartHeight / 2})`}
        >
          v
        </text>
      </svg>
    </div>
  );
}
