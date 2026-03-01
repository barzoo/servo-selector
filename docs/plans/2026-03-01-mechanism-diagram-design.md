# 机械参数页面传动机构示意图设计文档

## 1. 设计目标

在机械参数配置页面（MechanismStep）中，根据用户选定的机械类型，显示对应的伺服系统组成示意图。

### 1.1 用户体验目标
- 帮助用户快速理解传动结构
- 建立虚拟配置与物理世界的直观关联
- 提升界面专业性和可视化效果

### 1.2 设计约束
- 无文字（避免 i18n 复杂性）
- 静态 SVG（不随参数变化）
- 统一视觉语言
- 动力流向：左 → 右

## 2. 视觉设计系统

### 2.1 画布规范
| 属性 | 值 |
|------|-----|
| viewBox | "0 0 400 200" |
| 宽度 | 自适应（max-w-md） |
| 背景 | 透明或 #F8FAFC |

### 2.2 颜色系统
```typescript
const MECHANISM_COLORS = {
  servo: '#2563EB',        // 蓝色 - 伺服电机
  transmission: '#059669', // 绿色 - 传动机构
  load: '#DC2626',         // 红色 - 负载
  frame: '#374151',        // 深灰 - 结构框架
  guide: '#9CA3AF',        // 浅灰 - 导轨/辅助线
  arrow: '#F59E0B',        // 橙色 - 动力流向箭头
};
```

### 2.3 标准元素尺寸
| 元素 | 尺寸 | 形状 |
|------|------|------|
| 伺服电机 | 40×50px | 圆角矩形 |
| 减速机 | 35×40px | 梯形 |
| 丝杠 | 120×8px | 长条矩形 |
| 滑块 | 50×30px | 矩形 |
| 齿轮/带轮 | 直径 30px | 圆形 |
| 箭头 | 15×3px | 三角形箭头 |

## 3. 组件架构

### 3.1 文件结构
```
src/components/wizard/mechanism-diagrams/
├── index.tsx                 # 统一导出 + 类型定义
├── constants.ts              # 颜色、尺寸常量
├── BallScrewDiagram.tsx      # 滚珠丝杠
├── GearboxDiagram.tsx        # 齿轮减速机
├── BeltDiagram.tsx           # 同步带
├── RackPinionDiagram.tsx     # 齿轮齿条
└── DirectDriveDiagram.tsx    # 直接驱动
```

### 3.2 类型定义
```typescript
export interface MechanismDiagramProps {
  className?: string;
}

export type MechanismDiagramComponent = React.FC<MechanismDiagramProps>;

export const mechanismDiagrams: Record<MechanismType, MechanismDiagramComponent>;
```

### 3.3 集成方式
在 MechanismStep 组件中：
```typescript
const DiagramComponent = mechanismDiagrams[formData.type];

<div className="bg-gray-50 rounded-lg p-4 flex justify-center">
  <DiagramComponent className="w-full max-w-md" />
</div>
```

## 4. SVG 内容规范

### 4.1 滚珠丝杠 (BALL_SCREW)
```
[伺服电机] → [减速机] → [丝杠] → [滑块]
  蓝色        绿色        绿色      红色
```
布局：电机(左) → 减速机 → 丝杠(水平长条) → 滑块(可在导轨上移动示意)

### 4.2 齿轮减速机 (GEARBOX)
```
[伺服电机] → [减速机] → [转盘]
  蓝色        绿色        红色
```
布局：电机(左) → 减速机(中) → 圆形转盘/滚筒(右)

### 4.3 同步带 (BELT)
```
[伺服电机] → [主动轮] → [皮带] → [从动轮+负载]
  蓝色        绿色        绿色        红色
```
布局：电机+主动轮(左) → 皮带(环形示意) → 从动轮+负载(右)

### 4.4 齿轮齿条 (RACK_PINION)
```
[伺服电机] → [减速机] → [小齿轮] → [齿条+滑块]
  蓝色        绿色        绿色         红色
```
布局：电机+减速机(左) → 小齿轮(中) → 齿条+滑块(右)

### 4.5 直接驱动 (DIRECT_DRIVE)
```
[伺服电机] → [负载]
  蓝色        红色
```
布局：电机(左，较大) → 负载(右，转盘或直线滑块)

## 5. 实现要点

### 5.1 SVG 最佳实践
- 使用 `viewBox` 确保响应式缩放
- 使用 `currentColor` 或 CSS 变量便于主题切换
- 避免使用文字元素
- 使用 `<g>` 分组管理相关元素

### 5.2 可访问性
- 添加 `aria-label` 描述图示内容
- 使用 `role="img"` 声明图片角色

### 5.3 性能优化
- 组件使用 `React.memo` 避免不必要的重渲染
- SVG 内联避免额外 HTTP 请求

## 6. 后续扩展

可能的未来增强（不在当前范围）：
- 添加简单的 CSS 动画（如旋转箭头表示运动方向）
- 根据参数高亮相关部件
- 交互式提示（hover 显示部件名称）
