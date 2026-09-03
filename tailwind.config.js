/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        prince: {
          light: '#e0f2fe',
          DEFAULT: '#38bdf8',
          dark: '#0284c7',
        },
        princess: {
          light: '#fce7f3',
          DEFAULT: '#f472b6',
          dark: '#db2777',
        }
      },
      keyframes: {
        stripe: {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '32px 0' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)', opacity: '1' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)' },
        },
        scaleUp: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        }
      },
      animation: {
        stripe: 'stripe 1.5s linear infinite',
        bounceIn: 'bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        scaleUp: 'scaleUp 0.2s ease-out',
      }
    },
  },
  plugins: [],
}
