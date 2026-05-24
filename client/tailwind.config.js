/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        darkBg: '#0A0F1C',
        darkCard: '#131A2C',
        darkBorder: '#1E293B',
        accentCyan: '#00D1FF',
        accentPurple: '#7C3AED',
        successGreen: '#10B981',
        warningAmber: '#F59E0B',
        dangerRed: '#EF4444',
        textPrimary: '#F8FAFC',
        textSecondary: '#94A3B8',
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
