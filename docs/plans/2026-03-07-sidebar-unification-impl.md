# 侧边栏统一化与轴命名功能实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 统一侧边栏交互模式，添加轴命名功能，修复指示器显示逻辑

**Architecture:** 改造AxisSidebar组件使项目信息和公共参数与轴使用相同的Item模式，在SystemConfigStep添加轴名称输入，修复page.tsx的指示器条件判断

**Tech Stack:** React, TypeScript, TailwindCSS, Zustand, next-intl

---

## 前置检查

**文件清单确认:**
- `src/app/page.tsx` - 主页面
- `src/components/wizard/AxisSidebar.tsx` - 侧边栏组件
- `src/components/wizard/AxisSidebarItem.tsx` - 轴Item组件
- `src/components/wizard/steps/SystemConfigStep.tsx` - 第4步配置
- `src/stores/project-store.ts` - 状态管理

**依赖检查:**
- 项目使用 `lucide-react` 图标库
- 使用 `next-intl` 进行国际化
- 使用 Zustand 进行状态管理

---

## Task 1: 修复主内容区指示器显示逻辑

**Files:**
- Modify: `src/app/page.tsx:221-229`

**Step 1: 分析当前代码**

当前指示器显示条件:
```tsx
{currentAxis && (
  <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
    <span>🛠️</span>
    <span>当前配置: {currentAxis.name}</span>
    {currentAxis.status === 'CONFIGURING' && (
      <span className="text-xs">🔄</span>
    )}
  </div>
)}
```

问题: 编辑项目信息或公共参数时也会显示

**Step 2: 修改显示条件**

添加条件: `mainViewMode === 'wizard'`

```tsx
{currentAxis && mainViewMode === 'wizard' && (
  <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
    <span>🛠️</span>
    <span>当前配置: {currentAxis.name}</span>
    {currentAxis.status === 'CONFIGURING' && (
      <span className="text-xs">🔄</span>
    )}
  </div>
)}
```

**Step 3: 验证修改**

启动开发服务器: `npm run dev`

测试步骤:
1. 打开页面，添加一个轴
2. 确认指示器显示"当前配置: 轴-1"
3. 点击侧边栏"编辑"项目信息
4. 确认指示器**不显示**
5. 点击侧边栏"编辑公共参数"
6. 确认指示器**不显示**
7. 点击轴返回wizard模式
8. 确认指示器重新显示

**Step 4: Commit**

```bash
git add src/app/page.tsx
git commit -m "fix: 只在wizard模式下显示当前配置指示器"
```

---

## Task 2: 改造AxisSidebar - 统一项目信息为Item模式

**Files:**
- Modify: `src/components/wizard/AxisSidebar.tsx:44-71`

**Step 1: 修改项目信息区域**

将项目信息区域从详情展示改为简洁Item模式:

```tsx
{/* 项目信息区域 - 简化为Item模式 */}
<div className="p-2 border-b border-gray-200 bg-white">
  <button
    onClick={onOpenProjectSettings}
    className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left ${
      mainViewMode === 'edit-project'
        ? 'bg-blue-50 border-blue-500 shadow-sm'
        : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-gray-50'
    }`}
  >
    <span className="flex-shrink-0 text-lg">📁</span>
    <div className="flex-1 min-w-0">
      <p className="font-medium text-gray-900 truncate">
        {project.name || '未命名项目'}
      </p>
      {mainViewMode === 'edit-project' && (
        <p className="text-xs text-blue-600">编辑中...</p>
      )}
    </div>
  </button>
</div>
```

**Step 2: 移除编辑按钮**

原代码中的编辑按钮逻辑已整合到Item中，删除单独编辑按钮。

**Step 3: 验证修改**

测试步骤:
1. 打开页面
2. 确认项目信息只显示名称，无客户/销售信息
3. 点击项目信息Item
4. 确认Item高亮显示蓝色边框
5. 确认显示"编辑中..."提示
6. 确认主区显示项目信息编辑表单

**Step 4: Commit**

```bash
git add src/components/wizard/AxisSidebar.tsx
git commit -m "refactor: 统一项目信息为Item模式，简化侧边栏展示"
```

---

## Task 3: 改造AxisSidebar - 统一公共参数为Item模式

**Files:**
- Modify: `src/components/wizard/AxisSidebar.tsx:73-132`

**Step 1: 修改公共参数区域**

将公共参数从可展开详情改为简洁Item模式:

```tsx
{/* 公共参数区域 - 简化为Item模式 */}
<div className="p-2 border-b border-gray-200 bg-blue-50">
  <button
    onClick={onOpenCommonParams}
    className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left ${
      mainViewMode === 'edit-common'
        ? 'bg-blue-100 border-blue-500 shadow-sm'
        : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-gray-50'
    }`}
  >
    <span className="flex-shrink-0 text-lg">⚙️</span>
    <div className="flex-1 min-w-0">
      <p className="font-medium text-gray-900">公共参数</p>
      {mainViewMode === 'edit-common' && (
        <p className="text-xs text-blue-600">编辑中...</p>
      )}
    </div>
  </button>
</div>
```

**Step 2: 移除展开/折叠逻辑**

删除 `isCommonParamsExpanded` state 和相关展开逻辑。

删除代码:
```tsx
const [isCommonParamsExpanded, setIsCommonParamsExpanded] = useState(true);
```

