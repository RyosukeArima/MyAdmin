/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4F46E5',
          50: '#F0F0FF',
          100: '#E0E0FF',
          500: '#4F46E5',
          600: '#4338CA',
          700: '#3730A3',
        },
        secondary: {
          DEFAULT: '#F59E0B',
          50: '#FFFBF0',
          100: '#FEF3C7',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
        }
      }
    },
  },
  plugins: [],
} 