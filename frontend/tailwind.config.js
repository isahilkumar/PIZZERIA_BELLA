/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sunset: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316', // Sunset Orange
          600: '#ea580c', // Fiery Sunset
          700: '#c2410c',
          coral: '#ff5e62',
          rose: '#f43f5e',
          gold: '#ffb347',
          peach: '#fff1ec',
          cream: '#fffdfa',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'sunset-sm': '0 4px 20px -2px rgba(249, 115, 22, 0.12)',
        'sunset-md': '0 10px 30px -4px rgba(249, 115, 22, 0.20)',
        'sunset-lg': '0 20px 40px -6px rgba(249, 115, 22, 0.28)',
        'sunset-glow': '0 0 50px -10px rgba(255, 94, 98, 0.35)',
        'card-soft': '0 10px 30px -5px rgba(0, 0, 0, 0.05), 0 0 1px 1px rgba(0, 0, 0, 0.02)',
      },
      animation: {
        'float': 'float 5s ease-in-out infinite',
        'float-slow': 'floatSlow 7s ease-in-out infinite',
        'spin-slow': 'spin 30s linear infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-14px) rotate(1.5deg)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.06)' },
        },
      }
    },
  },
  plugins: [],
}
