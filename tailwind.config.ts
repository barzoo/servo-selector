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
          primary: '#00A4E4',
          'primary-light': '#33C3FF',
          'primary-dark': '#0077C8',
          secondary: '#003366',
          'secondary-light': '#004080',
          'secondary-dark': '#002244',
        }
      },
      fontFamily: {
        sans: ['"Noto Sans SC"', '"Source Han Sans SC"', 'system-ui', 'sans-serif'],
        display: ['"Noto Sans SC"', 'Arial', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'glow-blue': '0 0 40px rgba(0, 164, 228, 0.4)',
        'glow-blue-sm': '0 0 20px rgba(0, 164, 228, 0.3)',
        'card': '0 4px 20px rgba(0, 119, 200, 0.15)',
        'card-hover': '0 8px 30px rgba(0, 119, 200, 0.2)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-hero': 'linear-gradient(135deg, #003366 0%, #0077C8 50%, #00A4E4 100%)',
        'glow-left': 'radial-gradient(circle at 20% 50%, rgba(0, 164, 228, 0.15), transparent 50%)',
        'glow-right': 'radial-gradient(circle at 80% 50%, rgba(0, 119, 200, 0.15), transparent 50%)',
      }
    },
  },
  plugins: [],
};
export default config;
