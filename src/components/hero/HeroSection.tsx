'use client';

import { useTranslations } from 'next-intl';
import { Zap, ArrowRight, ChevronDown } from 'lucide-react';

interface HeroSectionProps {
  onStartConfiguration: () => void;
}

export function HeroSection({ onStartConfiguration }: HeroSectionProps) {
  const t = useTranslations('hero');

  return (
    <section className="relative min-h-screen w-full bg-black overflow-hidden flex items-center">
      {/* Background Effects */}
      <div className="absolute inset-0">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-950/30 via-transparent to-cyan-950/30" />

        {/* Cyan glow - top right */}
        <div className="absolute -top-20 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[150px] animate-pulse" />

        {/* Red glow - bottom left */}
        <div className="absolute -bottom-20 left-1/4 w-[500px] h-[500px] bg-red-500/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '1s' }} />

        {/* Grid pattern */}
        <div className="absolute inset-0 grid-pattern opacity-30" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left: Text Content */}
          <div className="space-y-8 animate-fade-in-up">
            {/* Brand Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900/80 border border-neutral-800 rounded-sm">
              <Zap className="w-4 h-4 text-red-500" />
              <span className="text-sm text-neutral-300">Bosch Rexroth</span>
            </div>

            {/* Main Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              <span className="text-red-600 text-glow-red">「智」</span>
              慧选型工具
            </h1>

            {/* Subtitle */}
            <h2 className="text-xl md:text-2xl font-semibold text-cyan-500 text-glow-cyan">
              高性价比伺服系统配置
            </h2>

            {/* Feature List */}
            <ul className="space-y-4 text-neutral-200">
              <li className="flex items-start gap-3">
                <span className="text-cyan-500 mt-1">-</span>
                <span>承袭 ctrlX AUTOMATION，集成卓越性能与开放生态</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-cyan-500 mt-1">-</span>
                <span>智能算法匹配最优电机与驱动器组合</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-cyan-500 mt-1">-</span>
                <span>一键生成完整技术文档与物料清单</span>
              </li>
            </ul>

            {/* CTA Button */}
            <div className="pt-4">
              <button
                onClick={onStartConfiguration}
                className="group inline-flex items-center gap-3 px-8 py-4 bg-red-600 text-white font-semibold rounded-sm hover:bg-red-500 hover:shadow-glow-red transition-all duration-300"
              >
                <span>{t('startConfiguration')}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Footnote */}
            <p className="text-xs text-neutral-600 pt-4">
              <sup>1</sup> 基于 Bosch Rexroth 官方技术参数
            </p>
          </div>

          {/* Right: Visual Element */}
          <div className="hidden md:flex items-center justify-center relative">
            {/* Decorative geometric shapes */}
            <div className="relative w-80 h-80">
              {/* Outer ring */}
              <div className="absolute inset-0 border-2 border-red-500/20 rounded-full animate-pulse" />

              {/* Middle ring */}
              <div className="absolute inset-8 border border-cyan-500/30 rounded-full" style={{ animation: 'spin 20s linear infinite' }} />

              {/* Inner content */}
              <div className="absolute inset-16 bg-gradient-to-br from-neutral-900 to-black rounded-full flex items-center justify-center border border-neutral-800">
                <div className="text-center">
                  <div className="text-5xl font-bold text-white mb-2">ctrlX</div>
                  <div className="text-cyan-500 text-sm tracking-widest">AUTOMATION</div>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-red-500/20 rounded-lg backdrop-blur-sm border border-red-500/30 animate-float" />
              <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-cyan-500/20 rounded-lg backdrop-blur-sm border border-cyan-500/30 animate-float" style={{ animationDelay: '1.5s' }} />
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 text-neutral-500 animate-bounce">
          <span className="text-xs">向下滚动</span>
          <ChevronDown className="w-5 h-5" />
        </div>
      </div>
    </section>
  );
}
