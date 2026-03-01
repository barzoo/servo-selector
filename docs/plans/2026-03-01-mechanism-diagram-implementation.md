# 传动机构示意图实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 在机械参数页面添加 5 种传动机构的 SVG 示意图组件

**Architecture:** 使用内联 SVG React 组件，每个机械类型独立组件文件，通过统一入口导出。示意图显示在 MechanismStep 的类型选择器和参数表单之间。

**Tech Stack:** Next.js + React + TypeScript + TailwindCSS

---

## 前置检查

### Task 0: 验证项目结构和依赖

**Files:**
- Read: `src/types/index.ts` (确认 MechanismType 定义)
- Read: `src/components/wizard/steps/MechanismStep.tsx` (确认集成点)

**Step 1: 确认类型定义存在**

验证 `MechanismType` 包含：
- 'BALL_SCREW'
- 'GEARBOX'
- 'DIRECT_DRIVE'
- 'BELT'
- 'RACK_PINION'

**Step 2: 确认无额外依赖需求**

SVG 组件无需额外 npm 包。

---

## 第一阶段：基础架构

### Task 1: 创建目录结构和常量文件

**Files:**
- Create: `src/components/wizard/mechanism-diagrams/constants.ts`

**Step 1: 创建目录**

```bash
mkdir -p src/components/wizard/mechanism-diagrams
```

**Step 2: 编写常量文件**

```typescript
// src/components/wizard/mechanism-diagrams/constants.ts

/**
 * 机械示意图颜色系统
 * 遵循工业标准视觉语言：
 * - 蓝色：动力源（伺服电机）
 * - 绿色：传动系统
 * - 红色：执行端/负载
 * - 橙色：动力流向指示
 */
export const MECHANISM_COLORS = {
  servo: '#2563EB',        // 蓝色 - 伺服电机
  transmission: '#059669', // 绿色 - 传动机构
  load: '#DC2626',         // 红色 - 负载
  frame: '#374151',        // 深灰 - 结构框架
  guide: '#9CA3AF',        // 浅灰 - 导轨/辅助线
  arrow: '#F59E0B',        // 橙色 - 动力流向箭头
} as const;

/**
 * 标准元素尺寸 (px)
 * 基于 viewBox="0 0 400 200" 的坐标系
 */
export const MECHANISM_DIMENSIONS = {
  servo: { width: 40, height: 50 },
  gearbox: { width: 35, height: 40 },
  screw: { width: 120, height: 8 },
  slider: { width: 50, height: 30 },
  pulley: { diameter: 30 },
  gear: { diameter: 25 },
  arrow: { length: 15, width: 3 },
} as const;

/**
 * 画布配置
 */
export const CANVAS_CONFIG = {
  viewBox: '0 0 400 200',
  width: 400,
  height: 200,
  padding: 20,
} as const;
```

**Step 3: Commit**

```bash
git add src/components/wizard/mechanism-diagrams/constants.ts
git commit -m "feat: add mechanism diagram constants"
```

---

### Task 2: 创建统一导出和类型定义

**Files:**
- Create: `src/components/wizard/mechanism-diagrams/index.tsx`

**Step 1: 编写入口文件**

```typescript
// src/components/wizard/mechanism-diagrams/index.tsx

import { MechanismType } from '@/types';
import BallScrewDiagram from './BallScrewDiagram';
import GearboxDiagram from './GearboxDiagram';
import BeltDiagram from './BeltDiagram';
import RackPinionDiagram from './RackPinionDiagram';
import DirectDriveDiagram from './DirectDriveDiagram';

export interface MechanismDiagramProps {
  /** 额外的 CSS 类名 */
  className?: string;
}

export type MechanismDiagramComponent = React.FC<MechanismDiagramProps>;

/**
 * 机械类型到示意图组件的映射
 */
export const mechanismDiagrams: Record<MechanismType, MechanismDiagramComponent> = {
  BALL_SCREW: BallScrewDiagram,
  GEARBOX: GearboxDiagram,
  BELT: BeltDiagram,
  RACK_PINION: RackPinionDiagram,
  DIRECT_DRIVE: DirectDriveDiagram,
};

// 单独导出各组件（便于单独使用）
export {
  BallScrewDiagram,
  GearboxDiagram,
  BeltDiagram,
  RackPinionDiagram,
  DirectDriveDiagram,
};

// 导出常量
export { MECHANISM_COLORS, MECHANISM_DIMENSIONS, CANVAS_CONFIG } from './constants';
```

