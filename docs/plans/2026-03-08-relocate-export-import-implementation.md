# 迁移导入/导出功能到结果页面实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将项目数据导入/导出功能从顶部工具栏迁移到结果页面，与 PDF 导出按钮并排显示，并移除顶部工具菜单。

**Architecture:** 在 ResultStep.tsx 的底部操作区域添加导出/导入按钮，复用现有的 ExportDialog 和 ImportDialog 组件，从 page.tsx 移除 ProjectDataMenu 组件。

**Tech Stack:** Next.js 14 + TypeScript + TailwindCSS + next-intl + Lucide React

---

## Task 1: 修改 ResultStep.tsx 添加导入/导出按钮

**Files:**
- Modify: `src/components/wizard/steps/ResultStep.tsx`

**Step 1: 添加导入**

在文件顶部添加 ImportDialog 和 ExportDialog 导入：

```typescript
import { ExportDialog } from '../ExportDialog';
import { ImportDialog } from '../ImportDialog';
import { Download, Upload } from 'lucide-react';
```

**Step 2: 添加状态管理**

在组件内部添加对话框状态：

```typescript
const [showExportDialog, setShowExportDialog] = useState(false);
const [showImportDialog, setShowImportDialog] = useState(false);
```

**Step 3: 修改按钮区域**

找到 PDF 导出按钮的位置（约第 409 行），在其前后添加导出/导入按钮：

将：
```typescript
<PdfExportButton disabled={!config} />
```

改为：
```typescript
<button
  onClick={() => setShowExportDialog(true)}
  className="btn btn-secondary"
  title={t('exportProject')}
>
  <Download className="w-4 h-4" />
  {t('exportProject')}
</button>

<button
  onClick={() => setShowImportDialog(true)}
  className="btn btn-secondary"
  title={t('importProject')}
>
  <Upload className="w-4 h-4" />
  {t('importProject')}
</button>

<PdfExportButton disabled={!config} />
```

**Step 4: 添加对话框组件**

在组件返回的 JSX 末尾（`</div>` 之前）添加对话框：

```typescript
<ExportDialog
  isOpen={showExportDialog}
  onClose={() => setShowExportDialog(false)}
/>
<ImportDialog
  isOpen={showImportDialog}
  onClose={() => setShowImportDialog(false)}
/>
```

**Step 5: Commit**

```bash
git add src/components/wizard/steps/ResultStep.tsx
git commit -m "feat: add export/import buttons to ResultStep"
```

---

## Task 2: 从 page.tsx 移除 ProjectDataMenu

**Files:**
- Modify: `src/app/page.tsx`

**Step 1: 移除导入**

删除以下导入：
```typescript
import { ProjectDataMenu } from '@/components/project-data';
```

**Step 2: 移除桌面端工具菜单**

找到桌面端 LanguageSwitcher 区域（约第 248-250 行）：

将：
```typescript
{/* Desktop: Language Switcher & Tools */}
<div className="hidden md:flex absolute right-0 top-0 items-center gap-2">
  <LanguageSwitcher />
  <ProjectDataMenu />
</div>
```

改为：
```typescript
{/* Desktop: Language Switcher */}
<div className="hidden md:flex absolute right-0 top-0 items-center gap-2">
  <LanguageSwitcher />
</div>
```

**Step 3: 移除移动端工具菜单**

找到移动端 LanguageSwitcher 区域（约第 264-268 行）：

将：
```typescript
{/* Mobile: Language Switcher & Tools */}
<div className="md:hidden mt-4 flex justify-center gap-2">
  <LanguageSwitcher />
  <ProjectDataMenu />
</div>
```

改为：
```typescript
{/* Mobile: Language Switcher */}
<div className="md:hidden mt-4 flex justify-center gap-2">
  <LanguageSwitcher />
</div>
```

**Step 4: Commit**

```bash
git add src/app/page.tsx
git commit -m "refactor: remove ProjectDataMenu from header"
```

---

## Task 3: 更新 i18n 翻译文件

**Files:**
- Modify: `src/i18n/messages/zh.json`
- Modify: `src/i18n/messages/en.json`

### Task 3a: 添加中文翻译

**Step 1: 在 result 命名空间添加翻译**

在 `src/i18n/messages/zh.json` 的 `result` 对象中添加：

```json
"exportProject": "导出项目",
"importProject": "导入项目"
```

找到 result 部分（搜索 `"result": {`），在合适位置添加这两个键。

**Step 2: Commit**

```bash
git add src/i18n/messages/zh.json
git commit -m "i18n: add export/import button labels for Chinese"
```

### Task 3b: 添加英文翻译

**Step 1: 在 result 命名空间添加翻译**

在 `src/i18n/messages/en.json` 的 `result` 对象中添加：

```json
"exportProject": "Export Project",
"importProject": "Import Project"
```

**Step 2: Commit**

```bash
git add src/i18n/messages/en.json
git commit -m "i18n: add export/import button labels for English"
```

---

## Task 4: 测试验证

**Files:**
- Run: `npm run build`
- Run: `npm test`

### Task 4a: 构建测试

**Step 1: 运行构建**

```bash
npm run build
```

**Expected:** 构建成功，无 TypeScript 错误

**Step 2: Commit（如需要）**

```bash
git add -A
git commit -m "fix: resolve build issues" || echo "No changes to commit"
```

### Task 4b: 运行测试

**Step 1: 运行测试**

```bash
npm test
```

**Expected:** 所有现有测试通过

**Step 2: Commit（如需要）**

```bash
git add -A
git commit -m "test: ensure all tests pass" || echo "No changes to commit"
```

---

## Task 5: 最终验证

**Step 1: 验证文件结构**

```bash
grep -n "ProjectDataMenu" src/app/page.tsx || echo "ProjectDataMenu removed from page.tsx"
```

**Expected:** 无输出或显示未找到

**Step 2: 验证 ResultStep 修改**

```bash
grep -n "ExportDialog\|ImportDialog\|exportProject\|importProject" src/components/wizard/steps/ResultStep.tsx
```

**Expected:** 显示导入、状态、按钮和对话框的使用位置

**Step 3: 最终提交**

```bash
git add -A
git commit -m "feat: relocate export/import buttons to result page"
```

---

## 测试清单（手动验证）

1. **界面验证**
   - [ ] 顶部工具栏不再显示工具菜单
   - [ ] 结果页面底部显示导出项目按钮
   - [ ] 结果页面底部显示导入项目按钮
   - [ ] 按钮与 PDF 导出并排显示

2. **导出功能**
   - [ ] 点击"导出项目"打开导出对话框
   - [ ] 可以正常导出 JSON 文件

3. **导入功能**
   - [ ] 点击"导入项目"打开导入对话框
   - [ ] 可以正常导入 JSON 文件

4. **i18n**
   - [ ] 中文界面显示"导出项目"/"导入项目"
   - [ ] 英文界面显示"Export Project"/"Import Project"
