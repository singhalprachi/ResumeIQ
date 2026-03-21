/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        ink: {
          DEFAULT: '#0A0A0F',
          50: '#f4f4f8',
          100: '#e8e8f0',
          200: '#c4c4d8',
          900: '#0A0A0F',
        },
        signal: {
          green: '#00E5A0',
          yellow: '#FFD60A',
          red: '#FF3B5C',
          blue: '#4D9EFF',
        },
        surface: {
          1: '#12121A',
          2: '#1A1A26',
          3: '#222234',
          4: '#2A2A40',
        },
      },
      animation: {
        'score-fill': 'scoreFill 1.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'fade-up': 'fadeUp 0.5s ease forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        scoreFill: {
          from: { strokeDashoffset: '314' },
          to: { strokeDashoffset: 'var(--target-offset)' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