**Step 2: Commit**

```bash
git add src/components/wizard/mechanism-diagrams/index.tsx
git commit -m "feat: add mechanism diagrams index with type definitions"
```

---

## 第二阶段：SVG 组件实现

### Task 3: 实现滚珠丝杠示意图 (BallScrewDiagram)

**Files:**
- Create: `src/components/wizard/mechanism-diagrams/BallScrewDiagram.tsx`

**Step 1: 创建组件**

```tsx
// src/components/wizard/mechanism-diagrams/BallScrewDiagram.tsx
'use client';

import React from 'react';
import { MechanismDiagramProps } from './index';
import { MECHANISM_COLORS, CANVAS_CONFIG } from './constants';

/**
 * 滚珠丝杠传动示意图
 * 布局：[伺服电机] → [减速机] → [丝杠] → [滑块]
 */
const BallScrewDiagram: React.FC<MechanismDiagramProps> = ({ className }) => {
  const { servo, transmission, load, frame, arrow } = MECHANISM_COLORS;

  return (
    <svg
      viewBox={CANVAS_CONFIG.viewBox}
      className={className}
      aria-label="滚珠丝杠传动系统示意图"
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

      {/* 动力流向箭头 */}
      <polygon points="45,140 55,135 55,145" fill={arrow} />
      <line x1="20" y1="140" x2="50" y2="140" stroke={arrow} strokeWidth="2" />

      <polygon points="92,140 102,135 102,145" fill={arrow} />
      <line x1="75" y1="140" x2="97" y2="140" stroke={arrow} strokeWidth="2" />

      <polygon points="210,140 220,135 220,145" fill={arrow} />
      <line x1="130" y1="140" x2="215" y2="140" stroke={arrow} strokeWidth="2" />

      <polygon points="285,140 295,135 295,145" fill={arrow} />
      <line x1="220" y1="140" x2="290" y2="140" stroke={arrow} strokeWidth="2" />
    </svg>
  );
};

export default BallScrewDiagram;
```

**Step 2: Commit**

```bash
git add src/components/wizard/mechanism-diagrams/BallScrewDiagram.tsx
git commit -m "feat: add ball screw mechanism diagram"
```

---

### Task 4: 实现齿轮减速机示意图 (GearboxDiagram)

**Files:**
- Create: `src/components/wizard/mechanism-diagrams/GearboxDiagram.tsx`

**Step 1: 创建组件**

```tsx
// src/components/wizard/mechanism-diagrams/GearboxDiagram.tsx
'use client';

import React from 'react';
import { MechanismDiagramProps } from './index';
import { MECHANISM_COLORS, CANVAS_CONFIG } from './constants';

/**
 * 齿轮减速机传动示意图
 * 布局：[伺服电机] → [减速机] → [转盘]
 */
const GearboxDiagram: React.FC<MechanismDiagramProps> = ({ className }) => {
  const { servo, transmission, load, frame, arrow } = MECHANISM_COLORS;

  return (
    <svg
      viewBox={CANVAS_CONFIG.viewBox}
      className={className}
      aria-label="齿轮减速机传动系统示意图"
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

      {/* 动力流向箭头 */}
      <polygon points="52,155 62,150 62,160" fill={arrow} />
      <line x1="30" y1="155" x2="57" y2="155" stroke={arrow} strokeWidth="2" />

      <polygon points="120,155 130,150 130,160" fill={arrow} />
      <line x1="90" y1="155" x2="125" y2="155" stroke={arrow} strokeWidth="2" />

      <polygon points="205,155 215,150 215,160" fill={arrow} />
      <line x1="150" y1="155" x2="210" y2="155" stroke={arrow} strokeWidth="2" />
    </svg>
  );
};

export default GearboxDiagram;
```

**Step 2: Commit**

```bash
git add src/components/wizard/mechanism-diagrams/GearboxDiagram.tsx
git commit -m "feat: add gearbox mechanism diagram"
```

---

### Task 5: 实现同步带示意图 (BeltDiagram)

**Files:**
- Create: `src/components/wizard/mechanism-diagrams/BeltDiagram.tsx`

**Step 1: 创建组件**

