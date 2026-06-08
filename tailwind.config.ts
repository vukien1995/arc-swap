import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        arc: {
          bg:      '#05060a',
          surface: '#0d1017',
          panel:   '#111722',
          border:  '#1e2a3a',
          border2: '#243044',
          text:    '#e8edf5',
          muted:   '#5a6a80',
          accent:  '#00e5ff',
          accent2: '#ff6b35',
          green:   '#00e676',
          red:     '#ff5252',
          usdc:    '#2775CA',
          eurc:    '#0050ff',
          cirbtc:  '#f7931a',
        },
      },
      fontFamily: {
        syne: ['var(--font-syne)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'fade-up': 'fade-up 0.3s ease forwards',
        'slide-down': 'slide-down 0.2s ease forwards',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0,229,255,0.2)' },
          '50%': { boxShadow: '0 0 40px rgba(0,229,255,0.5)' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-down': {
          from: { opacity: '0', transform: 'translateY(-6px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
