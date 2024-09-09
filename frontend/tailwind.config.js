module.exports = {
  mode: 'jit',
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        tangerine: {
          DEFAULT: '#ff9500',
          light: '#ff7a00',
          dark: '#e56e00',
        },
      },
    },
  }, 
  variants: {
    extend: {
      backgroundColor: ['hover'],
      textColor: ['hover'],
      borderColor: ['hover'],
    },
  }, 
  plugins: [],
}