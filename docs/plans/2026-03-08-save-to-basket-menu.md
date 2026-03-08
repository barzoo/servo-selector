# SaveToBasketMenu 组件实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将"保存到篮子"后的对话框改为下拉菜单形式，从按钮位置智能弹出

**Architecture:** 创建一个独立的 SaveToBasketMenu 组件，使用绝对定位从触发按钮弹出。组件自动检测视口空间，决定向上或向下弹出。菜单包含三个选项，点击外部或按 Escape 关闭。

**Tech Stack:** React, TypeScript, Tailwind CSS, Lucide React icons

---

## Task 1: 创建 SaveToBasketMenu 组件

**Files:**
- Create: `src/components/wizard/SaveToBasketMenu.tsx`

**Step 1: 创建组件文件**

创建 `src/components/wizard/SaveToBasketMenu.tsx`：

```tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { CheckCircle, RotateCcw, Plus, FileText } from 'lucide-react';

interface SaveToBasketMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onCloneAxis: () => void;
  onAddNewAxis: () => void;
  onContinueEditing: () => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

export function SaveToBasketMenu({
  isOpen,
  onClose,
  onCloneAxis,
  onAddNewAxis,
  onContinueEditing,
  triggerRef,
}: SaveToBasketMenuProps) {
  const [placement, setPlacement] = useState<'top' | 'bottom'>('bottom');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const menuHeight = 280;

      if (spaceBelow < menuHeight && spaceAbove > spaceBelow) {
        setPlacement('top');
      } else {
        setPlacement('bottom');
      }
    }
  }, [isOpen, triggerRef]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Menu */}
      <div
        ref={menuRef}
        className="absolute right-0 z-50 w-72"
        style={{
          top: placement === 'bottom' ? '100%' : 'auto',
          bottom: placement === 'top' ? '100%' : 'auto',
          marginTop: placement === 'bottom' ? '8px' : '0',
          marginBottom: placement === 'top' ? '8px' : '0',
        }}
        role="menu"
      >
        <div className="card shadow-2xl border border-[var(--border-default)] overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 bg-[var(--green-500)]/5 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-[var(--green-400)]" />
              <span className="font-medium text-[var(--foreground)] text-sm">轴已保存到篮子</span>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <MenuItem
              icon={<RotateCcw className="w-4 h-4 text-[var(--primary-400)]" />}
              title="基于此轴创建新轴"
              description="复制当前配置作为起点"
              onClick={onCloneAxis}
              iconBg="bg-[var(--primary-500)]/10"
            />

            <MenuItem
              icon={<Plus className="w-4 h-4 text-[var(--green-400)]" />}
              title="添加空白新轴"
              description="从头开始配置新轴"
              onClick={onAddNewAxis}
              iconBg="bg-[var(--green-500)]/10"
            />

            <MenuItem
              icon={<FileText className="w-4 h-4 text-[var(--foreground-muted)]" />}
              title="继续编辑当前轴"
              description="返回查看或修改配置"
              onClick={onContinueEditing}
              iconBg="bg-[var(--background-tertiary)]"
            />
          </div>
        </div>

        {/* Arrow indicator */}
        <div
          className={`absolute right-6 w-3 h-3 bg-[var(--background-secondary)] border-l border-t border-[var(--border-default)] transform rotate-45 ${
            placement === 'bottom' ? '-top-1.5' : '-bottom-1.5 rotate-[225deg]'
          }`}
        />
      </div>
    </>
  );
}

interface MenuItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  iconBg: string;
}

function MenuItem({ icon, title, description, onClick, iconBg }: MenuItemProps) {
  return (
    <button
      onClick={onClick}
      className="w-full px-4 py-3 text-left hover:bg-[var(--primary-500)]/5 transition-colors flex items-start gap-3 group"
      role="menuitem"
    >
      <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="font-medium text-[var(--foreground)] text-sm">{title}</p>
        <p className="text-xs text-[var(--foreground-muted)]">{description}</p>
      </div>
    </button>
  );
}
```

**Step 2: 验证组件创建成功**

Run: `cat src/components/wizard/SaveToBasketMenu.tsx | head -20`
Expected: 显示组件文件内容

**Step 3: Commit**

```bash
git add src/components/wizard/SaveToBasketMenu.tsx
git commit -m "feat: 创建 SaveToBasketMenu 下拉菜单组件"
```

