/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './loshu.tsx'
  ],
  theme: {
    extend: {
      colors: {
        void: '#0b0a08',
        'person-a': {
          DEFAULT: '#c9a24b',
          dim: 'rgba(201,162,75,0.13)',
          mid: 'rgba(201,162,75,0.28)',
        },
        'person-b': {
          DEFAULT: '#5f8fae',
          dim: 'rgba(95,143,174,0.13)',
          mid: 'rgba(95,143,174,0.28)',
        },
        success: '#6fae7c',
        warning: '#d9a45c',
        danger: '#c97b6a',
      },
      fontFamily: {
        'display': ['var(--font-newsreader)', 'serif'],
        'body': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
        'retro': ['var(--font-newsreader)', 'serif'],
      },
      backgroundImage: {
        'gradient-void': 'linear-gradient(160deg, #100d09 0%, #181310 55%, #0b0a08 100%)',
      },
      borderRadius: {
        'card': '14px',
        'chip': '8px',
        'organic': '14px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
  ],
}
