/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        camp: {
          bg: '#0a0a0f',
          surface: '#14141f',
          border: '#252535',
          accent: '#f59e0b',
          accentHover: '#d97706',
        }
      }
    },
  },
  plugins: [],
}
