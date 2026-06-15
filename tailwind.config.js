/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Tajawal', 'system-ui', 'sans-serif'],
        display: ['"Aref Ruqaa"', 'Tajawal', 'serif'],
      },
      colors: {
        brand: {
          50: '#fbf3f3', 100: '#f3dedf', 200: '#e6bcbe', 300: '#d28f93',
          400: '#bb5d63', 500: '#a23c43', 600: '#852e34', 700: '#6a2329',
          800: '#511a1f', 900: '#3a1216',
        },
        gold: {
          50: '#fbf7ec', 100: '#f4ebd0', 200: '#e8d39e', 300: '#dcbb6e',
          400: '#d0a64e', 500: '#c2a160', 600: '#a8884a', 700: '#876b39',
          800: '#6c552f', 900: '#594729',
        },
      },
    },
  },
  plugins: [],
};
