export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cosmic-dark': '#000000',
        'cosmic-gold': '#d4af37',
        // Mantra theme colors
        'mantra-blue': '#60A5FA',
        'mantra-amber': '#FBBF24',
        'mantra-red': '#EF4444',
        'mantra-indigo': '#818CF8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        cinzel: ['Cinzel', 'serif'],
        philosopher: ['Philosopher', 'sans-serif'],
        sanskrit: ['Noto Sans Devanagari', 'sans-serif'],
      },
      animation: {
        'breathe': 'breathe 6s ease-in-out infinite',
        'breathe-slow': 'breathe-slow 8s ease-in-out infinite',
        'ripple': 'ripple 1s ease-out forwards',
        'glow-pulse': 'glow-pulse 4s ease-in-out infinite',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.3' },
          '50%': { transform: 'scale(1.08)', opacity: '0.6' },
        },
        'breathe-slow': {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.15' },
          '50%': { transform: 'scale(1.04)', opacity: '0.25' },
        },
        ripple: {
          '0%': { transform: 'scale(0.5)', opacity: '0.6' },
          '100%': { transform: 'scale(2.5)', opacity: '0' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(212,175,55,0.3), 0 0 60px transparent' },
          '50%': { boxShadow: '0 0 30px rgba(212,175,55,0.3), 0 0 80px rgba(212,175,55,0.3)' },
        },
      },
    },
  },
  plugins: [],
}
