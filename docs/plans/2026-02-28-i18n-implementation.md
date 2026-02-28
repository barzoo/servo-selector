# 多语言支持（i18n）实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 为伺服选型工具添加完整的英文界面支持，用户可通过语言切换器在中英文之间切换。

**Architecture:** 使用 `next-intl` 库实现国际化，通过 LocalStorage 持久化用户语言偏好，同时支持 URL 参数覆盖。所有 UI 文本抽取到 JSON 翻译文件，组件通过 hooks 获取当前语言文本。

**Tech Stack:** Next.js 14 App Router, TypeScript, next-intl, TailwindCSS, Zustand

---

## 前置准备

### Task 0: 安装依赖

**Files:**
- Modify: `package.json`

**Step 1: 安装 next-intl**

```bash
npm install next-intl
```

**Step 2: 提交**

```bash
git add package.json package-lock.json
git commit -m "deps: install next-intl for i18n support"
```

---

## 核心配置

### Task 1: 创建 i18n 配置文件

**Files:**
- Create: `src/i18n/config.ts`

**Step 1: 创建配置文件**

```typescript
export type Locale = 'zh' | 'en';

export const defaultLocale: Locale = 'zh';
export const locales: Locale[] = ['zh', 'en'];

export const localeLabels: Record<Locale, string> = {
  zh: '中文',
  en: 'EN',
};
```

**Step 2: 提交**

```bash
git add src/i18n/config.ts
git commit -m "feat(i18n): add locale configuration"
```

---

### Task 2: 创建翻译文件

**Files:**
- Create: `src/i18n/messages/zh.json`
- Create: `src/i18n/messages/en.json`

**Step 1: 创建中文翻译文件**

```json
{
  "metadata": {
    "title": "伺服选型工具",
    "description": "Bosch Rexroth 伺服系统选型计算工具"
  },
  "common": {
    "next": "下一步",
    "back": "上一步",
    "submit": "提交",
    "cancel": "取消",
    "save": "保存",
    "loading": "加载中...",
    "error": "错误",
    "success": "成功"
  },
  "steps": {
    "projectInfo": "项目信息",
    "mechanism": "机械参数",
    "motion": "运动参数",
    "duty": "工况条件",
    "systemConfig": "系统配置",
    "result": "选型结果"
  },
  "projectInfo": {
    "title": "项目信息",
    "projectName": "项目名称",
    "projectNamePlaceholder": "请输入项目名称",
    "customerName": "客户名称",
    "customerNamePlaceholder": "请输入客户名称",
    "salesPerson": "销售人员",
    "salesPersonPlaceholder": "请输入销售人员姓名",
    "date": "日期",
    "errors": {
      "projectNameRequired": "请输入项目名称"
    }
  },
  "mechanism": {
    "title": "机械参数",
    "type": "机械类型",
    "types": {
      "ballScrew": "滚珠丝杠",
      "gear": "齿轮/减速机",
      "directDrive": "直接驱动",
      "belt": "同步带",
      "rack": "齿轮齿条"
    }
  },
  "motion": {
    "title": "运动参数"
  },
  "duty": {
    "title": "工况条件"
  },
  "systemConfig": {
    "title": "系统配置"
  },
  "result": {
    "title": "选型结果",
    "summary": "计算摘要",
    "recommendedMotor": "推荐电机",
    "recommendedDrive": "推荐驱动器",
    "exportPdf": "导出 PDF"
  }
}
```

**Step 2: 创建英文翻译文件**

```json
{
  "metadata": {
    "title": "Servo Sizing Tool",
    "description": "Bosch Rexroth Servo System Sizing and Selection Tool"
  },
  "common": {
    "next": "Next",
    "back": "Back",
    "submit": "Submit",
    "cancel": "Cancel",
    "save": "Save",
    "loading": "Loading...",
    "error": "Error",
    "success": "Success"
  },
  "steps": {
    "projectInfo": "Project Info",
    "mechanism": "Mechanism",
    "motion": "Motion",
    "duty": "Duty Cycle",
    "systemConfig": "System Config",
    "result": "Results"
  },
  "projectInfo": {
    "title": "Project Information",
    "projectName": "Project Name",
    "projectNamePlaceholder": "Enter project name",
    "customerName": "Customer Name",
    "customerNamePlaceholder": "Enter customer name",
    "salesPerson": "Sales Person",
    "salesPersonPlaceholder": "Enter sales person name",
    "date": "Date",
    "errors": {
      "projectNameRequired": "Please enter project name"
    }
  },
  "mechanism": {
    "title": "Mechanism Parameters",
    "type": "Mechanism Type",
    "types": {
      "ballScrew": "Ball Screw",
      "gear": "Gear/Reducer",
      "directDrive": "Direct Drive",
      "belt": "Timing Belt",
      "rack": "Rack & Pinion"
    }
  },
  "motion": {
    "title": "Motion Parameters"
  },
  "duty": {
    "title": "Duty Conditions"
  },
  "systemConfig": {
    "title": "System Configuration"
  },
  "result": {
    "title": "Sizing Results",
    "summary": "Calculation Summary",
    "recommendedMotor": "Recommended Motor",
    "recommendedDrive": "Recommended Drive",
    "exportPdf": "Export PDF"
  }
}
```