---

## Task 2: 修改 ResultStep 组件

**Files:**
- Modify: `src/components/wizard/steps/ResultStep.tsx`

**Step 1: 导入新组件和必要的 hooks**

在文件顶部添加导入：

```tsx
import { useRef } from 'react';
import { SaveToBasketMenu } from '../SaveToBasketMenu';
import { ChevronUp, ChevronDown } from 'lucide-react';
```

**Step 2: 添加 state 和 ref**

在组件内部添加：

```tsx
const [showSaveMenu, setShowSaveMenu] = useState(false);
const saveButtonRef = useRef<HTMLButtonElement>(null);
```

**Step 3: 替换保存按钮和对话框**

找到原有的保存按钮代码（约 358-378 行），替换为：

```tsx
<div className="relative">
  <button
    ref={saveButtonRef}
    onClick={() => {
      if (!isSaved) {
        completeAxis();
        setIsSaved(true);
        setShowSaveMenu(true);
      } else {
        setShowSaveMenu(!showSaveMenu);
      }
    }}
    className="btn btn-primary"
  >
    {isSaved ? (
      <>
        <CheckCircle className="w-4 h-4" />
        已保存
        {showSaveMenu ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </>
    ) : (
      <>
        <Save className="w-4 h-4" />
        保存到篮子
      </>
    )}
  </button>

  <SaveToBasketMenu
    isOpen={showSaveMenu}
    onClose={() => setShowSaveMenu(false)}
    onCloneAxis={() => {
      const currentAxisId = useProjectStore.getState().currentAxisId;
      const newAxisId = addAxis(`轴-${project.axes.length + 1}`, currentAxisId);
      switchAxis(newAxisId);
      setShowSaveMenu(false);
      reset();
    }}
    onAddNewAxis={() => {
      const newAxisId = addAxis(`轴-${project.axes.length + 1}`);
      switchAxis(newAxisId);
      setShowSaveMenu(false);
      reset();
    }}
    onContinueEditing={() => setShowSaveMenu(false)}
    triggerRef={saveButtonRef}
  />
</div>
```

**Step 4: 删除原有的对话框代码**

删除原有的对话框代码（约 384-469 行），即 `{showSaveOptions && (...)}` 部分。

**Step 5: 清理未使用的代码**

删除 `showSaveOptions` state 和 `setShowSaveOptions`（如果不再使用）。

**Step 6: 验证修改**

Run: `npm run build 2>&1 | head -30`
Expected: 构建成功，无错误

**Step 7: Commit**

```bash
git add src/components/wizard/steps/ResultStep.tsx
git commit -m "refactor: 将保存到篮子对话框改为下拉菜单"
```

---

## Task 3: 测试验证

**Files:**
- Test: 手动测试

**Step 1: 启动开发服务器**

Run: `npm run dev`
Expected: 服务器启动成功，显示 `localhost:3000`

**Step 2: 测试场景**

1. 完成一个轴的配置，进入结果页面
2. 点击"保存到篮子"按钮
3. 验证：
   - 菜单从按钮位置弹出
   - 显示三个选项：基于此轴创建新轴、添加空白新轴、继续编辑当前轴
   - 每个选项有图标、标题和描述
   - 点击外部区域关闭菜单
   - 按 Escape 键关闭菜单
   - 点击"继续编辑当前轴"关闭菜单
   - 点击"基于此轴创建新轴"创建新轴并跳转
   - 点击"添加空白新轴"创建空白轴并跳转

4. 滚动页面到底部，再次点击按钮
5. 验证：菜单向上弹出（空间不足时自动调整）

**Step 3: 移动端测试**

1. 使用浏览器开发者工具切换到移动端视图
2. 重复上述测试
3. 验证菜单在小屏幕上显示正常

**Step 4: Commit 测试结果**

```bash
git add -A
git commit -m "test: 验证 SaveToBasketMenu 功能正常"
```

---

## 总结

完成以上任务后，"保存到篮子"功能将从对话框改为下拉菜单形式：

1. ✅ 菜单从按钮位置智能弹出（向上/向下自动判断）
2. ✅ 包含三个选项，每个都有图标、标题、描述
3. ✅ 点击外部或 Escape 关闭
4. ✅ 与现有项目风格一致
5. ✅ 响应式适配
