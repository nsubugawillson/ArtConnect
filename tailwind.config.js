/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        copper: {
          50: '#fdf4f0',
          100: '#fce8de',
          200: '#f8c9b0',
          300: '#f2a07a',
          400: '#eb7145',
          500: '#e4521f',
          600: '#c93c14',
          700: '#a0430a',
          800: '#7e3410',
          900: '#672c12',
        },
        mist: {
          50: '#f9fbfb',
          100: '#dfe8e6',
          200: '#c5d8d4',
          300: '#a3c3be',
          400: '#7ba9a3',
          500: '#5d9089',
        },
        charcoal: {
          800: '#2d2d2d',
          900: '#1a1a1a',
          950: '#0d0d0d',
        },
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        grotesk: ['Space Grotesk', 'sans-serif'],
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'pulse-copper': 'pulse-copper 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'pulse-copper': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 0 0 rgba(160, 67, 10, 0.4)' },
          '50%': { opacity: '0.8', boxShadow: '0 0 0 10px rgba(160, 67, 10, 0)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