以及展开/折叠按钮和条件渲染逻辑。

**Step 3: 验证修改**

测试步骤:
1. 打开页面
2. 确认公共参数只显示"公共参数"标题，无具体参数值
3. 点击公共参数Item
4. 确认Item高亮显示蓝色边框
5. 确认显示"编辑中..."提示
6. 确认主区显示公共参数编辑表单

**Step 4: Commit**

```bash
git add src/components/wizard/AxisSidebar.tsx
git commit -m "refactor: 统一公共参数为Item模式，移除展开折叠功能"
```

---

## Task 4: 在SystemConfigStep添加轴名称输入

**Files:**
- Modify: `src/components/wizard/steps/SystemConfigStep.tsx`

**Step 1: 导入updateAxisName**

```tsx
import { useProjectStore } from '@/stores/project-store';
```

修改解构，添加 `updateAxisName`:
```tsx
const { project, currentAxisId, input, setPreferences, setResult, prevStep, completeWizard, updateAxisName } = useProjectStore();
```

**Step 2: 添加轴名称状态**

在state定义后添加:
```tsx
const [axisName, setAxisName] = useState(currentAxis?.name || '');
```

**Step 3: 在表单中添加轴名称输入**

在表单底部、按钮之前添加轴名称输入:

```tsx
{/* 轴名称确认 */}
<div className="border-t border-gray-200 pt-6 mt-6">
  <h3 className="text-lg font-medium text-gray-900 mb-4">轴名称确认</h3>
  <div>
    <label className="block text-sm font-medium text-gray-700">
      轴名称
    </label>
    <input
      type="text"
      value={axisName}
      onChange={(e) => setAxisName(e.target.value)}
      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2 text-gray-900"
      placeholder="请输入轴名称"
    />
    <p className="mt-1 text-xs text-gray-500">
      此名称将用于标识该轴，可在侧边栏随时修改
    </p>
  </div>
</div>
```

**Step 4: 在提交时保存轴名称**

在 `handleSubmit` 函数中，调用 `completeWizard()` 之前添加:

```tsx
// Save axis name
if (axisName.trim() && updateAxisName) {
  updateAxisName(currentAxisId, axisName.trim());
}
```

**Step 5: 验证修改**

测试步骤:
1. 进入Wizard第4步（系统配置）
2. 确认页面底部显示"轴名称确认"区域
3. 确认输入框显示当前轴名称（如"轴-1"）
4. 修改轴名称
5. 点击"开始选型"
6. 确认侧边栏轴名称已更新

**Step 6: Commit**

```bash
git add src/components/wizard/steps/SystemConfigStep.tsx
git commit -m "feat: 在系统配置步骤添加轴名称确认功能"
```

---

## Task 5: 验证默认轴名称递增逻辑

**Files:**
- Check: `src/app/page.tsx:72-81`

**Step 1: 确认当前逻辑**

当前 `handleAddAxis` 函数:
```tsx
const handleAddAxis = () => {
  const newAxisId = addAxis(`轴-${project.axes.length + 1}`);
  switchAxis(newAxisId);
  setMainViewMode('wizard');

  // If this is the first axis and project name is empty, prompt user to fill project info
  if (project.axes.length === 0 && !project.name) {
    setMainViewMode('edit-project');
  }
};
```

**Step 2: 验证递增逻辑**

当前逻辑使用 `project.axes.length + 1`，这会正确生成:
- 第1个轴: "轴-1"
- 第2个轴: "轴-2"
- 第3个轴: "轴-3"

此逻辑已正确，无需修改。

**Step 3: 测试验证**

测试步骤:
1. 打开页面
2. 点击"添加第一个轴"
3. 确认侧边栏显示"轴-1"
4. 完成配置或取消
5. 点击"添加新轴"
6. 确认侧边栏显示"轴-2"
7. 重复确认"轴-3"等递增正确

**Step 4: Commit (如需要调整)**

如测试通过，无需commit。如需要调整:
```bash
git add src/app/page.tsx
git commit -m "fix: 确保轴名称默认递增序列正确"
```

---

## Task 6: 运行测试验证

**Files:**
- Run: `npm run test`
- Run: `npm run build`

**Step 1: 运行单元测试**

```bash
npm run test
```

Expected: All tests pass

**Step 2: 运行构建**

```bash
npm run build
```

Expected: Build succeeds with no errors

**Step 3: 运行E2E测试（如有）**

```bash
npm run test:e2e
```

Expected: All E2E tests pass

**Step 4: Commit (如测试通过)**

```bash
git add .
git commit -m "test: 验证侧边栏统一化和轴命名功能"
```

---

## 实现完成检查清单

- [ ] Task 1: 指示器只在wizard模式显示
- [ ] Task 2: 项目信息统一为Item模式
- [ ] Task 3: 公共参数统一为Item模式
- [ ] Task 4: SystemConfigStep添加轴名称输入
- [ ] Task 5: 轴名称默认递增验证
- [ ] Task 6: 所有测试通过

## 回滚方案

如需回滚:
```bash
git log --oneline -10  # 查看提交历史
git reset --hard <commit-before-changes>  # 回滚到修改前
```

## 相关文档

- 设计文档: `docs/plans/2026-03-07-sidebar-unification-design.md`
