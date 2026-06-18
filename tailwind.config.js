/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'display': ['"Cormorant Garamond"', 'serif'],
        'body': ['"DM Sans"', 'sans-serif'],
      },
      colors: {
        navy: {
          50:  '#eef2ff',
          100: '#dce6ff',
          200: '#b9ccff',
          300: '#839fff',
          400: '#4d6ef5',
          500: '#2a4adb',
          600: '#1e3abf',
          700: '#1a2f99',
          800: '#162880',
          900: '#0f1c5c',
          950: '#090e36',
        },
        gold: {
          50:  '#fdf9ee',
          100: '#faf0d0',
          200: '#f5de9e',
          300: '#efc66b',
          400: '#e8ae3e',
          500: '#d4941f',
          600: '#b87416',
          700: '#8f5514',
          800: '#6b3e14',
          900: '#4a2a0e',
        },
        stone: {
          50:  '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
        },
      },
      animation: {
        'fade-up':    'fadeUp 0.7s ease forwards',
        'fade-in':    'fadeIn 0.8s ease forwards',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'ticker':     'ticker 30s linear infinite',
      },
      keyframes: {
        fadeUp:  { from: { opacity: 0, transform: 'translateY(28px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
        ticker:  { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
      },
    },
  },
  plugins: [],
}