```tsx
// src/components/wizard/mechanism-diagrams/BeltDiagram.tsx
'use client';

import React from 'react';
import { MechanismDiagramProps } from './index';
import { MECHANISM_COLORS, CANVAS_CONFIG } from './constants';

/**
 * 同步带传动示意图
 * 布局：[伺服电机+主动轮] → [皮带] → [从动轮+负载]
 */
const BeltDiagram: React.FC<MechanismDiagramProps> = ({ className }) => {
  const { servo, transmission, load, frame, arrow } = MECHANISM_COLORS;

  return (
    <svg
      viewBox={CANVAS_CONFIG.viewBox}
      className={className}
      aria-label="同步带传动系统示意图"
      role="img"
    >
      {/* 伺服电机 */}
      <rect
        x="20" y="80" width="40" height="45"
        fill={servo}
        rx="4"
      />

      {/* 主动轮 */}
      <circle
        cx="90"
        cy="102"
        r="22"
        fill={transmission}
      />
      {/* 主动轮齿示意 */}
      <circle cx="90" cy="102" r="18" fill="none" stroke="white" strokeWidth="1.5" strokeDasharray="3,3" />

      {/* 从动轮 */}
      <circle
        cx="280"
        cy="102"
        r="22"
        fill={transmission}
      />
      {/* 从动轮齿示意 */}
      <circle cx="280" cy="102" r="18" fill="none" stroke="white" strokeWidth="1.5" strokeDasharray="3,3" />

      {/* 同步带 - 上侧 */}
      <line x1="90" y1="80" x2="280" y2="80" stroke={transmission} strokeWidth="6" strokeLinecap="round" />
      {/* 同步带 - 下侧 */}
      <line x1="90" y1="124" x2="280" y2="124" stroke={transmission} strokeWidth="6" strokeLinecap="round" />

      {/* 负载（连接从动轮） */}
      <rect
        x="310" y="85" width="50" height="35"
        fill={load}
        rx="3"
      />
      {/* 连接轴 */}
      <line x1="302" y1="102" x2="310" y2="102" stroke={frame} strokeWidth="4" />

      {/* 动力流向箭头 */}
      <polygon points="40,150 50,145 50,155" fill={arrow} />
      <line x1="20" y1="150" x2="45" y2="150" stroke={arrow} strokeWidth="2" />

      <polygon points="185,150 195,145 195,155" fill={arrow} />
      <line x1="90" y1="150" x2="190" y2="150" stroke={arrow} strokeWidth="2" />

      <polygon points="335,150 345,145 345,155" fill={arrow} />
      <line x1="280" y1="150" x2="340" y2="150" stroke={arrow} strokeWidth="2" />
    </svg>
  );
};

export default BeltDiagram;
```

**Step 2: Commit**

```bash
git add src/components/wizard/mechanism-diagrams/BeltDiagram.tsx
git commit -m "feat: add belt mechanism diagram"
```

---

### Task 6: 实现齿轮齿条示意图 (RackPinionDiagram)

**Files:**
- Create: `src/components/wizard/mechanism-diagrams/RackPinionDiagram.tsx`

**Step 1: 创建组件**

```tsx
// src/components/wizard/mechanism-diagrams/RackPinionDiagram.tsx
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
```

**Step 2: Commit**

```bash
git add src/components/wizard/mechanism-diagrams/RackPinionDiagram.tsx
git commit -m "feat: add rack and pinion mechanism diagram"
```

---

### Task 7: 实现直接驱动示意图 (DirectDriveDiagram)

**Files:**
- Create: `src/components/wizard/mechanism-diagrams/DirectDriveDiagram.tsx`

**Step 1: 创建组件**

```tsx
// src/components/wizard/mechanism-diagrams/DirectDriveDiagram.tsx
'use client';

import React from 'react';
import { MechanismDiagramProps } from './index';
import { MECHANISM_COLORS, CANVAS_CONFIG } from './constants';

/**
 * 直接驱动示意图
 * 布局：[伺服电机] → [负载]
 * 适用于旋转直驱和直线直驱两种模式
 */
const DirectDriveDiagram: React.FC<MechanismDiagramProps> = ({ className }) => {
  const { servo, load, frame, arrow } = MECHANISM_COLORS;

  return (
    <svg
      viewBox={CANVAS_CONFIG.viewBox}
      className={className}
      aria-label="直接驱动系统示意图"
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

      {/* 动力流向箭头 */}
      <polygon points="62,155 72,150 72,160" fill={arrow} />
      <line x1="30" y1="155" x2="67" y2="155" stroke={arrow} strokeWidth="2" />

      <polygon points="160,155 170,150 170,160" fill={arrow} />
      <line x1="95" y1="155" x2="165" y2="155" stroke={arrow} strokeWidth="2" />
    </svg>
  );
};

export default DirectDriveDiagram;
```

