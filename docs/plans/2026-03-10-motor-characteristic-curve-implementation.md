# 电机特性曲线与工况需求对比图 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 在结果步骤展示电机特性曲线与工况需求的对比图，帮助用户直观理解选型匹配度

**Architecture:** 创建 MotorCharacteristicChart 组件，使用 SVG 绘制电机特性包络线（梯形区域）和三个工况点（加速/恒速/减速）。组件接收电机参数和工况数据，在 ResultStep 中集成展示。

**Tech Stack:** React, TypeScript, TailwindCSS, SVG

---

## Task 1: Create MotorCharacteristicChart Component

**Files:**
- Create: `src/components/wizard/MotorCharacteristicChart.tsx`

**Step 1: Create the component file**

```typescript
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

  // Check if points are within envelope
  const isPointWithinEnvelope = (point: OperatingPoint) => {
    if (point.speed <= motor.ratedSpeed) {
      return point.torque <= motor.peakTorque;
    } else if (point.speed <= motor.maxSpeed) {
      const maxAllowedTorque = motor.peakTorque -
        (motor.peakTorque - motor.ratedTorque) *
        (point.speed - motor.ratedSpeed) / (motor.maxSpeed - motor.ratedSpeed);
      return point.torque <= maxAllowedTorque;
    }
    return false;
  };

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
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit src/components/wizard/MotorCharacteristicChart.tsx`
Expected: No errors

**Step 3: Commit**

```bash
git add src/components/wizard/MotorCharacteristicChart.tsx
git commit -m "feat: add MotorCharacteristicChart component

- Create SVG-based motor characteristic curve visualization
- Show motor torque-speed envelope
- Display three operating points (accel/constant/decel)
- Include rated torque reference line"
```

---

## Task 2: Remove VelocityProfileChart from MotionStep

**Files:**
- Modify: `src/components/wizard/steps/MotionStep.tsx`

**Step 1: Remove the import**

Remove this line:
```typescript
import { VelocityProfileChart } from '@/components/wizard/VelocityProfileChart';
```

**Step 2: Remove the component usage**

Remove these lines:
```tsx
      {/* Velocity Profile Chart */}
      <VelocityProfileChart profile={formData.profile} />
```

**Step 3: Verify the changes**

Run: `npx tsc --noEmit src/components/wizard/steps/MotionStep.tsx`
Expected: No errors

**Step 4: Commit**

```bash
git add src/components/wizard/steps/MotionStep.tsx
git commit -m "refactor: remove VelocityProfileChart from MotionStep

- Remove velocity-time curve visualization
- Prepare for motor characteristic chart in ResultStep"
```

---

## Task 3: Integrate MotorCharacteristicChart into ResultStep

**Files:**
- Modify: `src/components/wizard/steps/ResultStep.tsx`

**Step 1: Import the new component**

Add import at the top of the file:
```typescript
import { MotorCharacteristicChart } from '@/components/wizard/MotorCharacteristicChart';
```

**Step 2: Find the recommended motor display section**

Locate where the first recommended motor is displayed (around where `motorRecommendations[0]` is used).

**Step 3: Add the chart component**

After the motor basic info (rated torque, speed, etc.), add the chart:

```tsx
{/* Motor Characteristic Chart */}
{firstRecommendation && sizingResult && (
  <MotorCharacteristicChart
    motor={{
      ratedTorque: firstRecommendation.motor.rated_torque,
      peakTorque: firstRecommendation.motor.peak_torque,
      ratedSpeed: firstRecommendation.motor.rated_speed,
      maxSpeed: firstRecommendation.motor.max_speed,
    }}
    operatingPoints={{
      accel: {
        speed: sizingResult.mechanical.speeds.max * 0.5,  // Estimate accel speed
        torque: sizingResult.mechanical.torques.accel,
      },
      constant: {
        speed: sizingResult.mechanical.speeds.max,
        torque: sizingResult.mechanical.torques.constant,
      },
      decel: {
        speed: sizingResult.mechanical.speeds.max * 0.5,  // Estimate decel speed
        torque: Math.abs(sizingResult.mechanical.torques.decel),
      },
    }}
    className="mt-4"
  />
)}
```

**Step 4: Verify the integration**

Run: `npx tsc --noEmit src/components/wizard/steps/ResultStep.tsx`
Expected: No errors

**Step 5: Commit**

```bash
git add src/components/wizard/steps/ResultStep.tsx
git commit -m "feat: integrate MotorCharacteristicChart into ResultStep

- Add motor characteristic curve visualization
- Show motor capability vs operating requirements
- Help users understand sizing match visually"
```

---

## Task 4: Delete VelocityProfileChart Component

**Files:**
- Delete: `src/components/wizard/VelocityProfileChart.tsx`

**Step 1: Delete the file**

```bash
git rm src/components/wizard/VelocityProfileChart.tsx
```

**Step 2: Commit**

```bash
git commit -m "chore: remove VelocityProfileChart component

- Replaced by MotorCharacteristicChart
- Velocity-time curve not useful for sizing decisions"
```

---

## Task 5: Run Type Check and Build

**Files:**
- All modified files

**Step 1: Run TypeScript type check**

Run: `npx tsc --noEmit`
Expected: No type errors in new files

**Step 2: Run build**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git commit -m "chore: verify type check and build pass

- All TypeScript types compile without errors
- Build completes successfully"
```

---

## Task 6: Manual Testing Checklist

**Files:**
- `src/components/wizard/steps/ResultStep.tsx`

**Step 1: Start development server**

Run: `npm run dev`

**Step 2: Manual test scenarios**

1. Complete a full sizing calculation
2. Navigate to Result step
3. Verify chart displays with:
   - Motor characteristic envelope (gray area)
   - Rated torque line (dashed)
   - Three operating points (green/blue/orange)
   - Proper axis labels
4. Check that operating points are within envelope
5. Verify responsive layout on different screen sizes

**Step 3: Commit (if any fixes needed)**

If no fixes needed, skip this step.

---

## Summary

This implementation plan covers:

1. **MotorCharacteristicChart Component**: SVG-based torque-speed characteristic visualization
2. **MotionStep Cleanup**: Remove obsolete VelocityProfileChart
3. **ResultStep Integration**: Add chart to show motor capability vs requirements
4. **Cleanup**: Delete VelocityProfileChart component
5. **Testing**: Type check, build, and manual verification

The new chart provides meaningful sizing information by showing:
- Motor capability envelope
- Actual operating point requirements
- Visual safety margin assessment
