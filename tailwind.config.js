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
          50: '#eef2f8', 100: '#d9e1ee', 200: '#b4c4dc', 300: '#88a0c4',
          400: '#5b78a8', 500: '#3a5688', 600: '#2c4470', 700: '#22355a',
          800: '#1a2945', 900: '#111c30',
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