**Step 3: 提交**

```bash
git add src/i18n/messages/
git commit -m "feat(i18n): add Chinese and English translation files"
```

---

### Task 3: 创建 i18n Provider

**Files:**
- Create: `src/i18n/NextIntlProvider.tsx`

**Step 1: 创建 Provider 组件**

```typescript
'use client';

import { NextIntlClientProvider } from 'next-intl';
import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  messages: Record<string, unknown>;
  locale: string;
}

export default function NextIntlProvider({ children, messages, locale }: Props) {
  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      {children}
    </NextIntlClientProvider>
  );
}
```

**Step 2: 提交**

```bash
git add src/i18n/NextIntlProvider.tsx
git commit -m "feat(i18n): add NextIntlProvider component"
```

---

### Task 4: 创建语言状态管理

**Files:**
- Create: `src/stores/language-store.ts`

**Step 1: 创建语言状态 store**

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Locale, defaultLocale } from '@/i18n/config';

interface LanguageState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      locale: defaultLocale,
      setLocale: (locale) => set({ locale }),
    }),
    {
      name: 'servo-selector-language',
    }
  )
);
```

**Step 2: 提交**

```bash
git add src/stores/language-store.ts
git commit -m "feat(i18n): add language state management with Zustand"
```

---

## UI 组件

### Task 5: 创建语言切换组件

**Files:**
- Create: `src/components/LanguageSwitcher.tsx`

**Step 1: 创建语言切换组件**

```typescript
'use client';

import { useLanguageStore } from '@/stores/language-store';
import { locales, localeLabels, type Locale } from '@/i18n/config';

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLanguageStore();

  const handleChange = (newLocale: Locale) => {
    setLocale(newLocale);
    // Update URL parameter
    const url = new URL(window.location.href);
    url.searchParams.set('lang', newLocale);
    window.history.replaceState({}, '', url.toString());
    // Reload to apply new language
    window.location.reload();
  };

  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
      {locales.map((l) => (
        <button
          key={l}
          onClick={() => handleChange(l)}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            locale === l
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {localeLabels[l]}
        </button>
      ))}
    </div>
  );
}
```

**Step 2: 提交**

```bash
git add src/components/LanguageSwitcher.tsx
git commit -m "feat(i18n): add LanguageSwitcher component"
```

---

## 集成到应用

### Task 6: 更新 layout.tsx

**Files:**
- Modify: `src/app/layout.tsx`

**Step 1: 读取当前 layout.tsx 内容**

使用 Read 工具查看当前 `src/app/layout.tsx` 文件内容。

**Step 2: 修改 layout.tsx**

```typescript
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NextIntlProvider from "@/i18n/NextIntlProvider";
import { getMessages } from "next-intl/server";
import { headers } from "next/headers";
import { defaultLocale, type Locale } from "@/i18n/config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

async function getLocale(): Promise<Locale> {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  const searchParams = headersList.get("x-search-params") || "";

  // Check URL parameter first
  const urlParams = new URLSearchParams(searchParams);
  const urlLocale = urlParams.get("lang") as Locale | null;
  if (urlLocale && ["zh", "en"].includes(urlLocale)) {
    return urlLocale;
  }

  return defaultLocale;
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages({ locale });

  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlProvider messages={messages} locale={locale}>
          {children}
        </NextIntlProvider>
      </body>
    </html>
  );
}
```

**Step 3: 提交**

```bash
git add src/app/layout.tsx
git commit -m "feat(i18n): integrate next-intl into layout"
```

---

### Task 7: 更新 page.tsx 添加语言切换器

**Files:**
- Modify: `src/app/page.tsx`

**Step 1: 读取当前 page.tsx 内容**

使用 Read 工具查看当前 `src/app/page.tsx` 文件内容。

**Step 2: 修改 page.tsx**

在页面中添加 LanguageSwitcher 组件到合适位置（通常是右上角）。

```typescript
import ServoWizard from "@/components/wizard/ServoWizard";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function Home() {
  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">伺服选型工具</h1>
          <LanguageSwitcher />
        </div>
        <ServoWizard />
      </div>
    </main>
  );
}
```

**Step 3: 提交**

```bash
git add src/app/page.tsx
git commit -m "feat(i18n): add LanguageSwitcher to main page"
```

---

## 组件国际化

### Task 8: 国际化 StepIndicator

**Files:**
- Modify: `src/components/wizard/StepIndicator.tsx`

**Step 1: 读取当前文件内容**

使用 Read 工具查看当前文件。

**Step 2: 修改组件使用翻译**

```typescript
'use client';

