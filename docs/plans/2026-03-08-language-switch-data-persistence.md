# 语言切换数据保持实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 实现无刷新语言切换，保持用户编辑中的数据不丢失

**Architecture:**
1. 重构 `ClientLanguageProvider` 支持动态语言切换（不刷新页面）
2. 修改 `LanguageSwitcher` 使用新的切换机制
3. 确保 `project-store` 的当前编辑状态（`input`）在轴切换时正确保存

**Tech Stack:** React, next-intl, Zustand, TypeScript

---

## 背景分析

### 当前问题
- `LanguageSwitcher.tsx:17` 使用 `window.location.reload()` 导致页面刷新
- 页面刷新后，内存中的状态丢失
- 只有已完成的轴（`COMPLETED`）数据被持久化，编辑中的数据丢失

### 解决方案
1. **无刷新语言切换**: 使用 React state 动态切换 next-intl 的 locale 和 messages
2. **状态保持**: Zustand 的 persist 中间件已经处理项目数据的持久化
3. **编辑状态修复**: 确保 `switchAxis` 时当前轴的 `input` 被正确保存到轴数据中

---

## Task 1: 重构 ClientLanguageProvider 支持动态切换

**Files:**
- Modify: `src/i18n/ClientLanguageProvider.tsx`

**Step 1: 添加语言切换 Context**

创建 LanguageContext 用于跨组件语言切换：

```typescript
'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import zhMessages from './messages/zh.json';
import enMessages from './messages/en.json';
import type { Locale } from './config';

const messagesMap = {
  zh: zhMessages,
  en: enMessages,
};

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}

interface Props {
  children: React.ReactNode;
}

export default function ClientLanguageProvider({ children }: Props) {
  const [locale, setLocaleState] = useState<Locale>('zh');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Read locale from localStorage (set by language-store)
    const stored = localStorage.getItem('servo-selector-language');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.state?.locale) {
          setLocaleState(parsed.state.locale);
        }
      } catch {
        // fallback to default
      }
    }
    setMounted(true);
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    // Update URL parameter without reload
    const url = new URL(window.location.href);
    url.searchParams.set('lang', newLocale);
    window.history.replaceState({}, '', url.toString());
  }, []);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <NextIntlClientProvider messages={zhMessages} locale="zh">
        {children}
      </NextIntlClientProvider>
    );
  }

  return (
    <LanguageContext.Provider value={{ locale, setLocale }}>
      <NextIntlClientProvider messages={messagesMap[locale]} locale={locale}>
        {children}
      </NextIntlClientProvider>
    </LanguageContext.Provider>
  );
}
```

**Step 2: 验证类型正确**

确保 TypeScript 编译通过：

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/i18n/ClientLanguageProvider.tsx
git commit -m "feat(i18n): add LanguageContext for dynamic locale switching"
```

---

## Task 2: 修改 LanguageSwitcher 使用新切换机制

**Files:**
- Modify: `src/components/LanguageSwitcher.tsx`

**Step 1: 使用新的 useLanguage hook**

```typescript
'use client';

