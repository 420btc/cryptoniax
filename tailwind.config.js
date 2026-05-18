const { fontFamily } = require('tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
        sans: ['Inter', ...fontFamily.sans],
      },
      colors: {
        bingx: { DEFAULT: '#F0B90B', dark: '#C89A09' },
        hyperliquid: { DEFAULT: '#00E6FF', dark: '#00B8CC' },
        bybit: { DEFAULT: '#F7A600', dark: '#D48E00' },
        uniswap: { DEFAULT: '#FF007A', dark: '#CC0062' },
        hodl: { DEFAULT: '#7C3AED', dark: '#5B21B6' },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        float: 'float 3s ease-in-out infinite',
        sparkle: 'sparkle 1.5s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        sparkle: {
          '0%, 100%': { opacity: 0.4 },
          '50%': { opacity: 1 },
        },
      },
    },
  },
  plugins: [],
}
