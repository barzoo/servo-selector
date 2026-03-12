'use client';

import { useTranslations } from 'next-intl';
import { Zap, ArrowRight } from 'lucide-react';

interface HeroSectionProps {
  onStartConfiguration: () => void;
}

export function HeroSection({ onStartConfiguration }: HeroSectionProps) {
  const t = useTranslations('hero');

  return (
    <section className="relative min-h-screen w-full overflow-hidden flex items-center bg-gradient-to-br from-[#003366] via-[#0077C8] to-[#00A4E4]">
      {/* Background Effects */}
      <div className="absolute inset-0">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#003366]/50 via-transparent to-[#00A4E4]/30" />

        {/* Light glow - top right */}
        <div className="absolute -top-20 right-1/4 w-[500px] h-[500px] bg-white/10 rounded-full blur-[150px] animate-pulse" />

        {/* Blue glow - bottom left */}
        <div className="absolute -bottom-20 left-1/4 w-[500px] h-[500px] bg-[#00A4E4]/20 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '1s' }} />

        {/* Grid pattern */}
        <div className="absolute inset-0 grid-pattern opacity-20" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left: Text Content */}
          <div className="space-y-8 animate-fade-in-up">
            {/* Brand Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 border border-white/30 rounded-sm">
              <Zap className="w-4 h-4 text-white" />
              <span className="text-sm text-white/90">Bosch Rexroth</span>
            </div>

            {/* Main Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              <span className="text-[#87CEEB]">「智」</span>
              慧选型工具
            </h1>

            {/* Subtitle */}
            <h2 className="text-xl md:text-2xl font-semibold text-white/90">
              高性价比伺服系统配置
            </h2>

            {/* Feature List */}
            <ul className="space-y-4 text-white/80">
              <li className="flex items-start gap-3">
                <span className="text-white mt-1">-</span>
                <span>承袭 ctrlX AUTOMATION，集成卓越性能与开放生态</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-white mt-1">-</span>
                <span>智能算法匹配最优电机与驱动器组合</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-white mt-1">-</span>
                <span>一键生成完整技术文档与物料清单</span>
              </li>
            </ul>

            {/* CTA Button */}
            <div className="pt-4">
              <button
                onClick={onStartConfiguration}
                className="group inline-flex items-center gap-3 px-8 py-4 bg-white text-[#0077C8] font-semibold rounded-sm hover:bg-white/90 hover:shadow-lg transition-all duration-300"
              >
                <span>{t('startConfiguration')}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Footnote */}
            <p className="text-xs text-white/50 pt-4">
              <sup>1</sup> 基于 Bosch Rexroth 官方技术参数
            </p>
          </div>

          {/* Right: Visual Element */}
          <div className="hidden md:flex items-center justify-center relative">
            {/* Decorative geometric shapes */}
            <div className="relative w-80 h-80">
              {/* Outer ring */}
              <div className="absolute inset-0 border-2 border-white/30 rounded-full animate-pulse" />

              {/* Middle ring */}
              <div className="absolute inset-8 border border-white/20 rounded-full" style={{ animation: 'spin 20s linear infinite' }} />

              {/* Inner content */}
              <div className="absolute inset-16 bg-white/10 rounded-full flex items-center justify-center border border-white/30 backdrop-blur-sm">
                <div className="text-center">
                  <div className="text-5xl font-bold text-white mb-2">ctrlX</div>
                  <div className="text-white/80 text-sm tracking-widest">AUTOMATION</div>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/20 rounded-lg backdrop-blur-sm border border-white/30 animate-float" />
              <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20 animate-float" style={{ animationDelay: '1.5s' }} />
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
