/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#F3F4EF',
        ink: '#262E27',
        inksoft: '#5B6158',
        teal: { DEFAULT: '#2F5C55', tint: '#E1EBE8' },
        ochre: { DEFAULT: '#A8672B', tint: '#F1E4D4' },
        red: { DEFAULT: '#B4503F', tint: '#F5E3DF' },
        border: '#DEDCD1'
      },
      fontFamily: {
        serif: ['Fraunces', 'serif'],
        sans: ['"Work Sans"', 'sans-serif']
      },
      borderRadius: {
        xl: '14px'
      }
    }
  },
  plugins: []
}
