/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: 'jit',
  content: [
    './src/**/*.{js,jsx,ts,tsx,html}', 
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  
  theme: {
    extend: {
      colors: {
        // darkGray: '#1F1F1F',
        // navyBlue: '#0D1B2A',
        // graphite: '#2C2C2C',
        // white: '#f0f0f0',
        // amber: '#FFC107',
        // goldenYellow: '#FFB400',
        // deepOrange: '#FF5722',
        // tangerine: '#FF6F00',
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
  // safelist: [
  //   {
  //     pattern:
  //       /(bg|text|border)-(darkGray|navyBlue|white|graphite|amber|goldenYellow|deepOrange|tangerine)/,
  //   },
  // ],
}