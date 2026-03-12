import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          red: '#dc2626',
          cyan: '#06b6d4',
          dark: '#0a0a0a',
        }
      },
      fontFamily: {
        sans: ['"Noto Sans SC"', '"Source Han Sans SC"', 'system-ui', 'sans-serif'],
        display: ['"Noto Sans SC"', 'Arial', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'glow-red': '0 0 40px rgba(220, 38, 38, 0.4)',
        'glow-cyan': '0 0 30px rgba(6, 182, 212, 0.3)',
        'glow-red-sm': '0 0 20px rgba(220, 38, 38, 0.3)',
        'glow-cyan-sm': '0 0 15px rgba(6, 182, 212, 0.2)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'glow-left': 'radial-gradient(circle at 20% 50%, rgba(220, 38, 38, 0.15), transparent 50%)',
        'glow-right': 'radial-gradient(circle at 80% 50%, rgba(6, 182, 212, 0.15), transparent 50%)',
      }
    },
  },
  plugins: [],
};
export default config;
