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
        // Cyber Mystic backgrounds
        'cosmic-void': '#050505',
        'deep-space': '#050505',
        'nebula-dark': '#0f0f0f',
        'starfield': '#0f0f0f',

        // Cyber Mystic accents
        'solar': {
          400: '#c084fc',
          500: '#a855f7',  // neon purple (primary)
          600: '#9333ea',
        },
        'leaf': {
          400: '#2ffde0',
          500: '#00f5d4',  // electric cyan (accent)
          600: '#00c4aa',
        },
        'terra': {
          500: '#f472b6',  // pink surface
          600: '#f15bb5',  // pink (secondary)
        },
        'mystic-purple': {
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
        },
      },
      fontFamily: {
        'retro': ['Orbitron', 'sans-serif'],
        'body': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'gradient-cosmic': 'linear-gradient(135deg, #050505 0%, #0f0f0f 50%, #050505 100%)',
        'gradient-solar': 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
        'gradient-leaf': 'linear-gradient(135deg, #00f5d4 0%, #00c4aa 100%)',
        'gradient-mystic': 'linear-gradient(135deg, #a855f7 0%, #f15bb5 100%)',
      },
      borderRadius: {
        'organic': '1.25rem',
        'bio': '2rem',
      },
      boxShadow: {
        'glow-solar': '0 0 20px rgba(168, 85, 247, 0.5)',   // purple glow
        'glow-leaf': '0 0 20px rgba(0, 245, 212, 0.5)',      // cyan glow
        'glow-mystic': '0 0 20px rgba(241, 91, 181, 0.5)',   // pink glow
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(168, 85, 247, 0.3)' },
          '100%': { boxShadow: '0 0 25px rgba(168, 85, 247, 0.8)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
  ],
}