'use client';

interface VelocityProfileChartProps {
  profile: 'TRAPEZOIDAL' | 'S_CURVE';
  className?: string;
}

export function VelocityProfileChart({ profile, className = '' }: VelocityProfileChartProps) {
  // SVG viewBox dimensions
  const width = 320;
  const height = 120;
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };

  // Chart area dimensions
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Generate path based on profile type
  const generatePath = (): string => {
    const startX = padding.left;
    const endX = padding.left + chartWidth;
    const bottomY = padding.top + chartHeight;
    const topY = padding.top;

    if (profile === 'TRAPEZOIDAL') {
      // Trapezoidal: 25% accel / 50% constant / 25% decel
      const accelEndX = startX + chartWidth * 0.25;
      const decelStartX = startX + chartWidth * 0.75;

      return `M ${startX} ${bottomY} L ${accelEndX} ${topY} L ${decelStartX} ${topY} L ${endX} ${bottomY}`;
    } else {
      // S-Curve: smooth bezier curves
      const accelEndX = startX + chartWidth * 0.25;
      const decelStartX = startX + chartWidth * 0.75;
      const midY = bottomY - chartHeight * 0.5;

      // Control points for smooth S-curve
      const cp1x = startX + chartWidth * 0.1;
      const cp2x = accelEndX - chartWidth * 0.05;
      const cp3x = accelEndX + chartWidth * 0.05;
      const cp4x = decelStartX - chartWidth * 0.05;
      const cp5x = decelStartX + chartWidth * 0.05;
      const cp6x = endX - chartWidth * 0.1;

      return `M ${startX} ${bottomY}
              C ${cp1x} ${bottomY}, ${cp2x} ${topY}, ${accelEndX} ${topY}
              L ${decelStartX} ${topY}
              C ${cp3x} ${topY}, ${cp4x} ${bottomY}, ${endX} ${bottomY}`;
    }
  };

  // Generate fill path (closed area under curve)
  const generateFillPath = (): string => {
    const startX = padding.left;
    const endX = padding.left + chartWidth;
    const bottomY = padding.top + chartHeight;

    return `${generatePath()} L ${endX} ${bottomY} L ${startX} ${bottomY} Z`;
  };

  return (
    <div className={`bg-[var(--background-secondary)] rounded-xl p-4 ${className}`}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto transition-all duration-200"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Gradient definition */}
        <defs>
          <linearGradient id={`gradient-${profile}`} x1="0" y1="0" x2="0" y2="1">
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
          d={generateFillPath()}
          fill={`url(#gradient-${profile})`}
          className="transition-all duration-200"
        />

        {/* Curve line */}
        <path
          d={generatePath()}
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
