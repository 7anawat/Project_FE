/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Prompt', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'Cambria', 'serif'],
      },
      colors: {
        cream: {
          50: '#FCFAF7',
          100: '#F8F4EC',
          200: '#F2EBDC',
          300: '#E8DEC9',
          400: '#D6C8AC',
        },
        charcoal: {
          700: '#4A4641',
          800: '#34312C',
          900: '#23201D',
          950: '#181614',
        },
      },
    },
  },
  plugins: [],
};