**Step 2: Commit**

```bash
git add src/components/wizard/mechanism-diagrams/DirectDriveDiagram.tsx
git commit -m "feat: add direct drive mechanism diagram"
```

---

## 第三阶段：集成到 MechanismStep

### Task 8: 在 MechanismStep 中集成示意图

**Files:**
- Modify: `src/components/wizard/steps/MechanismStep.tsx`

**Step 1: 添加导入**

在文件顶部添加：
```typescript
import { mechanismDiagrams } from '../mechanism-diagrams';
```

**Step 2: 在表单中添加示意图显示**

找到 `renderParamsForm()` 调用处，在其之前插入示意图组件：

```typescript
// 在 form 中，机械类型选择之后，参数表单之前
return (
  <form onSubmit={handleSubmit} className="space-y-6">
    <h2 className="text-2xl font-bold text-gray-900">{t('title')}</h2>

    {/* 机械类型选择 */}
    <div>
      <label className="block text-sm font-medium text-gray-700">
        {t('type')} <span className="text-red-500">*</span>
      </label>
      <select
        value={formData.type}
        onChange={(e) => handleTypeChange(e.target.value as MechanismType)}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2 text-gray-900"
      >
        {mechanismTypes.map((type) => (
          <option key={type.value} value={type.value}>
            {t(`types.${type.labelKey}`)}
          </option>
        ))}
      </select>
    </div>

    {/* 传动机构示意图 */}
    {(() => {
      const DiagramComponent = mechanismDiagrams[formData.type];
      return (
        <div className="bg-gray-50 rounded-lg p-4 flex justify-center border border-gray-200">
          <DiagramComponent className="w-full max-w-md h-auto" />
        </div>
      );
    })()}

    {/* 参数表单 */}
    {renderParamsForm()}

    {/* 按钮... */}
  </form>
);
```

**Step 3: 验证 TypeScript 编译**

```bash
npm run build 2>&1 | head -50
```

Expected: 无错误

**Step 4: Commit**

```bash
git add src/components/wizard/steps/MechanismStep.tsx
git commit -m "feat: integrate mechanism diagrams into MechanismStep"
```

---

## 第四阶段：验证和测试

### Task 9: 运行开发服务器验证

**Files:**
- None

**Step 1: 启动开发服务器**

```bash
npm run dev
```

**Step 2: 手动验证清单**

在浏览器中访问 http://localhost:3000，进入 Step 2（机械参数）：

- [ ] 页面正常加载无报错
- [ ] 默认显示滚珠丝杠示意图
- [ ] 切换机械类型时示意图正确更新
- [ ] 所有 5 种机械类型的示意图都显示正常
- [ ] 示意图样式正确（颜色、比例）
- [ ] 响应式布局正常（调整窗口大小）

**Step 3: 截图记录（可选）**

如需调整样式，截图保存到 `docs/plans/mechanism-diagrams-screenshots/`

---

### Task 10: 运行构建验证

**Files:**
- None

**Step 1: 执行构建**

```bash
npm run build
```

Expected: 构建成功，无 TypeScript 错误

**Step 2: Commit（如需要）**

```bash
git add -A
git commit -m "chore: verify mechanism diagrams build successfully" || echo "No changes to commit"
```

---

## 完成总结

实现完成后，MechanismStep 页面将显示：

1. **滚珠丝杠**: 电机→减速机→丝杠→滑块
2. **齿轮减速机**: 电机→减速机→转盘
3. **同步带**: 电机+主动轮→皮带→从动轮+负载
4. **齿轮齿条**: 电机+减速机→小齿轮→齿条+滑块
5. **直接驱动**: 电机→负载（无中间传动）

所有示意图遵循统一视觉规范，动力流向从左到右，使用标准颜色系统。