import { useLanguage } from '@/i18n/ClientLanguageProvider';
import { locales, localeLabels, type Locale } from '@/i18n/config';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();

  const handleChange = (newLocale: Locale) => {
    if (newLocale !== locale) {
      setLocale(newLocale);
    }
  };

  return (
    <div className="flex items-center gap-1 bg-[var(--background-tertiary)] rounded-xl p-1 border border-[var(--border-subtle)]">
      <div className="px-2">
        <Globe className="w-4 h-4 text-[var(--foreground-muted)]" />
      </div>
      {locales.map((l) => (
        <button
          key={l}
          onClick={() => handleChange(l)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
            locale === l
              ? 'bg-[var(--primary-500)] text-white shadow-lg shadow-[var(--primary-500)]/30'
              : 'text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--background-elevated)]'
          }`}
        >
          {localeLabels[l]}
        </button>
      ))}
    </div>
  );
}
```

**Step 2: 运行开发服务器验证**

Run: `npm run dev`

手动测试：
1. 打开 http://localhost:3000
2. 进入向导编辑页面
3. 填写一些数据（不要完成轴）
4. 切换语言
5. 验证：页面没有刷新，语言切换成功，数据保持

**Step 3: Commit**

```bash
git add src/components/LanguageSwitcher.tsx
git commit -m "feat(i18n): use LanguageContext for no-reload locale switching"
```

---

## Task 3: 修复 switchAxis 保存当前编辑状态

**Files:**
- Modify: `src/stores/project-store.ts:268-298`

**Step 1: 分析当前问题**

当前 `switchAxis` 方法在保存当前轴状态时，只保存了 `input` 和 `result`，但 `input` 可能包含未保存的编辑数据。需要确保这些数据被正确保存到轴的 `input` 字段。

查看当前代码（第 268-298 行）：
```typescript
switchAxis: (axisId) => {
  const state = get();
  const axis = state.project.axes.find((a) => a.id === axisId);
  if (!axis) return;

  // Save current axis state before switching
  const currentAxis = state.project.axes.find((a) => a.id === state.currentAxisId);
  if (currentAxis) {
    set((state) => ({
      project: {
        ...state.project,
        axes: state.project.axes.map((a) =>
          a.id === currentAxis.id
            ? { ...a, input: state.input, result: state.result }
            : a
        ),
      },
    }));
  }

  // Load new axis state
  set({
    currentAxisId: axisId,
    currentStep: axis.status === 'COMPLETED' ? 5 : 1,
    isComplete: axis.status === 'COMPLETED',
    input: {},  // ← 这里重置了 input
    result: axis.result,
  });
},
```

**Step 2: 修改 switchAxis 正确加载轴的 input**

修改加载新轴状态时的逻辑，从轴的 `input` 加载：

```typescript
switchAxis: (axisId) => {
  const state = get();
  const axis = state.project.axes.find((a) => a.id === axisId);
  if (!axis) return;

  // Save current axis state before switching
  const currentAxis = state.project.axes.find((a) => a.id === state.currentAxisId);
  if (currentAxis) {
    set((state) => ({
      project: {
        ...state.project,
        axes: state.project.axes.map((a) =>
          a.id === currentAxis.id
            ? { ...a, input: state.input, result: state.result }
            : a
        ),
      },
    }));
  }

  // Load new axis state from axis input
  const axisInput = axis.input || {};
  set({
    currentAxisId: axisId,
    currentStep: axis.status === 'COMPLETED' ? 5 : 1,
    isComplete: axis.status === 'COMPLETED',
    input: axisInput,  // ← 从轴的 input 加载
    result: axis.result,
  });
},
```

**Step 3: 运行测试验证**

Run: `npm test -- src/stores/__tests__/project-store.test.ts`
Expected: All tests pass

**Step 4: Commit**

```bash
git add src/stores/project-store.ts
git commit -m "fix(store): load axis input when switching axes"
```

---

## Task 4: 添加语言切换集成测试

**Files:**
- Create: `src/components/__tests__/LanguageSwitcher.test.tsx`

**Step 1: 编写测试**

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LanguageSwitcher from '../LanguageSwitcher';
import ClientLanguageProvider from '@/i18n/ClientLanguageProvider';

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock window.history
const mockReplaceState = vi.fn();
Object.defineProperty(window, 'history', {
  value: { replaceState: mockReplaceState },
});

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  it('should switch language without page reload', () => {
    render(
      <ClientLanguageProvider>
        <LanguageSwitcher />
      </ClientLanguageProvider>
    );

    const enButton = screen.getByText('EN');

    // Click to switch to English
    fireEvent.click(enButton);

    // Verify URL was updated without reload
    expect(mockReplaceState).toHaveBeenCalled();

    // Verify no page reload happened (window.location.reload should not be called)
    // This is implicit since we're testing in JSDOM
  });

  it('should highlight current locale', () => {
    render(
      <ClientLanguageProvider>
        <LanguageSwitcher />
      </ClientLanguageProvider>
    );

    const zhButton = screen.getByText('中文');
    const enButton = screen.getByText('EN');

    // 中文应该被选中（默认）
    expect(zhButton.className).toContain('bg-');
    expect(enButton.className).not.toContain('bg-');
  });
});
```

**Step 2: 运行测试**

Run: `npm test -- src/components/__tests__/LanguageSwitcher.test.tsx`
Expected: Tests pass

**Step 3: Commit**

```bash
git add src/components/__tests__/LanguageSwitcher.test.tsx
git commit -m "test(i18n): add LanguageSwitcher integration tests"
```

---

## Task 5: 端到端验证

**Files:**
- Manual testing

**Step 1: 启动开发服务器**

Run: `npm run dev`

**Step 2: 手动测试场景**

测试场景 1: 编辑中切换语言
1. 打开 http://localhost:3000
2. 创建新项目
3. 在第一步（机构类型）选择"滚珠丝杠"
4. 填写一些参数（如行程、导程等）
5. 切换到第二步（运动参数）
6. 填写速度、加速度等
7. **切换语言到 English**
8. 验证：页面没有刷新，语言变为英文，已填写的数据仍然存在
9. 继续编辑，完成轴配置
10. 验证：轴可以正常完成，数据正确保存

测试场景 2: 多轴切换
1. 完成第一个轴的配置
2. 添加第二个轴
3. 在第二个轴编辑过程中切换语言
4. 验证：第二个轴的编辑数据保持
5. 切换回第一个轴
6. 验证：第一个轴的数据正确加载

测试场景 3: 刷新后恢复
1. 编辑过程中切换语言
2. 刷新页面
3. 验证：语言设置保持，项目数据保持

**Step 3: 构建验证**

Run: `npm run build`
Expected: Build succeeds without errors

**Step 4: Commit**

```bash
git add .
git commit -m "feat(i18n): complete no-reload language switching with data persistence"
```

---

## 总结

### 修改的文件
1. `src/i18n/ClientLanguageProvider.tsx` - 添加 LanguageContext 支持动态切换
2. `src/components/LanguageSwitcher.tsx` - 使用新的切换机制，移除 reload
3. `src/stores/project-store.ts` - 修复 switchAxis 加载轴 input
4. `src/components/__tests__/LanguageSwitcher.test.tsx` - 新增测试

### 关键变更
- 移除 `window.location.reload()`，实现真正的无刷新切换
- 使用 React Context 在组件树中传递 `setLocale` 函数
- 修复轴切换时的数据加载逻辑

### 验证清单
- [ ] 语言切换不刷新页面
- [ ] 编辑中的数据在切换语言后保持
- [ ] 多轴切换时数据正确加载
- [ ] 刷新页面后语言和项目数据恢复
- [ ] 所有测试通过
- [ ] 构建成功