import { useTranslations } from 'next-intl';

interface StepIndicatorProps {
  currentStep: number;
}

const steps = ['projectInfo', 'mechanism', 'motion', 'duty', 'systemConfig', 'result'] as const;

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  const t = useTranslations('steps');

  return (
    <div className="flex items-center justify-between mb-8">
      {steps.map((stepKey, index) => (
        <div key={stepKey} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              index <= currentStep
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-600'
            }`}
          >
            {index + 1}
          </div>
          <span className="ml-2 text-sm hidden md:block">
            {t(stepKey)}
          </span>
          {index < steps.length - 1 && (
            <div className="w-8 h-0.5 bg-gray-200 mx-2" />
          )}
        </div>
      ))}
    </div>
  );
}
```

**Step 3: 提交**

```bash
git add src/components/wizard/StepIndicator.tsx
git commit -m "feat(i18n): translate StepIndicator component"
```

---

### Task 9: 国际化 ProjectInfoStep

**Files:**
- Modify: `src/components/wizard/steps/ProjectInfoStep.tsx`

**Step 1: 读取当前文件内容**

使用 Read 工具查看当前文件。

**Step 2: 修改组件使用翻译**

将硬编码的中文文本替换为 `useTranslations` hook 调用。例如：

```typescript
const t = useTranslations('projectInfo');
const commonT = useTranslations('common');

// 替换 "项目名称" 为 {t('projectName')}
// 替换 placeholder 为 {t('projectNamePlaceholder')}
// 替换 "请输入项目名称" 错误信息为 {t('errors.projectNameRequired')}
```

**Step 3: 提交**

```bash
git add src/components/wizard/steps/ProjectInfoStep.tsx
git commit -m "feat(i18n): translate ProjectInfoStep component"
```

---

### Task 10: 国际化 MechanismStep

**Files:**
- Modify: `src/components/wizard/steps/MechanismStep.tsx`

**Step 1: 读取当前文件内容**

使用 Read 工具查看当前文件。

**Step 2: 修改组件使用翻译**

```typescript
const t = useTranslations('mechanism');

// 替换机械类型名称为翻译键
// "滚珠丝杠" -> t('types.ballScrew')
// "齿轮/减速机" -> t('types.gear')
// 等等
```

**Step 3: 提交**

```bash
git add src/components/wizard/steps/MechanismStep.tsx
git commit -m "feat(i18n): translate MechanismStep component"
```

---

### Task 11: 国际化其他步骤组件

**Files:**
- Modify: `src/components/wizard/steps/MotionStep.tsx`
- Modify: `src/components/wizard/steps/DutyStep.tsx`
- Modify: `src/components/wizard/steps/SystemConfigStep.tsx`
- Modify: `src/components/wizard/steps/ResultStep.tsx`

**Step 1: 依次读取并修改每个文件**

使用 `useTranslations` hook 替换所有硬编码中文文本。

**Step 2: 提交（每个文件单独提交或一起提交）**

```bash
git add src/components/wizard/steps/
git commit -m "feat(i18n): translate remaining wizard steps"
```

---

## 完善翻译文件

### Task 12: 补充完整翻译内容

**Files:**
- Modify: `src/i18n/messages/zh.json`
- Modify: `src/i18n/messages/en.json`

**Step 1: 根据组件实际需求补充翻译键**

检查所有组件中使用的翻译键，确保 zh.json 和 en.json 中包含所有需要的键值。

**Step 2: 提交**

```bash
git add src/i18n/messages/
git commit -m "feat(i18n): complete translation content for all components"
```

---

## 测试验证

### Task 13: 运行开发服务器测试

**Step 1: 启动开发服务器**

```bash
npm run dev
```

**Step 2: 手动测试场景**

1. 打开 http://localhost:3000
2. 确认默认显示中文
3. 点击语言切换器切换到英文
4. 确认页面刷新后显示英文
5. 刷新页面，确认语言偏好被记住
6. 在 URL 中添加 `?lang=en`，确认直接显示英文

**Step 3: 测试通过标准**

- [ ] 语言切换器显示正常
- [ ] 中文/英文切换正常工作
- [ ] LocalStorage 保存偏好
- [ ] URL 参数可以覆盖偏好

---

### Task 14: 构建测试

**Step 1: 运行构建命令**

```bash
npm run build
```

**Step 2: 确认构建成功**

检查 `dist/` 目录生成成功，没有 i18n 相关错误。

---

## 完成

实施计划执行完毕。所有组件已国际化，支持中英文切换。
