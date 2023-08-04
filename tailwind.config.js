/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Darker Grotesque'],
      },
      colors: {
        primary: {
          100: '#c0d6df',
        },
      },
    },
  },
  plugins: [],
};
