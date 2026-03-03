/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0F1C3F',
        secondary: '#4FC3F7',
        surface: '#1C2747',
        success: '#34D399',
        warning: '#FBBF24',
        error: '#EF4444',
        textSecondary: '#CBD5E1',
      }
    },
  },
  plugins: [],
}