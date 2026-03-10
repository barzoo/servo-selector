'use client';

import { useId, useMemo } from 'react';

interface MotorParams {
  ratedTorque: number;      // N·m
  peakTorque: number;       // N·m
  ratedSpeed: number;       // rpm
  maxSpeed: number;         // rpm
}

interface OperatingPoint {
  speed: number;    // rpm
  torque: number;   // N·m
}

interface OperatingPoints {
  accel: OperatingPoint;
  constant: OperatingPoint;
  decel: OperatingPoint;
}

interface MotorCharacteristicChartProps {
  motor: MotorParams;
  operatingPoints: OperatingPoints;
  className?: string;
}

export function MotorCharacteristicChart({
  motor,
  operatingPoints,
  className = ''
}: MotorCharacteristicChartProps) {
  const uniqueId = useId();

  // SVG dimensions
  const width = 400;
  const height = 280;
  const padding = { top: 40, right: 60, bottom: 60, left: 70 };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Calculate scales
  const maxTorque = Math.max(motor.peakTorque, operatingPoints.accel.torque, operatingPoints.decel.torque) * 1.1;
  const maxSpeed = Math.max(motor.maxSpeed, operatingPoints.constant.speed) * 1.1;

  // Scale functions
  const scaleX = (speed: number) => padding.left + (speed / maxSpeed) * chartWidth;
  const scaleY = (torque: number) => padding.top + chartHeight - (torque / maxTorque) * chartHeight;

  // Generate motor envelope path (trapezoid)
  const envelopePath = useMemo(() => {
    const p1 = { x: scaleX(0), y: scaleY(motor.peakTorque) };
    const p2 = { x: scaleX(motor.ratedSpeed), y: scaleY(motor.peakTorque) };
    const p3 = { x: scaleX(motor.maxSpeed), y: scaleY(motor.ratedTorque) };
    const p4 = { x: scaleX(motor.maxSpeed), y: scaleY(0) };
    const p5 = { x: scaleX(0), y: scaleY(0) };

    return `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y} L ${p3.x} ${p3.y} L ${p4.x} ${p4.y} L ${p5.x} ${p5.y} Z`;
  }, [motor, scaleX, scaleY]);

  // Rated torque line
  const ratedTorqueLine = useMemo(() => {
    const y = scaleY(motor.ratedTorque);
    return {
      x1: padding.left,
      y1: y,
      x2: padding.left + chartWidth,
      y2: y
    };
  }, [motor.ratedTorque, scaleY]);

  return (
    <div className={`bg-[var(--background-secondary)] rounded-xl p-4 ${className}`}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Motor characteristic curve showing torque-speed envelope and operating points"
      >
        {/* Gradient definition */}
        <defs>
          <linearGradient id={`envelope-gradient-${uniqueId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--foreground-muted)" stopOpacity="0.15" />
            <stop offset="100%" stopColor="var(--foreground-muted)" stopOpacity="0.05" />
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
          opacity="0.4"
        />
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={padding.top + chartHeight}
          stroke="var(--foreground-muted)"
          strokeWidth="1"
          opacity="0.4"
        />

        {/* X-axis labels */}
        <text x={padding.left} y={height - 20} textAnchor="middle" fill="var(--foreground-muted)" fontSize="10" opacity="0.7">
          0
        </text>
        <text x={scaleX(motor.ratedSpeed)} y={height - 20} textAnchor="middle" fill="var(--foreground-muted)" fontSize="10" opacity="0.7">
          {motor.ratedSpeed}
        </text>
        <text x={scaleX(motor.maxSpeed)} y={height - 20} textAnchor="middle" fill="var(--foreground-muted)" fontSize="10" opacity="0.7">
          {motor.maxSpeed}
        </text>
        <text x={padding.left + chartWidth / 2} y={height - 5} textAnchor="middle" fill="var(--foreground-muted)" fontSize="11" opacity="0.8">
          转速 (rpm)
        </text>

        {/* Y-axis labels */}
        <text x={padding.left - 10} y={scaleY(0)} textAnchor="end" dominantBaseline="middle" fill="var(--foreground-muted)" fontSize="10" opacity="0.7">
          0
        </text>
        <text x={padding.left - 10} y={scaleY(motor.ratedTorque)} textAnchor="end" dominantBaseline="middle" fill="var(--foreground-muted)" fontSize="10" opacity="0.7">
          {motor.ratedTorque.toFixed(1)}
        </text>
        <text x={padding.left - 10} y={scaleY(motor.peakTorque)} textAnchor="end" dominantBaseline="middle" fill="var(--foreground-muted)" fontSize="10" opacity="0.7">
          {motor.peakTorque.toFixed(1)}
        </text>
        <text x={15} y={padding.top + chartHeight / 2} textAnchor="middle" fill="var(--foreground-muted)" fontSize="11" opacity="0.8" transform={`rotate(-90, 15, ${padding.top + chartHeight / 2})`}>
          转矩 (N·m)
        </text>

        {/* Motor envelope */}
        <path
          d={envelopePath}
          fill={`url(#envelope-gradient-${uniqueId})`}
          stroke="var(--foreground-muted)"
          strokeWidth="1.5"
          strokeOpacity="0.4"
        />

        {/* Rated torque line */}
        <line
          x1={ratedTorqueLine.x1}
          y1={ratedTorqueLine.y1}
          x2={ratedTorqueLine.x2}
          y2={ratedTorqueLine.y2}
          stroke="var(--primary-400)"
          strokeWidth="1.5"
          strokeDasharray="5,3"
          opacity="0.7"
        />
        <text x={padding.left + chartWidth + 5} y={ratedTorqueLine.y1} dominantBaseline="middle" fill="var(--primary-400)" fontSize="9" opacity="0.8">
          额定
        </text>

        {/* Operating points */}
        {/* Accel point - Green */}
        <circle
          cx={scaleX(operatingPoints.accel.speed)}
          cy={scaleY(operatingPoints.accel.torque)}
          r="6"
          fill="var(--green-400)"
          stroke="var(--background-secondary)"
          strokeWidth="2"
        />
        <text x={scaleX(operatingPoints.accel.speed)} y={scaleY(operatingPoints.accel.torque) - 12} textAnchor="middle" fill="var(--green-400)" fontSize="9" fontWeight="500">
          加速
        </text>

        {/* Constant point - Blue */}
        <circle
          cx={scaleX(operatingPoints.constant.speed)}
          cy={scaleY(operatingPoints.constant.torque)}
          r="6"
          fill="var(--blue-400)"
          stroke="var(--background-secondary)"
          strokeWidth="2"
        />
        <text x={scaleX(operatingPoints.constant.speed)} y={scaleY(operatingPoints.constant.torque) - 12} textAnchor="middle" fill="var(--blue-400)" fontSize="9" fontWeight="500">
          恒速
        </text>

        {/* Decel point - Amber */}
        <circle
          cx={scaleX(operatingPoints.decel.speed)}
          cy={scaleY(operatingPoints.decel.torque)}
          r="6"
          fill="var(--amber-400)"
          stroke="var(--background-secondary)"
          strokeWidth="2"
        />
        <text x={scaleX(operatingPoints.decel.speed)} y={scaleY(operatingPoints.decel.torque) - 12} textAnchor="middle" fill="var(--amber-400)" fontSize="9" fontWeight="500">
          减速
        </text>
      </svg>
    </div>
  );
}
