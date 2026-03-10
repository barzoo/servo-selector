# 速度-时间曲线图 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 在运动参数步骤添加简化的速度-时间曲线图组件，直观展示梯形和 S 曲线加减速过程

**Architecture:** 创建一个独立的 VelocityProfileChart 组件，使用 SVG 动态绘制速度-时间曲线。组件接收 profile 属性，根据 TRAPEZOIDAL 或 S_CURVE 类型渲染对应的曲线路径。组件集成到 MotionStep 中，位于曲线类型选择区域下方。

**Tech Stack:** React, TypeScript, TailwindCSS, SVG

---

## Task 1: Create VelocityProfileChart Component

**Files:**
- Create: `src/components/wizard/VelocityProfileChart.tsx`

**Step 1: Create the component file with TypeScript interface**

```typescript
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
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit src/components/wizard/VelocityProfileChart.tsx`
Expected: No errors

**Step 3: Commit**

```bash
git add src/components/wizard/VelocityProfileChart.tsx
git commit -m "feat: add VelocityProfileChart component

- Create SVG-based velocity-time curve visualization
- Support TRAPEZOIDAL and S_CURVE profile types
- Add gradient fill and axis labels
- Include smooth transition animations"
```

---

## Task 2: Integrate Chart into MotionStep

**Files:**
- Modify: `src/components/wizard/steps/MotionStep.tsx`

**Step 1: Import the new component**

Add import at the top of the file (after existing imports):

```typescript
import { VelocityProfileChart } from '@/components/wizard/VelocityProfileChart';
```

**Step 2: Add chart component after profile selection**

Find the profile selection section (around line 330-394), then add the chart component after the closing `</div>` of the profile selection section.

Locate this code block:
```tsx
      </div>

      {/* Parameters */}
```

Insert the chart component between them:

```tsx
      </div>

      {/* Velocity Profile Chart */}
      <VelocityProfileChart profile={formData.profile} />

      {/* Parameters */}
```

**Step 3: Verify the integration**

Run: `npx tsc --noEmit src/components/wizard/steps/MotionStep.tsx`
Expected: No errors

**Step 4: Commit**

```bash
git add src/components/wizard/steps/MotionStep.tsx
git commit -m "feat: integrate VelocityProfileChart into MotionStep

- Add chart component below profile selection
- Chart updates based on selected profile type"
```

---

## Task 3: Run Type Check and Build

**Files:**
- All modified files

**Step 1: Run TypeScript type check**

Run: `npx tsc --noEmit`
Expected: No type errors

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

## Task 4: Manual Testing Checklist

**Files:**
- `src/components/wizard/steps/MotionStep.tsx`

**Step 1: Start development server**

Run: `npm run dev`

**Step 2: Manual test scenarios**

1. Navigate to Motion Parameters step
2. Verify chart displays with default TRAPEZOIDAL profile
3. Switch to S_CURVE profile
4. Verify chart updates to smooth curve
5. Switch back to TRAPEZOIDAL
6. Verify chart updates to trapezoid shape
7. Check responsive layout on different screen sizes

**Step 3: Commit (if any fixes needed)**

If no fixes needed, skip this step.

---

## Summary

This implementation plan covers:

1. **VelocityProfileChart Component**: SVG-based chart with gradient fill
2. **MotionStep Integration**: Chart placed between profile selection and parameters
3. **Visual Design**: Consistent with existing UI theme
4. **Testing**: Type check, build, and manual verification

The chart provides immediate visual feedback when users switch between trapezoidal and S-curve motion profiles.
